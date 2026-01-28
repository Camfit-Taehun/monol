# TASK-UC02-040: lint/test 실행 러너(출력 캡처/타임아웃/요약) 구현

## 목표
리뷰 준비 과정에서 lint/test를 실행하고 결과를 요약하는 러너를 구현합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/ci/run-command.ts`
- `monol/monol-suite/src/core/review/config.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) run-command.ts 구현:
- 입력: command string
- 출력: { ok, exitCode, stdout, stderr, durationMs }
2) 타임아웃 지원(예: 10분 기본): timeout 초과 시 강제 종료 + ok=false
3) 출력 길이 제한(예: 20k chars) + 마지막 N줄 우선 보존
4) 실행 실패 시에도 예외를 던지지 말고 결과 객체로 반환

## 검증 방법
- `echo test` 같은 커맨드로 정상 실행 확인.
- 실패 커맨드로 ok=false 확인.

## 완료 기준(DoD)
- [ ] 명령 실행 결과가 구조화되어 반환된다
- [ ] 타임아웃/출력 제한이 적용된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
