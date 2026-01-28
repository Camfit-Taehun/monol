# TASK-001: 중첩 `.git/` 디렉토리 제거

## 목표
- repo 내부에 포함된 `**/.git/` 잔재를 제거해 subrepo 혼선을 없앤다.

## 작업 단계
1) `find . -name .git -type d`
2) repo root 외 `.git/` 삭제: `rm -rf path/to/.git`
3) 재확인

## 완료 기준(DoD)
- [ ] `.git/`는 repo root 1개만 존재
