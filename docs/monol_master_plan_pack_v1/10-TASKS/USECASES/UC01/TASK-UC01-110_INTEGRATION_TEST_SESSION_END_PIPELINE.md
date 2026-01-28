# TASK-UC01-110: UC01 파이프라인 통합 테스트(E2E-lite)

## 목표
샘플 세션(events)을 넣고, session→tasks 파이프라인이 실제로 태스크를 생성하는지 통합 테스트를 만듭니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/tests/uc01/pipeline.test.ts`
- `monol/monol-suite/src/core/session/create-tasks-from-session.ts`
- `monol/monol-suite/src/core/datastore/client.ts`
- `monol/monol-suite/src/core/workbase/store.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) 테스트용 임시 datastore(메모리 sqlite 또는 temp file)를 준비할 수 있으면 사용(권장).
2) 샘플 events를 insert한 뒤 `createTasksFromSession` 실행.
3) 생성된 태스크 수와 dedupe 동작 확인:
- 1회 실행 시 N개
- 2회 실행 시 0개 추가
4) 테스트 종료 후 temp db 정리

## 검증 방법
- `npm test`로 통합 테스트 통과 확인.

## 완료 기준(DoD)
- [ ] UC01 E2E-lite 테스트가 존재하고 통과한다
- [ ] idempotency(2회 실행) 검증이 포함된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
