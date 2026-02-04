# Planote — 개요 (KO)

## 1) 한 줄 정의
Planote는 프로젝트의 `/plan` 폴더를 **프로젝트 지도**로 만든다:
- 마크다운 하이어라키(폴더 → 파일 → 헤딩) 탐색
- 원문을 건드리지 않고 노드에 주석(코멘트/수정요청) 작성
- AI가 즉시 실행 가능한 변경 요청 번들 생성
- 리비전/diff로 변경 추적 및 요청 해결 처리
- 플랜 노드를 실제 업무 링크(티켓/PR/체크리스트)와 연결

## 2) 해결하려는 핵심 문제
P1. 여러 마크다운 플랜 파일을 검토하는 과정이 느리고 실수하기 쉽다.  
P2. 검토 중 즉시 첨삭/수정 요청을 남기고, 이를 AI 에이전트에게 “정리된 형태”로 전달하고 싶다.  
P3. 수정 후 무엇이 바뀌었는지(diff)와 어떤 요청이 충족됐는지를 한 화면에서 보고 싶다.  
P4. 플랜의 작업이 실제 업무(티켓/PR/체크리스트) 진행과 연결되어야 한다.  
P5. 프로젝트 시작 시 플랜 폴더를 만들면 그게 곧 “지도”가 되도록 스캐폴딩이 필요하다.

## 3) 비목표(v1)
- 실시간 다중 사용자 협업(구글독스 스타일)
- 이슈 트래커 완전 연동(링크 저장만)
- Planote 내부에서 플랜 문서 편집(주석만; 편집은 외부 에디터/에이전트)
- 클라우드/원격 서버 운영

## 4) 참여자(Actor) / 역할
- Reviewer(사람): 플랜을 읽고 요청을 남기며, 수정 결과를 검증한다.
- Operator(사람): 번들을 AI 에이전트에게 전달하고 작업을 실행한다(Reviewer와 동일할 수 있음).
- AI Agent(외부): 번들을 소비해 플랜 마크다운을 수정한다.
- Maintainer(개발): Planote 코드 및 스키마 마이그레이션을 관리한다.

## 5) 핵심 개념
- Project Root: Planote를 실행하는 디렉터리
- Plan Root: 플랜 문서 폴더(기본 `plan/`)
- Plan Node: 폴더/파일/섹션(헤딩)
- Annotation: 비파괴 주석(코멘트/구조화된 수정요청)
- Review Cycle: 함께 묶어서 보낼 요청 묶음 + 베이스 스냅샷
- Bundle: 생성된 요청 문서(프롬프트/JSON)
- Revision: 에이전트 작업 이후 변경 감지(diff)
- Work Link: 노드/주석에 연결된 외부 업무 링크

## 6) 가이드 원칙(하드 룰)
1) 편의보다 데이터 무결성(주석 유실 금지)  
2) 기본은 비파괴(원문 마크다운은 깨끗하게 유지)  
3) 앵커는 최대한 살아남아야 함(견고한 재매칭)  
4) 인간 검토가 1순위(빠른 탐색/키보드 중심)  
5) 로컬 전용(공격면 최소화, 렌더 sanitize)

## 7) 성공 지표
- 플랜 섹션 탐색 시간 ≤ 5초  
- 주석 생성 ≤ 10초(섹션) / ≤ 15초(선택)  
- 번들 생성 1클릭 + 결정적 출력  
- diff 로딩 ≤ 2초(일반 변경)  
- 앵커 재매칭 성공률 ≥ 90%

## 8) 레퍼런스 URL
- plannotator: https://github.com/backnotprop/plannotator
- Commentary(VS Code 확장): https://marketplace.visualstudio.com/items?itemName=jaredhughes.commentary
- md-review: https://github.com/ryo-manba/md-review
- GitBook change requests: https://gitbook.com/docs/guides/docs-best-practices/make-your-documentation-process-more-collaborative-with-change-requests
- Markdown-Annotations: https://github.com/iainc/Markdown-Annotations
