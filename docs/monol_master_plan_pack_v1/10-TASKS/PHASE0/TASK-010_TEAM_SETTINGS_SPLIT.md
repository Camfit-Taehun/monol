# TASK-010: `.claude/settings.json`(팀) vs `settings.local.json`(개인) 역할 분리

## 목표
- 팀 공유 설정은 `settings.json`으로,
- 개인 환경/민감값은 `settings.local.json`으로 분리하여 운영 안정성을 높인다.

## 변경 범위
- `monol/.claude/settings.local.json`
- (신규) `monol/.claude/settings.json` (팀용)

## 작업 단계
1) local에 있는 항목 중 팀에 공통인 것(예: allow Bash)만 settings.json으로 이동
2) 개인/민감(도메인, 토큰)은 local에만 유지
3) 문서에 두 파일의 역할을 명시

## 완료 기준(DoD)
- [ ] 팀 공유 가능 상태
