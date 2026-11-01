# task-009 웹 S-02 생성 결과 패널

| 항목 | 내용 |
|---|---|
| 웨이브 | W3 · 선행 task-007·008 · 위험도 보통 · 보안 영향 없음 |
| 담당 | builder → codex-reviewer(design) |
| 근거 | `docs/03_SCREENS_UX.md` S-02·F-01~F-03, `docs/04_API.md#3` |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- SSE 구독 진행률·단계 메시지·세그먼트 n/N, 플레이어(반복·전체화면, A-05)
- MP4 다운로드(`?download=1`)·프롬프트 복사·재생성(A-01), 실패 사유 한국어 표시, 404 처리

## 하지 않을 것
- 잡 취소 UI(API 없음), API 변경

## 완료 조건
- [ ] `pnpm typecheck`·`pnpm test` 통과, 가짜 스테이지로 F-01·F-03 수동 재현 기록
