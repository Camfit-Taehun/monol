# TASK-UC01-000: UC01 구현 범위 확정 + 인터페이스(contracts) 정의

## 목표
UC01(세션→태스크 자동 변환)을 구현하기 위해 필요한 최소 인터페이스를 먼저 고정합니다.
이 단계가 끝나면 이후 작업이 ‘구현만 하면 되는 상태’가 됩니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/session/contracts.ts`
- `monol/monol-suite/src/core/workbase/contracts.ts`
- `monol/monol-suite/src/core/datastore/contracts.ts`
- `monol/monol-suite/docs/uc01-session-to-tasks.md`

## 작업 단계(Claude Code가 그대로 실행)
1) 통합 루트(`monol/monol-suite`) 아래에 `src/core/session/`, `src/core/workbase/`, `src/core/datastore/` 디렉토리를 만든다(없다면).
2) `src/core/datastore/contracts.ts`에 최소 타입을 정의한다:
- Event(id, ts, source, type, actor?, project?, payload)
- QueryEventsFilter(project?, from?, to?, source?, type?, text?, limit?)
- DatastoreClient: queryEvents(filter), appendEvent(event).
3) `src/core/workbase/contracts.ts`에 최소 타입을 정의한다:
- Task(id, title, description?, tags?, priority?, status?, sourceSessionId?)
- CreateTaskInput
- WorkbaseClient: createTask(input), searchTasks(filter), updateTaskStatus(...)(선택).
4) `src/core/session/contracts.ts`에 최소 타입을 정의한다:
- ExtractedItem(type: todo|decision|risk, title, details?, confidence)
- ExtractSessionResult(items[], summary?).
5) `docs/uc01-session-to-tasks.md`에 아래 정책을 명시한다:
- 어떤 훅에서 실행하는지(SessionEnd)
- 중복 방지 키(sessionId+hash)
- 생성 최대 개수, confidence threshold
6) 모든 파일이 빌드에 포함되도록 export 경로(필요 시 index.ts)를 정리한다.

## 검증 방법
- `npm test` 또는 `npm run build`가 깨지지 않는지 확인(아직 구현체는 없어도 타입만 추가했으므로 통과해야 함).
- `docs/uc01-session-to-tasks.md`에 정책이 명확히 적혔는지 확인.

## 완료 기준(DoD)
- [ ] contracts 타입이 컴파일 오류 없이 추가됨
- [ ] 문서에 정책(중복 방지/limit/threshold/훅 트리거)이 명시됨

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
