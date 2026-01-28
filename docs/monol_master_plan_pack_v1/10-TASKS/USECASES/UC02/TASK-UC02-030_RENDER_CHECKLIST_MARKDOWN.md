# TASK-UC02-030: 체크리스트 Markdown 렌더러 구현

## 목표
룰 매칭 결과를 사람이 바로 읽을 수 있는 markdown으로 저장합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/review/render-checklist.ts`
- `monol/monol-suite/src/core/review/config.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) render-checklist.ts 구현:
- 입력: files[], matchedRules
- 출력: markdown string
2) 포맷 권장:
- 변경 파일 목록(Top N)
- 매칭된 룰 목록
- 체크리스트(checkbox)
3) 저장 경로:
- `.monol/reports/review-checklist.md`

## 검증 방법
- 샘플 입력으로 markdown을 생성했을 때 사람이 읽기 쉬운 형태인지 확인.

## 완료 기준(DoD)
- [ ] 체크리스트 markdown 생성/저장이 가능

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
