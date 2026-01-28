# TASK-UC02-050: 실패 요약기(린트/테스트 로그에서 핵심만 추출)

## 목표
실패 로그가 길어도 핵심 원인을 빠르게 보게 하기 위해 요약기를 구현합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/ci/summarize-failure.ts`
- `monol/monol-suite/src/core/ci/run-command.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) summarize-failure.ts 구현:
- 입력: run-command 결과
- 출력: { headline, keyLines[] }
2) 규칙 기반 시작:
- 'FAIL', 'Error:', 'AssertionError', 'TypeError' 포함 라인 우선
- lint는 file:line 패턴 우선
3) 최대 keyLines N개 제한(예: 30개)

## 검증 방법
- 샘플 실패 로그로 요약 결과가 핵심을 잡는지 확인.

## 완료 기준(DoD)
- [ ] 실패 시 사람이 읽을 수 있는 요약이 생성된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
