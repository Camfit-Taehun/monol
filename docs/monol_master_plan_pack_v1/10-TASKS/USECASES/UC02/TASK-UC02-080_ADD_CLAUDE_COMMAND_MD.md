# TASK-UC02-080: Claude Code 커맨드(Commands) Markdown 추가

## 목표
Claude Code에서 `/review-prep` 같은 형태로 실행할 수 있도록 command markdown을 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/.claude-plugin/commands/review-prep.md`
- `monol/monol-suite/.claude-plugin/plugin.json`

## 작업 단계(Claude Code가 그대로 실행)
1) commands/review-prep.md 작성:
- 목적/사용법
- 예: `monol review prep --dry-run` 실행
- 결과 파일 위치 안내
2) plugin.json에 해당 command 파일을 포함하도록 갱신(번들 방식이면 번들러가 생성하도록).

## 검증 방법
- Claude Code에서 커맨드가 보이는지 확인.

## 완료 기준(DoD)
- [ ] Claude Code에서 리뷰 prep 커맨드를 실행할 수 있다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
