# TASK-UC02-000: 리뷰 자동화 설정 스키마 정의(.monol/review.json)

## 목표
프로젝트마다 lint/test/format 명령이 다르므로, UC02가 사용할 설정 스키마를 먼저 정의합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/review/config.ts`
- `monol/monol-suite/.monol/review.example.json`
- `monol/monol-suite/docs/uc02-review-automation.md`

## 작업 단계(Claude Code가 그대로 실행)
1) `.monol/review.example.json` 템플릿 생성(커밋 가능).
2) `config.ts`에 스키마 정의:
- lintCommand
- testCommand
- optional: formatCommand, changedFilesBase(HEAD|staged), reportDir
3) config 로더는 UC01의 load-config를 재사용하거나 별도 로더로 작성(중복 최소화).
4) `docs/uc02-review-automation.md`에 설정 방법/기본값 명시

## 검증 방법
- 템플릿만으로도 기본 동작이 가능하도록 기본값 정의 확인.

## 완료 기준(DoD)
- [ ] 리뷰 자동화 설정 스키마가 문서/코드로 고정됨

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
