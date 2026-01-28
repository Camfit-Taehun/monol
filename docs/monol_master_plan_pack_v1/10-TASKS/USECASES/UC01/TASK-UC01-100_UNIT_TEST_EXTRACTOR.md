# TASK-UC01-100: extractor 단위 테스트 추가

## 목표
UC01에서 가장 중요한 extractor가 회귀하지 않도록 단위 테스트를 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/tests/uc01/extractor.test.ts`
- `monol/monol-suite/src/core/session/extractors/extract-items.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) 테스트 프레임워크 확인(jest/vitest 등) 후 테스트 파일 생성.
2) fixture events 배열을 직접 구성해 입력.
3) 케이스 최소 4개:
- TODO 추출
- Decision 추출
- Risk 추출
- 빈 입력 처리
4) 스냅샷 또는 명시적 assert로 검증

## 검증 방법
- `npm test`로 해당 테스트가 통과하는지 확인.

## 완료 기준(DoD)
- [ ] extractor 테스트가 추가되고 통과한다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
