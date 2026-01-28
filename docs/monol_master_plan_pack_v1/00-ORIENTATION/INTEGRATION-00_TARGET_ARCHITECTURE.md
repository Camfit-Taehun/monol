# INTEGRATION-00: 통합 패키지(monol) 최종 아키텍처

## 최종 목표
- npm 패키지: `monol` 하나만 설치
- Claude Code 플러그인: `.claude-plugin/plugin.json`은 **monol 1개**
- 내부 기능: logs/rulebook/workbase/datastore/x/console/mcp 등을 monol 내부 모듈로 제공

## 왜 “통합 패키지 + 단일 플러그인”이 유리한가
- 팀 배포/업데이트가 단순해짐(설치 1회)
- 플러그인 간 버전/호환성 문제 급감
- 경로 문제(../)를 근본적으로 제거 가능
- MCP tool/hook/콘솔을 하나의 제품으로 일관되게 설계 가능

## 추천 디렉토리 레이아웃(통합 후)
repo-root/
  monol/                         # publish 대상(실제 배포)
    package.json
    .claude-plugin/
      plugin.json                # monol 단일 플러그인
      commands/
      hooks/
      skills/
      agents/
    src/
      core/                      # logs/workbase/rulebook/datastore wrappers
      mcp/                       # MCP server + tools
      cli/                       # CLI 엔트리(기존 bash wrapper 포함 가능)
      console/                   # UI(선택)
    scripts/
      assemble-plugin.mjs        # 번들러
      install.mjs                # Claude Code 플러그인 설치(필요 시)
  legacy/                        # (선택) 기존 패키지 이동, 점진적 제거

## 통합 전략(현실적인 2단계)
- 1단계(빠르게): **번들러(assemble)**로 기존 패키지들의 commands/hooks/skills/agents를 monol로 복사해 단일 플러그인 구성
- 2단계(안정화 후): 실제 코드도 monol/src로 옮겨 레거시 의존 제거

## 절대 규칙(통합 시)
- 플러그인 경로는 plugin 내부 상대경로만 사용(../ 금지)
- `.claude-plugin/plugin.json`의 모든 path는 `./`로 시작
- 세션/DB/로그 산출물은 repo에 커밋 금지(.gitignore)
