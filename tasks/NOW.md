# NOW — 재진입 스냅샷 (30줄 이내, 매 작업 끝에 덮어쓴다)

- 갱신: 2026-11-03
- 현재 작업: task-004 스테이지 1 실측 스파이크(3060) — 진행
- 다음 한 걸음: RTX 3060에서 Distilled 모델 로드·세그먼트 실측 및 결과 기록
- 계획: task-002 보안 기본 설정 완료(.env.example·Dependabot·SECURITY.md·ignore 규칙·secscan 확인) · Q9 policy.json은 task-012a 전까지 보류
- 마지막으로 한 일: task-003 API·Host/Origin 가드·공통 오류 처리 구현, 테스트 28개와 Ruff 통과
- 주의: `apps/api` 작업 트리 변경(guards.py·errors.py·routes.py·db.py·worker.py·schemas.py·progress.py)은 task-003 범위, 리뷰 전 — task-002에서 건드리지 않음
- 열린 결정(미결): PRD `#7` Q4·Q6·Q7·Q8·Q9·Q16 · 큐 상한에 실행 잡 포함 여부 · PRD `#8` L1 유지 여부 · `http` 스킴 허용 · Claude 재시도 정책 · 분석 방식 기본값
- 확인 필요: YouTube 약관 · GSAP 버전·라이선스 · LTX I2V 지원·파라미터 · yt-dlp·Whisper·비전모델·장면 감지 라이선스·VRAM · 자격 증명 관리자 접근 라이브러리 · Claude 모델·이미지 상한·비용 · yt-dlp 옵션명 · 영상 ID 형식 · 키 형식 규칙
- 디자인 결정: accent `#6062e9` · accent-text `#818cf8` · 신규 토큰 채택 · `--font-mono`는 시스템 폰트 우선(JetBrains Mono·D2Coding 보류). v2 토큰의 모노 스택은 앱 적용 때 교정
- 주의: 다운로드·방식 B 기능 플래그 기본 꺼짐(동의 후 켬), 동의 버전·시각 SQLite 저장. 원본·프레임은 성공 후 24시간, 실패 시 즉시 삭제. 분석 상한 추측 금지(Q16)
- SDLC 단계: 02 릴리스 경계·UX 결정 확정 · 04 시안 토큰·GNB 적용(검증 남음) · 06 릴리스 1 뼈대 (`docs/06_SDLC.md#1`)
- 담당: 팀장(직접 작성) → challenger → reviewer(security)
- 테스트 상태: task-003 `uv run pytest -q` 28 passed · `uv run ruff check .` 통과 · task-001 lint/typecheck 미실행(node_modules 없음)
- 남은 작업: 릴리스 1 task-004~013 · 2-1·2-2는 릴리스 1 완료 후 착수
