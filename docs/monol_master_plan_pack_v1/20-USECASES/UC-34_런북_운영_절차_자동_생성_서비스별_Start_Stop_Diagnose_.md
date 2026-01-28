# UC-34: 런북/운영 절차 자동 생성(서비스별 Start/Stop/Diagnose)

## 가치(Why)
서비스 운영 절차를 자동으로 문서화해 장애 대응 속도를 높입니다.

## 범위(What)
- 서버/CLI 명령을 분석해 runbook 템플릿 생성

## 선행 조건/의존(Task)
- UC-05

## 구현 설계/개발 플랜(How)
1) 서비스 목록 정의(서버/콘솔/MCP)
2) 각 서비스에 대해:
- start/stop
- health check
- 로그 위치
- 흔한 오류/대응
3) docs/runbooks에 저장

## 수정/생성 파일(초안)
- `monol/src/core/runbooks/generate.ts`
- `monol/tests/runbooks.test.ts`

## 테스트 시나리오(재현 절차)
테스트:
- 템플릿 생성 스냅샷

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
