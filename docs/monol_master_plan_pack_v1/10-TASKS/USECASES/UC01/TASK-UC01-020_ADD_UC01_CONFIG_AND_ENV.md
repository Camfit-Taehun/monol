# TASK-UC01-020: UC01 설정/환경변수 로더 추가

## 목표
자동 태스크 생성의 on/off, 최대 생성 개수, confidence threshold 등을 설정 가능하게 합니다.
(팀/개인 환경 차이를 흡수)

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/config/load-config.ts`
- `monol/monol-suite/src/core/session/uc01-config.ts`
- `monol/monol-suite/.monol/config.example.json`

## 작업 단계(Claude Code가 그대로 실행)
1) `.monol/config.example.json` 템플릿을 만든다(레포에 커밋 가능, 민감정보 금지).
2) `src/core/config/load-config.ts`를 추가하여 우선순위로 설정을 로드:
1) env (MONOL_AUTOCREATE_TASKS, MONOL_TASK_MAX_PER_SESSION, MONOL_TASK_MIN_CONFIDENCE)
2) `.monol/config.json`(있으면)
3) defaults
3) `src/core/session/uc01-config.ts`에 UC01 전용 설정 타입/기본값 정의.
4) 향후 다른 UC에서도 재사용 가능하도록 config 로더는 범용적으로 작성.

## 검증 방법
- 로컬에서 env를 바꿔 설정이 반영되는지 간단 출력으로 확인.
- `.monol/config.json`이 없을 때도 기본값으로 실행되는지 확인.

## 완료 기준(DoD)
- [ ] UC01 설정이 env/파일로 제어 가능
- [ ] 기본값이 정의되어 있고 문서화됨

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
