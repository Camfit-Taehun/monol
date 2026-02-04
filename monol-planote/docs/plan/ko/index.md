# Planote — 문서 인덱스 (KO)

## 권장 읽기 순서
1) overview.md
2) requirements.md
3) architecture.md
4) data-model.md
5) cli-spec.md
6) api-spec.md
7) ui-spec.md
8) bundles-and-agent.md
9) testing.md
10) implementation-plan.md
11) implementation-blueprints-full.md
12) implementation-blueprints.md
13) scenarios.md
14) policies.md

## 빠른 시작
- `planote init`
- `planote serve`
- 주석 작성 → 리뷰 사이클 생성 → 번들 생성 → AI 에이전트 실행 → 리비전 감지 → diff 검토/해결

## 이 폴더의 문서
- overview.md: 제품 정의, 범위, 용어, 원칙
- requirements.md: 기능/비기능 요구사항 + 수용 기준
- architecture.md: 기술 아키텍처 + 모듈 + 빌드/런
- data-model.md: 저장 구조 + 스키마 + ID + 마이그레이션
- cli-spec.md: CLI 명령/옵션/출력/종료코드
- api-spec.md: 서버 REST/WS API 계약
- ui-spec.md: 화면/동선/키보드/접근성 스펙
- bundles-and-agent.md: 번들 포맷 + 템플릿 + 에이전트 지침
- testing.md: 테스트 전략 + 케이스 + 수동 QA
- implementation-plan.md: WP(작업 패키지) 계획 + 태스크 + DoD + 리스크
- implementation-blueprints-full.md: **FULL 파일 단위 1:1 템플릿** (`scaffold/wp0..wp7`와 페어)
- implementation-blueprints.md: 요약/레거시 코드 청사진
- scenarios.md: 주요/엣지/예외 시나리오
- policies.md: 보안/프라이버시/데이터 무결성 정책

## QA 로그
- `_qa_log.md`에 각 WP 수동 QA 결과를 반드시 기록한다.