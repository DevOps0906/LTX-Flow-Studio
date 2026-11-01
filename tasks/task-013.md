# task-013 스테이지 1 Dev 엔진 (실측 · 실동작)

| 항목 | 내용 |
|---|---|
| 웨이브 | W2 · 선행 task-006 · 위험도 높음 · 보안 영향 의존성(dev 가중치) |
| 담당 | builder (가중치 다운로드·실행은 사용자 승인 후) → codex-reviewer(code) + reviewer(security: 가중치 라이선스) |
| 근거 | `docs/adr/ADR-001-gpu-3060-segments.md` Dev 엔진 위험 표, `docs/05_STAGES.md#2` 엔진 행, `docs/04_API.md#2` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- LTX-Video dev 체크포인트 최신 stable·라이선스 확인(`secscan license`)
- 720p 9:16·16:9 ~5초 세그먼트 1개 실측: VRAM 최대치·시간·스텝 수 → 팀장 보고
- `engine="dev"` 잡 실동작: 잡 시작 시 해당 엔진만 적재·이전 엔진 해제, OOM이면 `failed(oom)`

## 하지 않을 것
- 자동 해상도·스텝 하향, distilled 경로 변경, 문서 수치 직접 확정(팀장 몫), 가중치 커밋

## 완료 조건
- [ ] `engine=dev` 15초 9:16 잡 1건 `done`(또는 OOM 시 `failed(oom)` 재현 기록), `ffprobe` 720×1280 확인
- [ ] `uv run pytest -q`: 엔진 전환 시 이전 모델 해제 테스트 통과
