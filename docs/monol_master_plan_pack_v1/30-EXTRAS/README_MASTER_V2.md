# Monol 통합 플랜 팩 v2 (2026-01-27)

이 폴더는 **Claude Code가 컨텍스트 과부하 없이** 실행할 수 있도록, 모놀 개선안을 **아주 작은 단위(Task)**로 쪼개 놓은 실행 패킷입니다.

## 핵심 목표(요약)
- **통합 패키지(monol) 1개**만 설치/업데이트
- Claude Code에는 **플러그인 1개(monol)**만 등록
- 데이터는 **monol-datastore 중심(SSOT)**으로 통합
- Hooks + MCP로 “자동화/관측/지식화”를 강화

## 사용 방법(권장)
- Claude Code에 **한 번에 한 파일만** 올려서 실행하세요.
- Task 파일은 “수정 파일/커맨드/검증/DoD”가 포함되어 있어 그대로 수행 가능합니다.

## 추천 실행 순서
1) `00-ORIENTATION/` 전체 3~5개 문서 읽기(방향/규칙)
2) `10-TASKS/PHASE0/` (정리/안전/버그)
3) `10-TASKS/PHASE1/` (단일 플러그인 + 번들러 + 설치 방식)
4) `10-TASKS/PHASE2/` (데이터/이벤트 통합)
5) `10-TASKS/PHASE3/` (MCP 서버 + Tool)
6) `20-USECASES/` (활용사례 구현)

## 인덱스
- 태스크 목록: `10-TASKS/INDEX.md`
- 활용사례 목록: `20-USECASES/INDEX.md`
