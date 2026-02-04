# Planote (planote) — Claude Code 런북 (KO)

## 0. 미션
**Planote**를 구현한다: 프로젝트의 `/plan` 마크다운 하이어라키를 로컬에서 빠르게 검토하고, 원문을 훼손하지 않는 주석(코멘트/구조화된 수정요청)을 달며, AI가 바로 실행 가능한 요청 번들을 생성하고, 그 요청과 수정 결과(리비전/diff) 및 업무 링크를 연결한다.

이 레포는 스펙 기반이다.
- 진실원천(구현 기준): `/plan/en/*.md`
- 번역: `/plan/ko/*.md`
- 반드시 영어 스펙에 정의된 내용만 구현한다.
- 모호한 부분은 “데이터 손실이 없고 기존 주석이 깨지지 않는” 가장 보수적인 선택을 한다.

## 1. 전역 제약 (절대 위반 금지)
1) 로컬-퍼스트: 원격 백엔드/텔레메트리 금지
2) 비파괴 주석: 주석 저장을 위해 플랜 마크다운 원문을 절대 수정하지 않는다
3) 경로 샌드박스: 서버는 repo root 및 `.planote/` 내부에서만 읽기/쓰기
4) 데이터 안전: 원자적 저장, 조용한 데이터 유실 금지
5) 스코프 통제: WP 단위로 구현, 각 WP는 테스트+수동 QA 통과

## 2. 각 WP의 DoD(완료 정의)
- ✅ 유닛 테스트 추가/갱신 및 통과
- ✅ 필요 시 통합/E2E 테스트 갱신 및 통과
- ✅ `npm run lint`, `npm test` 통과
- ✅ 각 WP의 수동 QA 체크를 수행하고 `/plan/en/_qa_log.md`에 기록
- ✅ 데이터 안전/정확성에 영향을 주는 TODO 미잔존(로드맵 TODO만 허용)

## 3. 기술 스택(하드 블로커 없으면 고정)
- Node.js >= 20
- TypeScript
- Server: Fastify(가급적)
- Frontend: React + Vite
- Markdown parse: unified/remark
- Markdown render: react-markdown + sanitize
- Watcher: chokidar
- Test: vitest + playwright

## 4. 작업 패키지(WP) 실행 순서
아래 문서를 먼저 읽고 그대로 따른다:
- `/plan/en/implementation-plan.md`
- `/plan/en/implementation-blueprints.md`

WP0 → WP7 순서로 실행한다.

각 WP 종료 시:
1) 테스트 실행
2) 해당 WP의 수동 QA 실행
3) `/plan/en/_qa_log.md`에 기록:
   - 날짜/시간
   - 실행한 커맨드
   - 기대 결과 vs 실제
   - 발견/수정한 버그
   - 남은 이슈(있다면)

## 5. 커밋 규칙
- WP 종료 시 커밋 메시지: `WPx: <짧은 제목>`
- WP 내부에서 작은 커밋도 허용(히스토리 명확하면 OK)

## 6. 즉시 중단하고 수정해야 하는 레드 플래그
- 주석 파일이 병합 없이 덮어써짐
- 경로 탐색(Path traversal) 취약점
- 마크다운 렌더 XSS 가능성
- UI 하이라이트와 저장 앵커 불일치
- `.planote/` 스키마 변경 시 마이그레이션 미구현

## 7. 유용 커맨드
- `npm install`
- `npm run dev`
- `npm run build`
- `npm test`
- `npm run e2e`

## 8. WP7까지 산출물
- `planote serve` UI 동작
- 폴더/파일/헤딩 트리 + 마크다운 프리뷰
- 주석 CRUD(섹션+선택) + `.planote/` 저장
- 번들 생성(프롬프트 MD + JSON)
- 리뷰 사이클 + 리비전 감지 + diff 뷰
- 업무 링크 메타데이터
