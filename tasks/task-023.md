# task-023 웹 GSAP 진행 애니메이션 (프로그레스·단계 표시, reduced-motion)

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-001 · 위험도 높음 · 보안 영향 새 의존성(GSAP) |
| 담당 | builder → reviewer(security: 라이선스) + codex-reviewer(a11y) |
| 근거 | `docs/03_SCREENS_UX.md` 규칙 표 진행 애니메이션·reduced-motion 행, `docs/01_PRD.md#3` R-B3 |
| 쓰기 허용 | `apps/web/**`, lockfile |

## 할 것
- GSAP 최신 stable 버전·라이선스 조건 확인(`secscan license` + 공식 라이선스 문서 근거) → 팀장 승인 후 설치
- 진행률 바·단계 표시 컴포넌트 1개(S-02·S-03·S-05 공용), 값은 props(SSE)만
- `prefers-reduced-motion: reduce` 대체(즉시 반영), 언마운트 시 트윈 정리, `role="progressbar"`·`aria-live`

## 하지 않을 것
- 승인 전 설치, 진행률 값 보간으로 가짜 진척 표시, 유료 플러그인 사용(조건 미확인)

## 완료 조건
- [ ] 라이선스·버전 근거를 팀장에게 보고, `pnpm test`: reduced-motion 시 트윈 미호출 테스트 통과
- [ ] `pnpm lint`·`pnpm typecheck`·`pnpm build` 통과
