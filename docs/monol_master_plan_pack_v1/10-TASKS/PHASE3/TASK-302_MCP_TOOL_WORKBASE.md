# TASK-302: MCP Tool - workbase task CRUD

## 목표
- create/search/update status 등을 tool로 제공한다.

## tool 설계
- `workbase.createTask`
- `workbase.searchTasks`
- `workbase.updateTaskStatus`

## 작업 단계
1) workbase 저장소를 datastore로 통합하거나 adapter 제공
2) destructive tool은 dryRun/confirm 옵션

## 완료 기준(DoD)
- [ ] Claude가 태스크 생성/검색/상태 변경 가능
