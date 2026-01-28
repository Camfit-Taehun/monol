# TASK-124: 문서를 “통합 패키지(monol)” 기준으로 전환

## 목표
- 사용자 안내가 더 이상 개별 패키지 설치로 분산되지 않게 한다.

## 변경 범위(예시)
- repo root `README.md` 또는 `monol/README.md`
- `monol-suite/README.md`는 legacy로 표기하거나 통합 안내로 교체

## 작업 단계
1) Quick start: `npm i -g monol` + `monol install`
2) 기능 소개: monol에 포함된 modules/commands 목록(짧게)
3) 트러블슈팅: 권한/경로/캐시/OS 이슈

## 완료 기준(DoD)
- [ ] 문서만 보고 설치 가능
