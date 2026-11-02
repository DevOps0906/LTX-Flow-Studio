"""단일 워커 큐. GPU는 하나이므로 잡을 한 번에 하나씩 직렬로 처리한다."""

import asyncio
import logging
import os
from pathlib import Path
from typing import Any

from app.db import JobStore
from app.progress import ProgressEvent, ProgressHub
from app.schemas import FRAME_SIZES
from app.stages import ProgressCallback, Stage, StageContext

logger = logging.getLogger(__name__)


def output_path(outputs_dir: Path, job_id: str) -> Path:
    """job id → 최종 MP4 고정 경로. 외부 입력 경로를 쓰지 않는다."""
    return outputs_dir / f"{job_id}.mp4"


class Worker:
    def __init__(
        self,
        store: JobStore,
        hub: ProgressHub,
        stages: dict[int, Stage],
        outputs_dir: Path,
    ) -> None:
        self._store = store
        self._hub = hub
        self._stages = stages
        self._outputs_dir = outputs_dir
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._current: str | None = None

    @property
    def available_stages(self) -> frozenset[int]:
        return frozenset(self._stages)

    @property
    def busy(self) -> bool:
        return self._current is not None

    @property
    def queue_length(self) -> int:
        return self._queue.qsize()

    async def enqueue(self, job_id: str) -> None:
        await self._hub.publish(job_id, ProgressEvent("queued", 0, "대기 중"))
        self._queue.put_nowait(job_id)

    async def run_forever(self) -> None:
        while True:
            job_id = await self._queue.get()
            self._current = job_id
            try:
                await self._process(job_id)
            finally:
                self._current = None
                self._queue.task_done()

    async def _report(
        self, job_id: str, status: str, progress: int, message: str, stage: int | None, **extra: Any
    ) -> None:
        # DB를 먼저 쓰고 알린다: SSE가 종료 이벤트를 받으면 DB에서 최종 값을 읽는다
        await asyncio.to_thread(
            self._store.update,
            job_id,
            status=status,
            progress=progress,
            message=message,
            stage=stage,
            **extra,
        )
        await self._hub.publish(job_id, ProgressEvent(status, progress, message, stage))

    def _reporter(self, job_id: str, base: float, span: float, stage: int) -> ProgressCallback:
        async def report(fraction: float, message: str) -> None:
            fraction = min(max(fraction, 0.0), 1.0)
            await self._report(job_id, "running", int(base + span * fraction), message, stage)

        return report

    async def _process(self, job_id: str) -> None:
        job = await asyncio.to_thread(self._store.get, job_id)
        if job is None:
            return
        await asyncio.to_thread(self._outputs_dir.mkdir, parents=True, exist_ok=True)
        await self._report(job_id, "running", 0, "생성 시작", job.stages[0])

        span = 100 / len(job.stages)
        work_paths: list[Path] = []
        input_path: Path | None = None
        try:
            for index, number in enumerate(job.stages):
                stage = self._stages[number]
                stage_output = self._outputs_dir / f"{job_id}.stage{number}.mp4"
                work_paths.append(stage_output)
                ctx = StageContext(job=job, input_path=input_path, output_path=stage_output)
                await stage.run(ctx, self._reporter(job_id, index * span, span, number))
                input_path = stage_output
            assert input_path is not None
            await asyncio.to_thread(os.replace, input_path, output_path(self._outputs_dir, job_id))
        except NotImplementedError:
            logger.warning("job %s: 미구현 스테이지", job_id)
            await self._fail(job_id, "not_implemented", "아직 구현되지 않은 스테이지입니다")
        except Exception:
            logger.exception("job %s failed", job_id)
            await self._fail(job_id, "generation_failed", "생성에 실패했습니다")
        else:
            last = job.stages[-1]
            width, height = FRAME_SIZES[last][job.aspect]
            await self._report(job_id, "done", 100, "완료", last, width=width, height=height)
        finally:
            for path in work_paths:
                await asyncio.to_thread(path.unlink, missing_ok=True)

    async def _fail(self, job_id: str, error_code: str, message: str) -> None:
        job = await asyncio.to_thread(self._store.get, job_id)
        progress, stage = (job.progress, job.stage) if job else (0, None)
        await self._report(job_id, "failed", progress, message, stage, error_code=error_code)
