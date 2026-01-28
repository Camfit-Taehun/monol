# UC-20: Feature Flag 레지스트리 + 만료 체크

## 가치(Why)
플래그 관리 표준화를 통해 실험/롤아웃을 안전하게 운영합니다.

## 범위(What)
- feature-flags.json + expiry 검사 + 제거 태스크 생성

## 선행 조건/의존(Task)
- UC-01

## 구현 설계/개발 플랜(How)
1) 레지스트리 스키마 확정
2) 만료/owner 누락 검사
3) 만료 시 태스크 생성

## 수정/생성 파일(초안)
- `monol/src/core/flags/check.ts`
- `monol/tests/flags-check.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- expiry 검사 단위 테스트

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
