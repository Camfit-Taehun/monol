# TASK-204: monol-server의 이벤트 저장을 datastore로 통합

## 목표
- monol-server가 별도 sqlite를 쓰지 않고 monol-datastore의 events를 사용한다.

## 변경 범위
- `monol/monol-server/src/db/*`
- `monol/monol-server/src/api/events.js`
- `monol/monol-server/src/api/stats.js`

## 작업 단계
1) server 이벤트 insert를 datastore appendEvent로 대체
2) stats는 datastore query 기반으로 재작성
3) (선택) 기존 server DB importer 제공

## 완료 기준(DoD)
- [ ] server 이벤트가 datastore에 기록됨
