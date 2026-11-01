# task-017 분석 잡 API · 큐 (A-08~A-12, analyses 테이블)

| 항목 | 내용 |
|---|---|
| 웨이브 | W6 · 선행 task-005·016 · 위험도 높음 · 보안 영향 노출 면(새 엔드포인트·파일 서빙) |
| 담당 | builder → codex-reviewer(code) + reviewer(contract·security) |
| 근거 | `docs/04_API.md#1`·`#2` Analysis·`#3` 분석 표·`#6`, `docs/02_ARCHITECTURE.md#2` GPU 공유·파일 행 |
| 쓰기 허용 | `apps/api/**` |

## 할 것
- `analyses` 테이블, A-08 생성(서버 재검증)·A-09 조회·A-10 SSE·A-11 원본·A-12 프레임(UUID·정수 경로만)
- GPU 잠금 공유(분석·생성 순차), 큐 규칙은 Q15 결정대로, 재시작 시 `running` → `failed(interrupted)`
- JobCreate에 `analysis_id`·`make_mode`·`keyframe_ids` 검증 추가(`analysis_not_done`·`keyframe_not_found`), `i2v`는 021 전까지 `i2v_unavailable`
- 원본 사본 정리는 Q13 결정대로

## 하지 않을 것
- 분석 단계 실제 처리(018·020), A-11에 다운로드 헤더, 키 관련 코드

## 완료 조건
- [ ] `uv run pytest -q`: A-08~A-12 계약·404·경로 조작 거부·Origin 가드·SSE 순서 테스트 통과
- [ ] 분석 잡 실행 중 생성 잡이 GPU를 동시에 잡지 않음 테스트
