import asyncio
import json
from collections.abc import AsyncIterator
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import FileResponse, StreamingResponse

from app.config import Settings
from app.db import JobStore
from app.gpu import query_gpu
from app.progress import ProgressEvent, ProgressHub
from app.schemas import GpuInfo, Job, JobCreate
from app.worker import Worker, output_path

router = APIRouter(prefix="/api")

_NOT_FOUND = {404: {"description": "잡 또는 파일 없음"}}


def _store(request: Request) -> JobStore:
    return request.app.state.store


def _get_job_or_404(store: JobStore, job_id: UUID) -> Job:
    job = store.get(job_id.hex)
    if job is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "잡을 찾을 수 없습니다")
    return job


def _sse(event: ProgressEvent) -> str:
    return f"event: progress\ndata: {json.dumps(event.to_dict(), ensure_ascii=False)}\n\n"


@router.get("/gpu", response_model=GpuInfo)
def get_gpu() -> GpuInfo:
    return query_gpu()


@router.post(
    "/jobs",
    response_model=Job,
    status_code=status.HTTP_201_CREATED,
    responses={400: {"description": "비활성 스테이지 요청"}},
)
async def create_job(body: JobCreate, request: Request) -> Job:
    worker: Worker = request.app.state.worker
    missing = set(body.stages) - worker.available_stages
    if missing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "요청한 스테이지가 설정되지 않았습니다")
    job = await asyncio.to_thread(_store(request).create, body)
    await worker.enqueue(job.id)
    return job


@router.get("/jobs", response_model=list[Job])
def list_jobs(request: Request, limit: int = Query(50, ge=1, le=100)) -> list[Job]:
    return _store(request).list_recent(limit)


@router.get("/jobs/{job_id}", response_model=Job, responses=_NOT_FOUND)
def get_job(job_id: UUID, request: Request) -> Job:
    return _get_job_or_404(_store(request), job_id)


@router.get(
    "/jobs/{job_id}/events",
    response_class=StreamingResponse,
    responses={200: {"content": {"text/event-stream": {}}}, **_NOT_FOUND},
)
async def job_events(job_id: UUID, request: Request) -> StreamingResponse:
    job = await asyncio.to_thread(_get_job_or_404, _store(request), job_id)
    hub: ProgressHub = request.app.state.hub

    async def stream() -> AsyncIterator[str]:
        if hub.has(job.id):
            async for event in hub.follow(job.id):
                yield _sse(event)
        else:
            # 재시작 등으로 기록이 없으면 DB 스냅샷 한 번만 보낸다
            yield _sse(ProgressEvent(job.status, job.progress, job.message))

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
        raise HTTPException(status.HTTP_404_NOT_FOUND, "파일이 아직 없습니다")
    return FileResponse(path, media_type="video/mp4")
