# task-021 제작 방식 B (make_mode=i2v) 스테이지 1 확장

| 항목 | 내용 |
|---|---|
| 웨이브 | W6 · 선행 task-006·015·017·019 · 위험도 높음 · 보안 영향 의존성(I2V 가중치) |
| 담당 | builder → codex-reviewer(code) + reviewer(contract) → tester |
| 근거 | `docs/adr/ADR-004-make-mode-a-b.md`, `docs/05_STAGES.md#5`, `docs/04_API.md#2` JobCreate |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- task-015 "지원" 판정일 때만: 세그먼트별 시작 프레임 주입(세그먼트마다 선택 장면 1장, Q18 확정), 프레임 비율 맞춤
- t2v·i2v 파이프라인 전환 시 이전 모델 해제(ADR-001 전환 규칙)
- 오류 `keyframe_missing`·`i2v_failed`. "미지원"이면 `i2v_unavailable` 유지만 하고 종료
- 기능 플래그 기본 꺼짐(Q12 확정: 릴리스 2-2 허용), S-07에서 동의 후 켰을 때만 동작. A-01에서 활성 상태·현재 동의 버전을 서버 검증하고 아니면 `i2v_disabled`

## 하지 않을 것
- t2v 경로 변경, 파라미터 추측 기본값, 원본 클립을 영상 조건으로 사용

## 완료 조건
- [ ] `make_mode=i2v` 15초 9:16 잡 1건 `done`, `ffprobe` 720×1280
- [ ] `uv run pytest -q`: 매핑·누락 프레임·모델 전환 테스트 통과
- [ ] I2V 기본 비활성·동의 버전 누락/불일치 시 서버 차단 테스트
