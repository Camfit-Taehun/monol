# TASK-202: `.claude/sessions` importer 구현

## 목표
- Claude 세션을 events로 적재한다.

## 변경 범위
- `monol/monol-datastore/tools/importers/import-claude-sessions.*` (신규)

## 작업 단계
1) 세션 파일 포맷 파악
2) session.start/session.end 이벤트 생성
3) 중복 방지 upsert
4) CLI 제공

## 완료 기준(DoD)
- [ ] 샘플 세션 적재 성공
