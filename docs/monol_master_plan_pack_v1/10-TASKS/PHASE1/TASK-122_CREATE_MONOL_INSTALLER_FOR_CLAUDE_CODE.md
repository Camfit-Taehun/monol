# TASK-122: monol 설치 스크립트(Claude Code 플러그인 등록 자동화)

## 목표
- 사용자가 `npm i -g monol` 후 별도 수동 작업 없이 monol 플러그인을 활성화할 수 있게 한다.
- (주의) Claude Code의 플러그인 설치 위치/정책에 맞춰야 하므로, 최소한 “프로젝트 스코프 설치”를 기본으로 한다.

## 변경 범위
- `monol/scripts/install.mjs` (신규)
- `monol/scripts/uninstall.mjs` (신규, 선택)
- `monol/package.json` postinstall/preuninstall

## 작업 단계(권장)
1) 설치 방식 결정:
   - (A) 프로젝트 repo에 `.claude/settings.json`을 수정하는 방식(권장하지 않음: 자동 수정은 위험)
   - (B) 사용자가 명령으로 실행: `monol install --project`
2) 안전한 방식(B)로 구현:
   - `monol install` 명령을 제공하여,
   - 현재 디렉토리의 `.claude/settings.json`에 플러그인 등록을 추가(백업 생성)
3) uninstall도 동일하게 제공(선택)
4) 문서에 설치/제거 명령 명시

## 검증
- 새 repo에서 `monol install` 실행 → `.claude/settings.json` 갱신
- Claude Code에서 플러그인 활성화 확인

## 완료 기준(DoD)
- [ ] 설치가 재현 가능하고 안전장치(백업)가 있다
