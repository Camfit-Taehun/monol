# TASK-100: 버전 정책 확립 + version 정렬(패키지/플러그인)

## 목표
- 각 패키지에서 `package.json` / `.claude-plugin/plugin.json` / 하드코딩 버전이 다르게 존재하는 문제를 해결한다.

## 원칙(권장)
- 배포 단위가 npm 패키지라면: `package.json.version`을 기준으로 한다.

## 작업 단계
1) 각 패키지별로 “배포 단위”를 먼저 확정:
   - (A) repo root 패키지 1개만 배포
   - (B) `*-pkg`만 배포
   - (C) 둘 다 배포(권장하지 않음)
2) 확정 후:
   - plugin.json version = 배포 단위 package.json version
3) monol-x의 `MONOL_VERSION` 등 하드코딩 버전 제거/동기화
4) 버전 bump 방식 문서화(선택: changesets)

## 완료 기준(DoD)
- [ ] 버전의 진실이 1개로 정해짐
- [ ] plugin.json과 package.json이 일치
