# task-020 Claude 분석 어댑터 (describe·draft)

| 항목 | 내용 |
|---|---|
| 웨이브 | W6 · 선행 task-018·019 · 위험도 높음 · 보안 영향 외부 계약·키 사용·외부 송신 |
| 담당 | builder → challenger(착수 전) → codex-reviewer(code) + reviewer(security·contract) |
| 근거 | `docs/05_STAGES.md#4` Claude 열, `docs/adr/ADR-003-analysis-local-vs-claude.md`, `docs/04_API.md#6` |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- Anthropic SDK·모델명 최신 stable 확인(`secscan license`), ClaudeAnalyzer: 대표 프레임·자막 → 캡션·초안
- 이미지 수·크기 상한은 공식 문서 근거 + Q16 결정값, 초과 시 잘라 보냄
- 오류 매핑 `claude_key_missing`·`claude_auth_failed`·`claude_rate_limited`·`claude_failed`(외부 원문 미노출)

## 하지 않을 것
- 오디오 전송, 키를 브라우저로 전달, 요청·응답 본문 로그, 재시도 정책 임의 결정(팀장 결정 필요, 결정 전에는 재시도 없이 `failed`)

## 완료 조건
- [ ] `uv run pytest -q`: 모의 클라이언트로 성공·401·429·5xx 매핑, 로그에 키·본문 없음 통과
- [ ] 사용자 키로 실호출 1건 `done`(사용자 승인 후, 비용 발생 고지)
