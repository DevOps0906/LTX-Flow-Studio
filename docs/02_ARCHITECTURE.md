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
| 저장 | 로컬 디스크 + SQLite | `outputs/<job_id>/`, `data/sources/<analysis_id>/`, `data/app.db` | 잡 기록·결과·분석 자산 및 동의 설정. 만료는 API 접근에서 즉시 적용하고, 실행 중 주기 정리·시작 시 정리로 파일을 삭제. 원본·프레임은 성공 완료 후 24시간, 임시 자막·전사는 분석 종료 직후, 실패 시 모든 임시 자산 즉시 삭제. 기한 전 접수된 생성 작업이 참조 중인 프레임은 작업 종료 직후 삭제 | 클라우드 저장 |
| 모델 | `models/` | 가중치(로컬, git 제외) | — | 자동 커밋 |
| 웹 진행 애니메이션 | `apps/web` | GSAP(버전·라이선스 **확인 필요**, task-023) | 프로그레스·단계 표시 트윈, reduced-motion 대체 | 상태 판단(값은 SSE만) |

새로운 영상생성 — 분석 파이프라인 구성 요소 (단계 계약: `05_STAGES.md#4`, 결정: ADR-003·ADR-004)
| 구성 | 위치 | 기술 | 책임 | 하지 않는 것 |
|---|---|---|---|---|
| URL 검증기 | `apps/api` | 표준 URL 파서 + 호스트 허용 목록 | 영상 ID 추출 → 정규 URL 재구성(`04_API.md#6`) | 사용자 문자열을 그대로 다음 단계로 넘김 |
| 다운로더 | PATH 또는 uv 의존성(결정 task-014) | yt-dlp 외부 프로세스, 인자 고정 | 원본 임시 사본 `data/sources/<analysis_id>/`(경로 제안) | 재생목록·라이브·임의 옵션 |
| 장면 감지·대표 프레임 | 외부 프로세스 | ffmpeg 장면 감지 필터 또는 PySceneDetect(선택 task-014) | 장면 구간·대표 프레임 JPG | 원본 재인코딩 배포 |
| 자막·음성 인식 | `apps/api` | yt-dlp 자막 우선, 없으면 Whisper 구현체(미확인, task-014) | 자막 텍스트 | 원본 오디오 보관 연장 |
| Analyzer: Local | `apps/api` | 로컬 소형 비전모델(후보 미확인, task-014) | 장면 캡션 → 프롬프트 초안 | LTX와 동시 GPU 적재 |
| Analyzer: Claude | `apps/api` → `api.anthropic.com` | Anthropic API(모델·SDK 버전 확인 필요) | 프레임·자막 전송 → 캡션·프롬프트 초안 | 키를 브라우저·로그에 노출 |
| 키 저장소 | 서버 로컬 | Windows 자격 증명 관리자(Q14 확정) | `ANTHROPIC_API_KEY` 쓰기·마스킹 조회 | 평문 SQLite·`outputs/` 저장 |

## 2. 경계·연결
| 경계 | 규칙 |
|---|---|
| 네트워크 | 웹 `127.0.0.1:3000`, API `127.0.0.1:8000`, ComfyUI는 로컬 URL만 허용 |
| 웹 → API | Next.js rewrites로 `/api/*` → `127.0.0.1:8000` 프록시(제안, 같은 출처·CORS 불필요). SSE 버퍼링 여부 확인 필요. **미결**(`01_PRD.md#7` Q4) |
| API → GPU | 프로세스 1개가 GPU 점유, **동시 실행 1잡**, 나머지는 FIFO 대기(`queued`) |
| API → ComfyUI | `Stage` 인터페이스 뒤의 어댑터 1개. 미설정·미응답이면 스테이지 2 비활성(`GET /api/gpu`의 `stage2_available=false`) |
| 파일 | `job_id`(서버 발급 UUID) → `outputs/<job_id>/final.mp4` 고정 매핑. 분석물은 `analysis_id`(UUID) → `data/sources/<analysis_id>/{source.mp4, frames/NNN.jpg}` 고정 매핑. 경로 입력은 받지 않으며 원본 만료·프레임 참조 규칙은 위 저장 행과 `04_API.md#2`에 따른다 |
| 외부 송신 | 허용 목록만: YouTube(yt-dlp가 접속, 대상은 정규 URL 하나) · `api.anthropic.com`(`analysis_mode=claude`만). 그 외 아웃바운드 없음 |
| GPU 공유 | 분석(Whisper·로컬 비전모델)과 LTX는 **순차 사용** — 같은 GPU 잠금, 단계 전후 모델 해제. 같은 GPU FIFO·큐 5개 공유(Q15 확정) |

## 3. 데이터 흐름
1. 사용자가 S-01에서 설정 후 생성 → `POST /api/jobs`(`stages=[1]` 또는 `[1,2]`) → SQLite에 `queued` 기록.
2. 워커가 큐에서 꺼내 스테이지 1 실행: 세그먼트 N개 생성(15초=3, 20초=4, 30초=6 — 세그먼트 ~5초 기준, 실측 후 확정) → ffmpeg 연결.
3. `stages`에 2가 있으면 스테이지 2(ComfyUI) 실행, 없으면 1단계 결과가 최종.
4. 진행 상황은 `SSE /api/jobs/{id}/events`로 푸시, 완료 시 `GET /api/files/{id}.mp4`로 재생·다운로드.
5. 벤치마킹: S-03 → `POST /api/sources/validate`(A-07) → `POST /api/analyses`(A-08) → 분석 단계(`05_STAGES.md#4`, SSE A-10) → `done`이면 S-04에서 초안 편집·제작 방식 선택 → `POST /api/jobs`(`analysis_id`·`make_mode`) → 위 2~4와 같다.
- 흐름도: `diagrams/analysis-pipeline.mmd` · 분석 상태: `diagrams/analysis-state.mmd`
- 흐름도: `diagrams/pipeline-flow.mmd` · 시퀀스: `diagrams/job-sequence.mmd` · 상태: `diagrams/job-state.mmd`

## 4. 잡 상태 (정본: `04_API.md#2`)
`queued → running_stage1 → (running_stage2) → done`, 어디서든 `failed`. 서버 재시작 시 `running_*` 잡은 `failed`(사유 `interrupted`)로 정리, `queued`는 유지.
분석 잡: `queued → running(step: download→scenes→transcript→describe→draft) → done`, 어디서든 `failed`. 재시작 규칙은 생성 잡과 같다(정본 `04_API.md#2` Analysis).

## 5. 데이터 모델
SQLite `jobs`(필드 = `04_API.md#2` Job) · `analyses`(필드 = `04_API.md#2` Analysis) · `settings`(분석 기본값·버전이 있는 동의·기능 플래그, **API 키 저장 금지**) 3개. Claude 키는 Windows 자격 증명 관리자에 둔다. 데이터 필드 정본은 `04_API.md#2`.

## 6. 품질 속성
| 속성 | 방침 |
|---|---|
| VRAM 12GB | 세그먼트 단위 생성, FP8·CPU offload, 세그먼트 사이 캐시 해제(ADR-001) |
| 내결함 | 세그먼트 파일을 `outputs/<job_id>/seg_NN.mp4`로 남겨 원인 추적. 이어 하기(재개)는 MVP 아님 |
| 관측 | 잡별 로그 `outputs/<job_id>/job.log`(프롬프트 전문·토큰 기록 금지는 `04_API.md#5`) |
