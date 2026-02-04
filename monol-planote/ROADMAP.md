# Planote Roadmap

## Phase 1: Core Features (Completed)

| WP | Status | Name | Description |
|---|---|---|---|
| WP0 | ✅ Done | Repo bootstrap | Monorepo setup, Fastify + React + Vite, quality gates |
| WP1 | ✅ Done | Indexer | Markdown hierarchy scanning, heading parser, file watcher |
| WP2 | ✅ Done | UI Tree + Preview | 3-panel layout, collapsible tree, sanitized markdown preview |
| WP3 | ✅ Done | Annotations | CRUD API for file/section annotations in `.planote/` |
| WP4 | ✅ Done | Selection anchors | Quote-based anchoring, re-matching, highlight injection |
| WP5 | ✅ Done | Cycles & Bundles | Review cycles, JSON/prompt bundle generation |
| WP6 | ✅ Done | Revision detection | Git integration, diff view, base commit tracking |
| WP7 | ✅ Done | Work links + Roll-up | Node metadata, annotation badges, search filter |

**Phase 1 완료일**: 2026-02-03

---

## Phase 2: Enhanced UX (In Progress)

| WP | Status | Name | Description |
|---|---|---|---|
| WP8 | 🔲 Planned | Annotation Templates | 자주 사용하는 주석 유형 프리셋 (버그 리포트, 리팩토링 요청 등) |
| WP9 | ✅ Done | Batch Operations | 다중 선택 (Shift+Click), Select All/Deselect All |
| WP10 | 🔲 Planned | Export/Import | `.planote/` 백업/복원, 다른 프로젝트로 이전 |
| WP11 | ✅ Done | Keyboard Navigation | `j/k` 탐색, `/` 검색, `?` 도움말, `Esc` 포커스 해제 |
| WP12 | 🔲 Planned | Annotation Statistics | 대시보드: 타입별/우선순위별/파일별 통계 |

### UI 보완 작업 (2026-02-03 완료)

| 항목 | Status | Description |
|---|---|---|
| Selection Popup 위치 | ✅ Done | 선택 영역 근처에 팝업 표시, 화면 경계 처리 |
| Line Comment | ✅ Done | 라인 번호 클릭 → 인라인 코멘트 입력 |
| Feedback 제출 | ✅ Done | Approve/Request Changes → `.planote/feedback/`에 JSON 저장 |
| Annotation 타입 선택 | ✅ Done | 코멘트 팝업에 타입 드롭다운 (todo/note/question/risk) |
| 로딩/에러 상태 | ✅ Done | 로딩 스피너, 에러 토스트 알림 |
| 검색 개선 | ✅ Done | 300ms 디바운싱, 텍스트 하이라이트, 주석 내용 검색 |
| Diff 뷰어 개선 | ✅ Done | diff2html 통합, Unified/Split 뷰 전환 |
| 복사/내보내기 | ✅ Done | Copy, Download JSON, Download MD 버튼 |

---

## Phase 3: Integration (Future)

| WP | Status | Name | Description |
|---|---|---|---|
| WP13 | 🔲 Future | GitHub PR Integration | 주석과 PR 자동 연결, PR 코멘트에서 주석 생성 |
| WP14 | 🔲 Future | Linear/Jira Sync | 이슈 트래커 양방향 동기화 |
| WP15 | 🔲 Future | AI Assistant | LLM을 통한 주석 자동 생성, 요약, 제안 |
| WP16 | 🔲 Future | Team Collaboration | 주석 공유, 충돌 해결, 권한 관리 (로컬 Git 기반) |
| WP17 | 🔲 Future | VS Code Extension | IDE 내장 Planote 뷰어/에디터 |

---

## Phase 4: Polish (Future)

| WP | Status | Name | Description |
|---|---|---|---|
| WP18 | 🔲 Future | Theme Support | 다크 모드, 커스텀 테마 |
| WP19 | 🔲 Future | i18n | 다국어 지원 (한국어, 영어, 일본어) |
| WP20 | 🔲 Future | Performance | 대규모 프로젝트 최적화, 가상 스크롤, 레이지 로딩 |
| WP21 | 🔲 Future | Plugin System | 커스텀 주석 타입, 커스텀 번들 포맷 |

---

## Next Steps (Recommended)

### 즉시 착수 가능한 작업

1. **WP8: Annotation Templates**
   - 주석 생성 시 템플릿 선택 UI
   - 템플릿 CRUD API (`/api/templates`)
   - 기본 제공 템플릿: Bug Report, Feature Request, Refactoring, Question
   - `.planote/templates.json`에 커스텀 템플릿 저장

2. **WP12: Annotation Statistics**
   - 대시보드 패널 추가
   - 타입별/우선순위별/파일별 주석 통계
   - 시간에 따른 추세 그래프

3. **WP10: Export/Import**
   - `.planote/` 폴더 전체 백업
   - 다른 프로젝트로 주석 이전
   - 선택적 내보내기 (특정 파일/태그만)

### 우선순위 결정 기준

- **사용 빈도**: 매일 사용하는 기능 우선
- **개발 난이도**: 빠르게 구현 가능한 것 우선
- **의존성**: 다른 기능의 전제조건이 되는 것 우선

---

## Changelog

### 2026-02-03 (오후)
- **Phase 2 일부 완료**: WP9 (Batch Operations), WP11 (Keyboard Navigation)
- **UI 보완 작업 완료**:
  - Selection Popup 위치 수정 (선택 영역 근처에 표시)
  - Line Comment 기능 완성 (라인 번호 클릭 → 인라인 코멘트)
  - Feedback 제출 구현 (Approve/Request Changes → JSON 저장)
  - Annotation 타입 선택 추가 (todo/note/question/risk 드롭다운)
  - 로딩/에러 상태 추가 (스피너, 토스트 알림)
  - 검색 기능 강화 (디바운싱, 하이라이트, 주석 내용 검색)
  - Diff 뷰어 개선 (diff2html, Unified/Split 뷰)
  - 복사/내보내기 추가 (Copy, Download JSON/MD)
  - Keyboard Navigation (j/k 탐색, / 검색, ? 도움말)
  - Batch Selection (Shift+Click, Select All/Deselect All)

### 2026-02-03 (오전)
- Phase 1 완료 (WP0-WP7)
- 모든 E2E 테스트 통과
- 기본 기능 구현 완료
