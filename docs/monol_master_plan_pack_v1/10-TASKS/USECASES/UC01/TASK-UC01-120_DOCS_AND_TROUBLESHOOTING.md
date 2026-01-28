# TASK-UC01-120: UC01 문서/트러블슈팅 추가

## 목표
팀이 UC01을 실제로 쓰기 위해 필요한 문서(설정/예시/문제 해결)를 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/docs/uc01-session-to-tasks.md`
- `monol/monol-suite/README.md`

## 작업 단계(Claude Code가 그대로 실행)
1) docs에 아래 포함:
- 무엇을 하는 기능인지
- 켜기/끄기(env/config)
- 수동 실행 명령(uc01 run)
- 중복 방지 정책
- 흔한 오류(권한/DB 경로/세션 id 없음)와 해결책
2) README에 UC01 기능을 한 줄로 소개 + 링크 추가

## 검증 방법
- 문서만 보고 로컬에서 재현 가능한지 확인.

## 완료 기준(DoD)
- [ ] UC01 문서가 있어 팀원이 따라할 수 있다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
