# Planote (planote) — Claude Code Runbook (EN)

## 0. Mission
Build **Planote**: a local-first tool to review a project's `/plan` Markdown hierarchy, add non-destructive annotations (comments + structured edit requests), generate an AI-ready request bundle, and link the requests to revisions (diffs) and work items.

This repo is spec-driven.
- Source of truth: `/plan/en/*.md`
- Translation: `/plan/ko/*.md`
- You MUST implement only what is defined in the English specs.
- If something is ambiguous, choose the most conservative option that preserves data and doesn't break existing annotations.

## 1. Global Constraints (Do NOT violate)
1) Local-first: no remote backend, no telemetry.
2) Non-destructive annotations: NEVER modify plan markdown files to store comments.
3) Path sandbox: server must only read/write within repo root and `.planote/`.
4) Data safety: atomic writes, no silent data loss.
5) Scope discipline: implement in Work Packages (WP0..), each with passing tests + manual QA.

## 2. Definition of Done (for every WP)
- ✅ Unit tests added/updated and passing
- ✅ Integration/e2e tests updated as applicable
- ✅ `npm run lint` and `npm test` pass
- ✅ Manual QA checklist for the WP is executed and documented in `/plan/en/_qa_log.md`
- ✅ No TODO left that affects correctness or data safety (allowed: future enhancements in roadmap section only)

## 3. Tech Stack (locked unless a hard blocker)
- Node.js >= 20
- TypeScript
- Server: Fastify (or Express only if absolutely necessary; prefer Fastify)
- Frontend: React + Vite
- Markdown parse: unified/remark
- Markdown render: react-markdown (sanitized)
- Watcher: chokidar
- Test: vitest + playwright (UI e2e)

## 4. Work Packages (execute in order)
Read:
- `/plan/en/implementation-plan.md`
- `/plan/en/implementation-blueprints.md`

Execute WP0 → WP7.

At the end of each WP:
1) Run tests
2) Run manual QA steps for that WP
3) Update `/plan/en/_qa_log.md` with:
   - date/time
   - commands run
   - expected vs actual
   - bugs fixed
   - remaining known issues (if any)

## 5. Commit Discipline
- Commit at the end of each WP with message: `WPx: <short title>`
- Smaller commits are OK within a WP if they keep history clear.

## 6. Red Flags (stop and fix immediately)
- Any annotation file overwritten without merge
- Any path traversal vulnerability
- Any XSS possibility in markdown rendering
- Any mismatch between displayed highlights and stored anchors
- Any breaking change to `.planote/` schema without migration code

## 7. Useful Commands
- `npm install`
- `npm run dev` (server+ui dev)
- `npm run build`
- `npm test`
- `npm run e2e`

## 8. Deliverables by WP7
- `planote serve` UI working
- Plan tree (folder/file/heading) + markdown preview
- Annotations (section + selection) CRUD, stored in `.planote/`
- Bundle generator (prompt + JSON)
- Review cycle + revision detection + diff view
- Work-link metadata


## Scaffold templates
This pack includes runnable templates under `scaffold/wp0` … `scaffold/wp7`.
When asked to implement a WP, you can mirror the corresponding scaffold into the repo (merging carefully).
