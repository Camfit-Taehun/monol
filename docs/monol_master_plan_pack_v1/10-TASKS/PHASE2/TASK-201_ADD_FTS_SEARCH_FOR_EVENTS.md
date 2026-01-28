# TASK-201: events 텍스트 검색(FTS5) 추가(선택)

## 목표
- 세션 요약/결정/에러로그를 빠르게 검색할 수 있게 한다.

## 작업 단계
1) `events_fts` 가상 테이블 생성(FTS5)
2) insert/update 트리거 또는 appendEvent에서 동시 업데이트
3) `queryEvents({text})` 지원

## 완료 기준(DoD)
- [ ] 텍스트 검색이 동작
