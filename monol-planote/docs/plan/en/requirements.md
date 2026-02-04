# Planote — Requirements (EN)

## 0) Requirement levels
- MUST: required for MVP/WP completion
- SHOULD: required for v1 completeness
- COULD: roadmap

## 1) Functional Requirements (FR)
### FR-001 Plan Root discovery
- MUST: Determine Project Root and Plan Root.
- Default: Plan Root = `plan/` if exists, else instruct to run `planote init`.
- Acceptance:
  - Running `planote serve` in a project with `plan/` loads tree.
  - If no plan root exists: show actionable error with fix (`planote init`).

### FR-002 Plan hierarchy view (folder/file/heading)
- MUST: Tree view includes folders, markdown files, and headings inside each file.
- MUST: Headings show nesting by level (H1..H6).
- MUST: Clicking a node opens preview and scrolls to target section.
- Acceptance:
  - Tree updates when files are added/removed/edited (watch mode).
  - Large files: show progress indicator on parsing.

### FR-003 Markdown preview rendering
- MUST: Render Markdown safely (sanitize HTML).
- MUST: Support links and images (local relative paths) with safe handling.
- Acceptance:
  - XSS attempts in markdown do not execute.
  - Relative links navigate within Planote if target is in plan root; else show external warning.

### FR-004 Annotation CRUD
- MUST: Create annotation on:
  - A file (document-level),
  - A section (heading node),
  - A selection (selected text in preview).
- MUST: Annotation fields include: title (optional), body, type, status, priority, tags.
- MUST: List, filter, update, resolve, reopen, delete (soft delete by default).
- Acceptance:
  - Annotations persist across reload.
  - Delete never permanently removes without recovery (trash).

### FR-005 Structured edit requests
- MUST: Annotation can include structured edit actions:
  - replace, insert_before, insert_after, delete, rewrite_section
- MUST: Each action includes:
  - target (section or selection),
  - instruction,
  - expected result / acceptance criteria (short)
- Acceptance:
  - Bundle generator outputs these actions deterministically.

### FR-006 Anchor resilience (rematching)
- MUST: Selection annotations store quote+context and attempt rematching after edits.
- MUST: If rematching is ambiguous or fails:
  - show "needs attention" state,
  - provide UI to re-anchor manually (select new target).
- Acceptance:
  - Small edits before the selection should keep highlight in most cases.

### FR-007 Review cycles
- MUST: Create a review cycle by selecting annotations (default: all open).
- MUST: Cycle stores a base snapshot (file hashes and optionally git state).
- MUST: Cycle can generate one or more bundles.
- Acceptance:
  - A cycle can be reopened until closed.
  - Base snapshot is immutable for a cycle.

### FR-008 Bundle generation
- MUST: Generate bundle formats:
  - Prompt Markdown (human-readable + AI instructions)
  - Structured JSON (tooling-friendly)
- MUST: Bundle groups requests by file, then section.
- MUST: Bundle includes minimal context snippets (no full docs).
- Acceptance:
  - Same annotations produce identical bundle output ordering.

### FR-009 Revision detection and diff view
- SHOULD: Detect changes:
  - via git diff if git repo detected,
  - else via snapshot hash comparison.
- SHOULD: Show diff:
  - file list + unified view
  - optional side-by-side view
- MUST: Link changed sections/files to related annotations (auto-suggest).
- Acceptance:
  - Reviewer can mark an annotation "resolved by revision".

### FR-010 Work links
- MUST: Attach external links (URL + optional title/status) to Plan Node or Annotation.
- SHOULD: Roll-up status display in tree.
- Acceptance:
  - Work links persist and are editable.

### FR-011 Search and navigation
- MUST: Search across:
  - file names, headings, annotation body/tags
- MUST: Keyboard navigation for tree and annotations.
- Acceptance:
  - Search results in < 500ms for typical repo.

### FR-012 Import/Export
- SHOULD: Export cycle/bundle to `.planote/bundles/`
- SHOULD: Export annotations as JSON (backup).
- COULD: Import from another structure.

## 2) Non-functional Requirements (NFR)
### NFR-001 Security
- MUST: Local server binds to `127.0.0.1` only by default.
- MUST: Sanitize markdown rendering.
- MUST: Prevent path traversal.
- MUST: No telemetry.

### NFR-002 Reliability / Integrity
- MUST: Atomic write for all `.planote/` JSON files.
- MUST: Crash-safe: no corrupted JSON.
- SHOULD: File lock to prevent concurrent servers writing.

### NFR-003 Performance
- MUST: Index up to 1,000 markdown files OR 50MB plan root total in < 10s on typical machine.
- SHOULD: Incremental indexing (only changed files re-parse).
- MUST: UI responsive during scan.

### NFR-004 Compatibility
- MUST: macOS / Windows / Linux.
- MUST: Node >= 20.
- MUST: git and non-git directories supported.

### NFR-005 Accessibility
- SHOULD: Keyboard accessible core flows.
- SHOULD: Contrast-safe highlighting.
- SHOULD: Screen reader friendly.

## 3) Acceptance gates
- All MUST requirements pass automated tests or documented manual QA.
- No known data-loss bugs.
- Security MUST requirements verified by tests + manual checklist.
