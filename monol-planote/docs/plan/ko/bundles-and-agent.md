# Planote — 번들 & 에이전트 지침 (KO)

## 번들 포맷
- 프롬프트 Markdown(`prompt_md`): 사람+AI용
- 구조화 JSON(`structured_json`): 툴링용

## 결정적 정렬
주석 정렬:
1) filePath 오름차순
2) 섹션 위치(lineStart) 오름차순(없으면 sectionId)
3) priority: P0 > P1 > P2 > P3
4) createdAt 오름차순

## 프롬프트 템플릿(정본)
(이전 초안의 템플릿을 사용하며, allowed/forbidden roots 제약을 반드시 포함한다.)

## Operator 프로토콜(체크리스트)
1) 사이클 생성(스냅샷 캡처)
2) 번들 생성(md+json)
3) 에이전트 실행
4) 리비전 감지 후 diff 검토
5) 해결/재앵커
6) 사이클 종료

WP별 산출물/버튼/파일 출력은 `implementation-blueprints.md`에 정의한다.
