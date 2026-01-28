# TASK-UC02-060: PR 설명 텍스트 생성기 구현(변경 요약+체크리스트+테스트 결과)

## 목표
리뷰어가 바로 이해하도록 PR 텍스트(초안)를 자동 생성합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/review/generate-pr-text.ts`
- `monol/monol-suite/src/core/review/render-checklist.ts`
- `monol/monol-suite/src/core/ci/summarize-failure.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) generate-pr-text.ts 구현:
- 입력: files[], checklistMd, lintResult, testResult
- 출력: markdown string
2) 포맷:
- Summary
- Files changed
- Checklist
- Test results
- Notes/risks
3) 저장 경로:
- `.monol/reports/pr-draft.md`

## 검증 방법
- 샘플 입력으로 pr-draft가 생성되는지 확인.
- 실패 케이스(테스트 실패)에서 요약이 포함되는지 확인.

## 완료 기준(DoD)
- [ ] PR 초안 텍스트가 자동 생성된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
