# TASK-303: MCP Tool - rulebook match/get

## 목표
- 변경 파일 목록을 주면 관련 룰/체크리스트를 반환한다.

## tool 설계
- `rulebook.match({ files: string[] })`
- `rulebook.getRule({ id })`

## 작업 단계
1) 룰북 저장 구조 표준화(파일 패턴 + 체크리스트)
2) match 구현
3) 테스트

## 완료 기준(DoD)
- [ ] 변경 기반 룰 체크리스트 자동 생성 가능
