import asyncio
import json
from collections.abc import AsyncIterator, Iterator
from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Query, Request, status
from fastapi.responses import FileResponse, StreamingResponse

from app.config import Settings
from app.db import JobStore
from app.errors import ApiError
from app.gpu import query_gpu
from app.progress import ProgressHub
from app.schemas import (
    LIST_LIMIT,
    QUEUE_LIMIT,
    TERMINAL_STATUSES,
    GpuInfo,
    Job,
    JobCreate,
    JobPage,
)
from app.worker import Worker, output_path

router = APIRouter(prefix="/api")

_NOT_FOUND = {404: {"description": "잡 또는 파일 없음"}}


def _store(request: Request) -> JobStore:
    return request.app.state.store


def _get_job_or_404(store: JobStore, job_id: UUID) -> Job:
    job = store.get(job_id.hex)
    if job is None:
        raise ApiError(status.HTTP_404_NOT_FOUND, "not_found", "잡을 찾을 수 없습니다")
    return job


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _progress_data(job_status: str, stage: int | None, progress: int, message: str) -> dict:
    # status는 웹 호환 필드이며, 세그먼트 정보는 task-006에서 추가한다.
    return {
        "status": job_status,
        "stage": stage,
        "segment": None,
        "segments_total": None,
        "progress": progress,
        "message": message,
    }


def _terminal_events(job: Job) -> Iterator[str]:
    yield _sse("progress", _progress_data(job.status, job.stage, job.progress, job.message))
    if job.status == "done":
        yield _sse("done", {"video_url": job.video_url, "width": job.width, "height": job.height})
    else:
        yield _sse("error", {"error_code": job.error_code, "message": job.message})


@router.get("/gpu", response_model=GpuInfo)
def get_gpu(request: Request) -> GpuInfo:
    worker: Worker = request.app.state.worker
    # stage2_available는 ComfyUI 연결 확인(task-011) 전까지 false
    return query_gpu().model_copy(
        update={"busy": worker.busy, "queue_length": worker.queue_length, "stage2_available": False}
    )


@router.post(
    "/jobs",
    response_model=Job,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"description": "invalid_request"},
        409: {"description": "stage2_unavailable"},
        422: {"description": "resolution_requires_stage2"},
        429: {"description": "queue_full"},
    },
)
async def create_job(body: JobCreate, request: Request) -> Job:
    worker: Worker = request.app.state.worker
    if body.resolution == "1080p" and 2 not in body.stages:
        raise ApiError(422, "resolution_requires_stage2", "1080p는 스테이지 2가 필요합니다")
    if set(body.stages) - worker.available_stages:
        raise ApiError(409, "stage2_unavailable", "스테이지 2(ComfyUI)가 설정되지 않았습니다")
    if worker.queue_length >= QUEUE_LIMIT:
        raise ApiError(429, "queue_full", "대기 중인 작업이 너무 많습니다")
    job = await asyncio.to_thread(_store(request).create, body)
    await worker.enqueue(job.id)
    return job


@router.get("/jobs", response_model=JobPage, responses={400: {"description": "invalid_request"}})
def list_jobs(
    request: Request,
    limit: int = Query(LIST_LIMIT, ge=1, le=LIST_LIMIT),
    before: datetime | None = None,
) -> JobPage:
    items, has_more = _store(request).list_recent(limit, before)
    return JobPage(items=items, next_before=items[-1].created_at if has_more else None)


@router.get("/jobs/{job_id}", response_model=Job, responses=_NOT_FOUND)
def get_job(job_id: UUID, request: Request) -> Job:
    return _get_job_or_404(_store(request), job_id)


@router.get(
    "/jobs/{job_id}/events",
    response_class=StreamingResponse,
    responses={200: {"content": {"text/event-stream": {}}}, **_NOT_FOUND},
)
async def job_events(job_id: UUID, request: Request) -> StreamingResponse:
    store = _store(request)
    job = await asyncio.to_thread(_get_job_or_404, store, job_id)
    hub: ProgressHub = request.app.state.hub

    async def latest() -> Job:
        return await asyncio.to_thread(store.get, job.id) or job

    async def stream() -> AsyncIterator[str]:
        # 04_API.md#3: 연결 직후 status(Job) → progress… → done | error 후 종료
        yield _sse("status", job.model_dump(mode="json"))
        if job.status in TERMINAL_STATUSES:
            for chunk in _terminal_events(job):
                yield chunk
            return
        if not hub.has(job.id):
            # 기록이 없으면(재시작 등) 스냅샷 한 번만 보낸다
            yield _sse("progress", _progress_data(job.status, job.stage, job.progress, job.message))
            return
        last_status = job.status
        async for event in hub.follow(job.id):
            if event.status in TERMINAL_STATUSES:
                final = await latest()
                yield _sse("status", final.model_dump(mode="json"))
                for chunk in _terminal_events(final):
                    yield chunk
                return
            if event.status != last_status:
                last_status = event.status
                yield _sse("status", (await latest()).model_dump(mode="json"))
            yield _sse(
                "progress", _progress_data(event.status, event.stage, event.progress, event.message)
            )

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get(
    "/files/{job_id}.mp4",
    response_class=FileResponse,
    responses={200: {"content": {"video/mp4": {}}}, **_NOT_FOUND},
)
def get_file(job_id: UUID, request: Request) -> FileResponse:
    job = _get_job_or_404(_store(request), job_id)
    settings: Settings = request.app.state.settings
    path = output_path(settings.outputs_dir, job.id)
    if job.status != "done" or not path.is_file():
        raise ApiError(status.HTTP_404_NOT_FOUND, "not_found", "파일이 아직 없습니다")
    return FileResponse(path, media_type="video/mp4")
