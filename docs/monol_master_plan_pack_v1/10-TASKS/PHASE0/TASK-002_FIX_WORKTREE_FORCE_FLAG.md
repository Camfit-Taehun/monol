# TASK-002: worktree remove의 `--force` 항상 적용 버그 수정

## 목표
- `monol/monol-x/core/worktree.sh`에서 force=false인데도 `--force`가 붙는 버그 수정.

## 변경 범위
- `monol/monol-x/core/worktree.sh`

## 작업 단계
1) `${force:+--force}` 제거
2) `force_flag` 변수를 만들어 `force=="true"`일 때만 `--force` 설정
3) 호출부에 `$force_flag` 사용

## 검증
- force 미지정: `--force` 미적용
- force 지정: `--force` 적용

## 완료 기준(DoD)
- [ ] 의도한 경우에만 강제 삭제
