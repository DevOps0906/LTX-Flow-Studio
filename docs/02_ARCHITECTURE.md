# 02 ARCHITECTURE — LTX Nomad Studio

> 범위·용어: `01_PRD.md#3` · 스테이지 상세: `05_STAGES.md` · API: `04_API.md` · 결정: `adr/ADR-001`, `adr/ADR-002`

## 1. 구성 요소
| 구성 | 위치 | 기술 | 책임 | 하지 않는 것 |
|---|---|---|---|---|
| 웹 | `apps/web` | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 | `/dashboard` 단일 화면(`03_SCREENS_UX.md`), API 호출·SSE 구독 | 추론·파일 저장 |
| API·워커 | `apps/api` | FastAPI · Pydantic v2 · uv | `04_API.md` 엔드포인트, 잡 큐, 스테이지 실행 | 인증, 원격 노출 |
| 스테이지 1 | `apps/api` 내부 | diffusers LTX-Video distilled(기본) / dev (FP8 / CPU offload) | ~5초 세그먼트 생성 → 이어붙여 720p MP4 | 1080p 생성 |
| 스테이지 2(선택) | 외부: 기존 설치 ComfyUI | REST/WS (`COMFYUI_URL`) | 720p → 1080p 고해상도 | 설치·관리(사용자 몫) |
| 후처리 | PATH의 ffmpeg | 외부 프로세스 | 세그먼트 연결·인코딩 | 번들 배포 |
| 저장 | 로컬 디스크 + SQLite | `outputs/<job_id>/`, `data/app.db`(경로 제안) | 잡 기록·결과 파일 | 클라우드 저장 |
| 모델 | `models/` | 가중치(로컬, git 제외) | — | 자동 커밋 |

## 2. 경계·연결
| 경계 | 규칙 |
|---|---|
| 네트워크 | 웹 `127.0.0.1:3000`, API `127.0.0.1:8000`, ComfyUI는 로컬 URL만 허용 |
| 웹 → API | Next.js rewrites로 `/api/*` → `127.0.0.1:8000` 프록시(제안, 같은 출처·CORS 불필요). SSE 버퍼링 여부 확인 필요. **미결**(`01_PRD.md#7` Q4) |
| API → GPU | 프로세스 1개가 GPU 점유, **동시 실행 1잡**, 나머지는 FIFO 대기(`queued`) |
| API → ComfyUI | `Stage` 인터페이스 뒤의 어댑터 1개. 미설정·미응답이면 스테이지 2 비활성(`GET /api/gpu`의 `stage2_available=false`) |
| 파일 | `job_id`(서버 발급 UUID) → `outputs/<job_id>/final.mp4` 고정 매핑. 경로 입력 받지 않음 |

## 3. 데이터 흐름
1. 사용자가 S-01에서 설정 후 생성 → `POST /api/jobs`(`stages=[1]` 또는 `[1,2]`) → SQLite에 `queued` 기록.
2. 워커가 큐에서 꺼내 스테이지 1 실행: 세그먼트 N개 생성(15초=3, 20초=4, 30초=6 — 세그먼트 ~5초 기준, 실측 후 확정) → ffmpeg 연결.
3. `stages`에 2가 있으면 스테이지 2(ComfyUI) 실행, 없으면 1단계 결과가 최종.
4. 진행 상황은 `SSE /api/jobs/{id}/events`로 푸시, 완료 시 `GET /api/files/{id}.mp4`로 재생·다운로드.
- 흐름도: `diagrams/pipeline-flow.mmd` · 시퀀스: `diagrams/job-sequence.mmd` · 상태: `diagrams/job-state.mmd`

## 4. 잡 상태 (정본: `04_API.md#2`)
`queued → running_stage1 → (running_stage2) → done`, 어디서든 `failed`. 서버 재시작 시 `running_*` 잡은 `failed`(사유 `interrupted`)로 정리, `queued`는 유지.

## 5. 데이터 모델
SQLite `jobs` 테이블 1개(필드는 `04_API.md#2` Job 객체와 같다). 별도 데이터 모델 문서는 미작성 — 문서 번호 충돌 메모는 `05_STAGES.md` 머리말.

## 6. 품질 속성
| 속성 | 방침 |
|---|---|
| VRAM 12GB | 세그먼트 단위 생성, FP8·CPU offload, 세그먼트 사이 캐시 해제(ADR-001) |
| 내결함 | 세그먼트 파일을 `outputs/<job_id>/seg_NN.mp4`로 남겨 원인 추적. 이어 하기(재개)는 MVP 아님 |
| 관측 | 잡별 로그 `outputs/<job_id>/job.log`(프롬프트 전문·토큰 기록 금지는 `04_API.md#5`) |
