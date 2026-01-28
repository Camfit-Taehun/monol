# TASK-304: MCP Tool - logs search/summary

## 목표
- 세션 요약/결정 로그를 검색/조회한다.

## tool 설계
- `logs.listRecent({limit})`
- `logs.search({query, from, to, limit})`
- `logs.getSummary({sessionId})`

## 작업 단계
1) events에서 세션 단위 뷰 구성
2) tool 구현

## 완료 기준(DoD)
- [ ] 세션/요약을 Claude가 tool로 조회 가능
