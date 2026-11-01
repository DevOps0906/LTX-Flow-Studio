# task-019 설정 · Claude API 키 저장 (A-13~A-16)

| 항목 | 내용 |
|---|---|
| 웨이브 | W5 · 선행 task-003 · 위험도 높음 · 보안 영향 키 권한(사용자 비밀 저장) |
| 담당 | builder → challenger(착수 전) → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/04_API.md#1` A-13~A-16·`#2` Settings·`#6` 키 행, `docs/01_PRD.md#8` |
| 쓰기 허용 | `apps/api/**`, `.env.example`(이름만) |

## 할 것
- 키 저장소 어댑터(Q14 결정 위치), A-15 쓰기 전용·A-16 삭제, A-13은 `claude_key_set`·끝 4자만
- `settings` 테이블은 `analysis_mode_default`만(키 금지)
- 로그·오류 메시지·예외 문자열에서 키 제거(마스킹 필터)

## 하지 않을 것
- 키를 SQLite·파일 평문·응답·SSE·로그에 기록, 키 유효성 확인용 외부 호출(요구 없음), 저장 위치 임의 결정

## 완료 조건
- [ ] `uv run pytest -q`: A-13 응답에 원문 없음 · 로그 캡처에 키 문자열 없음 · Origin 없는 PUT/DELETE 거부 통과
- [ ] `secscan`(비밀 스캔) 통과
