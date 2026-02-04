# Planote — 아키텍처 (KO)

## 1) 시스템 개요
Planote는 로컬 애플리케이션으로 구성된다:
- CLI(`planote`): init, 서버 실행, 번들 생성, 사이클 관리
- 로컬 서버(HTTP + WS): 플랜 마크다운 읽기, `.planote/` 메타데이터 관리, 이벤트 발행
- 웹 UI: 하이어라키 탐색, 마크다운 렌더, 주석 작성, diff 확인

모든 데이터 저장은 `.planote/`(sidecar) 아래 파일시스템 기반.

## 2) 컴포넌트 다이어그램(텍스트)
[User]
  | CLI 실행
  v
[CLI] ---- 제어/실행 ----> [로컬 서버] <-----> [파일시스템]
                               |
                               | UI 서빙
                               v
                             [Web UI]

## 3) 기술 스택(고정)
- Node.js >= 20
- TypeScript
- CLI: commander(또는 yargs)
- Server: Fastify
- WS: `@fastify/websocket` 권장
- Markdown parse: unified/remark
- Markdown render: react-markdown + sanitize
- Diff: git diff + patch 파서 + UI 렌더러
- Watch: chokidar
- Tests: vitest, playwright

## 4) 런타임 모드
### 4.1 개발 모드
- `npm run dev`
  - 서버 핫리로드
  - UI dev 서버(Vite) + 서버 프록시
  - UI URL 출력

### 4.2 프로덕션 모드
- `planote serve`
  - 서버 실행
  - 빌드된 UI(`/ui/dist`)를 정적 서빙
  - 기본 브라우저 오픈(설정 가능)

## 5) 레포 레이아웃(목표)
/src
  /core
  /server
  /cli
/ui
/plan
/.planote

## 6) 모듈 경계(하드 룰)
- core/*: 도메인 로직(HTTP 없음)
- server/*: API 레이어, 샌드박스, WS
- cli/*: 명령 파싱, 콘솔 UX
- ui/*: 렌더/인터랙션; fs 직접 접근 금지

## 7) 경로 샌드박스
- Project Root 결정:
  - git이면 top-level
  - 아니면 cwd
- 허용 읽기 범위:
  - Plan Root
  - `.planote/`
- 정규화 후 `..` 또는 심볼릭 링크 탈출은 거부.

## 8) 동시성 모델
- 단일 writer: `.planote/lock.json` 락 파일 유지
- 다른 서버 시작 시:
  - 명확한 메시지로 실패 또는
  - `--read-only` 모드 허용

## 9) 이벤트 모델
- WS 이벤트:
  - 인덱스 업데이트, 파일 변경
  - 주석 CRUD
  - 사이클/번들/리비전 업데이트
- UI는 구독하고 증분 갱신.

## 10) 에러 처리 전략
- API는 { code, message, details? } 형태의 타이핑된 에러 반환
- UI는 코드별 사용자 액션 제시:
  - PATH_OUTSIDE_ROOT, LOCKED, ANCHOR_AMBIGUOUS, NOT_FOUND, READ_ONLY 등

## 11) 빌드/릴리즈
- UI 빌드: `npm run build:ui`
- 서버/CLI 빌드: `npm run build:server` + `npm run build:cli`
- 시작: `npm start`
