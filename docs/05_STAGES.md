# 05 STAGES — 스테이지 1(생성) · 스테이지 2(고해상도) · 분석(벤치마킹)

> "스테이지"는 사용자 처리 단계다. 원본 §6의 개발 로드맵 Phase P1~P3와 다르다(`01_PRD.md#3` 용어 표).

## 1. Stage 인터페이스 (계약만, 코드 아님)
| 항목 | 내용 |
|---|---|
| 입력 | Job(`04_API.md#2`), 이전 스테이지 결과 파일 경로(스테이지 2만) |
| 출력 | 결과 MP4 경로, 최종 `width`·`height` |
| 진행 보고 | `progress(stage, segment, segments_total, progress, message)` 콜백 → SSE `progress` |
| 가용성 | `available() -> bool` (스테이지 2: ComfyUI 응답·노드 확인) |
| 규칙 | `stages=[1]`이면 스테이지 1 결과가 최종. 스테이지 2 실패 시 잡은 `failed`(`stage2_failed`)이고 1단계 파일은 `outputs/<job_id>/stage1.mp4`로 남긴다 |

## 2. 스테이지 1 — 생성 (단독 완결, 근거 `adr/ADR-001-gpu-3060-segments.md`)
| 항목 | 내용 |
|---|---|
| 엔진 | `engine="distilled"`(기본): LTX-Video distilled 고속(원본 §3.1 4~8 스텝) · `engine="dev"`: LTX-Video dev 고화질(스텝 수·메모리 확인 필요, task-013). 둘 다 diffusers, FP8 / CPU offload. 체크포인트·diffusers 버전은 최신 stable 확인 후 고정(distilled task-004, dev task-013) |
| 해상도 | 720p 고정(`04_API.md#2` 해상도 행) |
| 세그먼트 | ~5초 단위. 15초=3 · 20초=4 · 30초=6. 세그먼트 길이·fps·프레임 수는 **확인 필요**(모델 제약 실측) |
| 연결 | 세그먼트를 독립 생성 후 단순 이어붙이기(ffmpeg concat) → `stage1.mp4` (확정 2026-11-01). 끝프레임 조건 이어생성은 후속 후보로만 |
| 메모리 | 세그먼트 사이 VRAM 캐시 해제. OOM이면 `failed`(`oom`) — 자동 해상도 하향 없음 |
| 속도 | "수십 초 내"는 목표치. 실측값은 `01_PRD.md#5`에 기록 |

## 3. 스테이지 2 — 고해상도 (선택 플러그인, 근거 `adr/ADR-002-two-backends.md`)
| 항목 | 내용 |
|---|---|
| 방식 | 기존 설치 ComfyUI에 REST/WS로 워크플로 제출 → 1080p 결과 회수 |
| 설정 | `.env`: `COMFYUI_URL`(기본 `http://127.0.0.1:8188` 추정, **미확인**) · `COMFYUI_PATH`(설치 경로) |
| 설치본 | 포터블 루트 `C:\ComfyUI\ComfyUI_windows_portable`(실행 `run_nvidia_gpu.bat`, `python_embeded\`), ComfyUI 본체 `C:\ComfyUI\ComfyUI_windows_portable\ComfyUI` v0.32.0 — 사용자 결정 2026-11-01, 경로 확인 2026-11-01 |
| `COMFYUI_PATH` | 본체 폴더 `...\ComfyUI_windows_portable\ComfyUI` (노드·모델 설치 위치). 실행 스크립트는 포터블 루트의 `run_nvidia_gpu.bat` |
| 선행 | `custom_nodes`는 comfyui-manager·controlnet_aux·Inspyrenet-Rembg·번역 노드뿐(LTX 없음). `models/*`는 전부 빈 폴더(LTX 포함 모델 0개), `extra_model_paths.yaml` 없음(확인됨) → 노드·가중치 설치가 별도 작업(task-010) |
| 워크플로 | 업스케일/LTX 노드 구성·워크플로 JSON은 **확인 필요**(추측 금지) |
| 비가용 | `available()=false`면 `GET /api/gpu`의 `stage2_available=false`, 웹은 1080p 비활성 |

ComfyUI 후보 폐기 (사용하지 않음 — 2026-11-01 기록)
| # | 경로 | 버전 |
|---|---|---|
| a | `D:\WorkSpace\언리얼_모음\Data\ComfyUI_windows_portable_nvidia\ComfyUI_windows_portable\ComfyUI` | v0.31.0 portable |
| b | `C:\Users\skydy\Downloads\ComfyUI_windows_portable_nvidia (1)\...` | v0.32.0 portable |
| c | Comfy Desktop 설치형 | v0.26.0 |

## 4. 분석 — 벤치마킹 생성의 앞 단계 (별도 분석 잡, 스테이지 아님 · 근거 `adr/ADR-003-analysis-local-vs-claude.md`)
| step | 로컬(`analysis_mode=local`) | Claude(`analysis_mode=claude`) | 확인 필요 |
|---|---|---|---|
| 1 `download` | yt-dlp, 정규 URL 하나·인자 고정(`04_API.md#6`) → `data/sources/<id>/source.mp4` | 같음 | 포맷 선택값·크기 상한(Q16) |
| 2 `scenes` | ffmpeg 장면 감지 또는 PySceneDetect → 장면 구간 + 대표 프레임 `frames/NNN.jpg` | 같음 | 임계값·장면 수 상한(Q16) |
| 3 `transcript` | yt-dlp 자막 우선, 없으면 로컬 Whisper(GPU) | 같음(로컬). Claude API 오디오 입력 지원은 **미확인**이라 쓰지 않음 | Whisper 구현체·모델 크기·VRAM |
| 4 `describe` | 로컬 소형 비전모델 장면 캡션(GPU) | 프레임·자막을 Claude에 전송 → 캡션 | 비전모델 후보·VRAM / Claude 모델·이미지 수·크기 상한 |
| 5 `draft` | 캡션·자막 → 프롬프트 초안(로컬, 방법 task-018에서 확정) | Claude 응답에서 초안 | 초안 형식(긍정·부정) |
| 규칙 | GPU 단계(3·4)는 LTX와 **순차** — 같은 GPU 잠금, 단계 끝에 모델 해제 | GPU는 3(Whisper)만 | 큐 공유 Q15 |
- 결과: Analysis(`04_API.md#2`) — 장면 카드·`prompt_draft`. 사용자가 S-04에서 초안을 고친 값이 JobCreate `prompt`가 된다(분석은 생성 잡을 자동 시작하지 않음).
- 실패: 단계별 오류 코드(`04_API.md#3` 분석 표). 원본 사본은 Q13 규칙대로 정리.

## 5. 제작 방식 A/B — 스테이지 1 입력 차이 (근거 `adr/ADR-004-make-mode-a-b.md`)
| 항목 | 방식 A `make_mode=t2v` | 방식 B `make_mode=i2v` |
|---|---|---|
| 입력 | `prompt`(초안 편집본) | `prompt` + 장면 대표 프레임(`keyframe_ids`) → 세그먼트 시작 프레임 |
| 엔진 | 기존 스테이지 1 그대로(`#2`) | LTX image-to-video — diffusers 파이프라인 존재·distilled/dev 호환·조건 이미지 해상도·강도 파라미터 **확인 필요**(task-015) |
| 세그먼트 | `#2`와 같음 | 세그먼트 수·연결은 `#2`와 같음. 세그먼트↔프레임 매핑 Q18(권고: 세그먼트마다 선택 장면 1장) |
| 프레임 전처리 | — | 720p 비율에 맞춰 자르기/여백(방법 확인 필요) |
| 스테이지 2 | 같음 | 같음 |
| 위험 | — | 결과 첫 프레임이 원본 장면과 같을 수 있음(저작권, Q12) · 원본 사본 삭제 시 `keyframe_missing` |

