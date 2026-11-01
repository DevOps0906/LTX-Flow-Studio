# task-006 스테이지 1 구현 (세그먼트 생성 · ffmpeg 연결)

| 항목 | 내용 |
|---|---|
| 웨이브 | W2 · 선행 task-004·005 · 위험도 높음 · 보안 영향 의존성(ffmpeg 외부 호출) |
| 담당 | builder → codex-reviewer(code) |
| 근거 | `docs/05_STAGES.md#1`·`#2`, `docs/adr/ADR-001-gpu-3060-segments.md`, task-004 결과 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- 가짜 스테이지를 LTX distilled 스테이지로 교체: 15/20/30초 → 3/4/6 세그먼트, 세그먼트 사이 VRAM 해제
- 세그먼트 독립 생성 → ffmpeg concat 단순 이어붙이기로 `stage1.mp4`·`final.mp4` (`05_STAGES.md#2` 연결 행)
- 엔진 선택 지점은 열어 두되 이 작업은 `distilled`만 실동작(dev는 task-013)
- 오류 코드 확정(`04_API.md#3` 후보) — 바뀌면 04_API 같은 작업에서 갱신

## 하지 않을 것
- 1080p 생성, 자동 해상도 하향, ComfyUI 호출

## 완료 조건
- [ ] 15초 9:16 잡 1건이 `done`, `ffprobe`로 720×1280·길이 확인
- [ ] 모델 미존재 시 `failed(model_missing)` 테스트 통과
