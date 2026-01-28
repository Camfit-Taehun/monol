# UC-02: PR/리뷰 자동화(룰북 체크 + 테스트 + PR 텍스트)

## 가치(Why)
코드 변경 직후 자동으로 룰북 체크리스트를 만들고 lint/test를 실행해 리뷰 품질과 속도를 올립니다.

## 범위(What)
- 트리거: `PostToolUse` 훅(또는 `Stop` 직전)
- 산출: 체크리스트 markdown + 테스트 결과 요약 + PR 설명 텍스트

## 선행 조건/의존(Task)
- TASK-303 rulebook MCP/tool
- TASK-120 통합 monol

## 구현 설계/개발 플랜(How)
### 1) 변경 파일 수집
- `git diff --name-only` 기준(스테이지/HEAD 기준 정책 결정)

### 2) 룰북 매칭
- `rulebook.match(files)`로 체크리스트 생성
- 결과를 `.monol/reports/review-checklist.md`에 저장

### 3) 테스트 실행
- `npm run lint`, `npm test` 실행(프로젝트별 커맨드 configurable)
- 실패 시:
  - 실패 테스트/린트 메시지 요약
  - 재실행 명령 제공

### 4) PR 텍스트
- 변경 요약(파일 top5)
- 체크리스트
- 테스트 결과
- 주의사항(보안/PII 룰)

## 수정/생성 파일(초안)
- `monol/src/core/review/prep.ts`
- `monol/src/core/rulebook/match.ts`
- `monol/src/core/ci/run.ts`
- `monol/.claude-plugin/commands/review-prep.md`
- `monol/tests/rulebook-match.test.ts`

## 테스트 시나리오(재현 절차)
### 로컬 통합 테스트
1) 임의 파일 수정
2) `monol review prep` 실행
3) 기대:
   - review-checklist.md 생성
   - test 결과 요약 출력

### 실패 케이스
- test 커맨드가 없으면: “설정 필요” 안내와 설정 파일 템플릿 생성

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
