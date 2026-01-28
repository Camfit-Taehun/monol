# UC01/UC02 마이크로 태스크 팩 v1 (2026-01-27)

이 팩은 기존 `monol_plans_v2`의 UC-01/UC-02를 **실제 구현 가능한 수준으로 더 잘게 쪼갠 Task** 모음입니다.

## 경로 가정(중요)
- 이 문서는 통합 패키지 루트를 기본으로 **`monol/monol-suite/`** 로 가정합니다.  
- 만약 통합 패키지를 별도 폴더(예: `monol/`)로 이미 만들었다면,
  아래 모든 파일 경로에서 `monol/monol-suite` 를 당신의 통합 루트로 치환하세요.

## 사용법
1) 아래 인덱스에서 Task 1개만 Claude Code에 넣고 실행
2) 완료 후 다음 Task로 이동

- UC01 인덱스: `10-TASKS/USECASES/UC01/INDEX.md`
- UC02 인덱스: `10-TASKS/USECASES/UC02/INDEX.md`

## 권장 선행(필수)
- 통합 패키지 스캐폴딩/번들러 작업이 어느 정도 되어 있어야 합니다.
  - (예) v2의 `TASK-120`, `TASK-121` 수준
- datastore events가 없으면 최소 스텁부터 시작 가능하지만,
  최종 E2E는 events가 필요합니다.
