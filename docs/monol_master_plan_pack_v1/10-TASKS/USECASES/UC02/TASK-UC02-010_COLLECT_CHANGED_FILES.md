# TASK-UC02-010: 변경 파일 수집기 구현(git diff 전략 포함)

## 목표
리뷰 준비의 시작은 ‘무엇이 바뀌었는지’이므로 변경 파일 목록 수집기를 구현합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/git/changed-files.ts`
- `monol/monol-suite/src/core/review/config.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) changed-files.ts 구현:
- 입력: base 전략(HEAD vs staged)
- 출력: string[] 파일 경로
2) 기본 전략:
- staged가 있으면 staged 우선
- 없으면 HEAD 대비 변경
3) git 실행은 child_process로 수행(실패 메시지 정리).

## 검증 방법
- 파일 1개 수정 후 함수 실행 → 해당 파일이 리스트에 포함되는지 확인.
- staged/unstaged 각각 테스트.

## 완료 기준(DoD)
- [ ] 변경 파일 수집이 안정적으로 동작

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
