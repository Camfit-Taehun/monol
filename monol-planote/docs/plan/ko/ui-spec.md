# Planote — UI 스펙 (KO)

## 1) 레이아웃(3패널)
- 좌: Plan Tree
- 중: 문서 프리뷰
- 우: 주석 / 사이클 / diff

상단 바:
- 검색
- 활성 사이클 선택
- 버튼: New Cycle, Generate Bundle, Detect Revision, Settings

## 2) 컴포넌트(정본 네이밍)
- `<AppShell />`
- `<TopBar />`
- `<PlanTree />` + `<TreeNode />`
- `<MarkdownPreview />`
- `<AnnotationPanel />` + `<AnnotationList />` + `<AnnotationEditor />`
- `<CyclePanel />`
- `<BundlePanel />`
- `<DiffPanel />`

키보드/에러/빈 상태 요구사항은 UI 스펙을 준수하고, 컴포넌트 경계를 그대로 코드로 유지한다.

컴포넌트 props 및 초기 스켈레톤은 `implementation-blueprints.md`를 따른다.
