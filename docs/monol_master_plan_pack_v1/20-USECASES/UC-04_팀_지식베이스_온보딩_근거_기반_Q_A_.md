# UC-04: 팀 지식베이스/온보딩(근거 기반 Q&A)

## 가치(Why)
‘왜 이렇게 했지?’를 세션/ADR 근거 링크로 바로 답변할 수 있게 합니다.

## 범위(What)
- 트리거: 세션 종료 요약 저장 + ADR 생성
- 산출: 검색/온보딩 커맨드 + MCP tool

## 선행 조건/의존(Task)
- TASK-201 FTS(선택)
- TASK-304 logs MCP

## 구현 설계/개발 플랜(How)
### 1) ADR/결정 이벤트 적재
- ADR 생성 시 `type=adr.created` 이벤트
- 결정 로그: `type=decision.made`

### 2) 검색
- FTS 기반 `kb.search(text)` 구현
- 결과에 “근거 링크” 포함(sessionId, adrPath)

### 3) 온보딩 커맨드
- `monol onboard`:
  - 최근 ADR 5개
  - 핵심 룰 10개
  - 최근 변경 큰 모듈 5개

## 수정/생성 파일(초안)
- `monol/src/core/kb/search.ts`
- `monol/src/core/adr/create.ts`
- `monol/.claude-plugin/commands/onboard.md`
- `monol/src/mcp/tools/kb.ts`

## 테스트 시나리오(재현 절차)
### 테스트
- 샘플 ADR 2개 + 세션 요약 2개 적재 후 검색
- onboard 실행 시 섹션별 결과 출력 확인

## 완료 기준(DoD)
- [ ] 기능이 end-to-end로 재현된다
- [ ] 실패 케이스(권한/빈 데이터/네트워크 오류) 처리
- [ ] 자동 테스트 최소 1개 추가(단위/통합/스크립트)
