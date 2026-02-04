# Planote — 구현 청사진(Implementation Blueprints) WP0–WP7 (KO)

이 문서는 Claude Code가 그대로 따라 **레포를 생성/구현**할 수 있도록 만든 **코드 레벨 스캐폴딩**이다.
- 파일 트리, 스크립트, 라우트 스켈레톤, UI 컴포넌트 스켈레톤, 테스트 스캐폴딩까지 명시한다.
- 여기에 없는 디테일은 “데이터 보존 + 테스트 통과”를 최우선으로 가장 단순한 선택을 한다.

---

## 0) 컨벤션(절대 변경 금지)
### 0.1 언어
- 코드/식별자/API 필드는 영어.
- UI 라벨은 v1에서 영어 허용.

### 0.2 경계(하드 룰)
- `src/core/*`는 `src/server/*`나 `ui/*`를 import하면 안 된다.
- `ui/*`는 파일시스템에 직접 접근하면 안 된다.

### 0.3 안전 기본값
- 서버는 기본적으로 `127.0.0.1`에 바인딩한다.
- 마크다운은 반드시 sanitize. raw HTML 금지.

### 0.4 결정성
- 번들/리스트 정렬은 안정적이어야 한다.
- `.planote/` JSON은 안정적 key ordering으로 stringify한다.

---

## 1) 목표 레포 파일 트리(WP7 완료 시)

> 아래 트리는 예시이며, 테스트가 확장되면 파일이 추가될 수 있다.

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

## 2) WP0 — 레포 부트스트랩 & 품질 게이트 (MUST)

### 2.1 실행 커맨드(Claude Code 실행 가능)
```bash
npm init -y
npm i fastify @fastify/static @fastify/websocket chokidar commander zod
npm i -D typescript tsx vitest @types/node eslint prettier concurrently cross-env playwright wait-on
npm create vite@latest ui -- --template react-ts
cd ui && npm i react-markdown remark-gfm rehype-sanitize && cd ..
npx playwright install --with-deps
```

> 노트:
- `zod`는 API payload와 `.planote` JSON 검증에 사용한다.
- `wait-on`은 Playwright가 dev 서버 준비를 기다리게 한다.

### 2.2 루트 `package.json`(정본)
`package.json`을 아래 내용으로 생성/교체:

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

### 2.3 루트 TS 설정
`tsconfig.base.json`:
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

`tsconfig.server.json`:
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

`tsconfig.cli.json`:
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
`.eslintrc.cjs`:
```js
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  extends: ["eslint:recommended"],
  ignorePatterns: ["dist/**", "ui/dist/**", ".planote/**"]
};
```

`.prettierrc`:
```json
{ "singleQuote": false, "printWidth": 100 }
```

`.gitignore`:
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

### 2.5 서버 스켈레톤(Fastify)
아래 파일들을 생성한다(코드블록 그대로).

`src/server/app.ts`:
```ts
import Fastify from "fastify";
import websocket from "@fastify/websocket";
import statik from "@fastify/static";
import path from "node:path";
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

`src/server/index.ts`:
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

`src/server/routes/project.ts`:
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

### 2.6 CLI 스켈레톤
`src/cli/main.ts`:
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

### 2.7 UI 스켈레톤(Vite + React)
`ui/vite.config.ts`에 proxy 추가:

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

`ui/src/api/client.ts`:
```ts
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}
```

`ui/src/App.tsx`:
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
      {data && <pre>{JSON.stringify(data.project, null, 2)}</pre>}
    </div>
  );
}
```

### 2.8 테스트(WP0 베이스라인)
`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] }
});
```

`tests/unit/wp0_project_route.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("WP0 sanity", () => {
  it("runs tests", () => {
    expect(1 + 1).toBe(2);
  });
});
```

`playwright.config.ts`:
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

`tests/e2e/wp0_smoke.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("UI loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Planote" })).toBeVisible();
});
```

### 2.9 WP0 수동 QA
- `npm run dev` → UI에 `/api/project` JSON 표시
- 서버 중지 후 재시작 → 충돌 없음
- 서버가 `127.0.0.1:8787`에서 리슨하는지 확인

---

## 3) WP1 — 인덱서: 플랜 하이어라키 스캔 (MUST)

이후 WP1~WP7 내용은 영어 버전과 동일한 코드블록을 따른다. (설명만 한국어로 제공)

### 3.1 의존성
```bash
npm i fast-glob
```

### 3.2 Core 타입, 인덱서/트리/스토어 스켈레톤, 서버 라우트 추가
(코드블록은 EN 문서와 동일)

### 3.8 수동 QA
- plan 아래 md 파일 추가/삭제 후 트리 반영
- 중첩 헤딩이 올바르게 표현

---

## 4) WP2 — UI: 트리 + 마크다운 프리뷰 (MUST)
- `/api/file` 구현 + UI 컴포넌트 구성
- sanitize 검증
- E2E: 파일 클릭 → 프리뷰 표시

---

## 5) WP3 — 주석(파일/섹션) (MUST)
- store(원자적 저장) 강화
- 주석 API/UI 구현
- 소프트 삭제 + trash 검증

---

## 6) WP4 — 선택 주석 + 앵커 재매칭 (MUST)
- 선택 캡처, 앵커 매칭 알고리즘
- ambiguous/not_found 처리 UI
- 유닛 테스트 + 수동 QA

---

## 7) WP5 — 리뷰 사이클 + 번들 생성 (MUST)
- cycle store + snapshot
- bundle 생성(prompt+json+meta)
- UI에서 생성/표시/복사

---

## 8) WP6 — 리비전 감지 + diff 뷰 (v1 필수)
- git diff 기반 리비전 생성
- diff UI(unified 기본) + 주석 연결 추천
- 주석 해결 처리 플로우

---

## 9) WP7 — 업무 링크 + 롤업 (SHOULD)
- 노드/주석 workLinks 저장
- 트리 배지 롤업

---

## 10) 공통: 샌드박스/락/WS 이벤트
- 경로 정규화/심볼릭 링크 탈출 방지
- 락 파일로 동시 실행 방지
- WS 이벤트는 `{type,payload}` JSON 계약

---

## 11) WP 중단 조건(즉시 수정 후 진행)
- 테스트 실패
- 데이터 덮어쓰기/유실
- path traversal 가능
- sanitize 실패(XSS)
- rename/delete 후 주석이 사라짐(반드시 보존)
