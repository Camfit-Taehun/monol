# UC-11: API 계약(OpenAPI) 자동 갱신 + 계약 테스트 생성

## 가치(Why)
API 변경 시 OpenAPI와 계약 테스트를 자동 갱신해 프론트/백 동기화를 강화합니다.

## 범위(What)
- 라우트 변경 감지 → openapi.yaml 갱신 → 계약 테스트 스캐폴드 생성

## 선행 조건/의존(Task)
- UC-02

## 구현 설계/개발 플랜(How)
1) `src/api/**` 변경 감지
2) openapi 생성기(현재 스택에 맞게) 적용
3) 계약 테스트 생성:
- supertest 기반 기본 케이스 생성(예: 200 응답)

## 수정/생성 파일(초안)
- `monol/src/core/api/openapi.ts`
- `monol/src/core/api/contract-tests.ts`
- `monol/tests/openapi.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- 스펙 생성 스냅샷
- 계약 테스트 샘플 실행

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
