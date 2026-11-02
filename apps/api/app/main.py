import asyncio
import contextlib
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings
from app.db import JobStore
from app.errors import install_error_handlers
from app.guards import LocalGuardMiddleware
from app.progress import ProgressHub
from app.routes import router
from app.stages import ComfyHiresStage, LtxDistilledStage, Stage, StubStage
from app.worker import Worker

HOST = "127.0.0.1"  # 로컬 전용. 외부 인터페이스에 바인딩하지 않는다.


def build_stages(settings: Settings) -> dict[int, Stage]:
    stage1: Stage
    if settings.stage1_backend == "ltx":
        stage1 = LtxDistilledStage()
    else:
        stage1 = StubStage(settings.stub_steps, settings.stub_step_delay)
    stages: dict[int, Stage] = {1: stage1}
    if settings.comfyui_url:
        stages[2] = ComfyHiresStage(settings.comfyui_url)
    return stages


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()

    @contextlib.asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        store = JobStore(settings.db_path)
        hub = ProgressHub()
        worker = Worker(store, hub, build_stages(settings), settings.outputs_dir)
        app.state.settings = settings
        app.state.store = store
        app.state.hub = hub
        app.state.worker = worker

        # 이전 실행에서 중단된 잡은 실패 처리, 대기 중이던 잡은 다시 큐에 넣는다
        for job_id in store.ids_by_status("running"):
            store.update(job_id, status="failed", message="서버 재시작으로 중단되었습니다")
        for job_id in store.ids_by_status("queued"):
            await worker.enqueue(job_id)

        task = asyncio.create_task(worker.run_forever())
        try:
            yield
        finally:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
            store.close()

    app = FastAPI(title="LTX Nomad Studio API", lifespan=lifespan)
    install_error_handlers(app)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
    )
    app.add_middleware(LocalGuardMiddleware, allowed_origins=settings.cors_origins)
    app.include_router(router)
    return app


app = create_app()


def run() -> None:
    import uvicorn

    uvicorn.run(app, host=HOST, port=8000)
