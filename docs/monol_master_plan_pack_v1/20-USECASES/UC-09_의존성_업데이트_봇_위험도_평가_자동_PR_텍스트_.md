# UC-09: 의존성 업데이트 봇(위험도 평가 + 자동 PR 텍스트)

## 가치(Why)
의존성 업데이트를 자동 제안/적용하면서 리스크를 정량화해 안전하게 업데이트합니다.

## 범위(What)
- outdated 스캔 + patch/minor 자동 적용 + major 보류 체크리스트

## 선행 조건/의존(Task)
- UC-02

## 구현 설계/개발 플랜(How)
1) `npm outdated --json` 파싱
2) semver 분류:
- patch/minor: 브랜치 생성 후 적용 + 테스트
- major: 자동 적용 보류 + 체크리스트 생성
3) PR 텍스트 생성(변경/테스트/리스크)

## 수정/생성 파일(초안)
- `monol/src/core/deps/outdated.ts`
- `monol/src/core/deps/update.ts`
- `monol/tests/deps-outdated.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- outdated json 파서 단위 테스트
- patch 시뮬레이션(샘플 package.json) 스냅샷

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
