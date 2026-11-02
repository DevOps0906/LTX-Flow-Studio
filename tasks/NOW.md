# NOW — 재진입 스냅샷 (30줄 이내, 매 작업 끝에 덮어쓴다)

- 갱신: 2026-11-02
- 현재 작업: 기획 재검토·사용자 결정 반영 — 상태: 문서 반영 완료
- 마지막으로 한 일: 릴리스 1에서 선택 스테이지 2 의존 제거(task-012), GNB 셸 task-001 반영·task-022 범위 축소, Q13(24시간)·Q19(단일 재생)·Q21(SQLite 동의)·Q22(S-01 대시보드) 결정 전파, README·API·화면·아키텍처·작업표 갱신
- 다음 한 걸음: task-001 lint/typecheck 검증(현재 `node_modules` 없음) → 문서 리뷰(reviewer doc) → Q4·Q6·Q7·Q8·Q9 확인 → task-002
- 열린 결정(미결): PRD `#7` Q4·Q6·Q7·Q8·Q9·Q16 · 큐 상한에 실행 잡 포함 여부 · PRD `#8` L1 유지 여부 · `http` 허용 · Claude 재시도 정책 · 분석 방식 기본값
- 확인 필요: YouTube 약관 충돌 여부 · GSAP 버전·라이선스 · LTX I2V 지원·파라미터 · yt-dlp·Whisper·비전모델·장면 감지 라이선스·VRAM · 자격 증명 관리자 접근 라이브러리(새 의존성) · Claude 모델·이미지 상한·비용 · yt-dlp 옵션명 · 영상 ID 형식 · 키 형식 규칙
- 디자인 결정: accent `#6062e9` · accent-text `#818cf8` · 신규 토큰 채택 · `--font-mono`는 시스템 폰트 스택 우선(JetBrains Mono·D2Coding 보류). `docs/design/v2/tokens.css`의 `--font-mono`는 아직 JetBrains 우선 → 앱 적용 때 교정
- 주의: 다운로드·방식 B 기능 플래그 기본 꺼짐(동의 후 켬), 동의 버전·시각 SQLite 저장. 원본·프레임은 성공 완료 후 24시간, 실패 시 즉시 삭제. 수치(분석 상한) 추측 금지(Q16)
- SDLC 단계: 02 릴리스 경계·UX 결정 확정 · 04 시안 토큰·GNB 적용(검증 남음) · 06 릴리스 1 뼈대 (`docs/06_SDLC.md#1`)
- 담당 모델/역할: planner(기획 문서 대리)
- 수정 파일: DESIGN.md, README.md, docs/01_PRD·02·03·04·05·06, tasks/README.md·NOW.md·task-001·012·016·017·022·024·025·026
- 테스트 상태: 문서 변경. `pnpm lint` 실행 실패: node_modules 미설치(eslint 없음). mmd 변경 없음
- 남은 작업: 릴리스 1 task-001~013(대기) · 2-1 9개·2-2 5개(보류, 릴리스 1 완료 후 착수)
