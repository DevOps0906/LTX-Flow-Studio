from abc import ABC, abstractmethod
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from pathlib import Path
from typing import ClassVar

from app.schemas import Job

# (0.0~1.0 이 스테이지 안에서의 진행 비율, 화면 메시지)
ProgressCallback = Callable[[float, str], Awaitable[None]]


@dataclass(frozen=True)
class StageContext:
    job: Job
    input_path: Path | None  # 이전 스테이지 결과(1단계는 None)
    output_path: Path  # 이 스테이지가 써야 할 MP4 경로


class Stage(ABC):
    name: ClassVar[str]

    @abstractmethod
    async def run(self, ctx: StageContext, report: ProgressCallback) -> None:
        """ctx.output_path에 결과를 쓴다. 실패 시 예외를 던진다."""
