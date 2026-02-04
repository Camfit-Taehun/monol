import type { FastifyInstance } from "fastify";
import type { ServerOptions } from "../app";

export async function registerProjectRoutes(app: FastifyInstance, opts: ServerOptions) {
  app.get("/api/project", async () => {
    return {
      ok: true,
      data: {
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
