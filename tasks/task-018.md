# task-018 로컬 분석 파이프라인 (scenes·transcript·describe·draft)

| 항목 | 내용 |
|---|---|
| 웨이브 | W6 · 선행 task-014·017 · 위험도 높음 · 보안 영향 의존성(task-014 선정분) |
| 담당 | builder → codex-reviewer(code) + reviewer(security: 라이선스) → tester |
| 근거 | `docs/05_STAGES.md#4` 로컬 열, `docs/adr/ADR-003-analysis-local-vs-claude.md` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- step 2~5 구현(공통 2·3은 Claude 경로가 재사용하도록 분리), `Analyzer` 인터페이스 + LocalAnalyzer
- 단계별 `progress` 이벤트(`step_index`/`steps_total`), GPU 단계 끝 모델 해제
- 오류 코드 `scene_detect_failed`·`transcript_failed`·`describe_failed`·`oom`

## 하지 않을 것
- 생성 잡 자동 시작, 자막 전문 로그, 상한값 임의 결정(Q16), task-014 미선정 모델 사용

## 완료 조건
- [ ] 사용자 지정 공개 영상 1개로 Analysis `done`, 장면·`prompt_draft` 채워짐(실기)
- [ ] `uv run pytest -q`: 단계 순서·실패 전이·모델 해제 테스트 통과
