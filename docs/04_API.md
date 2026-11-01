# 04 API — LTX Nomad Studio (FastAPI, `127.0.0.1:8000`)

> 구조: `02_ARCHITECTURE.md#2` · 스테이지: `05_STAGES.md` · 권한: 전부 "로컬 전용(인증 없음)" + `#5` 가드

## 1. 엔드포인트
| ID | 메서드·경로 | 입력 | 출력 | 오류 |
|---|---|---|---|---|
| A-01 | `POST /api/jobs` | JobCreate(`#2`) | 201 Job | 400 검증 · 409 `stage2_unavailable`(stages에 2인데 ComfyUI 없음) · 429 `queue_full`(대기 상한 초과, `#2` 상한) |
| A-02 | `GET /api/jobs` | `?limit=`(기본·최대 50) · `?before=`(created_at 커서) | 200 `{items: Job[], next_before}` 최신순 | 400 |
| A-03 | `GET /api/jobs/{id}` | path `id`(UUID) | 200 Job | 404 |
| A-04 | `GET /api/jobs/{id}/events` (SSE) | path `id` | `text/event-stream`, 이벤트 `#3`. 연결 시 현재 상태 1회 즉시 전송 | 404 |
| A-05 | `GET /api/files/{id}.mp4` | path `id`(UUID만) | 200 `video/mp4`, Range 지원, `?download=1`이면 `Content-Disposition: attachment` | 404(없음·미완료) |
| A-06 | `GET /api/gpu` | — | 200 GpuStatus(`#2`) | 503 GPU 미검출 |
- 오류 본문 공통: `{ "error": { "code": "<snake_case>", "message": "<한국어>" } }`.

## 2. 스키마 (Pydantic v2 · 웹 소비 타입과 같은 작업에서 맞춘다)
| 객체 | 필드 |
|---|---|
| JobCreate | `prompt`(필수, 최대 2000자) · `negative_prompt?` · `duration`: 15\|20\|30(기본 15) · `aspect`: `"9:16"`\|`"16:9"` · `stages`: `[1]`\|`[1,2]`(기본 `[1]`) · `engine`: `"distilled"`\|`"dev"`(기본 `"distilled"`, 차이는 `05_STAGES.md#2`) |
| 상한 | 프롬프트 2000자 · 대기 큐 5개(`queued` 기준, 실행 중 1건 포함 여부 확인 필요) · 목록 `limit` 기본·최대 50 (사용자 결정 2026-11-01) |
| Job | JobCreate 필드 + `id`(UUID) · `status`(아래) · `progress`(0~100) · `stage`(1\|2\|null) · `segment`/`segments_total` · `message` · `width`·`height`(최종 해상도) · `error_code?` · `created_at`·`finished_at?` · `video_url?`(`/api/files/{id}.mp4`) |
| status | (뼈대 구현은 `running` 하나로 시작 → task-006에서 아래 2단계 분리) `queued` · `running_stage1` · `running_stage2` · `done` · `failed` (전이: `diagrams/job-state.mmd`) |
| GpuStatus | `name`(예: 실측 GPU명) · `vram_total_mb` · `vram_used_mb` · `busy`(bool) · `queue_length` · `stage2_available`(bool) |
| 해상도 | 스테이지 1: 9:16=720×1280, 16:9=1280×720 · 스테이지 2: 9:16=1080×1920, 16:9=1920×1080 (원본 §3.1) |

## 3. SSE 이벤트 (A-04)
| event | data | 비고 |
|---|---|---|
| `status` | Job 전체 | 연결 직후·상태 전이 때 |
| `progress` | `{stage, segment, segments_total, progress, message}` | 세그먼트·스텝 단위. 전송 주기 미확인 |
| `done` | `{video_url, width, height}` | 이후 서버가 스트림 종료 |
| `error` | `{error_code, message}` | `failed` 전이, 스트림 종료 |
- 오류 코드 후보: `oom` · `stage2_failed` · `ffmpeg_failed` · `interrupted` · `model_missing` (확정은 task-006).

## 4. 웹 쪽 사용처
| API | 화면 |
|---|---|
| A-01 | S-01 생성·S-02 재생성 |
| A-02 | S-01 갤러리 |
| A-03·A-04 | S-02 진행률 |
| A-05 | S-02 플레이어·다운로드, 갤러리 썸네일(영상 첫 프레임, 별도 썸네일 API 없음) |
| A-06 | S-01 헤더 GPU 상태, 1080p 선택 가능 여부 |

## 5. 위협 메모 (노출 면: 로컬 API A-01~A-06)
| 항목 | 내용 |
|---|---|
| 노출 면 | `127.0.0.1:8000` 전 엔드포인트. 인터넷 노출 없음. 같은 PC의 브라우저가 연 악성 사이트가 localhost로 요청 가능(CSRF·DNS 리바인딩) |
| 인증·인가 | 없음(단일 로컬 사용자). 대신 `Host`가 `127.0.0.1`·`localhost`가 아니면 400, 쓰기(`POST`)는 `Origin`이 웹 출처(`http://127.0.0.1:3000`·`http://localhost:3000`)일 때만 |
| 다루는 데이터 | 프롬프트, 생성 MP4. 개인정보·결제 없음 |
| 키·권한 | `HF_TOKEN`(서버 전용, 필요 시) · `COMFYUI_URL`(로컬 주소만 허용) · `COMFYUI_PATH`(읽기 전용 참조) |
| 입력 | JobCreate는 Pydantic으로 열거값 고정, 프롬프트 2000자 상한(`#2`). `id`는 UUID 형식만 → 파일 경로 조작 불가 |
| 체인 | 리바인딩 + 무검증 POST → GPU 독점, `COMFYUI_URL` 임의값 → SSRF. 둘 다 위 가드로 차단 |
| 피해 범위 | 로컬 `outputs/` 읽기, GPU 시간 소모. 다른 경로·키에 닿지 않음 |
| 남용 | 큐 5개 초과 시 429, 동시 실행 1잡, `engine=dev`도 같은 상한 |
| 로그 | 잡 id·상태·시간·오류 코드 O / `HF_TOKEN`·프롬프트 전문 X |
| 결정 | 127.0.0.1 바인딩 + Host·Origin 가드 + UUID 경로 매핑 + CORS 와일드카드 금지 |
