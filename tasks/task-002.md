# task-002 보안 기본 설정 (`/secure setup`)

| 항목 | 내용 |
|---|---|
| 웨이브 | W1 · 선행 task-001 · 위험도 높음 · 보안 영향 키·권한 |
| 담당 | builder → reviewer(security) |
| 근거 | `docs/01_PRD.md#8`(L1) |
| 쓰기 허용 | `.gitignore`, `.env.example`, `security/**` |

## 할 것
- `/secure setup` 실행(L1). `.gitignore`에 `models/`·`outputs/`·`data/`·`.env*`(예시 제외)
- `.env.example`: `HF_TOKEN`·`COMFYUI_URL`·`COMFYUI_PATH` 이름만
- 라이선스 예외(ComfyUI·ffmpeg 외부 호출)는 PRD #8 팀장 결정 후 `security/policy.json`에 반영

## 하지 않을 것
- 실제 키 값 기록, 앱 코드 수정

## 완료 조건
- [ ] `secscan` 통과, `git status`에 `.env`·`models/`·`outputs/` 미추적
