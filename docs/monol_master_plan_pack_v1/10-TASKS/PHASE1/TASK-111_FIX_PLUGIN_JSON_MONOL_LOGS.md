# TASK-111: monol-logs plugin.json 표준화(./ 경로 + hooks 타입 정리)

## 목표
- `monol/monol-logs/.claude-plugin/plugin.json`의 경로 표기(디렉토리 문자열)를 표준화한다.
- 가능하면 commands/skills/hooks를 디렉토리 문자열 대신 파일 목록 또는 hooks.json으로 정리한다.

## 변경 범위
- `monol/monol-logs/.claude-plugin/plugin.json`
- `monol/monol-logs/monol-logs-pkg/commands/`
- `monol/monol-logs/monol-logs-pkg/hooks/`

## 작업 단계
1) plugin.json의 commands/skills/hooks 경로를 모두 `./monol-logs-pkg/...`로 변경(`./` prefix)
2) hooks를 파일 목록으로 바꾸고 싶다면:
   - `hooks.json` 파일을 만들고, plugin.json에는 `./monol-logs-pkg/hooks/hooks.json`만 지정(스펙에 맞게)
3) 실제 경로가 존재하는지 확인

## 완료 기준(DoD)
- [ ] 모든 경로가 `./`로 시작
- [ ] 로드 시 에러 없음
