"""SQLite 잡 저장소. 동기 API이므로 async 코드에서는 asyncio.to_thread로 부른다."""

import json
import sqlite3
import threading
import uuid
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.schemas import Job, JobCreate, JobStatus

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

_UPDATABLE = frozenset({"status", "progress", "message"})


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
        with self._lock, self._conn:
            self._conn.execute(_SCHEMA)

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

    def list_recent(self, limit: int) -> list[Job]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()
        return [_to_job(row) for row in rows]

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
