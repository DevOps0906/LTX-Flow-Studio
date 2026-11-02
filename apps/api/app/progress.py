"""잡별 진행 이벤트 기록. SSE 구독자는 처음부터 재생한 뒤 이어서 받는다."""

import asyncio
from collections.abc import AsyncIterator
from dataclasses import asdict, dataclass

from app.schemas import TERMINAL_STATUSES


@dataclass(frozen=True)
class ProgressEvent:
    status: str
    progress: int
    message: str
    stage: int | None = None

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


class ProgressHub:
    def __init__(self, max_jobs: int = 200) -> None:
        self._events: dict[str, list[ProgressEvent]] = {}
        self._cond = asyncio.Condition()
        self._max_jobs = max_jobs

    def has(self, job_id: str) -> bool:
        return job_id in self._events

    async def publish(self, job_id: str, event: ProgressEvent) -> None:
        async with self._cond:
            self._events.setdefault(job_id, []).append(event)
            self._prune()
            self._cond.notify_all()

    async def follow(self, job_id: str) -> AsyncIterator[ProgressEvent]:
        index = 0
        while True:
            async with self._cond:
                await self._cond.wait_for(
                    lambda seen=index: job_id not in self._events
                    or len(self._events[job_id]) > seen
                )
                batch = self._events.get(job_id, [])[index:]
            if not batch:
                return
            index += len(batch)
            for event in batch:
                yield event
                if event.status in TERMINAL_STATUSES:
                    return

    def _prune(self) -> None:
        # 끝난 잡의 기록부터 오래된 순으로 버린다(진행 중 잡은 유지)
        overflow = len(self._events) - self._max_jobs
        if overflow <= 0:
            return
        finished = [
            job_id
            for job_id, events in self._events.items()
            if events[-1].status in TERMINAL_STATUSES
        ]
        for job_id in finished[:overflow]:
            del self._events[job_id]
