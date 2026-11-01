# 04 API — LTX Nomad Studio (FastAPI, `127.0.0.1:8000`)

> 구조: `02_ARCHITECTURE.md#2` · 스테이지: `05_STAGES.md` · 권한: 전부 "로컬 전용(인증 없음)" + `#5` 가드

## 1. 엔드포인트
| ID | 메서드·경로 | 입력 | 출력 | 오류 |
|---|---|---|---|---|
| A-01 | `POST /api/jobs` | JobCreate(`#2`) | 201 Job | 400 검증 · 409 `stage2_unavailable`(stages에 2인데 ComfyUI 없음) · 429 `queue_full`(대기 상한 초과, `#2` 상한) · 벤치마킹 필드 오류(`#2` JobCreate 오류) |
| A-02 | `GET /api/jobs` | `?limit=`(기본·최대 50) · `?before=`(created_at 커서) | 200 `{items: Job[], next_before}` 최신순 | 400 |
| A-03 | `GET /api/jobs/{id}` | path `id`(UUID) | 200 Job | 404 |
| A-04 | `GET /api/jobs/{id}/events` (SSE) | path `id` | `text/event-stream`, 이벤트 `#3`. 연결 시 현재 상태 1회 즉시 전송 | 404 |
| A-05 | `GET /api/files/{id}.mp4` | path `id`(UUID만) | 200 `video/mp4`, Range 지원, `?download=1`이면 `Content-Disposition: attachment` | 404(없음·미완료) |
| A-06 | `GET /api/gpu` | — | 200 GpuStatus(`#2`) | 503 GPU 미검출 |
| A-07 | `POST /api/sources/validate` | `{url}` | 200 `{video_id, canonical_url}` — 네트워크 접속 없이 형식만 검사 | 400 `invalid_url` · 400 `host_not_allowed` · 400 `unsupported_url`(재생목록·라이브 등) |
| A-08 | `POST /api/analyses` | AnalysisCreate(`#2`) | 201 Analysis. 서버가 A-07 검사를 다시 한다 | A-07 오류 · 409 `claude_key_missing` · 429 `queue_full`(생성 잡과 공유 큐, Q15 확정) |
| A-09 | `GET /api/analyses/{id}` | path `id`(UUID) | 200 Analysis | 404 |
| A-10 | `GET /api/analyses/{id}/events` (SSE) | path `id` | 이벤트 `#3` 분석 표. 연결 시 현재 상태 1회 | 404 |
| A-11 | `GET /api/analyses/{id}/source.mp4` | path `id`(UUID만) | 200 `video/mp4`, Range 지원. **다운로드 헤더 없음**(재배포 방지) — 존치는 Q13 | 404(없음·삭제됨) |
| A-12 | `GET /api/analyses/{id}/frames/{n}.jpg` | `id` UUID · `n` 정수만 | 200 `image/jpeg`(대표 프레임) | 404 |
| A-13 | `GET /api/settings` | — | 200 Settings(`#2`). 키 원문은 절대 포함하지 않음 | — |
| A-14 | `PUT /api/settings` | `{analysis_mode_default}` | 200 Settings | 400 |
| A-15 | `PUT /api/settings/claude-key` | `{api_key}`(쓰기 전용) | 204. 저장 후 원문 폐기(메모리·응답·로그) | 400 `invalid_key_format`(규칙 확인 필요) · 500 `key_store_failed` |
| A-16 | `DELETE /api/settings/claude-key` | — | 204 | — |
- 오류 본문 공통: `{ "error": { "code": "<snake_case>", "message": "<한국어>" } }`.

## 2. 스키마 (Pydantic v2 · 웹 소비 타입과 같은 작업에서 맞춘다)
| 객체 | 필드 |
|---|---|
| JobCreate | `prompt`(필수, 최대 2000자) · `negative_prompt?` · `duration`: 15\|20\|30(기본 15) · `aspect`: `"9:16"`\|`"16:9"` · `stages`: `[1]`\|`[1,2]`(기본 `[1]`) · `engine`: `"distilled"`\|`"dev"`(기본 `"distilled"`, 차이는 `05_STAGES.md#2`) · 벤치마킹: `analysis_id?`(UUID, `done`이어야 함) · `make_mode`: `"t2v"`\|`"i2v"`(기본 `"t2v"`, `i2v`는 `analysis_id` 필수) · `keyframe_ids?`: 정수 배열(`i2v`만, 세그먼트마다 1개 — Q18 확정) |
| JobCreate 오류(추가) | 409 `analysis_not_done` · 400 `keyframe_not_found` · 409 `i2v_unavailable`(I2V 미지원 확인 시) |
| AnalysisCreate | `url`(필수, 길이 상한 Q16) · `analysis_mode`: `"local"`\|`"claude"`(생략 시 Settings 기본값) |
| Analysis | `id`(UUID) · `video_id` · `analysis_mode` · `status`: `queued`·`running`·`done`·`failed` · `step`: `download`·`scenes`·`transcript`·`describe`·`draft`\|null · `step_index`/`steps_total` · `progress`(0~100) · `message` · `scenes`: `[{index, start_s, end_s, frame_url, caption}]` · `transcript_source`: `"subtitle"`\|`"whisper"`\|null · `prompt_draft` · `negative_prompt_draft?` · `source_url?`(A-11) · `error_code?` · `created_at`·`finished_at?` (재시작 시 `running` → `failed(interrupted)`) |
| Settings | `analysis_mode_default`: `"local"`\|`"claude"`(기본 `"local"`, ADR-003) · `claude_key_set`(bool) · `claude_key_hint`(끝 4자만, 미설정 null) |
| 분석 상한 | 원본 길이·파일 크기·장면 수·Claude 전송 프레임 수·URL 길이 **미정(Q16)** — 수치 넣지 않음 |
| 상한 | 프롬프트 2000자 · 대기 큐 5개(`queued` 기준, 실행 중 1건 포함 여부 확인 필요) · 목록 `limit` 기본·최대 50 (사용자 결정 2026-11-01) |
| Job | JobCreate 필드(벤치마킹 필드 포함) + `id`(UUID) · `status`(아래) · `progress`(0~100) · `stage`(1\|2\|null) · `segment`/`segments_total` · `message` · `width`·`height`(최종 해상도) · `error_code?` · `created_at`·`finished_at?` · `video_url?`(`/api/files/{id}.mp4`) |
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
- 오류 코드 후보: `oom` · `stage2_failed` · `ffmpeg_failed` · `interrupted` · `model_missing` (확정은 task-006). `make_mode=i2v` 추가 후보: `keyframe_missing`(파일 삭제됨, Q13) · `i2v_failed` (확정 task-021).

분석 잡 이벤트 (A-10) — 같은 4종, data만 다르다
| event | data | 비고 |
|---|---|---|
| `status` | Analysis 전체 | 연결 직후·상태 전이 때 |
| `progress` | `{step, step_index, steps_total, progress, message}` | 단계 표시(GSAP)의 입력. 주기 미확인 |
| `done` | `{analysis_id}` | 웹은 A-09로 결과 조회 |
| `error` | `{error_code, message}` | `failed` 전이 |
- 분석 오류 코드 후보(확정 task-016~020): `source_unavailable`(비공개·삭제·지역 제한 등) · `source_too_long`(Q16) · `download_failed` · `scene_detect_failed` · `transcript_failed` · `describe_failed` · `claude_auth_failed` · `claude_rate_limited` · `claude_failed` · `oom` · `interrupted`. `message`에 키·외부 응답 원문을 넣지 않는다.

## 4. 웹 쪽 사용처
| API | 화면 |
|---|---|
| A-01 | S-01 생성·S-02 재생성 |
| A-02 | S-01 갤러리 |
| A-03·A-04 | S-02 진행률 |
| A-05 | S-02 플레이어·다운로드, 갤러리 썸네일(영상 첫 프레임, 별도 썸네일 API 없음) |
| A-06 | S-01 헤더 GPU 상태, 1080p 선택 가능 여부 |
| A-07·A-08 | S-03 URL 입력·분석 시작 |
| A-09·A-10·A-12 | S-03 분석 진행 · S-04 장면 카드·초안 |
| A-01(`analysis_id`·`make_mode`) | S-04 생성 시작 |
| A-03·A-04·A-05·A-11 | S-05 원본/생성 비교 |
| A-02 | S-06 갤러리 |
| A-13~A-16 | S-07 설정 · S-03 분석 방식 기본값·키 미설정 안내 |

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

## 6. 위협 메모 (노출 면: 벤치마킹 A-07~A-16 + 외부 송신)
| 항목 | 내용 |
|---|---|
| 노출 면 | 로컬 API A-07~A-16(`#5` 가드 동일 적용, `PUT`·`DELETE`도 Origin 검사). 외부 송신: YouTube(yt-dlp) · `api.anthropic.com`(claude 모드). 인터넷 수신 없음 |
| 인증·인가 | 없음(단일 로컬 사용자). 키 설정·삭제는 Origin 가드 필수 — CSRF로 공격자 키를 심으면 원본 프레임이 공격자 계정으로 전송됨 |
| 다루는 데이터 | 원본 임시 사본·장면 이미지·자막(저작물) · Claude API 키 · 프롬프트 초안. 저작권·약관 방침은 `01_PRD.md#6` 표(Q11·Q12 확정, Q13 미결, 약관 충돌 여부 **확인 필요**) |
| 키·권한 | `ANTHROPIC_API_KEY`: 서버 전용 저장(Windows 자격 증명 관리자 — Q14 확정, SQLite·`outputs/`·`data/sources/` 금지) · A-13은 `claude_key_set`·끝 4자 마스킹만 · 원문을 브라우저로 다시 보내지 않음 · Claude 호출은 서버에서만 |
| 입력: URL | 표준 파서로 분해 → 스킴 `https`만(`http` 허용 여부 팀장 결정 필요) → 호스트 정확 일치 허용 목록 `youtube.com`·`www.youtube.com`·`m.youtube.com`·`youtu.be`(서브도메인 와일드카드·IP·포트·userinfo 거부) → 경로 `/watch?v=`·`/shorts/<id>`·`youtu.be/<id>`만 → 영상 ID 정규식(형식 확인 필요) → 서버가 `https://www.youtube.com/watch?v=<id>` **재구성**. 원 문자열은 다음 단계로 넘기지 않는다 |
| 입력: 명령 | yt-dlp·ffmpeg는 인자 **배열**로 실행(셸 금지), 인자 고정: 설정 파일 무시·재생목록 금지·출력 템플릿 고정(`data/sources/<analysis_id>/`)·크기 상한(Q16)·`--` 뒤에 정규 URL 하나. 사용자 입력으로 옵션·포맷·경로를 받지 않는다. 옵션명은 설치 버전 문서로 **확인 필요**(task-016) |
| 체인 | DNS 리바인딩 + 무검증 A-08 → 임의 다운로드·GPU 독점·Claude 과금 / URL 허용 목록 우회 → yt-dlp가 내부망 접속(SSRF) / 옵션 주입 → `--exec` 류 실행. 각각 `#5` 가드 · 허용 목록+재구성 · 인자 고정으로 차단 |
| 피해 범위 | 키 유출 → 사용자 Anthropic 과금. 원본 사본은 로컬 `data/sources/`만. 다른 경로·키에 닿지 않음 |
| 남용 | 분석 큐 = 생성 잡과 공유 큐 5개(Q15 확정) · 원본 길이·크기·장면 수·Claude 전송 프레임 수 상한(Q16) · 동시 GPU 1작업 |
| 로그 | `analysis_id`·`video_id`·단계·오류 코드·시간 O / API 키·Authorization 헤더·Claude 요청·응답 본문·자막 전문·외부 오류 원문 X |
| 결정 | 허용 목록 + 정규 URL 재구성 + 인자 배열 고정 + 키 쓰기 전용·마스킹 + 외부 송신 허용 목록 + 다운로드·방식 B 기능 플래그 기본 꺼짐(동의 후 켬, 저장 필드 Q21). 고지 문구는 `01_PRD.md#6` 확정 |
