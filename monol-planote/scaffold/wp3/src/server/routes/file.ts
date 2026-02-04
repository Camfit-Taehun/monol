import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { AppError, isAppError } from "../../core/errors";
import { ConfigStore } from "../../core/store/config";
import { resolveSafePath } from "../../core/paths";
import { Indexer } from "../../core/indexer/scan";

export async function registerFileRoutes(app: FastifyInstance, projectRootAbs: string) {
  app.get("/api/file", async (req, reply) => {
    try {
      const q = req.query as { path?: string };
      if (!q.path) throw new AppError("INVALID_ARGUMENT", "path is required");

      const cfg = await new ConfigStore(projectRootAbs).load();

      const abs = await resolveSafePath({
        projectRootAbs,
        relPath: q.path,
        allowedRootsRel: [cfg.planRoot]
      });

      const buf = await fs.readFile(abs);
      const markdown = buf.toString("utf8");
      const sha256 = crypto.createHash("sha256").update(buf).digest("hex");

      const indexer = new Indexer(projectRootAbs, cfg.planRoot);
      const indexed = await indexer.readIndexedFileByPath(q.path);

      return {
        ok: true,
        data: {
          path: q.path,
          sha256,
          markdown,
          headings: indexed?.headings ?? []
        }
      };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
