# TASK-110: monol-x plugin.json 경로/외부참조(../) 제거

## 목표
- `monol/monol-x/.claude-plugin/plugin.json`에서 `../modules/...` 경로를 제거한다.
- commands/hooks path를 모두 `./` 기준으로 바꾼다.

## 변경 범위
- `monol/monol-x/.claude-plugin/plugin.json`
- (이동/복사 대상)
  - `monol/monol-x/modules/session-evaluator/commands/mn-evaluate.md`
  - `monol/monol-x/modules/session-evaluator/hooks/*`

## 작업 단계
1) 외부 참조 파일을 plugin 내부로 이동/복사:
   - 목적지 예: `monol/monol-x/.claude-plugin/commands/mn-evaluate.md`
   - hooks 목적지 예: `monol/monol-x/.claude-plugin/hooks/session-evaluator/*`
2) plugin.json에서:
   - `../modules/session-evaluator/commands/mn-evaluate.md` → `./commands/mn-evaluate.md`
   - hooks script 경로도 모두 `./hooks/...`로 변경
3) commands 항목들도 `./commands/...` 형태로 통일(가능하면)
4) Claude Code에서 커맨드/훅 로드 확인

## 검증
- 플러그인 로드시 “missing path” 오류가 없어야 함
- mn-evaluate 커맨드가 보이고 실행 가능

## 완료 기준(DoD)
- [ ] plugin.json에 `../`가 없다
- [ ] 모든 경로가 plugin 내부를 가리킨다
