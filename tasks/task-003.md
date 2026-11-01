# task-003 API 골격 · 로컬 가드 · GET /api/gpu

| 항목 | 내용 |
|---|---|
| 웨이브 | W1 · 선행 task-002 · 위험도 높음 · 보안 영향 노출 면 |
| 담당 | builder → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/04_API.md#1`(A-06)·`#2`(GpuStatus)·`#5`, `docs/02_ARCHITECTURE.md#2` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- FastAPI · Pydantic v2 · uv 프로젝트, `127.0.0.1:8000` 바인딩
- Host·Origin 가드(`04_API.md#5` 결정), 공통 오류 형식
- SQLite 초기화(`jobs` 테이블, 필드 = Job 객체), A-06 `GET /api/gpu`(스테이지 2는 우선 `false`)

## 하지 않을 것
- 모델 로드·추론, 잡 엔드포인트(task-005)

## 완료 조건
- [ ] `uv run pytest -q`: 가드(잘못된 Host 400, 외부 Origin POST 거부), A-06 스키마 테스트 통과
