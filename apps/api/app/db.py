"""SQLite 잡 저장소. 동기 API이므로 async 코드에서는 asyncio.to_thread로 부른다."""

import json
import sqlite3
import threading
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.schemas import TERMINAL_STATUSES, Job, JobCreate, JobStatus

# 최초(버전 0) 스키마. 이후 변경은 _MIGRATIONS에 덧붙인다(기존 데이터 삭제 금지).
_SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    message TEXT NOT NULL DEFAULT '',
    prompt TEXT NOT NULL,
    negative_prompt TEXT NOT NULL,
    duration INTEGER NOT NULL,
    aspect TEXT NOT NULL,
    resolution TEXT NOT NULL,
    engine TEXT NOT NULL,
    stages TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""

# PRAGMA user_version = 적용된 마이그레이션 수. 인덱스 i의 항목이 버전 i → i+1.
_MIGRATIONS: tuple[tuple[str, ...], ...] = (
    (
        "ALTER TABLE jobs ADD COLUMN stage INTEGER",
        "ALTER TABLE jobs ADD COLUMN width INTEGER",
        "ALTER TABLE jobs ADD COLUMN height INTEGER",
        "ALTER TABLE jobs ADD COLUMN error_code TEXT",
        "ALTER TABLE jobs ADD COLUMN finished_at TEXT",
    ),
)
SCHEMA_VERSION = len(_MIGRATIONS)

_UPDATABLE = frozenset({"status", "progress", "message", "stage", "width", "height", "error_code"})


def _now() -> str:
    return datetime.now(UTC).isoformat()


def video_url(job_id: str) -> str:
    return f"/api/files/{job_id}.mp4"


class JobStore:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._lock = threading.Lock()
        with self._lock:
            self._migrate()

    def _migrate(self) -> None:
        with self._conn:
            self._conn.execute(_SCHEMA)
        version = self._conn.execute("PRAGMA user_version").fetchone()[0]
        for index in range(version, SCHEMA_VERSION):
            # DDL도 한 트랜잭션으로 묶어 중간 실패 시 이전 버전 그대로 남긴다
            self._conn.execute("BEGIN")
            try:
                for statement in _MIGRATIONS[index]:
                    self._conn.execute(statement)
                self._conn.execute(f"PRAGMA user_version = {index + 1}")
            except Exception:
                self._conn.rollback()
                raise
            self._conn.commit()

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    def create(self, data: JobCreate) -> Job:
        job_id = uuid.uuid4().hex
        now = _now()
        with self._lock, self._conn:
            self._conn.execute(
                "INSERT INTO jobs (id, status, progress, message, prompt, negative_prompt,"
                " duration, aspect, resolution, engine, stages, created_at, updated_at)"
                " VALUES (?, 'queued', 0, '대기 중', ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    job_id,
                    data.prompt,
                    data.negative_prompt,
                    data.duration,
                    data.aspect,
                    data.resolution,
                    data.engine,
                    json.dumps(data.stages),
                    now,
                    now,
                ),
            )
        job = self.get(job_id)
        assert job is not None
        return job

    def get(self, job_id: str) -> Job | None:
        with self._lock:
            row = self._conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        return _to_job(row) if row else None

    def list_recent(self, limit: int, before: datetime | None = None) -> tuple[list[Job], bool]:
        """최신순 limit개와 다음 페이지 존재 여부. before는 created_at 커서(미포함)."""
        query = "SELECT * FROM jobs"
        params: list[Any] = []
        if before is not None:
            query += " WHERE created_at < ?"
            params.append(before.astimezone(UTC).isoformat())
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit + 1)
        with self._lock:
            rows = self._conn.execute(query, params).fetchall()
        return [_to_job(row) for row in rows[:limit]], len(rows) > limit

    def count_by_status(self, status: JobStatus) -> int:
        with self._lock:
            row = self._conn.execute(
                "SELECT COUNT(*) FROM jobs WHERE status = ?", (status,)
            ).fetchone()
        return int(row[0])

    def ids_by_status(self, status: JobStatus) -> list[str]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT id FROM jobs WHERE status = ? ORDER BY created_at", (status,)
            ).fetchall()
        return [row["id"] for row in rows]

    def update(self, job_id: str, **fields: Any) -> None:
        unknown = set(fields) - _UPDATABLE
        if unknown:
            raise ValueError(f"갱신할 수 없는 필드: {sorted(unknown)}")
        if fields.get("status") in TERMINAL_STATUSES:
            fields["finished_at"] = _now()
        assignments = ", ".join(f"{name} = ?" for name in fields)
        with self._lock, self._conn:
            self._conn.execute(
                f"UPDATE jobs SET {assignments}, updated_at = ? WHERE id = ?",
                (*fields.values(), _now(), job_id),
            )


def _to_job(row: sqlite3.Row) -> Job:
    data = dict(row)
    data["stages"] = json.loads(data["stages"])
    data["video_url"] = video_url(data["id"]) if data["status"] == "done" else None
    return Job.model_validate(data)
