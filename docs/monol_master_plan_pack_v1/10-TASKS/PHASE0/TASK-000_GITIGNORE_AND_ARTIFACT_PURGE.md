# TASK-000: 저장소 위생(.gitignore) + 산출물/민감물 제거

## 목표
- `node_modules/`, `dist/`, `.DS_Store`, `__MACOSX`, `.claude/sessions`, `claude-archives`, `*.db` 등 **산출물/민감물**이 커밋/배포 대상에서 빠지도록 정리한다.

## 변경 범위
- (신규) `monol/.gitignore`

## 작업 단계
1) repo root(`monol/`)에 `.gitignore` 생성/갱신:
   - `**/node_modules/`
   - `**/dist/`
   - `**/.DS_Store`
   - `__MACOSX/`
   - `.claude/sessions/`
   - `claude-archives/`
   - `.monol/`
   - `**/*.db`
   - `**/*.sqlite*`
   - `**/*.log`
   - `.env`, `.env.*`
2) 이미 추적 중이면 `git rm -r --cached <path>`로 추적 제거
3) `git status --ignored`로 확인

## 검증
- `git status`에 산출물이 남지 않는다.

## 완료 기준(DoD)
- [ ] 산출물/민감물이 커밋 대상에서 제외됨
