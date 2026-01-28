# TASK-200: datastore 표준 이벤트 스키마(events) 도입

## 목표
- 모든 자동화/관측의 기반이 되는 events 테이블을 monol-datastore에 추가한다.

## 변경 범위
- `monol/monol-datastore/` (스키마/마이그레이션/쿼리/모델)

## 스키마 제안
- `events(id TEXT PRIMARY KEY, ts INTEGER, source TEXT, type TEXT, actor TEXT, project TEXT, payload_json TEXT, tags TEXT)`
- 인덱스: `(ts)`, `(source,type)`, `(project,ts)`

## 작업 단계
1) 마이그레이션 작성
2) API:
   - `appendEvent(event)`
   - `queryEvents(filter)`
3) 테스트 추가(단위)

## 완료 기준(DoD)
- [ ] 마이그레이션 적용 + 단위 테스트 통과
