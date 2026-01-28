# TASK-UC01-010: SessionEnd 훅 엔트리포인트 추가(얇은 래퍼)

## 목표
Claude Code의 SessionEnd 시점에 UC01 로직을 호출할 수 있도록,
hook 엔트리를 추가하고 node 실행으로 위임합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/.claude-plugin/hooks/session-end.sh`
- `monol/monol-suite/.claude-plugin/hooks/hooks.json`
- `monol/monol-suite/package.json`

## 작업 단계(Claude Code가 그대로 실행)
1) `.claude-plugin/hooks/`에 `session-end.sh`를 생성한다.
2) `session-end.sh`는 ‘실제 로직’을 직접 구현하지 않고 아래만 수행:
- 통합 루트 기준 node 스크립트 실행
- 필요한 env 전달
- 실패 시 exit code 반환
3) `hooks.json`을 사용한다면(권장): SessionEnd 이벤트에 `session-end.sh`를 연결한다.
4) `package.json`에 hook 실행에 필요한 node entry(예: `node dist/...` 또는 `node src/...`) 경로를 맞춘다(빌드 방식에 따라).
5) 이 단계에서는 아직 ‘태스크 생성’ 로직이 없어도 된다. 우선 훅이 실행되는지만 확인한다.

## 검증 방법
- Claude Code에서 세션을 종료하고 훅이 실행되는지 로그로 확인(간단 echo).
- 훅이 실패해도 Claude Code 전체가 망가지지 않도록(에러 메시지+비정상 종료 코드) 동작 확인.

## 완료 기준(DoD)
- [ ] SessionEnd 훅이 실제로 실행된다
- [ ] 훅이 node 스크립트로 위임하는 구조가 만들어졌다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
