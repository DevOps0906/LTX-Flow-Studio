# 06 SDLC — LTX Nomad Studio 개발 생애주기

> NOMAD 9단계(`~/.claude/nomad/SDLC.md`)를 이 프로젝트에 맞춘 것. 흐름도: `diagrams/sdlc.mmd`. 작업 단위: `tasks/README.md`(W1~W4).
> 용어: "단계 01~09" = 개발 생애주기, "스테이지 1·2" = 영상 처리 단계, "W1~W4" = 구현 웨이브(`01_PRD.md#3`).

## 1. 단계별 정의와 현황 (기준일 2026-11-01)
| 단계 | 이 프로젝트에서 하는 일 | 산출물 | 담당 | 현황 |
|---|---|---|---|---|
| 01 검증 | 개인 로컬 도구라 시장 검증 생략 후보 | `00_LEAN`(Q7 미결) | 팀장 | 보류 — 사용자 결정 대기 |
| 02 기획 | PRD 보정(GPU·단계 재정의), 범위 확정 | `01_PRD.md` | planner | ✅ 완료 |
| 03 UX | 화면·흐름(S-01 스튜디오, S-02 결과) | `03_SCREENS_UX.md` | codex-designer ⇄ planner | ✅ 초안 완료, 교차 검토 미실시 |
| 04 UI | Bento 다크 토큰, 3구간 폰트, DESIGN.md | `apps/web/src/styles/tokens.css` | designer | 🔶 토큰만 있음. `DESIGN.md`·3구간 스크린샷 미작성 |
| 05 기술 설계 | 아키텍처·API·스테이지 계약·ADR | `02`·`04`·`05`, ADR-001·002, `.mmd` 3종 | planner · diagrammer | ✅ 완료 |
| 06 구현 | W1~W4 작업 | 코드·테스트 | builder (+tester) | 🔶 뼈대(웹·워커 stub)만. 실생성 미구현 |
| 07 QA | 문서 리뷰 → 코드 리뷰 → 디자인 QA | 리뷰 기록 | codex-reviewer (+reviewer) | ⬜ 미착수 |
| 08 배포 | 로컬 실행 패키징(스크립트·README) — 클라우드 배포 없음 | 실행 스크립트·README 진행 현황 | builder + 팀장 | ⬜ 미착수 |
| 09 개선 | 생성 품질·속도 피드백, 후속 후보 | 백로그 | 팀장 + planner | ⬜ 미착수 |

## 2. 단계 전환 게이트
| 전환 | 통과 조건 |
|---|---|
| 02 → 03 | 범위 승인(스테이지 1 단독 완결, Dev 엔진 포함, 랜딩 없음) |
| 03 → 04 | S-01·S-02 흐름 검증 |
| 04 → 05 | 토큰·DESIGN.md 승인, 3구간 스크린샷 |
| 05 → 06 | API·스테이지 계약 확정(`04`·`05`), 위험 작업은 challenger 통과 |
| 06 → 07 | `pnpm lint/typecheck/build`, `uv run pytest -q` 통과 |
| 07 → 08 | 🔴 0건. 코드는 codex-reviewer(code), 높음 위험은 reviewer(security) 추가 |
| 08 → 09 | 실기 검증(3060에서 15초 영상 생성·재생·다운로드) |

## 3. 구현 웨이브와 MVP 경계
| 웨이브 | 작업 | 내용 | MVP |
|---|---|---|---|
| W1 | 001~003 | 프로젝트·보안 기본·API 골격·GPU 상태 | 포함 |
| W2 | 004~007, 013 | 3060 실측 스파이크, 잡 API·큐, 스테이지 1 구현(세그먼트·ffmpeg concat), SSE, Dev 엔진 | 포함 |
| W3 | 008~010 | 웹 S-01·S-02, ComfyUI LTX 노드/가중치 준비(사용자 협업) | 008·009 포함 / 010은 스테이지 2용 |
| W4 | 011~012 | 스테이지 2 ComfyUI 어댑터, 통합 테스트·README | 012 포함 / 011 선택 |
- **스테이지 1 MVP = task-001~009·013**. 스테이지 2(010·011)가 없어도 완결(`stages=[1]`).
- 현재 진행: task-001(웹)·003(API 골격) 일부가 뼈대로 존재 → 작업 파일 완료 조건으로 재확인 후 상태 갱신.

## 4. 위험도별 검증 (필요한 만큼만)
| 위험 | 작업 | 착수 전 | 변경 후 |
|---|---|---|---|
| 낮음 | 001 | — | builder 자가 검증 |
| 보통 | 007~009 | — | codex-reviewer(code), 화면은 design |
| 높음 | 002~006·010·011·013 | challenger | codex-reviewer(code) + reviewer(security/contract) → tester |
- 모델 지침: Codex `gpt-6-astra`는 쓰지 않는다. 고난도는 Fable 5.1(reviewer·challenger, `model: fable`). 팀원은 Opus 우선.

## 5. 운영 규칙
- 작업은 `tasks/README.md` 순서로 하나씩, 끝날 때마다 `tasks/NOW.md` 갱신 → `delta --checkpoint` 후 `/clear`.
- 커밋은 `[task-NNN] 요약` + 본문(무엇을·확인 방법). 커밋·푸시는 팀장만, 사용자 승인 후.
- 모델 가중치·영상은 git 제외. 새 의존성은 `secscan license`(syft 필요, 미설치 → 라이선스 미검증 상태).
- 한도 도달 시 `/handoff`.

## 6. 다음 한 걸음과 미결
- 다음: 04 UI 마무리(DESIGN.md·스크린샷) → 문서 리뷰(reviewer doc) → task-002 착수.
- 미결: Q4 웹→API 프록시 · Q6 보관 기간 · Q7 린 게이트 · Q8 S-02 `?job=` · Q9 라이선스 예외 · 큐 5개에 실행 잡 포함 여부.
- 실측 필요: ComfyUI 포트·LTX 노드, 세그먼트 길이·fps, Dev 메모리·시간.
