# TASK-UC02-110: ci runner(run-command) 단위 테스트 추가

## 목표
명령 실행/실패/타임아웃/출력 제한 로직을 테스트합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/tests/uc02/run-command.test.ts`
- `monol/monol-suite/src/core/ci/run-command.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) 성공 케이스: `node -e "console.log('ok')"`
2) 실패 케이스: exit 1
3) 출력 제한 케이스: 매우 긴 출력 생성 후 truncation 확인
4) 타임아웃 케이스(가능하면): sleep 후 timeout 처리 확인

## 검증 방법
- `npm test` 통과 확인

## 완료 기준(DoD)
- [ ] run-command 테스트가 추가됨

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
