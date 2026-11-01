# task-004 스테이지 1 실측 스파이크 (RTX 3060 12GB)

| 항목 | 내용 |
|---|---|
| 웨이브 | W2 · 선행 task-003 · 위험도 높음 · 보안 영향 의존성(torch·diffusers·가중치) |
| 담당 | builder (실행은 사용자 승인 후) → reviewer(security: 의존성 라이선스) |
| 근거 | `docs/adr/ADR-001-gpu-3060-segments.md`, `docs/05_STAGES.md#2` |
| 쓰기 허용 | `apps/api/scripts/bench_*`, `apps/api/pyproject.toml` |

## 할 것
- diffusers·LTX distilled 최신 stable 버전과 가중치 라이선스 확인(`secscan license`)
- 720p 9:16·16:9, ~5초 세그먼트 1개 생성: VRAM 최대치·시간·fps·프레임 수 기록
- 결과를 팀장에게 보고 → `01_PRD.md#5` 생성 시간 확정 근거 (dev 엔진 실측은 task-013)

## 하지 않을 것
- 가중치·출력 커밋, 문서 수치 직접 확정(팀장 몫), API 연동

## 완료 조건
- [ ] 벤치 스크립트 1회 실행 로그(VRAM·시간) 제출, OOM 여부 명시
