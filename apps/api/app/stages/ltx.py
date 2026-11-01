from app.stages.base import ProgressCallback, Stage, StageContext


class LtxDistilledStage(Stage):
    """diffusers LTX-Video(distilled) 1단계 자리표시. `uv sync --extra ltx` 후 구현한다."""

    name = "ltx-distilled"

    async def run(self, ctx: StageContext, report: ProgressCallback) -> None:
        raise NotImplementedError("LTX 추론 스테이지는 아직 구현되지 않았습니다")
