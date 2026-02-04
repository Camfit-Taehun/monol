# Planote — Implementation Blueprints (WP0–WP7) (EN)

This document is **code-level scaffolding** that Claude Code can follow to generate the repository.
- It is intentionally explicit: file trees, scripts, route skeletons, component skeletons, and test scaffolds.
- If a detail is not here, prefer the simplest choice that preserves data and passes tests.

---

## 0) Conventions (Do NOT deviate)
### 0.1 Language
- Code, identifiers, and API fields are English.
- UI labels can be English for v1.

### 0.2 Strict boundaries
- `src/core/*` must not import `src/server/*` or `ui/*`.
- `ui/*` must not access the filesystem directly.

### 0.3 Safety defaults
- Server binds to `127.0.0.1` unless explicitly configured.
- Sanitize markdown output. No raw HTML.

### 0.4 Deterministic output
- Stable sort ordering in bundles and lists.
- Canonical JSON stringify (stable key ordering) in `.planote/`.

---

## 1) Target repo file tree (after WP7)

> Tree is illustrative. Some files may be added as tests expand.

```
.
├─ CLAUDE.md
├─ CLAUDE.ko.md
├─ package.json
├─ package-lock.json
├─ tsconfig.base.json
├─ tsconfig.server.json
├─ tsconfig.cli.json
├─ vitest.config.ts
├─ playwright.config.ts
├─ .eslintrc.cjs
├─ .prettierrc
├─ .gitignore
├─ src
│  ├─ core
│  │  ├─ errors.ts
│  │  ├─ paths.ts
│  │  ├─ events
│  │  │  └─ bus.ts
│  │  ├─ indexer
│  │  │  ├─ scan.ts
│  │  │  ├─ parseHeadings.ts
│  │  │  ├─ tree.ts
│  │  │  └─ watch.ts
│  │  ├─ markdown
│  │  │  └─ sanitize.ts
│  │  ├─ anchors
│  │  │  ├─ types.ts
│  │  │  └─ match.ts
│  │  ├─ store
│  │  │  ├─ atomic.ts
│  │  │  ├─ json.ts
│  │  │  ├─ lock.ts
│  │  │  ├─ annotations.ts
│  │  │  ├─ cycles.ts
│  │  │  ├─ revisions.ts
│  │  │  └─ migrations
│  │  │     └─ v1.ts
│  │  ├─ bundles
│  │  │  ├─ generatePrompt.ts
│  │  │  ├─ generateJson.ts
│  │  │  └─ ordering.ts
│  │  ├─ git
│  │  │  ├─ detect.ts
│  │  │  ├─ diff.ts
│  │  │  └─ parsePatch.ts
│  │  └─ types
│  │     └─ domain.ts
│  ├─ server
│  │  ├─ app.ts
│  │  ├─ index.ts
│  │  ├─ routes
│  │  │  ├─ project.ts
│  │  │  ├─ tree.ts
│  │  │  ├─ file.ts
│  │  │  ├─ annotations.ts
│  │  │  ├─ cycles.ts
│  │  │  ├─ bundles.ts
│  │  │  ├─ revisions.ts
│  │  │  └─ diff.ts
│  │  └─ ws
│  │     └─ events.ts
│  └─ cli
│     ├─ main.ts
│     └─ commands
│        ├─ init.ts
│        ├─ serve.ts
│        ├─ scan.ts
│        ├─ cycle.ts
│        ├─ bundle.ts
│        ├─ revision.ts
│        └─ doctor.ts
├─ ui
│  ├─ package.json
│  ├─ vite.config.ts
│  ├─ tsconfig.json
│  └─ src
│     ├─ main.tsx
│     ├─ App.tsx
│     ├─ api
│     │  ├─ client.ts
│     │  └─ types.ts
│     ├─ state
│     │  └─ store.ts
│     ├─ components
│     │  ├─ AppShell.tsx
│     │  ├─ TopBar.tsx
│     │  ├─ PlanTree.tsx
│     │  ├─ MarkdownPreview.tsx
│     │  ├─ AnnotationPanel.tsx
│     │  ├─ AnnotationEditor.tsx
│     │  ├─ CyclePanel.tsx
│     │  ├─ BundlePanel.tsx
│     │  ├─ DiffPanel.tsx
│     │  └─ EmptyState.tsx
│     └─ styles.css
└─ tests
   ├─ fixtures
   │  └─ sample-plan
   │     └─ plan
   │        ├─ a.md
   │        └─ b.md
   ├─ unit
   ├─ integration
   └─ e2e
```

---

## 2) WP0 — Repo bootstrap & quality gates (MUST)

### 2.1 Commands (Claude Code can run)
```bash
npm init -y
npm i fastify @fastify/static @fastify/websocket chokidar commander zod
npm i -D typescript tsx vitest @types/node eslint prettier concurrently cross-env playwright wait-on
npm create vite@latest ui -- --template react-ts
cd ui && npm i react-markdown remark-gfm rehype-sanitize && cd ..
npx playwright install --with-deps
```

> Notes:
- `zod` is used to validate API payloads and `.planote` JSON.
- `wait-on` helps Playwright wait for dev server.

### 2.2 Root `package.json` (canonical)
Create/replace `package.json`:

```json
{
  "name": "planote",
  "version": "0.0.0",
  "private": true,
  "workspaces": ["ui"],
  "scripts": {
    "dev": "concurrently -k \"npm:dev:server\" \"npm:dev:ui\"",
    "dev:server": "cross-env PLANOTE_HOST=127.0.0.1 PLANOTE_PORT=8787 tsx watch src/server/index.ts",
    "dev:ui": "npm --workspace ui run dev -- --port 5173",
    "build": "npm run build:ui && npm run build:server && npm run build:cli",
    "build:ui": "npm --workspace ui run build",
    "build:server": "tsc -p tsconfig.server.json",
    "build:cli": "tsc -p tsconfig.cli.json",
    "start": "node dist/server/index.js",
    "lint": "eslint .",
    "format": "prettier -w .",
    "typecheck": "tsc -p tsconfig.server.json --noEmit && tsc -p tsconfig.cli.json --noEmit && npm --workspace ui run typecheck",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "e2e:report": "playwright show-report"
  },
  "bin": {
    "planote": "dist/cli/main.js"
  }
}
```

### 2.3 Root TS configs
Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Create `tsconfig.server.json`:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "dist/server",
    "rootDir": "src"
  },
  "include": ["src/server/**/*.ts", "src/core/**/*.ts"]
}
```

Create `tsconfig.cli.json`:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "dist/cli",
    "rootDir": "src"
  },
  "include": ["src/cli/**/*.ts", "src/core/**/*.ts"]
}
```

### 2.4 ESLint / Prettier
Create `.eslintrc.cjs`:
```js
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist/**", "ui/dist/**", ".planote/**"]
};
```

Create `.prettierrc`:
```json
{ "singleQuote": false, "printWidth": 100 }
```

Create `.gitignore`:
```gitignore
node_modules/
dist/
ui/node_modules/
ui/dist/
.planote/
playwright-report/
test-results/
.DS_Store
```

### 2.5 Server skeleton (Fastify)
Create `src/server/app.ts`:
```ts
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import statik from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerProjectRoutes } from "./routes/project";

export type ServerOptions = {
  host: string;
  port: number;
  projectRoot: string;
  uiDistPath: string;
};

export async function buildServer(opts: ServerOptions) {
  const app = Fastify({ logger: true });

  await app.register(websocket);

  // API routes
  await registerProjectRoutes(app, opts);

  // In prod, serve built UI. In dev, Vite serves UI separately.
  await app.register(statik, {
    root: opts.uiDistPath,
    prefix: "/",
    decorateReply: false
  });

  // SPA fallback (basic)
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith("/api")) {
      reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } });
      return;
    }
    reply.type("text/html").sendFile("index.html");
  });

  return app;
}
```

Create `src/server/index.ts`:
```ts
import path from "node:path";
import { buildServer } from "./app";

function env(name: string, fallback: string) {
  return process.env[name] ?? fallback;
}

async function main() {
  const host = env("PLANOTE_HOST", "127.0.0.1");
  const port = Number(env("PLANOTE_PORT", "8787"));

  const projectRoot = process.cwd();
  const uiDistPath = path.join(projectRoot, "ui", "dist");

  const app = await buildServer({ host, port, projectRoot, uiDistPath });
  await app.listen({ host, port });
  app.log.info(`Planote server listening on http://${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Create `src/server/routes/project.ts`:
```ts
import type { FastifyInstance } from "fastify";
import type { ServerOptions } from "../app";

export async function registerProjectRoutes(app: FastifyInstance, opts: ServerOptions) {
  app.get("/api/project", async () => {
    return {
      ok: true,
      project: {
        projectRoot: opts.projectRoot,
        planRoot: "plan",
        isGitRepo: false,
        headBranch: null,
        headCommit: null,
        dirty: null,
        schemaVersion: 1
      }
    };
  });
}
```

### 2.6 CLI skeleton
Create `src/cli/main.ts`:
```ts
#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();
program.name("planote").description("Planote CLI").version("0.0.0");

program
  .command("doctor")
  .description("Diagnostics")
  .action(() => {
    console.log("Planote doctor: OK (WP0 stub)");
  });

program.parse(process.argv);
```

### 2.7 UI skeleton (Vite + React)
In `ui/vite.config.ts`, add proxy:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/api/events": { target: "ws://127.0.0.1:8787", ws: true }
    }
  }
});
```

In `ui/src/api/client.ts`:
```ts
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
```

In `ui/src/App.tsx`:
```tsx
import { useEffect, useState } from "react";
import { apiGet } from "./api/client";

type ProjectResponse = {
  ok: boolean;
  project: {
    projectRoot: string;
    planRoot: string;
    isGitRepo: boolean;
    headBranch: string | null;
    headCommit: string | null;
    dirty: boolean | null;
    schemaVersion: number;
  };
};

export default function App() {
  const [data, setData] = useState<ProjectResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ProjectResponse>("/api/project").then(setData).catch((e) => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>Planote</h1>
      {err && <pre>{err}</pre>}
      {!data && !err && <p>Loading…</p>}
      {data && (
        <pre>{JSON.stringify(data.project, null, 2)}</pre>
      )}
    </div>
  );
}
```

### 2.8 Tests (WP0 baseline)
Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] }
});
```

Create `tests/unit/wp0_project_route.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("WP0 sanity", () => {
  it("runs tests", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Create `playwright.config.ts`:
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  use: {
    baseURL: "http://127.0.0.1:5173"
  }
});
```

Create `tests/e2e/wp0_smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("UI loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Planote" })).toBeVisible();
});
```

### 2.9 WP0 Manual QA checklist
- `npm run dev` → UI shows `/api/project` JSON.
- Stop and restart → no conflict.
- Confirm server listens on `127.0.0.1:8787`.

---

## 3) WP1 — Indexer: scan plan hierarchy (MUST)

### 3.1 Dependencies (add if missing)
```bash
npm i fast-glob
```

### 3.2 Core types
Create `src/core/types/domain.ts`:
```ts
export type RepoRelativePath = string;

export type Heading = {
  sectionId: string;
  level: number; // 1..6
  title: string;
  lineStart: number;
  lineEnd: number;
  charStart: number;
  charEnd: number;
};

export type IndexedFile = {
  schemaVersion: 1;
  fileId: string;
  path: RepoRelativePath;
  sha256: string;
  headings: Heading[];
};

export type TreeNode =
  | { id: string; kind: "folder"; name: string; path: RepoRelativePath; children: TreeNode[] }
  | { id: string; kind: "file"; name: string; path: RepoRelativePath; children: TreeNode[] }
  | {
      id: string;
      kind: "section";
      name: string;
      path: RepoRelativePath;
      sectionId: string;
      level: number;
    };
```

### 3.3 Indexer scaffolding
Create `src/core/indexer/parseHeadings.ts` (skeleton; implement in WP1):
```ts
import { Heading } from "../types/domain";

/**
 * Parse markdown headings with remark.
 * Rules:
 * - Detect explicit id at end: `## Title {#my-id}`
 * - Else generate stable sectionId: `h:<slug>:<hash(lineStart+path)>`
 */
export async function parseHeadings(markdown: string, filePath: string): Promise<Heading[]> {
  // TODO: implement with unified/remark-parse
  return [];
}
```

Create `src/core/indexer/scan.ts`:
```ts
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseHeadings } from "./parseHeadings";
import { IndexedFile } from "../types/domain";

export type ScanResult = {
  files: IndexedFile[];
  warnings: { path: string; message: string }[];
};

export async function scanPlan(planRootAbs: string, projectRootAbs: string): Promise<ScanResult> {
  const rel = (p: string) => path.relative(projectRootAbs, p).replaceAll("\\", "/");
  const mdPaths = await fg(["**/*.md"], { cwd: planRootAbs, absolute: true, dot: false });

  const warnings: ScanResult["warnings"] = [];
  const files: IndexedFile[] = [];

  for (const absPath of mdPaths) {
    const buf = await fs.readFile(absPath);
    const text = buf.toString("utf8"); // warn if non-utf8? (later)
    const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
    const headings = await parseHeadings(text, rel(absPath));

    const fileId = crypto.createHash("sha256").update(rel(absPath)).digest("hex").slice(0, 16);
    files.push({
      schemaVersion: 1,
      fileId,
      path: rel(absPath),
      sha256,
      headings
    });
  }

  return { files, warnings };
}
```

Create `src/core/indexer/tree.ts`:
```ts
import path from "node:path";
import { IndexedFile, TreeNode } from "../types/domain";

export function buildTree(planRootRel: string, indexedFiles: IndexedFile[]): TreeNode {
  // Build folder/file tree from paths, then attach sections under each file.
  // Deterministic ordering: folders first, then files; lexicographic by name.
  return { id: `node:folder:${planRootRel}`, kind: "folder", name: path.basename(planRootRel), path: planRootRel, children: [] };
}
```

### 3.4 Store (manifest + per-file cache) scaffolding
Create `src/core/store/json.ts`:
```ts
import fs from "node:fs/promises";
export async function readJson<T>(s: string): Promise<T> {
  const text = await fs.readFile(s, "utf8");
  return JSON.parse(text) as T;
}
```

Create `src/core/store/atomic.ts` (WP1 minimal; expand later):
```ts
import fs from "node:fs/promises";
import path from "node:path";

export async function writeFileAtomic(dest: string, content: string) {
  const dir = path.dirname(dest);
  await fs.mkdir(dir, { recursive: true });
  const tmp = dest + ".tmp";
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, dest);
}

export async function writeJsonAtomic(dest: string, data: unknown) {
  const content = JSON.stringify(data, null, 2) + "\n";
  await writeFileAtomic(dest, content);
}
```

Create `src/core/store/indexManifest.ts` (optional file; or keep in scan route):
- Responsible for writing `.planote/index/manifest.json` and `.planote/index/files/<fileId>.json`.

### 3.5 Server routes for tree/scan
Create `src/server/routes/tree.ts`:
```ts
import type { FastifyInstance } from "fastify";
import path from "node:path";
import { scanPlan } from "../../core/indexer/scan";
import { buildTree } from "../../core/indexer/tree";

export async function registerTreeRoutes(app: FastifyInstance, projectRoot: string) {
  app.get("/api/tree", async () => {
    const planRootAbs = path.join(projectRoot, "plan");
    const { files } = await scanPlan(planRootAbs, projectRoot);
    const tree = buildTree("plan", files);
    return { ok: true, tree: { planRoot: "plan", nodes: tree } };
  });
}
```

Update `src/server/routes/project.ts` to register `registerTreeRoutes` from `app.ts` or `buildServer`.

### 3.6 WP1 tests (minimum)
- Add unit test for `buildTree` ordering.
- Add integration test that `/api/tree` returns ok for fixtures (see fixtures section below).

### 3.7 Fixtures
Create `tests/fixtures/sample-plan/plan/a.md` and `b.md` with headings; integration tests can chdir into a temp copy.

### 3.8 WP1 Manual QA
- Add a new markdown file under `plan/` → refresh `/api/tree` shows it.
- Add nested headings; verify section nesting in response JSON.

---

## 4) WP2 — UI: Plan tree + markdown preview (MUST)

### 4.1 UI state & types
Create `ui/src/api/types.ts`:
```ts
export type TreeNode =
  | { id: string; kind: "folder"; name: string; path: string; children: TreeNode[] }
  | { id: string; kind: "file"; name: string; path: string; children: TreeNode[] }
  | { id: string; kind: "section"; name: string; path: string; sectionId: string; level: number };

export type TreeResponse = {
  ok: true;
  tree: { planRoot: string; nodes: TreeNode };
};

export type FileResponse = {
  ok: true;
  file: { path: string; markdown: string };
};
```

### 4.2 Implement `/api/file`
Create `src/server/routes/file.ts`:
```ts
import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";

export async function registerFileRoutes(app: FastifyInstance, projectRoot: string) {
  app.get("/api/file", async (req, reply) => {
    const q = req.query as { path?: string };
    if (!q.path) {
      reply.code(400).send({ ok: false, error: { code: "INVALID_ARGUMENT", message: "path required" } });
      return;
    }
    // TODO WP2: enforce sandbox path (reject traversal).
    const abs = path.join(projectRoot, q.path);
    const markdown = await fs.readFile(abs, "utf8");
    return { ok: true, file: { path: q.path, markdown } };
  });
}
```

### 4.3 UI component skeletons (must match UI spec)
Create `ui/src/components/AppShell.tsx`:
```tsx
import { ReactNode } from "react";

export function AppShell(props: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 360px", height: "100vh" }}>
      <div style={{ borderRight: "1px solid #ddd", overflow: "auto" }}>{props.left}</div>
      <div style={{ overflow: "auto" }}>{props.center}</div>
      <div style={{ borderLeft: "1px solid #ddd", overflow: "auto" }}>{props.right}</div>
    </div>
  );
}
```

Create `ui/src/components/PlanTree.tsx`:
```tsx
import { TreeNode } from "../api/types";

export function PlanTree(props: {
  root: TreeNode | null;
  onOpen: (node: TreeNode) => void;
}) {
  if (!props.root) return <div style={{ padding: 12 }}>Loading tree…</div>;
  return (
    <div style={{ padding: 8 }}>
      <TreeNodeView node={props.root} depth={0} onOpen={props.onOpen} />
    </div>
  );
}

function TreeNodeView(props: { node: TreeNode; depth: number; onOpen: (n: TreeNode) => void }) {
  const n = props.node;
  const pad = { paddingLeft: props.depth * 12 };
  if (n.kind === "folder" || n.kind === "file") {
    return (
      <div>
        <div style={pad}>
          <button onClick={() => props.onOpen(n)}>{n.name}</button>
        </div>
        <div>
          {n.children.map((c) => (
            <TreeNodeView key={c.id} node={c} depth={props.depth + 1} onOpen={props.onOpen} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div style={pad}>
      <button onClick={() => props.onOpen(n)}>{n.name}</button>
    </div>
  );
}
```

Create `ui/src/components/MarkdownPreview.tsx`:
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

export function MarkdownPreview(props: { markdown: string }) {
  return (
    <div style={{ padding: 16 }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {props.markdown}
      </ReactMarkdown>
    </div>
  );
}
```

### 4.4 Wire UI in `ui/src/App.tsx`
- Load `/api/tree` on startup
- When user clicks a file/section:
  - load `/api/file?path=...`
  - show markdown preview
  - (scroll to section: implement in WP2 by adding heading anchors later; minimal in WP2: open file)

### 4.5 WP2 tests
- E2E: open file from tree, preview shows heading text.

### 4.6 WP2 Manual QA
- Ensure `<script>` in markdown is not executed.
- Click file nodes and see preview.

---

## 5) WP3 — Annotations (file/section) (MUST)

### 5.1 Add store primitives (upgrade atomic writes)
Replace `src/core/store/atomic.ts` to handle Windows-safe replace:
- Recommended: add dependency `write-file-atomic` OR implement safe rename.
For explicitness, use dependency:

```bash
npm i write-file-atomic json-stable-stringify
```

Update `src/core/store/atomic.ts`:
```ts
import writeFileAtomic from "write-file-atomic";
import stringify from "json-stable-stringify";
import fs from "node:fs/promises";
import path from "node:path";

export async function writeJsonAtomic(dest: string, data: unknown) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const content = stringify(data, { space: 2 }) + "\n";
  await writeFileAtomic(dest, content, { encoding: "utf8" });
}
```

### 5.2 Define annotation types
Create `src/core/types/annotations.ts`:
```ts
export type Priority = "P0" | "P1" | "P2" | "P3";
export type AnnotationStatus = "open" | "resolved" | "wontfix" | "obsolete";
export type AnnotationType = "comment" | "edit_request" | "task_request";

export type WorkLink = {
  kind: "url";
  url: string;
  title?: string;
  status?: "backlog" | "in_progress" | "done" | "blocked";
};

export type StructuredEdit =
  | { action: "replace"; instruction: string; acceptance: string }
  | { action: "insert_before"; instruction: string; acceptance: string }
  | { action: "insert_after"; instruction: string; acceptance: string }
  | { action: "delete"; instruction: string; acceptance: string }
  | { action: "rewrite_section"; instruction: string; acceptance: string };

export type AnnotationTarget =
  | { kind: "file"; filePath: string }
  | { kind: "section"; filePath: string; sectionId: string };

export type Annotation = {
  schemaVersion: 1;
  annotationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { name?: string; email?: string };

  status: AnnotationStatus;
  type: AnnotationType;
  priority: Priority;
  tags: string[];

  target: AnnotationTarget;

  title?: string;
  body: string;
  structuredEdits: StructuredEdit[];
  workLinks: WorkLink[];

  cycleRefs: string[];

  deleted: { isDeleted: boolean; deletedAt: string | null };
};
```

### 5.3 Annotation store
Create `src/core/store/annotations.ts`:
```ts
import path from "node:path";
import fs from "node:fs/promises";
import { writeJsonAtomic } from "./atomic";
import { Annotation } from "../types/annotations";

export class AnnotationStore {
  constructor(private projectRoot: string) {}

  private dir() {
    return path.join(this.projectRoot, ".planote", "annotations");
  }
  private trashDir() {
    return path.join(this.projectRoot, ".planote", "trash", "annotations");
  }

  async list(): Promise<Annotation[]> {
    await fs.mkdir(this.dir(), { recursive: true });
    const files = await fs.readdir(this.dir());
    const out: Annotation[] = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const text = await fs.readFile(path.join(this.dir(), f), "utf8");
      out.push(JSON.parse(text));
    }
    return out;
  }

  async get(id: string): Promise<Annotation | null> {
    const p = path.join(this.dir(), `${id}.json`);
    try {
      const text = await fs.readFile(p, "utf8");
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async put(a: Annotation): Promise<void> {
    await writeJsonAtomic(path.join(this.dir(), `${a.annotationId}.json`), a);
  }

  async softDelete(id: string): Promise<void> {
    const cur = await this.get(id);
    if (!cur) return;
    cur.deleted = { isDeleted: true, deletedAt: new Date().toISOString() };
    await fs.mkdir(this.trashDir(), { recursive: true });
    await writeJsonAtomic(path.join(this.trashDir(), `${id}.json`), cur);
    await fs.rm(path.join(this.dir(), `${id}.json`), { force: true });
  }
}
```

### 5.4 Server routes
Create `src/server/routes/annotations.ts` with:
- GET /api/annotations (filtering)
- POST /api/annotations
- PATCH /api/annotations/:id
- POST /api/annotations/:id/resolve
- DELETE /api/annotations/:id

Use `zod` schemas for request validation.

### 5.5 UI panel scaffolding
Create:
- `ui/src/components/AnnotationPanel.tsx`
- `ui/src/components/AnnotationEditor.tsx`

Minimal UI:
- list annotations
- add new annotation for current node (file/section)
- resolve/reopen
- soft delete

### 5.6 Tests
- Unit: store put/get/list/softDelete
- E2E: add annotation via UI → appears after reload

---

## 6) WP4 — Selection annotations + anchor rematching (MUST)

### 6.1 Anchor types
Create `src/core/anchors/types.ts`:
```ts
export type MatchState = "ok" | "ambiguous" | "not_found" | "needs_attention";

export type SelectionAnchor = {
  quote: string;
  contextBefore: string;
  contextAfter: string;
  approxCharOffset: number;
  sectionIdHint: string | null;
};

export type MatchCandidate = {
  start: number;
  end: number;
  confidence: number;
};

export type MatchResult =
  | { state: "ok"; candidate: MatchCandidate }
  | { state: "ambiguous"; candidates: MatchCandidate[] }
  | { state: "not_found" };
```

### 6.2 Matching algorithm
Create `src/core/anchors/match.ts`:
- Input: markdown string + SelectionAnchor + optional section range
- Strategy:
  1) exact quote search near approxCharOffset window
  2) quote+context search
  3) fallback: search entire section
  4) if multiple candidates, return ambiguous with candidates sorted by confidence

### 6.3 Expand annotation schema
Update annotation types to include selection targets:
- Add `target.kind = "selection"` with selection payload and anchor state fields.

### 6.4 UI selection capture
In `MarkdownPreview`:
- onMouseUp, read `window.getSelection()`
- if non-empty and within preview container:
  - compute quote text
  - compute context before/after (e.g., 120 chars each from markdown source; use current file markdown)
  - open annotation editor prefilled

### 6.5 Selection highlight
- Render markdown normally, but overlay highlights by mapping candidate offsets.
- Minimal approach:
  - For WP4, implement highlight by splitting markdown into three parts (before/selected/after) for display.
  - Better approach later: custom remark plugin to wrap matched range.

### 6.6 Tests
- Unit: match algorithm (ok/ambiguous/not_found)
- Manual QA: edit around selection and verify rematch.

---

## 7) WP5 — Review cycles + bundle generator (MUST)

### 7.1 Cycle store
Create `src/core/store/cycles.ts`:
- Create cycle with base snapshot:
  - list plan files + sha256
  - git state if available (call git module)
- Store as `.planote/cycles/<id>.json`

### 7.2 Bundle generator
Create `src/core/bundles/ordering.ts`:
- implement deterministic sort of annotations and sections.

Create `src/core/bundles/generatePrompt.ts` and `generateJson.ts`:
- read annotations + indexed file headings (for ordering and section titles)
- output:
  - `.planote/bundles/<bundleId>.md`
  - `.planote/bundles/<bundleId>.json`
  - `.planote/bundles/<bundleId>.meta.json`

### 7.3 Server routes
- POST /api/cycles
- GET /api/cycles
- POST /api/bundles

### 7.4 UI panels
- `CyclePanel`:
  - create cycle from open annotations
  - show base snapshot info
- `BundlePanel`:
  - show generated prompt and JSON, with Copy

### 7.5 Tests
- Unit: ordering determinism
- Integration: bundle files created with checksum

---

## 8) WP6 — Revision detection + diff view (REQUIRED for v1)

### 8.1 Git module
Create:
- `src/core/git/detect.ts`: find git repo root, head commit, branch, dirty state
- `src/core/git/diff.ts`: produce diff text between base and current
- `src/core/git/parsePatch.ts`: parse diff summary (files changed, insertions, deletions)

### 8.2 Revision store
Create `src/core/store/revisions.ts`:
- create revision linked to cycle id
- store patch text optionally as `.patch`

### 8.3 Server routes and UI
- POST /api/revisions/detect (cycleId)
- GET /api/revisions?cycleId=...
- GET /api/diff?revisionId=...

UI `DiffPanel`:
- list changed files
- unified diff view
- suggested annotation links:
  - same filePath
  - same sectionId (if section still exists)
  - quote match (selection anchors)

### 8.4 Tests
- Unit: parsePatch summary
- Integration: detect revision after modifying fixture
- Manual QA: resolve annotation by revision

---

## 9) WP7 — Work links + roll-up (SHOULD)

### 9.1 Work links in plan nodes
Add store for node-level metadata:
- `.planote/nodes/<nodeId>.json` (new folder)
- Minimal fields: workLinks[]
- Alternatively store inside annotations only for v1; but spec requires node-level too.

### 9.2 UI
- Add work link editor in right panel
- Tree badges roll-up:
  - count of open annotations
  - work link status summary

### 9.3 Tests
- Unit: node metadata store put/get
- E2E: add work link and see it persist.

---

## 10) Cross-cutting: sandbox, locks, and WS events
Implement once and reuse:
- Path sandbox helpers (`src/core/paths.ts`) to:
  - normalize paths
  - reject traversal
  - resolve symlinks safely
- Lock file (`src/core/store/lock.ts`)
- Event bus (`src/core/events/bus.ts`) + `src/server/ws/events.ts` to broadcast changes.

WS minimal contract:
- `{ type: string, payload: any }` JSON messages.

---

## 11) WP-by-WP “Stop conditions”
If any of the following occurs, stop the WP and fix before proceeding:
- tests failing
- data overwritten without merge
- any path traversal possibility
- markdown rendering executes HTML/scripts
- annotation becomes unreachable after rename/delete (must be preserved)

