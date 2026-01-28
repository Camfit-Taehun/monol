# UC-14: ADR 자동 생성/업데이트

## 가치(Why)
큰 변경의 의사결정 근거를 ADR로 남겨 장기 유지보수 비용을 줄입니다.

## 범위(What)
- adr new + 변경 기반 adr 필요 알림

## 선행 조건/의존(Task)
- UC-04

## 구현 설계/개발 플랜(How)
1) `monol adr new "<title>"`로 템플릿 생성
2) 큰 변경 감지 시 “ADR 필요” 제안
3) events 기록: adr.created

## 수정/생성 파일(초안)
- `monol/src/core/adr/new.ts`
- `monol/tests/adr-template.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- adr 템플릿 스냅샷
- 변경 감지 규칙 테스트

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
