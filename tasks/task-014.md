# task-014 벤치마킹 로컬 분석 스파이크 (도구·모델 선정 · 3060 실측)

| 항목 | 내용 |
|---|---|
| 웨이브 | W5 · 선행 task-004 · 위험도 높음 · 보안 영향 새 의존성(yt-dlp·Whisper 구현체·비전모델 가중치·장면 감지 도구) |
| 담당 | builder(설치·다운로드·실행은 사용자 승인 후) → reviewer(security: 라이선스) |
| 근거 | `docs/05_STAGES.md#4`, `docs/adr/ADR-003-analysis-local-vs-claude.md`, `docs/01_PRD.md#8` 라이선스 행 |
| 쓰기 허용 | `apps/api/spikes/**`(임시), 보고는 팀장에게 |

## 할 것
- yt-dlp 최신 stable·라이선스·설치 방식(PATH vs uv 의존성)·필요한 고정 옵션명 확인
- 장면 감지: ffmpeg 필터 vs PySceneDetect 비교 1건 → 선택안
- Whisper 구현체·로컬 소형 비전모델 후보 각 1~2개: 라이선스·VRAM·시간을 3060에서 실측(공개 짧은 영상 1개, 사용자 지정)
- LTX 적재 → 해제 → 비전모델 적재의 순차 VRAM 기록
- Q16 상한값 후보(원본 길이·크기·장면 수)를 실측 근거와 함께 제안

## 하지 않을 것
- 본 구현·API 추가, 문서 수치 직접 확정(팀장 몫), 가중치·원본 커밋, GPL·AGPL 의존성 채택

## 완료 조건
- [ ] 후보별 라이선스·버전·VRAM 최대치·시간 표를 팀장에게 보고(`secscan license` 또는 수동 확인 근거)
- [ ] 순차 사용 시 OOM 없음 재현 기록(또는 OOM 조건 기록)
