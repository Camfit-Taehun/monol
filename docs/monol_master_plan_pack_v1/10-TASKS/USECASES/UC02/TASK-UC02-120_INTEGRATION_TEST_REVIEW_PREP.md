# TASK-UC02-120: 리뷰 prep 통합 테스트(E2E-lite)

## 목표
샘플 repo(또는 fixture 디렉토리)에서 review prep가 산출물을 생성하는지 테스트합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/tests/uc02/review-prep.test.ts`
- `monol/monol-suite/src/cli/review-prep.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) 테스트 fixture 디렉토리를 준비(간단한 git repo로 init)하거나,
- 현재 repo에서 임시 브랜치/파일로 수행
2) review-prep를 dry-run로 실행하고:
- review-checklist.md 생성
- pr-draft.md 생성
을 assert
3) 테스트 후 생성 파일 정리

## 검증 방법
- `npm test`로 통과

## 완료 기준(DoD)
- [ ] UC02 E2E-lite 테스트가 존재하고 통과한다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
