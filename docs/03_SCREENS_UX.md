# 03 SCREENS·UX — LTX Nomad Studio

> 형식: `ux-patterns` 2절(`plan2spec` 입력). 범위 `01_PRD.md#3` · API `04_API.md#1` · 랜딩·로그인 없음, `/`는 `/dashboard`로 이동.
> S-01·S-02는 같은 `/dashboard`에 함께 그린다. S-02 경로 `?job={id}` 쿼리 표기는 제안(**미결**, `01_PRD.md#7` Q8).
> 벤치마킹(S-03~S-07, R-B1~R-B6)은 MVP 포함 여부 **팀장 결정 필요**(Q10). GNB "대시보드" = S-01 해석은 권고안(Q17).

## 화면
| ID | 화면 | 유형 | 경로 | 주된 일 | 구성 | 데이터 | API | 권한 | 다음 |
|---|---|---|---|---|---|---|---|---|---|
| S-01 | 생성 스튜디오 | 폼 | /dashboard | 설정을 고르고 영상 생성 시작 | sidebar:GNB, header, stat:GPU명·VRAM 사용량·대기 잡 수, form:긍정 프롬프트*·부정 프롬프트·마케팅 태그·길이(15/20/30초)·비율(9:16/16:9)·해상도(720p/1080p)·엔진(Distilled/Dev), button:영상 생성하기, link:최근 생성 보기, list:최근 생성 갤러리 카드(길이·비율·상태) | jobs, gpu | A-01, A-02, A-06 | 로컬 전용 | S-02, S-03, S-06, S-07 |
| S-02 | 생성 결과 | 상세 | /dashboard?job={id} | 진행률을 보고 결과를 재생·저장 | header:상태 배지, steps:대기·스테이지 1·스테이지 2·완료, text:진행률(GSAP)·단계 메시지·세그먼트 n/N, card:비디오 플레이어(반복·전체화면), text:해상도·비율·길이, button:MP4 다운로드, button:프롬프트 복사, button:재생성 | jobs | A-03, A-04, A-05, A-01 | 로컬 전용 | S-01, S-02 |
| S-03 | 벤치마킹 입력·분석 | 폼 | /benchmark | 유튜브 URL을 넣고 원본 분석 시작 | sidebar:GNB, header, form:유튜브 URL*·분석 방식(로컬/Claude API, 기본값=설정), text:저작권·약관 고지(문구 Q11), button:분석 시작, steps:원본 받기·장면 감지·자막·장면 설명·프롬프트 초안, text:분석 진행률(GSAP)·단계 메시지 | analyses, settings | A-07, A-08, A-10, A-13 | 로컬 전용 | S-04, S-07 |
| S-04 | 분석 결과·제작 설정 | 상세 | /benchmark?analysis={id} | 분석 결과로 새 영상 설정 후 생성 | sidebar:GNB, header:원본 video_id·분석 방식, list:장면 카드(대표 프레임·구간·캡션), form:프롬프트 초안*(편집)·부정 프롬프트·제작 방식(A 텍스트→영상 / B 장면 이미지→영상)·시작 장면 선택(B만)·길이·비율·해상도·엔진, button:새 영상 생성하기, button:다시 분석 | analyses, jobs, gpu | A-09, A-12, A-01, A-06 | 로컬 전용 | S-05, S-03 |
| S-05 | 원본·생성 비교 미리보기 | 상세 | /benchmark?analysis={id}&job={jid} | 원본과 생성 영상을 전환·나란히 비교 | tabs:원본·생성·나란히, card:원본 플레이어(다운로드 없음), card:생성 플레이어(반복·전체화면), steps:대기·스테이지 1·스테이지 2·완료, text:진행률(GSAP)·세그먼트 n/N, text:재배포 금지 고지, button:MP4 다운로드(생성만), button:재생성 | analyses, jobs | A-11, A-03, A-04, A-05, A-01 | 로컬 전용 | S-04, S-05 |
| S-06 | 갤러리 | 목록 | /gallery | 이전 생성물 찾아 열기 | sidebar:GNB, header, list:생성 카드(길이·비율·상태·제작 방식·벤치마킹 여부), pagination | jobs | A-02 | 로컬 전용 | S-02, S-05 |
| S-07 | 설정 | 폼 | /settings | 분석 방식 기본값·Claude API 키 관리 | sidebar:GNB, header, form:분석 방식 기본값(로컬/Claude API)·Claude API 키(입력 전용, 저장 후 끝 4자 마스킹), text:Claude 선택 시 프레임·자막 외부 전송 고지, button:저장, button:키 삭제 | settings | A-13, A-14, A-15, A-16 | 로컬 전용 | S-03 |

## 상태
| ID | 빈 | 로딩 | 오류 | 성공 |
|---|---|---|---|---|
| S-01 | 갤러리: "아직 만든 영상이 없습니다" + 프롬프트 입력 유도 | GPU 상태·갤러리 스켈레톤 | API 연결 실패 안내 + 다시 시도 · GPU 미검출(503)이면 생성 버튼 비활성 · 400 필드 오류 표시 | 잡 생성 → S-02 표시 |
| S-02 | — | `queued`: 대기 순번 · `running_*`: 진행률 바 + 단계 메시지 | `failed`: 오류 코드별 한국어 사유 + 재생성 버튼 · 404: 없는 영상 안내 + S-01 | `done`: 플레이어 자동 재생 |
| S-03 | URL 입력 유도 + 지원 형식 예시(watch·shorts·youtu.be) | `queued`: 대기 순번 · `running`: 단계 표시 + 진행률 | A-07 오류(`invalid_url`·`host_not_allowed`·`unsupported_url`) 필드 아래 표시 · `claude_key_missing`: S-07 링크 · `failed`: 단계별 사유 + 다시 분석 | `done` → S-04 |
| S-04 | 장면 0개: "장면을 찾지 못했습니다" + 방식 A만 허용 | 장면 카드 스켈레톤 | 404 → S-03 · `analysis_not_done`·`keyframe_not_found`·`i2v_unavailable` 사유 표시 | 잡 생성 → S-05 |
| S-05 | 원본 사본 없음(Q13): 원본 탭 비활성 + 사유 | 생성 쪽 `queued`·`running_*` 진행률, 원본은 즉시 재생 | 생성 `failed`: 사유 + 재생성 · 원본 404: 원본 탭 비활성 | 생성 `done`: 생성 탭 자동 전환 |
| S-06 | "아직 만든 영상이 없습니다" + S-01·S-03 링크 | 카드 스켈레톤 | API 연결 실패 + 다시 시도 | — |
| S-07 | 키 미설정: "키 없음" 표시 | 설정 스켈레톤 | `invalid_key_format`·`key_store_failed` 사유 | 저장 후 끝 4자 마스킹 표시, 입력칸 비움 |

## 흐름
| ID | 흐름 | 단계 |
|---|---|---|
| F-01 | 영상 생성 | S-01 → S-02 |
| F-02 | 갤러리 다시 보기 | S-01 → S-02 |
| F-03 | 재생성(같은 설정 새 잡) | S-02 → S-02 |
| F-04 | 벤치마킹 생성 | S-03 → S-04 → S-05 |
| F-05 | 원본·생성 비교(탭 전환) | S-05 → S-05 |
| F-06 | Claude 키 등록 후 분석 | S-03 → S-07 → S-03 |
| F-07 | 갤러리에서 벤치마킹 결과 열기 | S-06 → S-05 |

## 규칙 (화면 동작)
| 항목 | 규칙 |
|---|---|
| 1080p | `GET /api/gpu`의 `stage2_available=false`면 1080p 비활성 + "ComfyUI 연결 시 사용 가능" 안내. 선택 시 `stages=[1,2]` |
| 엔진 | Distilled(기본, 속도 우수) / Dev(고화질, 느림) 라디오 → `engine`. Dev 선택 시 "시간이 더 걸리고 메모리 부족 가능" 안내(ADR-001) |
| 생성 버튼 라벨 | 선택 길이 반영(예: "15초 영상 생성하기") — 원본 §4.2 |
| GPU 표기 | 헤더 GPU명은 A-06 응답값(하드코딩 금지) |
| GNB | 좌측 고정: 대시보드(S-01)·벤치마킹 생성(S-03)·갤러리(S-06)·설정(S-07). 현재 메뉴 `aria-current="page"`. 태블릿·모바일 형태(아이콘 레일·드로어 등)는 codex-designer 교차 검토에서 확정 |
| 반응형 | 데스크톱(1200~): GNB · 좌 폼(S-01/S-04) · 우 미리보기(S-02/S-05) · S-01 하단 갤러리 / 태블릿(768~1199)·모바일(~767): 폼 → 미리보기 → 갤러리 1열. S-05 "나란히"는 모바일에서 위아래로 쌓는다 |
| 비교 미리보기 | 원본·생성은 각자 비율 유지(레터박스). 원본 플레이어는 다운로드·전체화면 다운로드 메뉴 없음(재배포 방지). 동시 재생 여부 Q19 |
| 제작 방식 | A=기본. B 선택 시 장면 카드에서 시작 장면 선택(개수·매핑 Q18), B 미지원 확인 시 비활성 + 사유 |
| 분석 방식 | 기본값은 A-13. `claude` 선택 + 키 미설정이면 분석 시작 비활성 + S-07 링크 |
| 진행 애니메이션 | GSAP(버전·라이선스 **확인 필요**, task-023)로 진행률 바 트윈·단계 표시 전환. 값은 SSE만 반영(애니메이션이 진행률을 꾸며내지 않음). `role="progressbar"`·`aria-valuenow`, 단계 메시지는 `aria-live="polite"` |
| reduced-motion | `prefers-reduced-motion: reduce`면 트윈 없이 즉시 값 반영 + 단계 텍스트만 갱신(반복·펄스 애니메이션 없음) |
| 키 입력 | `type="password"`, 저장 후 입력값 즉시 비움. 화면은 A-13의 `claude_key_hint`만 표시 |
| 디자인 | 색은 토큰만(원본 §4.1 값 → `apps/web/src/styles/tokens.css`, task-001) |
