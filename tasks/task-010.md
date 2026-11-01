# task-010 ComfyUI LTX 노드/가중치 준비

| 항목 | 내용 |
|---|---|
| 웨이브 | W3 · 선행 — (설치본 확정됨) · 위험도 높음 · 보안 영향 의존성(외부 노드·가중치) |
| 담당 | 사용자(설치 승인·실행) + builder(절차 정리) → reviewer(security) |
| 근거 | `docs/05_STAGES.md#3`, `docs/adr/ADR-002-two-backends.md` |
| 쓰기 허용 | `.env.example`(주석만), 저장소 밖 ComfyUI 경로는 사용자 승인 범위만 |

## 할 것
- 포터블 루트 `C:\ComfyUI\ComfyUI_windows_portable`(`run_nvidia_gpu.bat`), 본체 `...\ComfyUI` v0.32.0 → `COMFYUI_PATH`=본체 폴더, `COMFYUI_URL`(포트 실측, 8188 미확인)
- 현재 `models/*` 전부 빈 폴더(LTX 포함 모델 0개), `extra_model_paths.yaml` 없음 → LTX 체크포인트·텍스트 인코더·(업스케일 모델)·LTX 노드를 모두 새로 설치
- 필요한 LTX/업스케일 노드·가중치를 공식 출처에서 확인해 목록화(이름·버전·라이선스), 승인 후 설치
- 1080p 업스케일 워크플로 JSON을 ComfyUI에서 수동 1회 성공시켜 내보내기

## 하지 않을 것
- 노드·워크플로 추측 작성, 앱 코드 수정, 가중치 커밋

## 완료 조건
- [ ] ComfyUI UI에서 720p 샘플 → 1080p 성공 기록, 노드 목록·포트를 팀장에게 보고
