# TASK-003: `MONOL_DATA_DIR` 정의 + dashboard PID/로그 경로 안정화

## 목표
- `monol/monol-x/core/dashboard.sh`에서 사용되는 `MONOL_DATA_DIR`을 정의하고 `.monol/data` 아래로 고정한다.

## 변경 범위
- `monol/monol-x/core/config.sh`
- `monol/monol-x/core/dashboard.sh`

## 작업 단계
1) config.sh에:
   - `MONOL_DATA_DIR="$(mn_dir)/data"`
   - `mkdir -p "$MONOL_DATA_DIR"`
2) dashboard.sh:
   - PID/LOG 경로가 `$MONOL_DATA_DIR` 아래인지 확인

## 검증
- start/stop 시 `.monol/data/dashboard.pid`가 생성/삭제

## 완료 기준(DoD)
- [ ] PID/LOG 경로가 안정화됨
