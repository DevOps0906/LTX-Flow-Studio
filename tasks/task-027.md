# task-027 벤치마킹 통합 테스트 · README 진행 현황

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-018·024·025(Q10 범위에 따라 020·021·026 추가) · 위험도 보통 · 보안 영향 없음 |
| 담당 | tester (+ planner: README) |
| 근거 | `docs/01_PRD.md#5` 벤치마킹 행, `docs/03_SCREENS_UX.md` F-04~F-07 |
| 쓰기 허용 | `apps/**/tests/**`, `README.md` |

## 할 것
- 분석 방식(local·claude) × 제작 방식(A·B) 중 Q10 범위 조합으로 URL 1개 → `done` 확인
- 거부 URL·키 미설정·원본 삭제 상태의 오류 화면 확인, 로그에 키·자막 전문 없음 확인
- README `## 진행 현황`·`## 콘텐츠 바로가기` 갱신

## 하지 않을 것
- 기능 추가·수정(발견 문제는 `tasks/README.md` 발견한 문제 표로)

## 완료 조건
- [ ] `pnpm test`·`uv run pytest -q` 통과, 조합별 결과표를 PRD #5 근거로 제출
