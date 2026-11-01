# 작업 표

> 웨이브 W1~W4는 작업 순서다. PRD 원본 §6 로드맵 Phase P1~P3, 사용자 스테이지 1·2와 다르다(`docs/01_PRD.md#3` 용어 표).

| 번호 | 제목 | 웨이브 | 선행 | 위험도 | 담당 | 상태 |
|---|---|---|---|---|---|---|
| task-001 | 프로젝트 생성 · 토큰 | W1 | — | 낮음 | builder (+designer) | 대기 |
| task-002 | 보안 기본 설정(`/secure setup`) | W1 | 001 | 높음 | builder | 대기 |
| task-003 | API 골격 · 로컬 가드 · GET /api/gpu | W1 | 002 | 높음 | builder | 대기 |
| task-004 | 스테이지 1 실측 스파이크(3060) | W2 | 003 | 높음 | builder | 대기 |
| task-005 | 잡 API · 큐 (A-01·02·03·05) | W2 | 003 | 높음 | builder | 대기 |
| task-006 | 스테이지 1 구현(세그먼트·ffmpeg) | W2 | 004·005 | 높음 | builder | 대기 |
| task-007 | SSE 진행률 (A-04) | W2 | 005 | 보통 | builder | 대기 |
| task-008 | 웹 S-01 생성 스튜디오 · 갤러리 | W3 | 001·005 | 보통 | builder | 대기 |
| task-009 | 웹 S-02 생성 결과 패널 | W3 | 007·008 | 보통 | builder | 대기 |
| task-010 | ComfyUI LTX 노드/가중치 준비 (`C:\ComfyUI\ComfyUI_windows_portable\ComfyUI`, 모델 0개 상태) | W3 | — | 높음 | 사용자 + builder | 대기 |
| task-011 | 스테이지 2 ComfyUI 어댑터 | W4 | 006·010 | 높음 | builder | 대기 |
| task-012 | 통합 테스트 · README 진행 현황 | W4 | 009·011·013 | 보통 | tester | 대기 |
| task-013 | 스테이지 1 Dev 엔진(실측·실동작) | W2 | 006 | 높음 | builder | 대기 |
| task-014 | 벤치마킹 로컬 분석 스파이크(도구·모델·3060 실측) | W5 | 004 | 높음 | builder | 보류(Q10) |
| task-015 | LTX image-to-video 스파이크(방식 B) | W5 | 004 | 높음 | builder | 보류(Q10) |
| task-016 | URL 검증·원본 다운로드 (A-07, yt-dlp 인자 고정) | W5 | 003·014 | 높음 | builder | 보류(Q10·Q11) |
| task-017 | 분석 잡 API·큐 (A-08~A-12) | W6 | 005·016 | 높음 | builder | 보류(Q10) |
| task-018 | 로컬 분석 파이프라인 | W6 | 014·017 | 높음 | builder | 보류(Q10) |
| task-019 | 설정·Claude API 키 저장 (A-13~A-16) | W5 | 003 | 높음 | builder | 보류(Q10·Q14) |
| task-020 | Claude 분석 어댑터 | W6 | 018·019 | 높음 | builder | 보류(Q10) |
| task-021 | 제작 방식 B(i2v) 스테이지 1 확장 | W6 | 006·015·017 | 높음 | builder | 보류(Q10·Q12) |
| task-022 | 웹 GNB·라우트·S-06 갤러리 | W7 | 008 | 보통 | builder (+codex-designer) | 보류(Q10) |
| task-023 | 웹 GSAP 진행 애니메이션 | W7 | 001 | 높음 | builder | 보류(Q10) |
| task-024 | 웹 S-03·S-04 벤치마킹 입력·분석 결과 | W7 | 017·022·023 | 보통 | builder | 보류(Q10) |
| task-025 | 웹 S-05 원본·생성 비교 | W7 | 024 | 보통 | builder | 보류(Q10) |
| task-026 | 웹 S-07 설정(분석 방식·키) | W7 | 019·022 | 높음 | builder | 보류(Q10) |
| task-027 | 벤치마킹 통합 테스트·README | W7 | 018·024·025 | 보통 | tester | 보류(Q10) |

상태: 대기 / 진행 / 완료 / 보류 · 스테이지 1 MVP는 task-001~009·013으로 완결(2단계 없이 동작). 벤치마킹(014~027)은 MVP 경계 팀장 결정(Q10, `docs/06_SDLC.md#3` 권고안) 전까지 보류.

## 발견한 문제 (범위 밖 — 나중 작업 후보)
| 날짜 | 위치 | 내용 | 제안 |
|---|---|---|---|

## 교훈 (다음 작업에 그대로 적용할 것만, 20줄 이내 유지)
- 
