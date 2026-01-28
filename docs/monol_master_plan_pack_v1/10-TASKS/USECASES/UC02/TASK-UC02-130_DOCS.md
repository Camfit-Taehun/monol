# TASK-UC02-130: UC02 문서/운영 가이드 추가

## 목표
팀이 UC02를 운영할 수 있도록 설정/옵션/권한/주의사항을 문서화합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/docs/uc02-review-automation.md`
- `monol/monol-suite/README.md`

## 작업 단계(Claude Code가 그대로 실행)
1) docs에 포함:
- 설정 파일 예시
- dry-run/full 모드
- 훅 트리거/해제 방법
- 테스트 커맨드가 없는 프로젝트 대응(설정 유도)
- 권한(쉘 실행) 안내
2) README에 UC02 소개 + 링크 추가

## 검증 방법
- 문서만 보고 dry-run 실행이 가능한지 확인

## 완료 기준(DoD)
- [ ] UC02 문서가 있어 팀원이 따라할 수 있다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
