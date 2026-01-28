# TASK-UC02-070: `monol review prep` CLI 구현(UC02 메인 엔트리)

## 목표
UC02 기능을 한 번에 실행하는 메인 CLI 명령을 추가합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/cli/review-prep.ts`
- `monol/monol-suite/src/cli/index.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) `review-prep.ts` 구현:
- 흐름: load review config → changed-files → rulebook match → checklist md → run lint/test → summarize → pr draft 생성
2) 옵션:
- `--base staged|HEAD`
- `--dry-run`(명령 실행 없이 체크리스트만)
- `--no-tests`(빠른 모드)
3) 실행 종료 시 결과 요약 출력:
- files count
- lint ok?
- test ok?
- report paths

## 검증 방법
- 로컬에서 `monol review prep --dry-run` 실행 시 체크리스트/PR draft가 생성되는지 확인.
- 테스트 실패 케이스에서 exit code 정책 확인(권장: 실패면 exit 1).

## 완료 기준(DoD)
- [ ] 단일 명령으로 UC02 주요 기능이 실행된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
