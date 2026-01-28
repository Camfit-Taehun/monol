# TASK-005: portable shell 레이어를 monol-x에 적용

## 목표
- `monol-x/core/*.sh`에서 mac 전용 호출을 portable 함수로 치환한다.

## 변경 범위
- `monol/monol-x/core/config.sh`
- `monol/monol-x/core/session.sh`
- `monol/monol-x/core/automation.sh`
- `monol/monol-x/core/evolution.sh`
- `monol/monol-x/core/team.sh`
- (필요 시) `monol/monol-x/core/worktree.sh`

## 작업 단계
1) 각 파일 상단에서 `source portable.sh`(또는 config에서 일괄)
2) date/stat/sed 호출을 래퍼로 대체
3) 간단 스모크: 주요 커맨드 1~2개 실행

## 완료 기준(DoD)
- [ ] monol-x 스크립트가 Linux에서도 큰 에러 없이 실행
