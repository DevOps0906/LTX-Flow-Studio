# task-002 보안 기본 설정 (`/secure setup`)

| 항목 | 내용 |
|---|---|
| 웨이브 | W1 · 선행 task-001 · 위험도 높음 · 보안 영향 키·권한 |
| 담당 | builder → reviewer(security) |
| 근거 | `docs/01_PRD.md#8`(L1) |
| 쓰기 허용 | `.gitignore`, `.env.example`, `security/**`, `.github/dependabot.yml`, `SECURITY.md`(`secscan setup` 산출, 2026-11-02 팀장 확장) |

## 할 것
- `/secure setup` 실행(L1). `.gitignore`에 `models/`·`outputs/`·`apps/api/data/`·`.env*`(예시 제외)·`*.db-*`·`*.log`
- `.env.example`: 현재 코드가 읽는 `LTX_API_COMFYUI_URL`만 기재. `LTX_API_COMFYUI_PATH`는 아직 코드에서 읽지 않음. `HF_TOKEN`은 .env로 안 읽히므로 주석 안내(OS 환경변수·`hf auth login`)
- 라이선스 예외(ComfyUI·ffmpeg 외부 호출)는 PRD #8 팀장 결정 후 `security/policy.json`에 반영 → Q9가 task-012a 전까지 미결 허용이라 이번에는 보류

## 하지 않을 것
- 실제 키 값 기록, 앱 코드 수정

## 완료 조건
- [x] `secscan all`: 취약점 엔진 실행, "먼저 고칠 것: 없음"(MODERATE 2건·KEV 0), 라이선스 정보 없음 492건 기록
- [x] `git check-ignore`에서 `.env`·`models/`·`outputs/`·`apps/api/data/` 무시, `.env.example`은 예외 처리 확인
- [x] 비밀·모델·출력·데이터 산출물은 Git 추적 대상에 없음
