# 워커(FastAPI) — stub 단계 확인용 이미지(GPU·LTX 미포함)
FROM python:3.11-slim
COPY --from=ghcr.io/astral-sh/uv:0.11.24 /uv /usr/local/bin/uv
ENV UV_LINK_MODE=copy UV_COMPILE_BYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY app app
RUN useradd -m worker && mkdir -p /data /outputs && chown worker /data /outputs
USER worker
ENV LTX_API_DATA_DIR=/data LTX_API_OUTPUTS_DIR=/outputs
EXPOSE 8000
CMD ["uv", "run", "--no-dev", "uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
