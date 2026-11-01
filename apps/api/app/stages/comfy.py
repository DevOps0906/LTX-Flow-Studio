from app.stages.base import ProgressCallback, Stage, StageContext


class ComfyHiresStage(Stage):
    """ComfyUI 고해상도 2단계 자리표시. LTX_API_COMFYUI_URL이 있을 때만 등록된다."""

    name = "comfy-hires"

    def __init__(self, base_url: str) -> None:
        self._base_url = base_url

    async def run(self, ctx: StageContext, report: ProgressCallback) -> None:
        raise NotImplementedError("ComfyUI 고해상도 스테이지는 아직 구현되지 않았습니다")
