# UC-12: 플레이키 테스트 감지/격리(Quarantine)

## 가치(Why)
불안정한 테스트를 자동 감지하고 격리해 CI 신뢰도를 회복합니다.

## 범위(What)
- 반복 변동 감지 → quarantine 리스트 관리 → CI 분리

## 선행 조건/의존(Task)
- UC-05

## 구현 설계/개발 플랜(How)
1) events의 test 결과를 집계해 flaky 후보 판정
2) `flaky-tests.json` 갱신(등록/해제)
3) CI에서 quarantine 분리 실행(문서/템플릿 제공)

## 수정/생성 파일(초안)
- `monol/src/core/tests/flaky-detector.ts`
- `monol/tests/flaky-detector.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- 판정 로직 단위 테스트(시계열 fixture)
- json 갱신 스냅샷

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
