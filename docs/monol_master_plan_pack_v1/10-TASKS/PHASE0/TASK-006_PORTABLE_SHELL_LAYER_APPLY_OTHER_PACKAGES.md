# TASK-006: portable 레이어를 logs/scout/channels에 적용(우선순위 파일부터)

## 목표
- `monol-logs`, `monol-plugin-scout`, `monol-channels`의 shell 유틸도 portable 호출로 전환한다.

## 변경 범위(우선)
- `monol/monol-logs/monol-logs-pkg/lib/*.sh`
- `monol/monol-plugin-scout/monol-plugin-scout-pkg/lib/*.sh`
- `monol/monol-channels/monol-channels-pkg/lib/*.sh`

## 작업 단계
1) 각 패키지에 portable 레이어를 복사하거나(통합 전 임시),
   통합 패키지로 번들될 예정이면 monol 쪽 portable을 참조하도록 설계
2) 우선 `date/stat/sed`만 치환

## 완료 기준(DoD)
- [ ] 주요 스크립트가 OS 의존으로 깨지지 않음
