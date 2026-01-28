# TASK-300: monol MCP 서버 스캐폴딩

## 목표
- MCP 서버를 만들어 Claude가 monol 기능/데이터에 tool 호출로 접근하게 한다.

## 변경 범위
- `monol/src/mcp/server.*` (신규)
- `monol/src/mcp/tools/*` (신규)

## 작업 단계
1) MCP 서버 기본 구조 구현(transport: stdio 권장)
2) tool: `monol.ping`
3) 로깅/에러 처리

## 완료 기준(DoD)
- [ ] ping tool이 동작
