# DESIGN — LTX Nomad Studio

> 정답 소스: `apps/web/src/styles/tokens.css` (Tailwind CSS v4 `@theme`). 값(hex·px)과 3구간 폰트 표는 자동 생성본 [docs/DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md)에만 있다. 이 문서는 이름·용도·상태만 적는다.
> 미리보기: [docs/design/preview.html](docs/design/preview.html) · 시안 스크린샷: `docs/design/shots/S-01-{390,900,1440}-dark.png`
> 상태: **초안 — 비주얼 수치는 사용자 확정 전**(아래 6장 확인 항목). 좌측 GNB 시안 v2는 7장.

## 1. 브리프
- 대상: 로컬 GPU로 마케팅 숏폼을 만드는 1인 크리에이터.
- 주된 일(S-01): 설정을 고르고 영상 생성을 시작해 진행·결과를 같은 화면에서 본다.
- 분위기 3단어: 어두운·집중된·정밀한 (Bento Grid + Minimal Dark, 근거 `prd_design_spec.md` 4장).
- 피할 것: 다색 그라데이션, 과한 글로우(선택·주 버튼에만 `--shadow-glow`), 라이트 모드(현재 다크 단일).

## 2. 토큰 (이름·용도)
| 그룹 | 토큰 | 용도 |
|---|---|---|
| 면 | `--color-bg` · `--color-surface` · `--color-surface-high` | 페이지 바탕 · 카드(패널) · 호버/선택/스켈레톤/진행바 트랙 |
| 강조 | `--color-accent` · `--color-accent-hover` · `--color-on-accent` | 주 버튼·선택 토글 경계·진행바·포커스 링 · 주 버튼 호버 · 주 버튼 글자 |
| 글자 | `--color-text` · `--color-text-muted` | 본문 · 보조(라벨·힌트·메타) |
| 경계 | `--color-input` · `--color-border` | 입력창 경계(3:1) · 장식 구분선 |
| 상태 | `--color-success` · `--color-warning` · `--color-danger` | 완료 · 대기/경고 · 실패/오류 |
| 서체 | `--font-sans` | Pretendard 우선(한국어 본문) |
| 글자 크기 | `--text-display` · `--text-h1` · `--text-h2` · `--text-body` · `--text-caption` | 3구간 값은 DESIGN_TOKENS.md 표(모바일 ~767 / 태블릿 768~1199 / 데스크톱 1200~) |
| 형태 | `--radius-control` · `--radius-card` · `--shadow-glow` · `--spacing` | 컨트롤 · 카드 반경, 강조 발광, 4px 격자 |
| 크기 | `--size-header` · `--size-player-max` · `--breakpoint-desktop` | 헤더 높이 · 플레이어 최대 높이 · `desktop:` 변형(1200~) |

## 3. 레이아웃 (S-01 `/dashboard`)
| 구간 | 배치 |
|---|---|
| 모바일 ~767 | 1열: 설정 패널 → 플레이어 → 최근 갤러리(2열) |
| 태블릿 768~1199 | 2열: 설정 \| 플레이어, 갤러리는 2열 폭 전체(3열) |
| 데스크톱 1200~ | 12열: 설정 5 \| 플레이어 7, 갤러리 12(4열 Bento, 최신 1개 2×2) |
페이지 가로 스크롤 금지. 플레이어는 9:16이면 `max-w-sm`, 16:9면 전체 폭, 높이 상한 `--size-player-max`.

## 4. 컴포넌트 명세
| 컴포넌트 | 기본 | 호버 | 선택/활성 | 비활성 | 포커스 |
|---|---|---|---|---|---|
| 주 버튼(영상 생성하기) | `bg-accent` · `text-on-accent` · `--shadow-glow` · 최소 높이 48 · `text-body` 굵게 | `bg-accent-hover` | 제출 중 라벨 변경 | 투명도 50%, 글로우 제거, `not-allowed` | 공통 링 |
| 보조 버튼(다운로드·복사·재생성·다시 시도) | `border-border` · 투명 바탕 · 최소 높이 40 | `bg-surface-high` | — | 투명도 50% | 공통 링 |
| 토글 그룹(길이·비율·해상도·엔진) | `border-border` · `text-text-muted` · 힌트 `text-caption` | `bg-surface-high` | `border-accent` · accent 15% 바탕 · `text-text` 굵게 · 글로우 | 투명도 50% | 공통 링 |
| 입력창(프롬프트) | `border-input` · `bg-bg` · 자리표시 `text-text-muted` | — | — | — | 공통 링 |
| 카드(Panel) | `bg-surface` · `border-border` · `--radius-card` · 제목 `text-h2` | — | — | — | — |
| 진행바 | 트랙 `bg-surface-high` 높이 8 · 채움 `bg-accent` · 위에 메시지(muted)+% (`tabular-nums`) | — | — | — | `role=progressbar` + aria 값 |
| 플레이어 | `bg-bg` 위 `border-border` 프레임, 아래 메타(dl, caption) + 보조 버튼 3개 | — | 완료 시 `<video controls loop muted>` | 다운로드는 완료 전 비활성 | 브라우저 기본 컨트롤 |
| 갤러리 카드 | `bg-bg` · `border-border` · `--radius-card` · 썸네일 16:9 · 프롬프트 2줄 · 길이·비율(muted) + 상태 | `border-accent` | 첫 카드 2×2 | 미완료 카드는 클릭 불가(호버 없음) | 공통 링 |
공통 포커스 링(`lib/cn.ts` `focusRing`): `focus-visible` 시 2px `ring-accent` + 2px 오프셋(`ring-offset-bg`).

## 5. 상태 명세
| 상태 | 플레이어 | 진행바 | 주 버튼 | 갤러리 |
|---|---|---|---|---|
| 대기(빈) | 안내 "프롬프트를 입력하고 생성하면…"(muted) | 숨김 | 활성(프롬프트 필수) | "아직 생성한 영상이 없습니다"(muted) |
| 로딩 | — | — | — | 스켈레톤 카드(`bg-surface-high` 깜빡임), `aria-busy` |
| 진행 중(submitting·running) | "영상을 만드는 중입니다…"(muted) | 표시, 메시지+% | 비활성 · 재생성 비활성 | 해당 잡 상태 라벨(muted) |
| 완료(done) | 영상 재생, 다운로드 활성 | 숨김 | 활성 | 상태 `text-success`, 카드 클릭 시 재생 |
| 오류(error) | 오류 문구 `text-danger` + `role=alert` | 숨김 | 활성(재시도) | 실패 카드 `text-danger` · 목록 API 실패 시 안내 + "다시 시도" |
| GPU 미검출(503) | — | — | 비활성 + 사유 표시 | — |

## 6. 접근성 확인 (2026-11-01, `design-preview --check`)
- 자동 검사 통과: text/bg 18.90 · text/surface 17.57 · muted/bg 7.71 · muted/surface 7.17 · danger 7.35 · success 8.68 · warning 9.21 · input/bg 4.16 · input/surface 3.86(3:1 기준). 컴포넌트 hex·px 직접 사용 0건.
- 수동 계산(검사기가 `--color-on-accent` 짝을 못 찾음):
  - **실패** `--color-on-accent` / `--color-accent` = 약 4.28:1 (본문 4.5 미달) — 주 버튼 기본 상태. 호버(`--color-accent-hover`)는 약 6.0:1 통과.
  - **실패** `text-accent` 글자(설정 단계 번호 "1.") / surface = 약 4.1:1.
  - 통과(3:1 기준): 포커스 링 accent/bg 약 4.4 · 진행바 accent/surface-high 약 3.8.
- 미반영: `prefers-reduced-motion`(스켈레톤 `animate-pulse`·진행바 `transition`) 처리 없음. 숫자용 고정폭 서체 토큰 없음(`tabular-nums`로 대체 중).

### 사람 확인 필요(확정 전 후보)
1. 주 버튼 대비: (A) `--color-accent: #6366f1 → #6062e9`(약 4.54:1, PRD 팔레트와 미세 차이) · (B) 값 유지, 주 버튼 바탕만 `accent-hover` 사용(tsx 변경 필요) · (C) 현행 유지(예외 승인).
2. 강조 글자: 새 토큰 `--color-accent-text`(예: #818cf8, surface 위 약 6.2:1) 추가 후 `text-accent` 교체(tsx 변경) 또는 번호를 `text-text-muted`로.
3. 3구간 폰트 크기는 현행 유지(모바일 본문 14px). 스킬 시작값(본문 15/16/16)보다 작다 — 유지 여부 확정.
4. 와이어프레임 `design/wireframes/S-01.html`은 plan2spec이 "길이(15/20/30초)"를 `/` 기준으로 쪼개 입력창 3개로 그렸고 좌우 2열·플레이어가 없다 — 시안이 아니라 필드 목록으로만 볼 것.

## 7. 시안 v2 — 좌측 GNB 대시보드 (2026-11-01, 초안·확정 전)
> 목업: `docs/design/v2/{home,studio,progress,settings}.html` · 스크린샷 `docs/design/v2/shots/<화면>-{390,900,1440}.png`, 모바일 드로어 `shots/drawer/`.
> 토큰 제안본: `docs/design/v2/tokens.css`(정답 소스와 같은 이름, `[v2]` 표시 줄만 다름) → 표 `docs/design/v2/DESIGN_TOKENS.md`, 미리보기 `docs/design/v2/preview.html`. 확정 전이라 `apps/web/src/styles/tokens.css`·`docs/DESIGN_TOKENS.md`는 그대로다.

### 7.1 셸 (GNB)
| 구간 | GNB | 본문 |
|---|---|---|
| 모바일 ~767 | 상단 바(햄버거+로고) → 왼쪽 드로어(`--size-gnb`, 85vw 상한), 배경 가림막·Esc·닫기 버튼, 닫힘 시 `visibility:hidden`(포커스 차단) | 1열 |
| 태블릿 768~1199 | 고정 아이콘 레일 `--size-gnb-rail`(56), 라벨 숨김(`title`·링크 텍스트는 유지), GPU는 점+VRAM% | `margin-left` 레일 폭 |
| 데스크톱 1200~ | 고정 `--size-gnb`(224), 라벨 포함, 하단 GPU 카드(이름·VRAM 바·대기 잡) | `margin-left` GNB 폭 |
메뉴: 대시보드 · 새로운 영상생성 · 갤러리 · 설정. 활성 = accent 18% 바탕 + 왼쪽 accent 막대 + 아이콘 `--color-accent-text`, `aria-current="page"`.

### 7.2 화면
| 화면 | 구성 | 3구간 배치 |
|---|---|---|
| 대시보드 홈(후속 후보, MVP 제외) | 상태 카드 4(GPU·대기 잡·오늘 생성·저장 공간) · 진행 중 카드 · 시작 CTA · 최근 생성 Bento(첫 카드 2×2) | 카드 2열 / 2열 / 4열, Bento 2 / 3 / 4열 |
| 새로운 영상생성 | ①유튜브 URL+분석 시작 · 분석 방식(로컬/Claude API) · 제작 방식(A 텍스트→영상 / B 캡처 이미지→영상) ②장면 목록 ③대표 프레임 선택(라디오) ④프롬프트 초안+길이·비율·엔진+생성 / 우 미리보기 탭 `원본 \| 생성 \| 나란히`(`role=tablist`, ←→ 키) | 1열 / 좌우 1:1 / 좌 5 : 우 7(미리보기 sticky). "나란히"는 데스크톱만 좌우, 그 아래는 위아래 |
| 생성 진행 | 5단계 점(다운로드→장면 분석→프롬프트→생성→병합, `aria-current="step"`) · 큰 % 숫자 · 진행바(`role=progressbar`) · 상태 메시지(`aria-live=polite`) · 작업 정보 · 단계 기록 · 취소 | 1열 / 1열 / 8:4 |
| 설정 | 분석 방식 기본값 · Claude API 키(`type=password`, 저장 후 입력칸 비움 + ‘저장됨’ 배지만, 값 재표시 없음) · 연결 테스트·키 삭제 · 서버 전용 안내 · 키 상태별 표시 | 1열 / 1열 / 2열 |

### 7.3 진행 애니메이션 (GSAP)
- 목업은 GSAP **3.13.0**을 cdnjs 고정 URL로 로드(`progress.html`). **확인 필요**: 작업 시점 최신 stable 버전, 라이선스(3.13부터 Webflow 무상 라이선스로 알려짐 — 원문 확인 전), 앱 반영 시 npm 의존성 추가는 별도 승인.
- 동작: 진행바 폭·단계 연결선·% 숫자 카운트를 같은 타임라인으로 `--motion-progress`×2(1.2s) `power2.out`, 활성 점은 `back.out` 크기 등장.
- 즉시 갱신 조건: `prefers-reduced-motion: reduce`(토큰 `--motion-progress: 0s`) · GSAP 로드 실패 · 헤드리스 캡처. 숫자 aria 값은 끝값으로 한 번만 갱신.

### 7.4 접근성 (v2 토큰, `design-preview --check` + 수동 계산)
- 자동: 6장 수치와 동일(통과). 컴포넌트 토큰 우회 0건(예외: `@media` 경계 768·1200px — CSS 변수 불가, 정답 소스와 같음).
- 수동: `--color-on-accent`/`--color-accent`(#6062e9) **4.54** ✅(본문) · `--color-accent-text`(#818cf8) / surface **6.16** · / bg **6.63** · / surface-high **5.57** ✅ · 포커스 링·진행바 accent / bg 4.16 · / surface 3.87 · / surface-high 3.50 ✅(3:1) · text / surface-high 15.88 · muted / surface-high 6.48 ✅.

### 7.5 사람 확인 필요 (v2)
1. `--color-accent` #6366f1 → #6062e9 채택 여부(6장 1번 후보 A). 채택 시 `--shadow-glow` 색도 함께.
2. 새 토큰 `--color-accent-text` · `--font-mono` · `--size-gnb`(224) · `--size-gnb-rail`(56) · `--size-icon` · `--size-hit`(44) · `--radius-pill` · `--border-width` · `--motion-progress`(0.6s) 채택 여부.
3. 고정폭 서체 후보(JetBrains Mono / D2Coding) — 미설치 환경은 Consolas로 떨어져 한글과 섞이면 어색함. 숫자만 `tabular-nums`로 둘지 결정.
4. 설정의 키 입력칸은 의도적으로 비워 둠(자리표시 문구만) — ‘저장됨’ 상태 표현 확인.
5. 갤러리 화면 시안은 이번 범위 밖(메뉴 링크만).
