# TASK-UC01-030: datastore에서 세션 이벤트 조회 API 구현

## 목표
세션 ID로 해당 세션의 이벤트를 조회하는 함수(어댑터)를 구현합니다.
이후 extractor는 이 결과를 입력으로 사용합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/datastore/client.ts`
- `monol/monol-suite/src/core/session/get-session-events.ts`
- `monol/monol-suite/src/core/datastore/contracts.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) `DatastoreClient` 구현체(또는 어댑터)를 만든다:
- 현재 monol-datastore를 의존성으로 사용할지, 직접 sqlite를 열지 결정
- 일단 ‘stub 구현(로컬 파일/메모리)’로 시작해도 OK
2) `get-session-events.ts`를 만들고 입력: `{ sessionId, project? }` → 출력: `Event[]` 형태로 통일
3) events 스키마가 아직 없다면(Phase2 전):
- 임시로 `.monol/fixtures/session-events.json` 같은 파일을 읽어오는 모드 제공(테스트용)
- 나중에 datastore로 스위치 가능하도록 인터페이스 유지
4) 결과는 시간순(ts asc) 정렬 보장

## 검증 방법
- 샘플 sessionId로 호출 시 Event[]가 반환되는지 확인(스텁이라도 OK).
- 정렬이 보장되는지 확인.

## 완료 기준(DoD)
- [ ] 세션 이벤트 조회 함수가 존재
- [ ] 추후 datastore로 교체 가능한 구조

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
