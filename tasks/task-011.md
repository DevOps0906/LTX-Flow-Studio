# task-011 스테이지 2 ComfyUI 어댑터

| 항목 | 내용 |
|---|---|
| 웨이브 | W4 · 선행 task-006·010 · 위험도 높음 · 보안 영향 외부 계약·노출 면(SSRF) |
| 담당 | challenger(착수 전) → builder → codex-reviewer(code) + reviewer(contract·security) |
| 근거 | `docs/05_STAGES.md#1`·`#3`, `docs/04_API.md#5`, task-010 결과 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- `Stage` 구현: task-010 워크플로 JSON 제출(REST/WS) → 1080p 회수 → `final.mp4`
- `available()`: `COMFYUI_URL` 로컬 주소만 허용, 응답·노드 확인 → A-06 `stage2_available`
- 스테이지 1 모델 해제 후 실행(GPU 공유), 실패 시 `stage2_failed` + `stage1.mp4` 보존

## 하지 않을 것
- ComfyUI 설치·노드 추가, 1단계 동작 변경

## 완료 조건
- [ ] `uv run pytest -q`(ComfyUI 모의 서버), 실제 잡 1건 `ffprobe` 1080×1920 확인
