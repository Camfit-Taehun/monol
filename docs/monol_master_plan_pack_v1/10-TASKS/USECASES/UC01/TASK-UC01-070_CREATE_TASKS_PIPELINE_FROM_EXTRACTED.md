# TASK-UC01-070: ExtractedItem → Workbase 태스크 생성 파이프라인 연결

## 목표
extractor 결과를 실제 Workbase 태스크로 변환/생성하는 파이프라인을 구현합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/session/create-tasks-from-session.ts`
- `monol/monol-suite/src/core/session/contracts.ts`
- `monol/monol-suite/src/core/workbase/store.ts`
- `monol/monol-suite/src/core/session/uc01-config.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) `create-tasks-from-session.ts` 구현:
- 입력: `{ sessionId, project? }`
- 내부 흐름: getSessionEvents → extractItems → (filter by confidence) → dedupe → createTask
2) limit/threshold 적용:
- `MONOL_TASK_MAX_PER_SESSION`
- `MONOL_TASK_MIN_CONFIDENCE`
3) 태스크 title/description 생성 규칙 정의:
- title: item.title
- description: item.details + 세션 링크/근거(가능하면)
- tags: ['from:session', `type:${item.type}`]
4) 0개 생성 시에도 정상 종료(에러 X).

## 검증 방법
- 샘플 세션으로 실행 시 태스크가 생성되는지 확인(스텁 데이터로도 OK).
- threshold를 높이면 생성이 줄어드는지 확인.

## 완료 기준(DoD)
- [ ] session→tasks 파이프라인 함수가 존재
- [ ] limit/threshold가 적용된다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
