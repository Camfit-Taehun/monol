# TASK-205: 데이터 보관/익명화/삭제 정책 추가

## 목표
- 세션/이벤트 데이터가 커질 때를 대비해 보관 정책과 민감정보 처리 규칙을 정의한다.

## 산출물
- `docs/data-retention.md` (신규)
- (선택) `monol purge` CLI: 오래된 이벤트 삭제

## 작업 단계
1) 보관기간(예: 90일) 설정 옵션
2) PII/토큰 같은 민감정보 마스킹 규칙
3) purge 명령 구현(soft delete 또는 hard delete)

## 완료 기준(DoD)
- [ ] 보관 정책 문서 + purge 동작
