# Planote — Architecture (EN)

## 1) System Overview
Planote is a local application consisting of:
- CLI (`planote`) to init, run server, generate bundles, manage cycles.
- Local Server (HTTP + WS) to read plan markdown, manage `.planote/` metadata, emit events.
- Web UI to browse hierarchy, render markdown, create annotations, view diffs.

All storage is filesystem-based under `.planote/` (sidecar).

## 2) Component Diagram (text)
[User]
  | runs CLI
  v
[CLI] ---- spawns/controls ----> [Local Server] <-----> [Filesystem]
                                     |
                                     | serves
                                     v
                                   [Web UI]

## 3) Tech Stack (locked)
- Node.js >= 20
- TypeScript
- CLI: commander (or yargs)
- Server: Fastify
- WS: `@fastify/websocket` (recommended)
- Markdown parse: unified/remark
- Markdown render: react-markdown + sanitizer
- Diff: git diff + patch parser + UI renderer
- Watch: chokidar
- Tests: vitest, playwright

## 4) Runtime Modes
### 4.1 Dev mode
- `npm run dev`
  - starts server with hot reload
  - starts UI dev server (Vite) with proxy to server
  - prints UI URL

### 4.2 Prod mode
- `planote serve`
  - starts server
  - serves built UI assets from `/ui/dist`
  - opens default browser (configurable)

## 5) Repo Layout (target)
/src
  /core
  /server
  /cli
/ui
/plan
/.planote

## 6) Module Boundaries (hard)
- core/*: pure domain logic (no HTTP)
- server/*: API layer, sandbox, WS
- cli/*: command parsing, console UX
- ui/*: rendering and interaction; never direct fs access

## 7) Path Sandbox
- Determine Project Root:
  - if git repo: git top-level
  - else: current working directory
- Allow reading only under:
  - Plan Root
  - `.planote/`
- Deny any path with `..` after normalization or symlink escape.

## 8) Concurrency Model
- Single-server writer: server holds a lock file `.planote/lock.json`.
- If another server starts:
  - fail with clear message and how to resolve, OR
  - allow `--read-only` mode.

## 9) Eventing Model
- WS events emitted on:
  - index update, file change
  - annotation CRUD
  - cycle/bundle/revision updates
- UI subscribes and updates state incrementally.

## 10) Error Handling Strategy
- API returns typed error response: { code, message, details? }
- UI maps error codes to user actions:
  - PATH_OUTSIDE_ROOT, LOCKED, ANCHOR_AMBIGUOUS, NOT_FOUND, READ_ONLY, etc.

## 11) Build/Release
- Build UI: `npm run build:ui`
- Build server+cli: `npm run build:server` + `npm run build:cli`
- Start: `npm start`

