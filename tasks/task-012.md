# task-012 통합 테스트 · README 진행 현황

| 항목 | 내용 |
|---|---|
| 웨이브 | W4 · 선행 task-009·011·013 · 위험도 보통 · 보안 영향 없음 |
| 담당 | tester (+ planner: README) |
| 근거 | `docs/01_PRD.md#5`, `docs/03_SCREENS_UX.md` 흐름 표 |
| 쓰기 허용 | `apps/**/tests/**`, `README.md` |

## 할 것
- 15·20·30초 × 9:16·16:9 × distilled·dev 스테이지 1 매트릭스, ComfyUI 유무 각각 1080p 동작 확인
- README `## 진행 현황`·`## 콘텐츠 바로가기`(plan-docs 원칙 7)

## 하지 않을 것
- 기능 추가·수정(발견 문제는 `tasks/README.md` 발견한 문제 표로)

## 완료 조건
- [ ] `pnpm test`·`uv run pytest -q` 통과, 매트릭스 결과표를 PRD #5 측정값 근거로 제출
