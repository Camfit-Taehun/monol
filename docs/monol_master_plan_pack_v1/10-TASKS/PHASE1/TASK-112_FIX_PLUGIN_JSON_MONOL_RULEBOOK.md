# TASK-112: monol-rulebook plugin.json 표준화

## 변경 범위
- `monol/monol-rulebook/.claude-plugin/plugin.json`

## 작업 단계
1) commands/skills/hooks/agents 경로를 `./monol-rulebook-pkg/...`로 변경
2) hooks 타입이 문자열(디렉토리)이라면 hooks.json 파일 방식으로 정리 고려
3) 경로 존재 확인

## 완료 기준(DoD)
- [ ] `./` prefix 적용
