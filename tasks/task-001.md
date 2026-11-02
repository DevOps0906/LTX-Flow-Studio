# task-001 프로젝트 생성 · 토큰

| 항목 | 내용 |
|---|---|
| 웨이브 | W1 · 선행 — · 위험도 낮음 · 보안 영향 없음 |
| 담당 | builder (+ designer: 토큰 값) |
| 근거 | `docs/02_ARCHITECTURE.md#1`·`#2`, `docs/03_SCREENS_UX.md` 규칙 표, `prd_design_spec.md#4.1` |
| 쓰기 허용 | 루트 `package.json`·`pnpm-workspace.yaml`, `apps/web/**`, `DESIGN.md` |

## 할 것
- pnpm 워크스페이스 + `apps/web`(Next.js 16 · React 19 · TS · Tailwind CSS v4, 최신 stable 확인 후 버전 고정)
- `apps/web/src/styles/tokens.css`: 채택한 v2 토큰과 3구간 폰트 크기 적용
- `/` → `/dashboard` 리다이렉트, S-01·S-02 구현을 위한 경로 기반 페이지 골격
- 앱 셸·반응형 GNB와 `/benchmark`·`/gallery`·`/settings` 라우트 자리표시 화면 구현(현재 커밋에 선구현됨)
- `/api/*` → `127.0.0.1:8000` 연결 방식은 PRD Q4 결정대로(미결이면 rewrites 제안안)

## 하지 않을 것
- S-01·S-02 화면 구현(task-008·009), 인증·랜딩

## 완료 조건
- [x] `pnpm lint` · `pnpm typecheck` 통과, `/` → `/dashboard` 이동 확인(2026-11-01, docker·dev 모두, GNB 셸 편입 Q20)
