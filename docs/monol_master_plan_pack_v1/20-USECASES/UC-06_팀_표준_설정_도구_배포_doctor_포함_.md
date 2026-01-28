# UC-06: 팀 표준 설정/도구 배포(doctor 포함)

## 가치(Why)
팀원이 동일한 monol 환경을 쓰게 하여 재현성/협업 효율을 높입니다.

## 범위(What)
- 트리거: `monol install --project`, `monol doctor`
- 산출: `.claude/settings.json` 템플릿 + doctor 리포트

## 선행 조건/의존(Task)
- TASK-122 installer
- TASK-010 팀 설정 분리

## 구현 설계/개발 플랜(How)
### 1) install 커맨드
- `.claude/settings.json` 백업 후 플러그인 등록
- 최소 권한 allow 목록 템플릿 제공

### 2) doctor 커맨드
- 체크:
  - plugin.json 존재
  - .claude/settings.json에 monol 등록
  - datastore 파일 접근 가능
  - (선택) mcp 실행 여부

## 수정/생성 파일(초안)
- `monol/src/cli/install.ts`
- `monol/src/cli/doctor.ts`
- `monol/.claude-plugin/commands/doctor.md`

## 테스트 시나리오(재현 절차)
### 테스트
- 빈 repo에서 install→doctor 순서대로 실행
- 일부러 설정을 깨뜨려 doctor가 문제를 찾는지 확인

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
