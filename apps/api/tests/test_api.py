import json
import subprocess
import uuid
from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app import gpu
from app.config import Settings
from app.main import create_app

PAYLOAD = {"prompt": "Hyper-realistic product shot"}


def read_events(client: TestClient, job_id: str) -> list[dict]:
    events: list[dict] = []
    with client.stream("GET", f"/api/jobs/{job_id}/events") as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        for line in response.iter_lines():
            if line.startswith("data: "):
                events.append(json.loads(line.removeprefix("data: ")))
    return events


def test_job_lifecycle_sse_and_file(client: TestClient) -> None:
    created = client.post("/api/jobs", json=PAYLOAD)
    assert created.status_code == 201
    job = created.json()
    assert job["status"] == "queued"
    assert job["stages"] == [1]
    assert (job["duration"], job["aspect"], job["resolution"], job["engine"]) == (
        15,
        "9:16",
        "720p",
        "distilled",
    )

    events = read_events(client, job["id"])
    progresses = [event["progress"] for event in events]
    assert progresses[0] == 0
    assert progresses[-1] == 100
    assert progresses == sorted(progresses)
    assert events[-1]["status"] == "done"
    assert all(isinstance(event["message"], str) and event["message"] for event in events)

    detail = client.get(f"/api/jobs/{job['id']}").json()
    assert detail["status"] == "done"
    assert detail["video_url"] == f"/api/files/{job['id']}.mp4"

    file_response = client.get(detail["video_url"])
    assert file_response.status_code == 200
    assert file_response.headers["content-type"] == "video/mp4"
    assert file_response.content

    listed = client.get("/api/jobs").json()
    assert [item["id"] for item in listed] == [job["id"]]


def test_file_404_for_unknown_job(client: TestClient) -> None:
    assert client.get(f"/api/files/{uuid.uuid4().hex}.mp4").status_code == 404
    assert client.get(f"/api/jobs/{uuid.uuid4().hex}").status_code == 404
    assert client.get(f"/api/jobs/{uuid.uuid4().hex}/events").status_code == 404


def test_file_404_when_job_failed(make_settings: Callable[..., Settings]) -> None:
    with TestClient(create_app(make_settings(stage1_backend="ltx"))) as client:
        job = client.post("/api/jobs", json=PAYLOAD).json()
        events = read_events(client, job["id"])
        assert events[-1]["status"] == "failed"
        assert client.get(f"/api/files/{job['id']}.mp4").status_code == 404


@pytest.mark.parametrize(
    "path",
    [
        "/api/files/..%2F..%2Fpyproject.toml",
        "/api/files/..%2F..%2Fapp%2Fmain.py.mp4",
        "/api/files/%2e%2e%2f%2e%2e%2fdata%2fjobs.db.mp4",
        "/api/files/..\\..\\pyproject.toml.mp4",
        "/api/files/../../pyproject.toml",
        "/api/files/not-a-uuid.mp4",
    ],
)
def test_file_path_traversal_rejected(client: TestClient, path: str) -> None:
    response = client.get(path)
    assert response.status_code in {404, 422}
    assert "video/mp4" not in response.headers.get("content-type", "")


@pytest.mark.parametrize(
    "override",
    [
        {"duration": 25},
        {"aspect": "1:1"},
        {"resolution": "4k"},
        {"engine": "turbo"},
        {"stages": [2]},
        {"stages": []},
        {"prompt": "   "},
        {"output_path": "../../etc"},
    ],
)
def test_create_job_validation(client: TestClient, override: dict) -> None:
    assert client.post("/api/jobs", json={**PAYLOAD, **override}).status_code == 422


def test_stage2_rejected_when_comfy_not_configured(client: TestClient) -> None:
    response = client.post("/api/jobs", json={**PAYLOAD, "stages": [1, 2]})
    assert response.status_code == 400


def test_gpu_not_ready_without_nvidia_smi(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(gpu.shutil, "which", lambda _: None)
    assert client.get("/api/gpu").json() == {
        "ready": False,
        "name": None,
        "vram_total_mb": None,
        "vram_used_mb": None,
    }


def test_gpu_parses_nvidia_smi(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(gpu.shutil, "which", lambda _: "nvidia-smi")

    def fake_run(*args: object, **kwargs: object) -> subprocess.CompletedProcess[str]:
        return subprocess.CompletedProcess(args, 0, stdout="NVIDIA GeForce RTX 3060, 12288, 512\n")

    monkeypatch.setattr(gpu.subprocess, "run", fake_run)
    assert client.get("/api/gpu").json() == {
        "ready": True,
        "name": "NVIDIA GeForce RTX 3060",
        "vram_total_mb": 12288,
        "vram_used_mb": 512,
    }


def test_cors_allows_only_localhost_3000(client: TestClient) -> None:
    headers = {"Access-Control-Request-Method": "POST"}
    allowed = client.options(
        "/api/jobs", headers={**headers, "Origin": "http://localhost:3000"}
    )
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"
    denied = client.options("/api/jobs", headers={**headers, "Origin": "http://evil.example"})
    assert "access-control-allow-origin" not in denied.headers
