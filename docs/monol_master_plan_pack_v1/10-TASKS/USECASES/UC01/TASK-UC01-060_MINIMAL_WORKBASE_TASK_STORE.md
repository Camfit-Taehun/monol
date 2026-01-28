# TASK-UC01-060: Workbase 최소 저장소 구현(태스크 생성/조회)

## 목표
UC01을 위해 Workbase의 최소 기능(create/search)을 먼저 구현합니다.
(기존 monol-workbase를 재사용할 수 있으면 adapter로 연결)

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/workbase/store.ts`
- `monol/monol-suite/src/core/workbase/contracts.ts`
- `monol/monol-suite/src/core/workbase/schema.sql (선택)`
- `monol/monol-suite/src/core/datastore/client.ts (연결 시)`

## 작업 단계(Claude Code가 그대로 실행)
1) Workbase 저장 방식 결정:
- (A) 기존 `monol-workbase` 패키지를 의존성으로 사용
- (B) datastore(SQLite) 안에 tasks 테이블을 새로 둔다(권장: 단순/통합)
2) 옵션 (B) 선택 시 tasks 스키마 설계(최소):
- id
- title
- description
- status(open/done)
- tags(json)
- priority
- sourceSessionId
- sourceHash
- createdTs
3) `store.ts`에 `createTask(input)` 구현(반환: Task).
4) `searchTasks({query,status,tag})` 최소 구현(없으면 빈 배열).

## 검증 방법
- createTask 1번 호출 → id가 반환되는지 확인.
- searchTasks(query)로 방금 만든 태스크가 검색되는지 확인.

## 완료 기준(DoD)
- [ ] Workbase 최소 CRUD(create/search)가 동작
- [ ] sourceSessionId/sourceHash를 저장할 수 있다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
