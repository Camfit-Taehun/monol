# TASK-123: 통합 monol 기준 단일 marketplace.json 구성

## 목표
- marketplace.json을 monol 패키지 기준으로 1개만 제공한다.

## 변경 범위
- `monol/.claude-plugin/marketplace.json` (신규)

## 작업 단계
1) plugins 목록에 monol만 포함
2) `$schema`는 불안정하면 제거
3) 레거시 패키지의 marketplace.json은 유지하더라도 “문서상”으로는 monol만 안내

## 완료 기준(DoD)
- [ ] 마켓플레이스 관점에서 monol 1개로 정리
