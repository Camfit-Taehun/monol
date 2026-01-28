# Monol Master Plan Pack v1 (2026-01-27)

이 폴더는 아래 2개 패키지를 **하나로 합친 통합 폴더**입니다.

1) `monol_plans_v2` (전체 통합 로드맵/Phase0~3 + 35개 활용사례)
2) `monol_uc01_uc02_microtasks_v1` (UC01/UC02를 “실행 가능한 초미세 Task”로 추가 분해)

## 무엇이 달라졌나
- 기존에는 zip 2개로 분리되어 있었는데,
- 지금 폴더는 **단일 트리**로 합쳐져 있어 Claude Code가 순서대로 파일을 열어 실행하기 쉽습니다.

## 빠른 시작(권장 순서)
1) 방향/규칙
- `00-ORIENTATION/INTEGRATION-00_TARGET_ARCHITECTURE.md`
- `00-ORIENTATION/INTEGRATION-01_EXECUTION_RULES_FOR_CLAUDE_CODE.md`
- `00-ORIENTATION/NEXT_STEPS_RECOMMENDED.md`

2) 기본 레일 깔기(Phase0 → Phase1)
- `10-TASKS/PHASE0/` 의 `TASK-000`부터
- 이후 `10-TASKS/PHASE1/` 의 `TASK-120` → `TASK-121` (통합 monol + 번들러)

3) UC01/UC02를 실제 구현(초미세 태스크)
- UC01: `10-TASKS/USECASES/UC01/INDEX.md`
- UC02: `10-TASKS/USECASES/UC02/INDEX.md`
- UC01/UC02는 Phase1의 통합 패키지/번들러가 어느 정도 된 후 진행하는 걸 추천합니다.

## 인덱스
- Phase 태스크: `10-TASKS/INDEX.md`
- Use case 목록: `20-USECASES/INDEX.md`
- UC01/UC02 마이크로 태스크: `10-TASKS/USECASES/INDEX.md`

## 참고(원본 README 보관 위치)
- 전체 로드맵 원본 README: `30-EXTRAS/README_MASTER_V2.md`
- UC01/UC02 마이크로 태스크 원본 README: `30-EXTRAS/README_UC01_UC02_MICROTASKS.md`

