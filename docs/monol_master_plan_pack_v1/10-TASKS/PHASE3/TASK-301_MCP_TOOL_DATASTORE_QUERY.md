# TASK-301: MCP Tool - datastore queryEvents

## 목표
- Claude가 events를 질의할 수 있게 한다(읽기 전용부터).

## tool 설계
- `datastore.queryEvents({ project, from, to, source, type, text, limit })`

## 작업 단계
1) datastore query API 연결
2) payload는 크기 제한(예: 50KB) 및 필터링
3) 결과에 `id/ts/type/source/snippet` 포함

## 완료 기준(DoD)
- [ ] Claude가 events 검색 가능
