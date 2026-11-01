import shutil
import subprocess

from app.schemas import GpuInfo

_QUERY = ["--query-gpu=name,memory.total,memory.used", "--format=csv,noheader,nounits"]


def query_gpu() -> GpuInfo:
    """nvidia-smi로 첫 번째 GPU 정보를 읽는다. 실패하면 ready=False."""
    exe = shutil.which("nvidia-smi")
    if exe is None:
        return GpuInfo(ready=False)
    try:
        result = subprocess.run(
            [exe, *_QUERY], capture_output=True, text=True, timeout=5, check=True
        )
        first_line = result.stdout.strip().splitlines()[0]
        name, total, used = (part.strip() for part in first_line.split(","))
        return GpuInfo(ready=True, name=name, vram_total_mb=int(total), vram_used_mb=int(used))
    except (OSError, subprocess.SubprocessError, IndexError, ValueError):
        return GpuInfo(ready=False)
