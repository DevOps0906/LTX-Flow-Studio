from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = API_ROOT.parent.parent


class Settings(BaseSettings):
    """워커 설정. 비밀 값은 없고, 경로·동작 옵션만 둔다."""

    model_config = SettingsConfigDict(
        env_prefix="LTX_API_",
        env_file=(REPO_ROOT / ".env", API_ROOT / ".env"),
        extra="ignore",
    )

    data_dir: Path = API_ROOT / "data"
    outputs_dir: Path = API_ROOT / "outputs"
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    # 1단계 구현 선택: stub(가짜 진행률) | ltx(실제 추론, 미구현)
    stage1_backend: Literal["stub", "ltx"] = "stub"
    stub_steps: int = Field(default=10, ge=1)
    stub_step_delay: float = Field(default=0.3, ge=0)
    # 설정되지 않으면 2단계(ComfyUI 고해상도)는 비활성
    comfyui_url: str | None = None

    @property
    def db_path(self) -> Path:
        return self.data_dir / "jobs.db"
