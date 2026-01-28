# TASK-009: monol-server/console 실제 통합 실행

## 목표
- TASK-008의 결정에 따라 실제로 코드 통합을 수행한다.

## 작업 단계(권장 흐름)
1) monol-console에만 있는 기능을 monol-server로 이관
2) 실행 스크립트/포트/DB 경로 통일
3) monol-console은 `legacy/`로 이동(즉시 삭제 X)
4) 문서 갱신(실행 진입점 1개)

## 검증
- UI 접속
- 이벤트 수집/통계 API 동작

## 완료 기준(DoD)
- [ ] 실행 진입점 1개
- [ ] legacy로만 남음
