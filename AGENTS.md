# AGENTS.md — LTX Nomad Studio

> 모든 AI 코딩 도구(Claude Code · ChatGPT Codex · Gemini CLI · OpenCode · Cursor)가 읽는 **단일 정본**. 80줄 이내로 유지한다.
> 영역별 상세 규칙은 `.claude/rules/*.md`(7장 표), 기획 근거는 `docs/`.

## 1. 무엇인가
이커머스·마케터·숏폼 크리에이터를 위한, 로컬 GPU(RTX 3060 12GB)에서 LTX-Distilled로 15~30초 영상을 만드는 단일 대시보드. 랜딩 없음(시작 즉시 `/dashboard`). 1단계=LTX 직접 생성(단독 완결), 2단계=ComfyUI 고해상도(선택). 기획 정본: `docs/01_PRD.md` · 구조: `docs/02_ARCHITECTURE.md`.

## 2. 스택 (작업 시 최신 stable 확인 후 버전 고정)
| 영역 | 선택 | 위치 |
|---|---|---|
| 웹 | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 | `apps/web` |
| 워커·API | FastAPI · Pydantic v2 · uv · diffusers LTX-Video(distilled) · SQLite · SSE | `apps/api` |
| 2단계 | 기존 설치된 ComfyUI(REST/WS 연동, 선택 플러그인) | 외부 경로 `.env` |
| 후처리 | ffmpeg | PATH |

## 3. 명령
| 목적 | 명령 |
|---|---|
| 설치 | `pnpm install` · `cd apps/api && uv sync` |
| 개발 서버 | `pnpm dev`(웹 3000) · `cd apps/api && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000` |
| 린트 · 타입 | `pnpm lint` · `pnpm typecheck` |
| 테스트 | `pnpm test` · `cd apps/api && uv run pytest -q` |
긴 출력 명령은 `~/.claude/nomad/bin/q <명령>`으로 실행한다.

## 4. 절대 규칙 (위반 = 리뷰 🔴)
- 비밀(API 키 · service_role · 결제 키)은 저장소·클라이언트 번들·로그에 넣지 않는다. `.env.example`에 이름만.
- UI는 반응형 3구간(~767 / 768~1199 / 1200~), 색·크기는 토큰만(hex·px 직접 금지).
- 문서·커밋·화면 문구는 한국어, 코드 식별자는 영어.
- 새 의존성은 `secscan license`로 확인(GPL·AGPL 거부). 보안 레벨 `docs/01_PRD.md#8`.
- 서버는 127.0.0.1에만 바인딩. 파일 서빙은 job id→고정 경로 매핑(경로 입력 금지).
- 1단계는 2단계 없이 완결. 스테이지는 `Stage` 인터페이스 뒤에 두고 `stages=[1]`이면 1단계에서 끝낸다.
- 모델 가중치·생성 영상은 git에 넣지 않는다(`models/`, `outputs/`는 .gitignore).
- GPU 12GB 전제: 세그먼트(~5초) 생성 후 이어붙이기. 근거 `docs/adr/ADR-001`.

## 5. 문서 지도 (필요한 장만 읽는다)
| 문서 | 내용 |
|---|---|
| `docs/adr/ADR-*.md` | 결정 기록(GPU 세그먼트·2방식 백엔드) |
| `docs/01_PRD.md` ~ `06_SDLC.md` | 기획 · 구조(데이터 모델 포함) · 화면 · API · 단계 계약 · 개발 생애주기 |
| `docs/diagrams/*.mmd` | 구조도 · 흐름도 · ERD (Mermaid) |
| `DESIGN.md` · `apps/web/src/styles/tokens.css` | 디자인 (정답은 토큰 파일) |
| `tasks/README.md` · `tasks/NOW.md` | 작업 표 · 현재 상태 |

## 6. 작업 방식
작업은 `tasks/README.md`의 순서대로 하나씩. 작업 파일의 "근거"와 "하지 않을 것"을 지키고, 완료 조건을 실행으로 확인한 뒤 커밋한다.
커밋: `[task-NNN] 요약` + 본문(무엇을 · 확인 방법).

## 7. 영역 규칙 · 도구별 로드 (규칙 정본은 `.claude/rules/` 한 곳)
아래 경로의 파일을 만들거나 고치기 **전에** 해당 규칙 파일을 읽는다. Claude Code는 `paths:` 조건으로 자동 로드하므로 다시 읽지 않는다.
| 작업 경로 | 규칙 파일 |
|---|---|
| `apps/web/**` | `.claude/rules/web.md` |
| `apps/api/**` | `.claude/rules/api.md` |
| `docs/**` · `DESIGN.md` | `.claude/rules/docs.md` |
- 읽지 않는 파일: `.env*` · lock 파일 · `node_modules/` · `.next/` · `dist/` · `build/` · `coverage/` (Claude는 `.claude/settings.json`, Gemini는 `.geminiignore`가 강제, ChatGPT Codex는 이 줄로 지킨다).
- 도구별 설정: Claude Code `CLAUDE.md`·`.claude/` · ChatGPT Codex `.codex/config.toml` · Gemini CLI `.gemini/settings.json`·`.geminiignore`.
- 새 규칙 파일을 추가하면 이 표에도 한 줄 추가한다.
