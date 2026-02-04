# Planote — Implementation Plan (WP0–WP7) (EN)

> This file defines *what* must be delivered per WP.  
> `implementation-blueprints.md` defines *how* (exact file tree, scripts, skeletons).

## WP0 — Repo bootstrap & quality gates (MUST)
### Goal
Set up project skeleton with dev/build/test/lint, minimal server+UI, and CI-ready scripts.

### DoD
- `npm run dev` starts server+ui
- `npm test` passes
- Manual QA logged in `/plan/en/_qa_log.md`

### Manual QA (WP0)
- Start dev, open UI, see project info.
- Stop server, restart, no port conflicts.
- Confirm server binds to 127.0.0.1 only.

## WP1 — Indexer: scan plan hierarchy (MUST)
Goal: incremental index of plan folder and headings.

Manual QA:
- Add/remove md file under plan → tree updates.
- Add heading levels → nesting correct.

## WP2 — UI: Plan tree + markdown preview (MUST)
Manual QA:
- XSS snippet does not execute.
- Keyboard navigation basics.

## WP3 — Annotations: file/section (MUST)
Manual QA:
- Create/filter/resolve/delete(soft) annotations.
- Confirm trash contains deleted one.

## WP4 — Selection annotations + anchor rematching (MUST)
Manual QA:
- Selection survives edits.
- Duplicate quote triggers ambiguous picker.

## WP5 — Review cycles + bundle generator (MUST)
Manual QA:
- Create cycle → generate bundle → outputs exist under `.planote/bundles/`.

## WP6 — Revision detection + diff view (REQUIRED for v1)
Manual QA:
- Edit plan file → detect revision → diff shows changes.
- Resolve annotation by revision.

## WP7 — Work links + roll-up (SHOULD)
Manual QA:
- Add work link to node and annotation.
- Tree badges update.

Risk register and mitigations remain as defined in earlier spec.
