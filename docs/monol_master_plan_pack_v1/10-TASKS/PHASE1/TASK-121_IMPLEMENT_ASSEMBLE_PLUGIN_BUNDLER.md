# TASK-121: assemble-plugin 번들러 구현(기존 패키지→통합 monol로 조립)

## 목표
- 기존 패키지들의 commands/hooks/skills/agents를 통합 monol `.claude-plugin/`로 복사하여
  **단일 플러그인에서 모두 제공**한다.

## 변경 범위
- `monol/scripts/assemble-plugin.mjs` (신규)
- `monol/scripts/assemble.config.json` (신규)
- `monol/.claude-plugin/{commands,hooks,skills,agents}` (생성/갱신)

## 작업 단계
1) assemble.config.json 작성(예시):
   ```json
   {
     "sources": [
       {"key":"logs","root":"../monol-logs/monol-logs-pkg"},
       {"key":"rulebook","root":"../monol-rulebook/monol-rulebook-pkg"},
       {"key":"channels","root":"../monol-channels/monol-channels-pkg"},
       {"key":"scout","root":"../monol-plugin-scout/monol-plugin-scout-pkg"},
       {"key":"datastore","root":"../monol-datastore/monol-datastore-pkg"}
     ]
   }
   ```
2) assemble-plugin.mjs 동작:
   - 대상 폴더 비우기/동기화
   - 각 source의 commands/hooks/skills/agents를 복사
   - 파일명 충돌 시 prefix: `<key>__<filename>`
3) `monol/.claude-plugin/plugin.json`을 “번들 결과”에 맞게 업데이트:
   - commands: 번들된 모든 md 목록을 자동 생성(또는 glob 지원이 없으면 파일 리스트를 생성하는 json도 함께 생성)
4) `package.json scripts`:
   - `assemble:plugin`: node scripts/assemble-plugin.mjs
   - `postinstall`: `npm run assemble:plugin` (+ install)

## 검증
- `npm run assemble:plugin` 실행 후:
  - `.claude-plugin/commands/`에 다수 파일 생성
  - plugin.json이 그 파일들을 참조
- Claude Code에서 monol 커맨드가 다수 보임

## 완료 기준(DoD)
- [ ] 번들러로 단일 플러그인이 여러 기능을 포함
