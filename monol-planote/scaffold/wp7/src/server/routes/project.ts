import type { FastifyInstance } from "fastify";
import type { ServerOptions } from "../app";
import { ConfigStore } from "../../core/store/config";
import { detectGit } from "../../core/git/detect";

export async function registerProjectRoutes(app: FastifyInstance, opts: ServerOptions) {
  app.get("/api/project", async () => {
    const cfg = await new ConfigStore(opts.projectRoot).load();
    const git = await detectGit(opts.projectRoot);

    return {
      ok: true,
      data: {
        projectRoot: opts.projectRoot,
        planRoot: cfg.planRoot,
        isGitRepo: git.isRepo,
        headBranch: git.headBranch,
        headCommit: git.headCommit,
        dirty: git.dirty,
        schemaVersion: 1
      }
    };
  });
}
