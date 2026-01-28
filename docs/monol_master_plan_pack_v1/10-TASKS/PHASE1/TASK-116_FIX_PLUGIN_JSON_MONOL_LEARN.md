# TASK-116: monol-learn plugin.json의 pluginPackage/상위경로 참조 제거

## 목표
- `pluginPackage: ../monol-learn-pkg`는 캐시/설치 환경에서 깨질 수 있다.
- monol-learn을 통합 패키지로 흡수하는 방향으로 전환한다.

## 변경 범위
- `monol/monol-learn/.claude-plugin/plugin.json`
- `monol/monol-learn-pkg/` (존재한다면)

## 작업 단계
1) 단기: monol-learn 플러그인은 “레거시”로 표시하고, 통합 monol에서 제공하도록 계획
2) 중기: plugin.json에서 pluginPackage 제거
   - commands/hooks/skills를 plugin 내부로 이동하거나
   - 통합 번들러에서 가져오도록 전환

## 완료 기준(DoD)
- [ ] `../` 기반 참조 제거(또는 deprecate 문서화)
