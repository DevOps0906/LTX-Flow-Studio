# NOW — 재진입 스냅샷 (30줄 이내, 매 작업 끝에 덮어쓴다)

- 갱신: 2026-11-01
- 현재 작업: 기획 문서 작성 + 사용자 결정 반영 — 상태: 완료(검토 대기)
- 마지막으로 한 일: 사용자 결정 반영 — ComfyUI 경로 확정, Dev 엔진 MVP 포함(task-013 추가), ffmpeg concat 확정, L1·상한(2000자·큐 5·limit 50)
- 다음 한 걸음: reviewer(doc) 검토 → task-001 착수
- 열린 결정(미결): PRD `#7` Q4 웹→API 프록시 · Q6 보관 기간 · Q7 린 게이트 · Q8 S-02 `?job=` · Q9 ComfyUI·ffmpeg 라이선스 예외
- 확인 필요: ComfyUI 포트(8188 추정) · LTX 노드·워크플로 · 세그먼트 길이·fps · dev 메모리·시간 · 큐 5개에 실행 중 잡 포함 여부
- 주의: 원본 PRD의 RTX 4090·"수십 초" 수치를 그대로 쓰지 않는다(ADR-001). ComfyUI 노드·포트는 추측 금지
- SDLC 단계: 02~05 문서 완료, 06 구현 뼈대 단계 (`docs/06_SDLC.md`)
- 담당 모델/역할: planner(기획 문서 대리)
- 수정 파일: docs/01~05, docs/adr/ADR-001·002, docs/diagrams/*.mmd, tasks/README.md, tasks/task-001~013.md
- 테스트 상태: 미실행(mmd-check 미실행 — 셸 도구 없음)
- 남은 작업: task-001~013
