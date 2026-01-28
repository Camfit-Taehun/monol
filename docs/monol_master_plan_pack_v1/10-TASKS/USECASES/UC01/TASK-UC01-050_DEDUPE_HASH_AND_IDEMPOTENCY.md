# TASK-UC01-050: 중복 방지(dedupe) 키/해시 구현

## 목표
SessionEnd 훅이 여러 번 실행되어도 같은 태스크가 중복 생성되지 않도록,
idempotent 동작을 보장합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/session/dedupe.ts`
- `monol/monol-suite/src/core/workbase/dedupe-store.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) `dedupe.ts`에 `computeDedupeKey(sessionId, itemTitle)` 구현:
- normalize(title)
- sha256 또는 간단 해시
2) dedupe 저장 방식 결정:
- (권장) Workbase 태스크에 `sourceSessionId` + `sourceHash` 컬럼/필드 저장
- 또는 events에 `task.created.from_session` 이벤트를 남기고, 그 이벤트를 조회해 dedupe
3) dedupe-store 어댑터 구현:
- `hasDedupeKey(key)`
- `rememberDedupeKey(key, taskId)`

## 검증 방법
- 동일 입력으로 computeDedupeKey가 항상 동일한 값인지 확인.
- has/remember가 최소 스텁으로라도 동작하는지 확인.

## 완료 기준(DoD)
- [ ] idempotency를 위한 dedupe 키가 존재
- [ ] 중복 생성 방지 저장소(스텁 포함) 제공

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
