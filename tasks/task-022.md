# task-022 웹 GNB 레이아웃 · 라우트 · S-06 갤러리

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-008 · 위험도 보통 · 보안 영향 없음 |
| 담당 | builder (+codex-designer: 태블릿·모바일 GNB 형태) → codex-reviewer(design) |
| 근거 | `docs/03_SCREENS_UX.md` S-06·규칙 표 GNB·반응형 행, 흐름 F-07 |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- 좌측 GNB(대시보드·새로운 영상생성·갤러리·설정, `aria-current`), `/benchmark`·`/gallery`·`/settings` 빈 라우트
- S-06 갤러리(A-02, 벤치마킹 잡은 S-05로 이동), S-01 하단 갤러리는 유지 + "최근 생성 보기" → S-06
- "대시보드" = S-01(Q17 확정, 시안 v2 홈과 차이 Q22). GNB 셸 부분은 릴리스 1로 올릴 수 있음(Q20)

## 하지 않을 것
- S-03~S-05·S-07 본문, 색·크기 하드코딩, 새 의존성

## 완료 조건
- [ ] `pnpm lint`·`pnpm typecheck`·`pnpm build` 통과
- [ ] 3구간(390·900·1440) 스크린샷 `shot`으로 GNB 확인
