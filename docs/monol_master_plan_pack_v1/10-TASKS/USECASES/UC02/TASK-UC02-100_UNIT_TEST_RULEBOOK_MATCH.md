# TASK-UC02-100: rulebook match 단위 테스트 추가

## 목표
파일 패턴 매칭이 회귀하지 않도록 테스트를 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/tests/uc02/rulebook-match.test.ts`
- `monol/monol-suite/src/core/rulebook/match.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) 테스트 케이스:
- 특정 패턴 파일이 룰에 매칭됨
- 매칭되지 않음
- 중복 체크리스트 제거
2) fixture rules/json을 테스트에서 로드 또는 inline으로 제공

## 검증 방법
- `npm test`로 통과 확인

## 완료 기준(DoD)
- [ ] rulebook match 테스트가 추가됨

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
