# task-016 URL 검증 · 원본 다운로드 (A-07, yt-dlp 인자 고정)

| 항목 | 내용 |
|---|---|
| 웨이브 | W5 · 선행 task-003·014 · 위험도 높음 · 보안 영향 노출 면(외부 송신·명령 실행) |
| 담당 | builder → challenger(착수 전) → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/04_API.md#1` A-07, `docs/04_API.md#6` 입력 행, `docs/05_STAGES.md#4` step 1 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- 호스트 정확 일치 허용 목록 + 경로 패턴 + 영상 ID 추출 → 정규 URL 재구성
- yt-dlp를 인자 배열로 실행(셸 금지), task-014에서 확인한 고정 옵션만, 출력 `data/sources/<analysis_id>/`
- 오류 매핑: `invalid_url`·`host_not_allowed`·`unsupported_url`·`source_unavailable`·`download_failed`
- 사용자 결정 Q11 고지 문구 반영 전에는 기능 플래그 꺼짐

## 하지 않을 것
- 사용자 입력으로 옵션·포맷·경로 받기, 재생목록·라이브 지원, 상한값 임의 결정(Q16)

## 완료 조건
- [ ] `uv run pytest -q`: 허용·거부 URL 표(서브도메인 위장·IP·포트·userinfo·`http`·옵션 문자열 `--exec` 포함) 통과
- [ ] 실행 인자 스냅샷 테스트: 사용자 문자열이 정규 URL 외에 인자에 들어가지 않음
