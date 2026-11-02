from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

JobStatus = Literal["queued", "running", "done", "failed"]
TERMINAL_STATUSES: frozenset[str] = frozenset({"done", "failed"})
QUEUE_LIMIT = 5  # 대기(queued) 상한. 실행 중 1건은 별도(04_API.md#2 상한)
LIST_LIMIT = 50  # A-02 limit 기본·최대

# 스테이지별 출력 (가로, 세로) — 04_API.md#2 해상도. 스테이지 1은 항상 720p.
FRAME_SIZES: dict[int, dict[str, tuple[int, int]]] = {
    1: {"9:16": (720, 1280), "16:9": (1280, 720)},
    2: {"9:16": (1080, 1920), "16:9": (1920, 1080)},
}


class JobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(min_length=1, max_length=2000)
    negative_prompt: str = Field(default="", max_length=2000)
    duration: Literal[15, 20, 30] = 15
    aspect: Literal["9:16", "16:9"] = "9:16"
    # 최종 해상도(정본). 1080p는 stages에 2가 있어야 한다(A-01 422 resolution_requires_stage2)
    resolution: Literal["720p", "1080p"] = "720p"
    engine: Literal["distilled", "dev"] = "distilled"
    stages: list[Literal[1, 2]] = Field(default_factory=lambda: [1])

    @field_validator("stages")
    @classmethod
    def _check_stages(cls, value: list[int]) -> list[int]:
        # 1단계는 항상 단독 완결되어야 하므로 [1] 또는 [1, 2]만 허용
        if value not in ([1], [1, 2]):
            raise ValueError("stages는 [1] 또는 [1, 2]만 허용합니다")
        return value


class Job(BaseModel):
    id: str
    status: JobStatus
    progress: int = Field(ge=0, le=100)
    message: str
    prompt: str
    negative_prompt: str
    duration: Literal[15, 20, 30]
    aspect: Literal["9:16", "16:9"]
    resolution: Literal["720p", "1080p"]
    engine: Literal["distilled", "dev"]
    stages: list[Literal[1, 2]]
    stage: Literal[1, 2] | None = None
    width: int | None = None
    height: int | None = None
    error_code: str | None = None
    created_at: datetime
    updated_at: datetime
    finished_at: datetime | None = None
    video_url: str | None = None


class JobPage(BaseModel):
    """A-02 응답. next_before를 다음 요청의 ?before=로 넘긴다(없으면 마지막 페이지)."""

    items: list[Job]
    next_before: datetime | None = None


class GpuInfo(BaseModel):
    """A-06 GpuStatus. 미검출이어도 200 ready=false(이름·VRAM null)."""

    ready: bool
    name: str | None = None
    vram_total_mb: int | None = None
    vram_used_mb: int | None = None
    busy: bool = False
    queue_length: int = 0
    stage2_available: bool = False
