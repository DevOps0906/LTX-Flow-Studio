import asyncio

from app.stages.base import ProgressCallback, Stage, StageContext

# 재생 가능한 영상이 아닌 자리표시 바이트(MP4 ftyp 박스만 있음)
_PLACEHOLDER = (
    b"\x00\x00\x00\x18ftypisom\x00\x00\x02\x00isommp42"
)


class StubStage(Stage):
    """실제 추론 없이 가짜 진행률을 내보내는 1단계."""

    name = "stub"

    def __init__(self, steps: int, step_delay: float) -> None:
        self._steps = steps
        self._step_delay = step_delay

    async def run(self, ctx: StageContext, report: ProgressCallback) -> None:
        for step in range(1, self._steps + 1):
            await asyncio.sleep(self._step_delay)
            await report(step / self._steps, f"가짜 생성 중 ({step}/{self._steps})")
        await asyncio.to_thread(ctx.output_path.write_bytes, _PLACEHOLDER)
