# Planote — Overview (EN)

## 1) Product One-liner
Planote turns a project's `/plan` folder into a **project map**:
- view markdown hierarchy (folder → file → headings),
- annotate any node without touching source,
- generate an AI-ready change request bundle,
- track revisions/diffs and resolve requests,
- connect plan nodes to actual work items.

## 2) Primary Problems
P1. Reviewing many Markdown plan files is slow and error-prone.  
P2. Reviewers need to leave precise requests (rewrite/insert/delete) and later send them to an AI agent cleanly.  
P3. After changes, users need to see "what changed" and which requests are now satisfied.  
P4. Plan work must connect to real tasks (tickets/PRs/checklists) and progress.  
P5. At project start, creating the plan folder should scaffold the map.

## 3) Non-goals (v1)
- Real-time multi-user collaboration
- Full issue tracker API integration (links only)
- Editing plan markdown inside Planote (annotation only)
- Cloud hosting / remote server

## 4) Actors / Roles
- Reviewer (human): reads plan, leaves requests, verifies revisions.
- Operator (human): runs AI agent using generated bundle; may be same as Reviewer.
- AI Agent (external): consumes bundle and edits plan markdown files.
- Maintainer (dev): maintains Planote code and schema migrations.

## 5) Core Concepts
- Project Root: directory where Planote runs.
- Plan Root: folder containing plan documents (default: `plan/`).
- Plan Node: folder, file, or section (heading).
- Annotation: non-destructive comment or structured edit request.
- Review Cycle: bundle of annotations sent together; includes a base snapshot.
- Bundle: generated request document (prompt/JSON).
- Revision: detected changes after agent work (diff against base snapshot/commit).
- Work Link: external link attached to Plan Node or Annotation.

## 6) Guiding Principles (hard rules)
1) Data integrity > convenience (never lose annotations).
2) Non-destructive by default (source Markdown remains clean).
3) Anchors must survive edits as much as possible (robust rematching).
4) Human review is first-class: fast navigation, keyboard-driven.
5) Local-only: minimize attack surface; sanitize rendering.

## 7) Success Metrics
- Locate any plan section ≤ 5s (typical repo).
- Create annotation ≤ 10s (section) / ≤ 15s (selection).
- Bundle generation one click with deterministic output.
- Diff view loads within 2s (typical changes).
- Anchor rematching success ≥ 90% for common edits.

## 8) Reference URLs
- plannotator: https://github.com/backnotprop/plannotator
- Commentary (VS Code extension): https://marketplace.visualstudio.com/items?itemName=jaredhughes.commentary
- md-review: https://github.com/ryo-manba/md-review
- GitBook change requests: https://gitbook.com/docs/guides/docs-best-practices/make-your-documentation-process-more-collaborative-with-change-requests
- Markdown-Annotations: https://github.com/iainc/Markdown-Annotations
