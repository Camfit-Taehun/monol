# TASK-120: 통합 패키지 `monol/` 스캐폴딩 생성(배포 단위 1개)

## 목표
- repo에 `monol/` 디렉토리(통합 배포 단위)를 만들고,
- 단일 플러그인 `.claude-plugin/plugin.json`을 구성한다.

## 변경 범위
- (신규) `monol/` (통합 패키지 루트)
  - `monol/package.json`
  - `monol/.claude-plugin/plugin.json`
  - `monol/.claude-plugin/commands/monol.md`
  - `monol/scripts/`
  - `monol/src/`

## 작업 단계
1) `monol/package.json` 생성:
   - name: `monol`
   - bin: `monol`(선택)
   - scripts: `assemble:plugin`, `postinstall` 등
2) `.claude-plugin/plugin.json` 생성:
   - name: `monol`
   - version: package.json과 동일
   - commands: `./.claude-plugin/commands/monol.md` 등(최소 1개)
3) `commands/monol.md`에:
   - “설치 확인/doctor/도움말” 제공
4) 아직 번들러 없이도 plugin이 로드되는지 확인

## 완료 기준(DoD)
- [ ] Claude Code에서 monol 플러그인 1개로 보임
