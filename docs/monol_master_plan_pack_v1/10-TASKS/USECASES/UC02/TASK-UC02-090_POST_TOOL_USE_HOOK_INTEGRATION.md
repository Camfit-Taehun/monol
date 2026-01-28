# TASK-UC02-090: PostToolUse 훅 연결(자동 리뷰 준비 트리거)

## 목표
코드 변경 직후 자동으로 리뷰 prep를 실행하는 훅을 연결합니다.
(초기에는 dry-run 모드 권장)

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/.claude-plugin/hooks/post-tool-use.sh`
- `monol/monol-suite/.claude-plugin/hooks/hooks.json`

## 작업 단계(Claude Code가 그대로 실행)
1) `post-tool-use.sh` 생성:
- 기본은 `monol review prep --dry-run`만 실행(과도한 자동 테스트 방지)
- 설정으로 full mode 전환 가능
2) hooks.json에서 PostToolUse 이벤트에 연결
3) 무한 루프 방지:
- 훅 실행 중 생성한 파일이 다시 변경으로 잡혀 재실행되지 않도록 제외 규칙(.monol/reports는 무시) 적용

## 검증 방법
- 간단 파일 수정 후 훅이 실행되어 report가 생기는지 확인.
- 무한 재실행이 없는지 확인.

## 완료 기준(DoD)
- [ ] PostToolUse 훅으로 리뷰 prep가 자동 실행된다(안전 모드)

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
