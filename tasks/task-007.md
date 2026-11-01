# task-007 SSE 진행률 (A-04)

| 항목 | 내용 |
|---|---|
| 웨이브 | W2 · 선행 task-005 · 위험도 보통 · 보안 영향 없음(가드는 task-003 공통) |
| 담당 | builder → codex-reviewer(code) |
| 근거 | `docs/04_API.md#3`, `docs/diagrams/job-sequence.mmd` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- `GET /api/jobs/{id}/events`: 연결 즉시 `status`, 이후 `progress`·`done`·`error` 후 종료
- 웹 프록시(PRD Q4) 경유 시 버퍼링 없이 도착하는지 확인

## 하지 않을 것
- 웹 화면, 웹훅·폴링 대체 경로

## 완료 조건
- [ ] `uv run pytest -q`: 가짜 스테이지 잡에서 이벤트 순서 `status → progress… → done` 검증
