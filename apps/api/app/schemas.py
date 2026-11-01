from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

JobStatus = Literal["queued", "running", "done", "failed"]
TERMINAL_STATUSES: frozenset[str] = frozenset({"done", "failed"})


class JobCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(min_length=1, max_length=2000)
    negative_prompt: str = Field(default="", max_length=2000)
    duration: Literal[15, 20, 30] = 15
    aspect: Literal["9:16", "16:9"] = "9:16"
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
    created_at: datetime
    updated_at: datetime
    video_url: str | None = None


class GpuInfo(BaseModel):
    ready: bool
    name: str | None = None
    vram_total_mb: int | None = None
    vram_used_mb: int | None = None
