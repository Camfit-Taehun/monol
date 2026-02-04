import Fastify from "fastify";
import websocket from "@fastify/websocket";
import statik from "@fastify/static";
import path from "node:path";
import fs from "node:fs";
import type { FastifyInstance } from "fastify";
import { registerProjectRoutes } from "./routes/project";
import { registerTreeRoutes } from "./routes/tree";
import { registerFileRoutes } from "./routes/file";
import { registerAnnotationRoutes } from "./routes/annotations";
import { registerAnchorRoutes } from "./routes/anchors";
import { registerCycleRoutes } from "./routes/cycles";
import { registerBundleRoutes } from "./routes/bundles";
import { registerRevisionRoutes } from "./routes/revisions";
import { registerNodeRoutes } from "./routes/nodes";
import { registerFeedbackRoutes } from "./routes/feedback";
import { registerHistoryRoutes } from "./routes/history";
import { registerSnapshotRoutes } from "./routes/snapshots";
import { HistoryWatcher } from "../core/history/watcher";
import { EventBus } from "../core/events/bus";
import { registerWsEvents } from "./ws/events";
import { ConfigStore } from "../core/store/config";
import { Indexer } from "../core/indexer/scan";
import { PlanWatcher } from "../core/indexer/watch";

export type ServerOptions = {
  host: string;
  port: number;
  projectRoot: string;
  uiDistPath: string;
};

function registerUiStatic(app: FastifyInstance, uiDistPath: string) {
  if (!fs.existsSync(uiDistPath)) return;

  app.register(statik, {
    root: uiDistPath,
    prefix: "/"
  });

  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith("/api")) {
      reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "Not found" } });
      return;
    }
    reply.type("text/html").sendFile("index.html");
  });
}

export async function buildServer(opts: ServerOptions) {
  const app = Fastify({ logger: true });

  await app.register(websocket);

  const bus = new EventBus();

  await registerProjectRoutes(app, opts);
  await registerTreeRoutes(app, opts.projectRoot);
  await registerFileRoutes(app, opts.projectRoot);
  await registerAnnotationRoutes(app, opts.projectRoot, bus);
  await registerAnchorRoutes(app, opts.projectRoot, bus);
  await registerCycleRoutes(app, opts.projectRoot, bus);
  await registerBundleRoutes(app, opts.projectRoot, bus);
  await registerRevisionRoutes(app, opts.projectRoot, bus);
  await registerNodeRoutes(app, opts.projectRoot);
  await registerFeedbackRoutes(app, opts.projectRoot);
  await registerHistoryRoutes(app, opts.projectRoot, bus);
  await registerSnapshotRoutes(app, opts.projectRoot, bus);
  await registerWsEvents(app, bus);

  registerUiStatic(app, opts.uiDistPath);

  // Start watchers (best-effort)
  try {
    const cfg = await new ConfigStore(opts.projectRoot).load();
    const indexer = new Indexer(opts.projectRoot, cfg.planRoot);
    const watcher = new PlanWatcher(opts.projectRoot, cfg.planRoot, indexer, (e) => {
      if (e.type === "index:updated") bus.emit({ type: "index:updated" });
      else bus.emit({ type: "index:error", message: e.message });
    });
    watcher.start();

    // Start history watcher
    const historyWatcher = new HistoryWatcher(opts.projectRoot, cfg.planRoot, cfg.history, (e) => {
      if (e.type === "version:created") {
        bus.emit({ type: "history:version:created", filePath: e.filePath, versionId: e.versionId });
      } else {
        bus.emit({ type: "history:version:error", filePath: e.filePath, message: e.message });
      }
    });
    historyWatcher.start();

    app.addHook("onClose", async () => {
      await watcher.stop();
      await historyWatcher.stop();
    });
  } catch (e) {
    app.log.warn({ err: e }, "Watcher not started");
  }

  return app;
}
