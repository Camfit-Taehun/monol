# TASK-UC01-080: 태스크 생성 결과를 events로 기록(audit trail)

## 목표
자동화가 만든 태스크를 나중에 추적할 수 있도록,
`task.created.from_session` 이벤트를 남깁니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/session/create-tasks-from-session.ts`
- `monol/monol-suite/src/core/datastore/client.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) TASK-UC01-070의 파이프라인에서 태스크를 생성한 직후 events에 append:
- source: 'uc01'
- type: 'task.created.from_session'
- payload: { sessionId, taskId, itemType, sourceHash }
2) 중복 생성 방지에 events 기반 dedupe를 쓰는 경우, 여기서 기록한 이벤트를 dedupe 조회에도 활용할 수 있게 한다.
3) payload에는 민감값을 넣지 않는다(요약 텍스트는 길이 제한).

## 검증 방법
- 태스크 생성 후 events에 해당 타입 이벤트가 1개 이상 생기는지 확인(로그 또는 DB).

## 완료 기준(DoD)
- [ ] 자동 생성 태스크의 audit 이벤트가 남는다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
