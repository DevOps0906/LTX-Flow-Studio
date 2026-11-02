# task-026 웹 S-07 설정 (분석 방식 기본값 · Claude API 키)

| 항목 | 내용 |
|---|---|
| 웨이브 | W7 · 선행 task-019·022 · 위험도 높음 · 보안 영향 키 입력(브라우저 → 로컬 API 1회 전송) |
| 담당 | builder → codex-reviewer(code) + reviewer(security) |
| 근거 | `docs/03_SCREENS_UX.md` S-07 행·규칙 표 키 입력 행, `docs/04_API.md#6` 키 행 |
| 쓰기 허용 | `apps/web/**` |

## 할 것
- 분석 방식 기본값(A-14), 키 입력 `type="password"` → A-15, 저장 후 입력값 즉시 비움, 표시는 `claude_key_hint`만, 키 삭제(A-16)
- 다운로드·I2V 기능 상태와 각각의 고지 동의 버전·시각 표시; I2V 활성은 동의 후에만 허용
- Claude 선택 시 외부 전송 고지

## 하지 않을 것
- 키를 localStorage·sessionStorage·쿠키·상태 관리 저장소·URL·콘솔·분석 도구에 남김, Next.js 환경 변수로 키 노출

## 완료 조건
- [ ] `pnpm test`: 저장 후 입력값 비움·저장소에 키 없음 테스트 통과
- [ ] `pnpm build` 결과물에 키 문자열 없음(`secscan`), lint·typecheck 통과
