# ADR-002 두 백엔드 — 스테이지 1 Python 직접, 스테이지 2 ComfyUI 선택 플러그인

- 상태: 채택
- 날짜: 2026-11-01

| 항목 | 내용 |
|---|---|
| 맥락 | 원본 §5는 "Local PyTorch / ComfyUI Server or Cloud GPU API"로 백엔드를 열어 두었다. 하나로 고정하면 ComfyUI 미설치 환경에서 앱이 동작하지 않거나, 고해상도 워크플로를 직접 다시 만들어야 한다. 사용할 ComfyUI(포터블 루트 `C:\ComfyUI\ComfyUI_windows_portable`, 본체 `...\ComfyUI` v0.32.0)에는 LTX 노드뿐 아니라 모델 자체가 없다(`05_STAGES.md#3`). |
| 선택 | 스테이지 1 = FastAPI 프로세스 안에서 diffusers LTX distilled 직접 실행(단독 완결). 스테이지 2 = 기존 설치 ComfyUI를 REST/WS로 부르는 선택 플러그인. 둘 다 `Stage` 인터페이스 뒤(`05_STAGES.md#1`), 잡 입력 `stages=[1]` 또는 `[1,2]`. 연결은 `.env` `COMFYUI_URL`·`COMFYUI_PATH`. |
| 대안 | (1) ComfyUI 단일 백엔드 — 설치·노드 의존이 커지고 1단계도 ComfyUI 없이는 불가해 버림. (2) Python 단일(업스케일까지 직접) — 업스케일 구현 부담, 기존 설치 자산을 못 써서 버림. (3) 클라우드 GPU API — 비용·로컬 원칙과 충돌. |
| 결과 | 얻음: ComfyUI 없이도 720p 완결, 고해상도는 있을 때만. 잃음: 백엔드 2개 유지, GPU를 두 프로세스가 나눠 씀(스테이지 1 모델 해제 후 스테이지 2 실행 필요 — 확인 필요). 미결: 포트 8188 미확인, 노드·워크플로 확인 필요. ComfyUI 라이선스(GPL 추정) 외부 프로세스 호출로 한정 — `01_PRD.md#8`. 되돌리는 비용: 중간(어댑터 교체). |
