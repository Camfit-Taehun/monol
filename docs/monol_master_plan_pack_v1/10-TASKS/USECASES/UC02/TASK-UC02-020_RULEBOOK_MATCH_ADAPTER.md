# TASK-UC02-020: 룰북 match 어댑터 구현(files → checklist items)

## 목표
변경 파일 목록을 룰북 규칙에 매칭해 체크리스트를 생성합니다.
(레거시 monol-rulebook가 있다면 adapter로 연결)

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/rulebook/match.ts`
- `monol/monol-suite/src/core/rulebook/rules/*.json (선택)`
- `monol/monol-suite/docs/rulebook-format.md (선택)`

## 작업 단계(Claude Code가 그대로 실행)
1) 룰북 저장 방식 결정:
- (A) 레거시 monol-rulebook의 규칙 파일을 그대로 가져오기
- (B) monol 내부에 최소 rule json 포맷 정의
2) 최소 rule 포맷(권장):
- id
- patterns(glob)
- checklist(string[])
- severity(info/warn/block)
3) match 구현:
- 입력: files[]
- 출력: matched rules + merged checklist
4) 충돌/중복 제거: 동일 문구 중복 제거

## 검증 방법
- 샘플 files=['src/api/user.ts'] → 해당 패턴 룰이 매칭되는지 확인.
- 중복 체크리스트가 제거되는지 확인.

## 완료 기준(DoD)
- [ ] 변경 파일 기반 체크리스트 생성이 가능

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
