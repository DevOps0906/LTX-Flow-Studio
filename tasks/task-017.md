# task-017 분석 잡 API · 큐 (A-08~A-12, analyses 테이블)

| 항목 | 내용 |
|---|---|
| 웨이브 | W6 · 선행 task-005·016 · 위험도 높음 · 보안 영향 노출 면(새 엔드포인트·파일 서빙) |
| 담당 | builder → codex-reviewer(code) + reviewer(contract·security) |
| 근거 | `docs/04_API.md#1`·`#2` Analysis·`#3` 분석 표·`#6`, `docs/02_ARCHITECTURE.md#2` GPU 공유·파일 행 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- `analyses` 테이블, A-08 생성(서버 재검증)·A-09 조회·A-10 SSE·A-11 원본·A-12 프레임(UUID·정수 경로만)
- GPU 잠금 공유(분석·생성 순차), 생성 잡과 같은 FIFO·큐 5개 공유(Q15 확정), 재시작 시 `running` → `failed(interrupted)`
- A-08은 `benchmark_download_enabled`와 현재 동의 버전을 서버에서 재검증하고, 불일치·미동의면 `download_consent_required`
- JobCreate에 `analysis_id`·`make_mode`·`keyframe_ids` 검증 추가(`analysis_not_done`·`keyframe_not_found`), `i2v`는 021 전까지 `i2v_unavailable`
- `source_expires_at = finished_at + 24h`; 실패 시 원본·프레임 즉시 삭제. 기한 전 생성 작업이 프레임을 사용 중이면 작업 종료 직후 삭제
- 만료 후 A-11 원본 조회와 새 생성 요청을 거부(`analysis_expired`); 기존 진행 작업은 종료까지 필요한 프레임을 유지

## 하지 않을 것
- 분석 단계 실제 처리(018·020), A-11에 다운로드 헤더, 키 관련 코드

## 완료 조건
- [ ] `uv run pytest -q`: A-08~A-12 계약·404·경로 조작 거부·Origin 가드·SSE 순서 테스트 통과
- [ ] 분석 잡 실행 중 생성 잡이 GPU를 동시에 잡지 않음 테스트
- [ ] 성공 후 만료·실패 즉시 정리·임시 자막 삭제·진행 중 생성의 프레임 보호 테스트
