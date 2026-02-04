# Planote — UI Spec (EN)

## 1) Layout (3-panel)
- Left: Plan Tree
- Center: Document Preview
- Right: Annotation / Cycle / Diff

Top bar:
- Search
- Active cycle selector
- Buttons: New Cycle, Generate Bundle, Detect Revision, Settings

## 2) Components (canonical names)
- `<AppShell />`
- `<TopBar />`
- `<PlanTree />` + `<TreeNode />`
- `<MarkdownPreview />`
- `<AnnotationPanel />` + `<AnnotationList />` + `<AnnotationEditor />`
- `<CyclePanel />`
- `<BundlePanel />`
- `<DiffPanel />`

Keyboard requirements and error/empty states are defined in the original UI spec; keep these component boundaries in code.

See `implementation-blueprints.md` for component props and initial skeleton code per WP.
