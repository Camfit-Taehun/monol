# TASK-008: monol-server vs monol-console 통합 전략 결정 & 계획서 작성

## 목표
- 중복 프로젝트 2개를 1개로 합치기 위한 “결정 문서(ADR-lite)”를 작성한다.
- 바로 삭제하지 말고 기능 비교표를 만든다.

## 산출물
- (신규) `docs/decisions/DEC-001-server-console-unify.md`

## 작업 단계
1) 두 프로젝트의:
   - 라우트 목록
   - DB 스키마
   - public UI 구성
   - websocket 이벤트
   를 표로 비교
2) 기준 프로젝트 선택(권장: monol-server)
3) 이관/삭제 순서와 리스크 정리

## 완료 기준(DoD)
- [ ] 통합 방향/순서가 문서로 남음
