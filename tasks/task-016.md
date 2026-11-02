# task-016 URL 검증 · 다운로드 동의 설정 · 원본 다운로드

| 항목 | 내용 |
|---|---|
| 웨이브 | W5 · 선행 task-003·014 · 위험도 높음 · 보안 영향 노출 면(외부 송신·명령 실행) |
| 담당 | builder → challenger(착수 전) → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/04_API.md#1` A-07·A-13·A-14, `docs/04_API.md#6` 입력 행, `docs/05_STAGES.md#4` step 1 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- 호스트 정확 일치 허용 목록 + 경로 패턴 + 영상 ID 추출 → 정규 URL 재구성
- SQLite 설정에 `benchmark_download_enabled`(기본 false), 동의 고지 버전·시각 저장; A-13/A-14로 조회·수정
- 활성화는 S-03의 명시적 고지 동의 후에만 허용하고, 서버가 현재 고지 버전과 시각을 기록
- yt-dlp를 인자 배열로 실행(셸 금지), task-014에서 확인한 고정 옵션만, 출력 `data/sources/<analysis_id>/`
- 오류 매핑: `invalid_url`·`host_not_allowed`·`unsupported_url`·`source_unavailable`·`download_failed`
- 다운로드는 저장된 동의가 활성이고 현재 고지 버전과 일치할 때만 허용(Q11·Q21)

## 하지 않을 것
- 사용자 입력으로 옵션·포맷·경로 받기, 재생목록·라이브 지원, 상한값 임의 결정(Q16)
- Claude API 키 처리(task-019)

## 완료 조건
- [ ] `uv run pytest -q`: 허용·거부 URL 표(서브도메인 위장·IP·포트·userinfo·`http`·옵션 문자열 `--exec` 포함) 통과
- [ ] 실행 인자 스냅샷 테스트: 사용자 문자열이 정규 URL 외에 인자에 들어가지 않음
- [ ] 동의 기본 꺼짐·동의 기록·철회·고지 버전 불일치 시 차단 테스트
