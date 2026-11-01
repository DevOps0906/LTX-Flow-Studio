# task-008 웹 S-01 생성 스튜디오 · 갤러리

| 항목 | 내용 |
|---|---|
| 웨이브 | W3 · 선행 task-001·005 · 위험도 보통 · 보안 영향 없음 |
| 담당 | builder → codex-reviewer(design) |
| 근거 | `docs/03_SCREENS_UX.md` S-01(화면·상태·규칙), `docs/04_API.md#2`(JobCreate·GpuStatus) |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- 폼(프롬프트·태그·길이·비율·해상도·엔진 Distilled/Dev + Dev 지연 안내), 헤더 GPU 상태(A-06), 생성(A-01), 갤러리(A-02)
- 1080p 비활성 규칙(`stage2_available`), 빈·로딩·오류 상태, 반응형 3구간

## 하지 않을 것
- S-02 결과 패널(task-009), hex·px 직접 사용

## 완료 조건
- [ ] `pnpm lint`·`pnpm typecheck`·`pnpm test` 통과, 3구간 스크린샷(`shot`) 제출
