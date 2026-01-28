# UC-27: 사고 회고(Postmortem) 자동 생성 + 액션아이템 추적

## 가치(Why)
사고 타임라인을 events에서 뽑아 회고 문서를 만들고 액션아이템을 Workbase로 추적합니다.

## 범위(What)
- postmortem 템플릿 + 타임라인 자동 채움 + action items 태스크 생성

## 선행 조건/의존(Task)
- UC-05
- UC-01

## 구현 설계/개발 플랜(How)
1) incident 입력(알림/티켓/기간)
2) events에서 타임라인 추출(test.fail, deploy 등)
3) docs/postmortems에 문서 생성
4) action items를 Workbase에 생성

## 수정/생성 파일(초안)
- `monol/src/core/incidents/postmortem.ts`
- `monol/tests/postmortem.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- 템플릿 생성 스냅샷
- 타임라인 추출 단위 테스트

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
