# TASK-117: monol-design plugin.json의 hooks 타입/형식 정상화

## 문제
- 현재 hooks가 `{}` 형태 등으로 들어있어 스펙상 이상 가능.

## 변경 범위
- `monol/monol-design/.claude-plugin/plugin.json`

## 작업 단계
1) hooks가 없다면:
   - `hooks: []` 또는 필드 제거
2) commands가 빈 배열이면 유지 가능
3) 최소한 plugin.json이 유효 JSON + 일관 타입을 갖게 함

## 완료 기준(DoD)
- [ ] plugin.json이 일관된 타입을 가진다
