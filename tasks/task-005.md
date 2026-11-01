# task-005 잡 API · 큐 (A-01·A-02·A-03·A-05)

| 항목 | 내용 |
|---|---|
| 웨이브 | W2 · 선행 task-003 · 위험도 높음 · 보안 영향 노출 면(파일 서빙) |
| 담당 | builder → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/04_API.md#1`·`#2`·`#5`, `docs/05_STAGES.md#1`, `docs/diagrams/job-state.mmd` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- `Stage` 인터페이스 + 가짜 스테이지(짧은 더미 MP4)로 큐·상태 전이 구현, 동시 실행 1잡
- A-01(409·429 포함)·A-02(커서)·A-03·A-05(UUID 매핑·Range·download)
- 서버 재시작 시 `running_*` → `failed(interrupted)`. 상한은 `04_API.md#2` 상한 행(2000자·큐 5·limit 50), `engine` 열거값 `distilled`·`dev`

## 하지 않을 것
- 실제 LTX 추론(task-006), SSE(task-007), 경로 입력 받기

## 완료 조건
- [ ] `uv run pytest -q`: 상태 전이·경로 조작(`../`) 404·잘못된 열거값 400 테스트 통과
