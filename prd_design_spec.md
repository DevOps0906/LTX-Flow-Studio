# 제품 요구사항 정의서 (PRD): LTX-Distilled 기반 초고속 영상 생성 플랫폼 (MVP)

---

## 1. 개요 및 목적 (Executive Summary)

* **제품명:** LTX Nomad Studio (Local MVP)
* **핵심 목적:** 이머커스, 마케터, 숏폼 크리에이터를 위해 LTX-Video 디스틸드(Distilled) 모델을 탑재한 단일 대시보드 형태의 영상 생성 플랫폼 구축.
* **주요 특징:** 
  * 15초, 20초, 30초 동영상 즉시 생성 (Shorts, Reels, TikTok 최적화)
  * 720p / 1080p 해상도 및 가로(16:9) / 세로(9:16) 모드 지원
  * LTX 디스틸드(Distilled) 추론을 통한 수십 초 내 고속 렌더링
  * 복잡한 설정 없이 프롬프트 입력과 클릭 몇 번으로 완성되는 직관적 Bento Grid UI

---

## 2. 경쟁사 벤치마킹 및 차별화 전략 (Competitive Analysis)

| 비교 항목 | Runway (Gen-2/3) | Pika Labs | LTX Studio (공식) | **LTX Nomad Studio (본 프로젝트)** |
| :--- | :--- | :--- | :--- | :--- |
| **렌더링 속도** | 느림 (1~3분 대기) | 보통 (40초~2분) | 보통 (스토리보드 전체 연산) | **매우 빠름 (디스틸드 적용 시 수십 초 내)** |
| **비용 구조** | 높은 구독료 / 크레딧 차감 | 구독료 방식 | SaaS 플랫폼 비용 | **로컬/자가 GPU 구동 시 비용 Zero** |
| **사용성/복잡도** | 복잡한 3D/카메라 컨트롤 | 디스코드/웹 혼용 | 영화 제작급 복잡한 타임라인 | **단일 대시보드 극단적 단순화** |
| **타겟 비디오** | 감성/영화풍 클립 | 애니메이션/소셜 클립 | 시나리오 중심 장편/단편 | **15~30초 바이럴 숏폼/마케팅 영상** |

---

## 3. 핵심 기능 명세 (Functional Requirements)

### 3.1 컨트롤 패널 (입력 영역)
* **프롬프트 입력창 (Prompt Input):** 
  * 긍정 프롬프트(Positive Prompt) 및 부정 프롬프트(Negative Prompt) 입력
  * 자주 쓰는 마케팅 태그 원클릭 추천 (예: "Cinematic lighting", "Smooth pan", "Hyper-realistic product shot")
* **영상 길이 선택 (Duration):** 
  * `15초`, `20초`, `30초` 토글 버튼 (기본값: 15초)
* **화면 비율 및 해상도 선택 (Aspect Ratio & Resolution):**
  * **세로 모드 (9:16):** 720p ($720 \times 1280$), 1080p ($1080 \times 1920$) - 숏폼 전용
  * **가로 모드 (16:9):** 720p ($1280 \times 720$), 1080p ($1920 \times 1080$) - 웹/유튜브 전용
* **엔진 선택 스위치:** 
  * `LTX-Distilled` (고속 프리뷰 / 4~8 스텝) vs `LTX-Dev` (고화질 정밀)

### 3.2 미리보기 및 갤러리 영역
* **실시간 진행률 표시기 (Progress Tracker):** 백엔드 GPU 추론 진행률(%) 및 단계별 메시지 실시간 노출.
* **비디오 플레이어:** 생성된 MP4 영상 즉시 재생 (반복 재생, 전체화면 기능).
* **결과물 액션:** MP4 다운로드, 프롬프트 복사, 재생성(Regenerate) 버튼 제공.
* **최근 생성 내역 (Recent Gallery):** 하단에 세션 동안 생성된 최근 영상 카드 목록 표시.

---

## 4. 디자인 시스템 및 와이어프레임 스펙

### 4.1 디자인 컨셉 (Bento Grid + Minimal Dark)
`nomad-design-modules` 스타일 가이드를 준수하여 직관적인 토스(Toss) 느낌의 깔끔한 다크 모드 인터페이스를 적용합니다.

* **Main Background:** `#090A0F` (딥 옵시디언)
* **Card Surface:** `#12141C` (다크 슬레이트)
* **Primary Accent:** `#6366F1` (인디고 글루)
* **Text Main:** `#F8FAFC` (슬레이트 50)
* **Text Muted:** `#94A3B8` (슬레이트 400)

### 4.2 레이아웃 와이어프레임 구조

```text
+-----------------------------------------------------------------------------------+
|  LTX NOMAD STUDIO                             [GPU Status: RTX 4090 - Ready]     |
+-------------------------------------------------+---------------------------------+
| [좌측: 설정 컨트롤 패널]                        | [우측: 비디오 미리보기 플레이어] |
|                                                 |                                 |
| 1. 프롬프트 입력                                | +-----------------------------+ |
| [ 제품을 강조하는 자연스러운 카메라 줌인... ]   | |                             | |
|                                                 | |     [ Video Player Area ]   | |
| 2. 영상 길이 선택                               | |                             | |
| [ 15초 (선택) ]  [ 20초 ]  [ 30초 ]            | +-----------------------------+ |
|                                                 | Resolution: 1080p | 9:16       |
| 3. 화면 비율 및 해상도                          | Duration: 15 seconds            |
| [ 📱 세로 (9:16) ]   [ 🖥️ 가로 (16:9) ]         |                                 |
| [ 720p ]   [ 1080p (선택) ]                     | [ 💾 MP4 다운로드 ] [ 📋 프롬프트 복사 ]
|                                                 |                                 |
| 4. 추론 엔진                                    |                                 |
| (x) LTX-Distilled (속도 우수)  ( ) LTX-Dev       |                                 |
|                                                 |                                 |
| [ 🚀 15초 영상 생성하기 (Distilled) ]            |                                 |
+-------------------------------------------------+---------------------------------+
| [하단: 최근 생성한 숏폼 미디어 갤러리 (Bento Grid)]                              |
| +-----------------+  +-----------------+  +-----------------+  +------------+ |
| | Clip #1 (15s)   |  | Clip #2 (20s)   |  | Clip #3 (30s)   |  | ...        | |
| +-----------------+  +-----------------+  +-----------------+  +------------+ |
+-----------------------------------------------------------------------------------+
```

---

## 5. 시스템 아키텍처 및 파이프라인 설계

```text
[User Web Dashboard (Next.js / Tailwind)]
                 │
                 ▼ (POST /api/generate)
[Next.js API Routes / Backend Middleware]
                 │
                 ▼ (Local Execution or REST/WebSocket)
[Local PyTorch / ComfyUI Server or Cloud GPU API]
   └─ LTX-Video Distilled Checkpoint (FP8 / CPU Offloaded)
                 │
                 ▼ (Video Render Complete)
[Video File Saved -> Local Storage / Supabase Storage]
                 │
                 ▼ (Realtime Webhook / Status Polling)
[Dashboard Auto-Update & Player Ready]
```

---

## 6. 개발 로드맵 및 단계별 계획 (SDLC)

1. **1단계 (Phase 1): 프론트엔드 UI/UX 구축**
   * Next.js App Router 기반 single-page 대시보드 레이아웃 생성
   * 프롬프트, 길이(15/20/30초), 해상도(720p/1080p, 9:16/16:9) UI 상태 구현
2. **2단계 (Phase 2): 백엔드 API & Local LTX Worker 연동**
   * ComfyUI / LTX Python API 연동 백엔드 엔드포인트 수립
   * LTX Distilled 파이프라인 연동 및 FP8 메모리 최적화 적용
3. **3단계 (Phase 3): 비동기 진행 상황 및 다운로드 처리**
   * SSE(Server-Sent Events) 또는 웹훅 기반 실시간 프로그레스 바 구현
   * 완료된 비디오 재생 및 MP4 파일 직접 로컬 다운로드 연동