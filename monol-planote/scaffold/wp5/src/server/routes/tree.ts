import type { FastifyInstance } from "fastify";
import path from "node:path";
import fs from "node:fs/promises";
import { AppError, isAppError } from "../../core/errors";
import { ConfigStore } from "../../core/store/config";
import { Indexer } from "../../core/indexer/scan";
import { buildTree } from "../../core/indexer/tree";

export async function registerTreeRoutes(app: FastifyInstance, projectRootAbs: string) {
  app.get("/api/tree", async (_req, reply) => {
    try {
      const cfg = await new ConfigStore(projectRootAbs).load();
      const planAbs = path.join(projectRootAbs, cfg.planRoot);
      try {
        await fs.access(planAbs);
      } catch {
        throw new AppError("PLAN_ROOT_MISSING", `Plan root not found: ${cfg.planRoot}`, {
          hint: "Run `planote init` or create the plan folder."
        });
      }

      const indexer = new Indexer(projectRootAbs, cfg.planRoot);
      const { files } = await indexer.scanIncremental();
      const tree = buildTree(cfg.planRoot, files);

      return { ok: true, data: { planRoot: cfg.planRoot, tree } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
