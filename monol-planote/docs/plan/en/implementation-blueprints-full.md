# Implementation Blueprints — FULL (WP0–WP7)

This document is the **FULL, “no-gaps” blueprint** for building Planote.
It is paired with **file-by-file, runnable templates** under:

- `scaffold/wp0/` … `scaffold/wp7/`

If you want the quickest path, **pick a WP** and copy that scaffold into your repo.
If you want a strict incremental build, follow WP0 → WP7 and merge each scaffold step-by-step.

> Canonical rule: if EN and KO docs differ, **English is the source of truth**.

---

## Repo shape (target)

```
.
├─ src/
│  ├─ cli/
│  ├─ core/
│  └─ server/
├─ ui/
├─ plan/
└─ .planote/        (runtime data; generated)
```

### Runtime data in `.planote/`
- `.planote/config.json` — config (auto-defaults if missing)
- `.planote/index/**` — indexing artifacts
- `.planote/annotations/**` — annotation records
- `.planote/cycles/**` — cycle records
- `.planote/bundles/**` — bundle records
- `.planote/revisions/**` — revision+diff records
- `.planote/nodes/**` — node metadata (work links, lastOpenedAt)

---

## How to use the scaffolds

### Option A — jump to a WP
1) Copy `scaffold/wpX/*` into your repo root (merge carefully).
2) Run:
- `npm install`
- `npm run dev`
3) Validate with:
- `npm run typecheck`
- `npm test`
- `npm run e2e`

### Option B — strict incremental
For WP0..WP7, for each WP:
1) `git checkout -b wpX`
2) Copy/merge from `scaffold/wpX` (or diff from previous scaffold)
3) Run checks
4) Commit and tag

---

# WP0 — Baseline: server + UI + tests

**Template:** `scaffold/wp0/`

## Goal
Have a working monorepo with:
- Fastify server (`/api/project`)
- Vite+React UI showing `/api/project`
- Unit test (Vitest) + E2E (Playwright)

## Key files
- `src/server/app.ts`, `src/server/index.ts`
- `src/server/routes/project.ts`
- `ui/src/App.tsx`
- `tests/unit/wp0_sanity.test.ts`
- `tests/e2e/wp0_smoke.spec.ts`

## Endpoints
- `GET /api/project`

## QA checklist
- `npm run dev` opens UI at `http://127.0.0.1:5173`
- UI shows JSON from `/api/project`
- `npm test` passes
- `npm run e2e` passes

---

# WP1 — Indexing + watch + WS events

**Template:** `scaffold/wp1/`

## Goal
Index markdown under `plan/` and provide:
- `GET /api/tree` (folder/file/section tree)
- `WS /api/events` for `index:updated`

## Key files added
- `src/core/indexer/*` (scan, parseHeadings, tree, watch)
- `src/core/store/config.ts`
- `src/core/events/bus.ts`
- `src/server/ws/events.ts`
- `src/server/routes/tree.ts`

## Endpoints
- `GET /api/tree`
- `WS /api/events` (messages: `index:updated`, `index:error`)

## QA checklist
- `npm run dev`
- `GET /api/tree` returns a tree with `plan/README.md`
- Editing a markdown file triggers `index:updated` over WS
- `npm test` passes

---

# WP2 — Tree UI + markdown preview

**Template:** `scaffold/wp2/`

## Goal
UI becomes 3-panel:
- Left: tree browser
- Center: markdown preview
- Right: placeholder (WP3+)

## Key files added/changed
- Server: `src/server/routes/file.ts` (`GET /api/file`)
- UI: `ui/src/components/*` (`PlanTree`, `MarkdownPreview`, etc.)
- UI: `ui/src/api/*`

## Endpoints
- `GET /api/file?path=plan/...`

## QA checklist
- Click `README.md` in tree → preview shows markdown
- Section node click scrolls preview to section heading
- `npm run e2e` passes (`wp2_tree_preview.spec.ts`)

---

# WP3 — Annotations (file/section)

**Template:** `scaffold/wp3/`

## Goal
Add persistent annotations stored as JSON:
- List annotations filtered by filePath/sectionId/status
- Create / update / soft-delete
- WS event `annotation:changed`

## Key files
- `src/core/store/annotations.ts`
- `src/server/routes/annotations.ts`
- UI: `ui/src/components/AnnotationPanel.tsx`

## Data model (stored under `.planote/annotations/`)
Each annotation is a JSON file:
- `target.kind`: `file` | `section` | (reserved) `selection`
- `status`: `open` / `closed`
- `workLinks`: reserved for WP7 UI improvements (schema already supports)

## Endpoints
- `GET /api/annotations`
- `POST /api/annotations`
- `PATCH /api/annotations/:id`
- `DELETE /api/annotations/:id`

## QA checklist
- Create an annotation from right panel → it appears in list
- `npm run e2e` passes (`wp3_annotations.spec.ts`)

---

# WP4 — Selection anchors + highlight

**Template:** `scaffold/wp4/`

## Goal
Support selection annotations with quote anchors:
- Create selection annotation from text selection in preview
- Server matches quote anchors to char ranges
- Preview highlights matched ranges (`<mark data-ann=...>`)

## Key files
- `src/core/anchors/*` (anchor type + match algorithm)
- `src/server/routes/anchors.ts` (reanchor endpoint)
- Server `GET /api/file` now returns `matches`
- UI `MarkdownPreview` supports highlight injection

## Endpoints
- `POST /api/anchors/reanchor/:id`
- `GET /api/file?path=...` includes `{ matches: [{annotationId,start,end}] }`

## QA checklist
- Selecting text in preview creates a selection annotation
- Reload preview → selected quote is highlighted
- `npm test` includes `wp4_anchor_match.test.ts`

---

# WP5 — Cycles + bundles

**Template:** `scaffold/wp5/`

## Goal
Group annotations into cycles and export bundles:
- `Cycle` = snapshot of annotation IDs
- `Bundle` = generated artifact from a cycle
  - JSON bundle
  - Prompt bundle (LLM-ready)

## Key files
- `src/core/store/cycles.ts`
- `src/core/store/bundles.ts`
- `src/core/bundles/*` (ordering, generateJson, generatePrompt)
- Server: `src/server/routes/cycles.ts`, `src/server/routes/bundles.ts`
- UI: `CyclePanel`, `BundlePanel`

## Endpoints
- `GET/POST/PATCH /api/cycles`
- `GET/POST /api/bundles`
- `GET /api/bundles/:id`

## QA checklist
- Create cycle → create prompt bundle → prompt appears in UI
- `npm run e2e` passes (`wp5_cycles_bundles.spec.ts`)

---

# WP6 — Git integration + diffs (revisions)

**Template:** `scaffold/wp6/`

## Goal
Capture change history for a cycle using Git:
- Detect Git repo & HEAD info in `/api/project`
- Cycle base snapshot includes git info
- Create a `Revision` which stores a `git diff <baseCommit>`
- UI shows diffs

## Key files
- `src/core/git/detect.ts`, `src/core/git/diff.ts`
- `src/core/store/revisions.ts`
- Server: `src/server/routes/revisions.ts` (also `/api/diff`)
- UI: `DiffPanel`

## Endpoints
- `GET /api/revisions?cycleId=...`
- `POST /api/revisions` (create revision)
- `GET /api/diff?revisionId=...`

## QA checklist
- In a Git repo: create cycle → change files → create revision → diff renders
- If not a Git repo, revision creation should return a friendly error
- `npm run e2e` includes a conditional skip (`wp6_revisions.spec.ts`)

---

# WP7 — Node metadata + search + rollups + work links

**Template:** `scaffold/wp7/`

## Goal
Add node-level metadata and usability upgrades:
- Node metadata store (`/api/nodes/meta`)
- Tree search filter
- Annotation roll-up counts (badges) per node
- Work links editor:
  - Node-level links
  - Annotation-level quick link add

## Key files
- `src/core/store/nodes.ts`
- Server: `src/server/routes/nodes.ts`
- UI: `TopBar`, `WorkLinksEditor`
- UI: `PlanTree` supports rollup badges

## Endpoints
- `GET /api/nodes/meta?nodeId=...`
- `PATCH /api/nodes/meta?nodeId=...`

## QA checklist
- Search filters tree as you type
- Creating an open annotation increments badges
- Adding node work link persists and reloads

---

## Final acceptance checklist (WP7)
- `npm run dev` works
- `npm run typecheck` passes
- `npm test` passes
- `npm run e2e` passes (some tests may skip if environment lacks git)
- Create:
  - file annotation
  - section annotation
  - selection annotation (highlight)
  - cycle
  - bundle prompt
  - revision diff (in git repo)
  - node work link
- Tree badges show roll-ups correctly

---

## Where to customize next
- Replace prompt-based link adds with a proper modal editor
- Improve anchor matching (prefix/suffix, fuzzy match)
- Add migrations when schema versions evolve
- Add auth if you ever expose this outside localhost
