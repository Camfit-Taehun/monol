# TASK-UC01-040: 세션 텍스트에서 TODO/Decision/Risk extractor 구현

## 목표
세션 이벤트(대화/요약/툴 로그 등)에서 TODO/결정/리스크를 추출하는 핵심 로직을 구현합니다.
우선은 규칙 기반(정규식/키워드)으로 빠르게 시작합니다.

## 변경 범위(수정/생성 파일)
- `monol/monol-suite/src/core/session/extractors/extract-items.ts`
- `monol/monol-suite/src/core/session/extractors/normalize.ts`
- `monol/monol-suite/src/core/session/contracts.ts`

## 작업 단계(Claude Code가 그대로 실행)
1) `extract-items.ts` 구현:
- 입력: `Event[]`
- 출력: `ExtractSessionResult`
2) 우선 대상 텍스트 소스 우선순위:
1) session summary payload(있으면)
2) user/assistant 메시지 payload
3) tool result payload(요약 가능한 범위만)
3) 규칙(최소):
- TODO: `TODO`, `해야`, `다음`, `FIXME`, `남은`, `추가로`
- Decision: `결정`, `채택`, `we decided`, `ADR`
- Risk: `리스크`, `주의`, `breaking`, `주의사항`, `위험`
4) normalize 함수로 title을 정규화(공백/구두점/대소문자).
5) confidence 점수는 간단 규칙으로 시작(키워드/문장 길이/명확도).

## 검증 방법
- 샘플 Event[]를 넣었을 때 ExtractedItem이 최소 1개 이상 추출되는지 확인.
- items가 없으면 빈 배열이 나오고 예외가 터지지 않아야 함.

## 완료 기준(DoD)
- [ ] extractor가 TODO/Decision/Risk를 추출한다
- [ ] 예외 없이 빈 입력도 처리한다

## 롤백 계획
- git revert 또는 해당 파일 삭제로 복구
