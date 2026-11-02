# task-024 웹 S-03 벤치마킹 입력·분석 · S-04 분석 결과·제작 설정

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-016·017·022·023 · 위험도 보통 · 보안 영향 로컬 동의 상태 |
| 담당 | builder → codex-reviewer(code·design) |
| 근거 | `docs/03_SCREENS_UX.md` S-03·S-04 행·상태·F-04·F-06, `docs/04_API.md#1`·`#2` |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- S-03: URL 입력(A-07 즉시 검사)·분석 시작(A-08)·진행(A-10 + task-023 컴포넌트); 2-1은 로컬 분석만, 2-2에서 A-13 설정 기본값과 Claude 선택 추가
- S-03에서 다운로드 고지와 동의 체크를 제공하고 A-13/A-14로 상태를 저장·표시; 동의 전 분석 버튼 비활성
- S-04: 장면 카드(A-12)·초안 편집·제작 방식 A/B·시작 장면 선택(B)·생성(A-01 `analysis_id`·`make_mode`)
- 웹 타입을 `04_API.md#2` Analysis·JobCreate 확장과 맞춤

## 하지 않을 것
- 브라우저에서 URL로 외부 요청, Claude 키 처리, 고지 문구 변경(`docs/01_PRD.md#6` 확정 문구 그대로)

## 완료 조건
- [ ] `pnpm lint`·`pnpm typecheck`·`pnpm build`·`pnpm test` 통과
- [ ] 상태 표(빈·로딩·오류·성공) 전부 화면 확인, 3구간 `shot`
