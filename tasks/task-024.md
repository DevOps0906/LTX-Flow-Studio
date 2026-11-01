# task-024 웹 S-03 벤치마킹 입력·분석 · S-04 분석 결과·제작 설정

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-017·022·023 · 위험도 보통 · 보안 영향 없음(서버 검증이 정본) |
| 담당 | builder → codex-reviewer(code·design) |
| 근거 | `docs/03_SCREENS_UX.md` S-03·S-04 행·상태·F-04·F-06, `docs/04_API.md#4` |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- S-03: URL 입력(A-07 즉시 검사)·분석 방식(기본값 A-13)·고지·분석 시작(A-08)·진행(A-10 + task-023 컴포넌트)
- S-04: 장면 카드(A-12)·초안 편집·제작 방식 A/B·시작 장면 선택(B)·생성(A-01 `analysis_id`·`make_mode`)
- 웹 타입을 `04_API.md#2` Analysis·JobCreate 확장과 맞춤

## 하지 않을 것
- 브라우저에서 URL로 외부 요청, Claude 키 처리, 고지 문구 변경(`docs/01_PRD.md#6` 확정 문구 그대로)

## 완료 조건
- [ ] `pnpm lint`·`pnpm typecheck`·`pnpm build`·`pnpm test` 통과
- [ ] 상태 표(빈·로딩·오류·성공) 전부 화면 확인, 3구간 `shot`
