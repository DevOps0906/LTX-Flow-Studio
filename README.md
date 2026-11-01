# LTX Nomad Studio

이커머스·마케터·숏폼 크리에이터를 위한 **로컬 GPU 영상 생성 대시보드**. 프롬프트와 몇 번의 클릭으로 LTX-Distilled 기반 15·20·30초 숏폼(MP4)을 만든다. 랜딩 페이지 없이 실행하면 곧바로 `/dashboard`가 열린다.

- **스테이지 1 (MVP)**: Python(FastAPI + diffusers LTX-Video, distilled / dev)으로 직접 생성. 이것만으로 완결된다.
- **스테이지 2 (선택)**: 기존 설치된 ComfyUI를 연동해 1080p 고해상도로 진행.
- **환경**: Windows 11 · RTX 3060 12GB(원본 PRD의 4090 가정을 보정, `docs/adr/ADR-001-gpu-3060-segments.md`) · Python 3.11 · Node 24 · ffmpeg
- **설계 요지**: 한 번에 15~30초를 만들 수 없어 ~5초 세그먼트를 생성해 ffmpeg concat으로 잇는다. 로컬 디스크 + SQLite 저장, 인증 없음(127.0.0.1 전용).

## 구조
| 경로 | 내용 |
|---|---|
| `apps/web` | Next.js 16 · React 19 · Tailwind CSS v4 대시보드 (Bento 다크, 반응형 3구간) |
| `apps/api` | FastAPI · Pydantic v2 · SQLite · SSE 워커 (uv) |
| `docs/` | 기획·구조·화면·API·스테이지·SDLC, ADR, Mermaid 다이어그램 |
| `tasks/` | 작업 분해(task-001~013)와 현재 상태(`NOW.md`) |
| `AGENTS.md` | 모든 AI 코딩 도구가 읽는 프로젝트 규칙 (NOMAD 멀티에이전트) |

## 실행
```powershell
pnpm install
cd apps/api; uv sync; cd ../..
# 터미널 1: 워커
cd apps/api; uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
# 터미널 2: 웹 (http://127.0.0.1:3000 → /dashboard)
pnpm dev
```
- 현재 워커는 **stub 단계**(가짜 진행률, 재생 불가 자리표시 MP4)다. 실제 LTX 생성은 아직 연결되지 않았다.
- 검사: `pnpm lint` · `pnpm typecheck` · `pnpm build` · `cd apps/api && uv run pytest -q`

## 진행 현황 (2026-11-01 기준)

기획·설계 문서는 완료됐고, 웹·워커는 **뼈대 단계**다. 실제 LTX 영상 생성(모델 설치 포함)은 시작 전이다. 작업 표 13개 중 정식 완료 0개, 뼈대가 일부 선행된 작업은 001·003·005·007이다(완료 조건 재확인 전이라 "대기"로 둔다).

| 영역 | 현재 상태 |
|---|---|
| 기획·설계 문서 | ✅ `docs/01~06`, ADR 2건, 다이어그램 4종 |
| 웹 대시보드 | 🔶 정적 UI + API 클라이언트. `/`→`/dashboard`, GPU 상태 헤더. 실워커 연동 미검증 |
| 워커 API | 🔶 6개 엔드포인트 + 큐·SSE·SQLite (stub). pytest 21개 통과 |
| 스테이지 1 (LTX 생성) | ⬜ 미구현. 모델 가중치 미설치, 3060 실측 전 |
| 스테이지 2 (ComfyUI) | ⬜ 미구현. ComfyUI에 LTX 노드·모델 0개 |
| QA·배포 | ⬜ 미착수 (라이선스 검증 `secscan license`는 syft 필요) |

제한: 생성된 MP4는 재생되지 않는 자리표시 파일 · 세그먼트 길이·fps·ComfyUI 포트(8188 추정)·Dev 엔진 메모리/시간은 실측 필요 · 큐 5개에 실행 중 잡을 포함하는지 미결.

### 작업 진행률
근거: `tasks/README.md`의 작업 13개(공식 완료 기준, 뼈대 선행분은 제외한 보수적 수치) + 영역 가중 추정.

| 웨이브 | 작업 | 내용 | 상태 |
|---|---|---|---|
| W1 | 001~003 | 프로젝트·보안 기본·API 골격·GPU 상태 | 🔶 뼈대 선행, 완료 조건 확인 필요 |
| W2 | 004~007, 013 | 3060 실측, 잡 큐, 스테이지 1(세그먼트·ffmpeg), SSE, Dev 엔진 | ⬜ 005·007 뼈대만 |
| W3 | 008~010 | 웹 S-01·S-02, ComfyUI LTX 준비 | ⬜ 008·009 UI 뼈대만 |
| W4 | 011~012 | 스테이지 2 어댑터, 통합 테스트 | ⬜ |

| 구분 | 완료 | 비중(추정) |
|---|---|---|
| 작업 표 (정식 완료 / 전체) | 0 / 13 | 0% |
| 기획·설계 (SDLC 02·03·05) | 완료 | 100% |
| 전체 프로젝트 (가중 추정) | — | 약 20% |

### 구현된 주요 항목
- [x] NOMAD 멀티에이전트 프로젝트 적용 (`nomad-doctor` ❌ 0)
- [x] 기획 문서 6종 · ADR 2건 · Mermaid 다이어그램 4종
- [x] 사용자 결정 반영: ComfyUI 경로, Dev 엔진 MVP 포함, ffmpeg concat, 보안 L1(프롬프트 2000자·큐 5·목록 50)
- [x] 웹 뼈대: `/`→`/dashboard`, Bento 다크 토큰, 반응형 3구간, 잡 API·SSE 클라이언트, GPU 상태
- [x] 워커 뼈대: `/api/gpu`·`/api/jobs`·SSE·파일 서빙, 경로 조작 차단, 127.0.0.1 바인딩
- [x] 검사 통과: lint · typecheck · build · pytest 21개 · mmd-check

### 다음 개발 단계
- [ ] 미결 결정: 린 게이트(Q7) · 웹→API 프록시(Q4) · 생성물 보관(Q6) · S-02 경로(Q8) · 라이선스 예외(Q9)
- [ ] 04 UI 마무리: `DESIGN.md` · 3구간 스크린샷
- [ ] 기획 문서 리뷰(reviewer doc)
- [ ] task-002 보안 기본 설정 → task-004 3060 실측 스파이크
- [ ] 스테이지 1 실구현 (LTX 가중치 설치, 세그먼트 생성, ffmpeg concat, Dev 엔진)
- [ ] 웹–워커 실연동 · 15초 영상 생성·재생·다운로드 실기 검증
- [ ] 스테이지 2: ComfyUI LTX 노드·모델 설치(task-010) → 어댑터(task-011)

## 콘텐츠 바로가기
| 콘텐츠 | 화면 경로 | 기획·명세 문서 | 구현 코드 |
|---|---|---|---|
| 대시보드 (S-01 생성 스튜디오·갤러리) | `/dashboard` | [화면](docs/03_SCREENS_UX.md) | [dashboard](apps/web/src/app/dashboard/page.tsx) · [studio](apps/web/src/components/studio/studio.tsx) |
| 결과 패널 (S-02 플레이어·진행률) | `/dashboard` | [화면](docs/03_SCREENS_UX.md) | [player-panel](apps/web/src/components/studio/player-panel.tsx) |
| 잡 API · SSE · 파일 | `127.0.0.1:8000/api/*` | [API](docs/04_API.md) | [routes](apps/api/app/routes.py) · [worker](apps/api/app/worker.py) |
| 스테이지 1·2 계약 | — | [스테이지](docs/05_STAGES.md) · [ADR-001](docs/adr/ADR-001-gpu-3060-segments.md) · [ADR-002](docs/adr/ADR-002-two-backends.md) | [stages](apps/api/app/stages/base.py) |
| 개발 생애주기 · 작업 표 | — | [SDLC](docs/06_SDLC.md) · [tasks](tasks/README.md) · [NOW](tasks/NOW.md) | — |
| 기획 원본 | — | [PRD 원본](prd_design_spec.md) · [PRD 보정](docs/01_PRD.md) · [구조](docs/02_ARCHITECTURE.md) | — |

## 연관·참고 저장소
- [nomad-agent-os](https://github.com/DevOps0906/nomad-agent-os) — 멀티에이전트 운영 체계
- [SceneFlow](https://github.com/DevOps0906/SceneFlow) — 대시보드 셸·디자인 토큰 참조
- [platform-docs](https://github.com/DevOps0906/platform-docs) — 문서 양식·보안·디자인 기준 참조
