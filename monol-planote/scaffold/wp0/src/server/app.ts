import Fastify from "fastify";
import websocket from "@fastify/websocket";
import statik from "@fastify/static";
import path from "node:path";
import fs from "node:fs";
import type { FastifyInstance } from "fastify";
import { registerProjectRoutes } from "./routes/project";

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

  await registerProjectRoutes(app, opts);

  registerUiStatic(app, opts.uiDistPath);

  return app;
}
