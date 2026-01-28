# TASK-004: mac/Linux 공통 portable shell 레이어 생성

## 목표
- mac 전용(`date -j`, `stat -f`, `sed -i ''`) 호출을 래퍼 함수로 감싸 OS 의존을 제거한다.

## 변경 범위
- (신규) `monol/monol-x/core/portable.sh`

## 작업 단계
1) `portable.sh`에 아래 함수 제공:
   - `mn_date_to_epoch()`
   - `mn_file_mtime()`
   - `mn_sed_inplace()`
2) 각 함수는 mac/Linux 분기(`uname`)로 구현

## 검증
- 로컬 OS에서 각 함수가 에러 없이 동작

## 완료 기준(DoD)
- [ ] portable 래퍼 제공 완료
