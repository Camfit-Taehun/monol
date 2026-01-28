# TASK-UC01-090: UC01 수동 실행용 CLI/스크립트 추가

## 목표
훅에만 의존하지 않고 로컬에서 쉽게 재현/디버그할 수 있도록,
UC01을 수동으로 실행하는 CLI를 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/cli/uc01-run.ts`
- `monol/monol-suite/src/cli/index.ts`
- `monol/monol-suite/package.json`

## 작업 단계(Claude Code가 그대로 실행)
1) `uc01-run.ts` 구현:
- `monol uc01 run --session <id>` 형태
- 내부에서 `createTasksFromSession` 호출
2) help/usage 포함
3) 실행 결과로:
- 생성된 태스크 수
- 태스크 id 리스트
를 출력

## 검증 방법
- 샘플 sessionId로 실행 시 에러 없이 종료되는지 확인.
- 태스크 생성 시 결과가 출력되는지 확인.

## 완료 기준(DoD)
- [ ] 로컬에서 UC01을 수동 실행할 수 있다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
