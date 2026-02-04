import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError, isAppError } from "../../core/errors";
import { NodeStore } from "../../core/store/nodes";

const PatchSchema = z.object({
  workLinks: z
    .array(
      z.object({
        kind: z.enum(["github", "linear", "jira", "notion", "google-doc", "figma", "url", "other"]),
        url: z.string().url(),
        title: z.string().optional(),
        meta: z.record(z.any()).optional()
      })
    )
    .optional(),
  lastOpenedAt: z.string().nullable().optional()
});

export async function registerNodeRoutes(app: FastifyInstance, projectRootAbs: string) {
  const store = new NodeStore(projectRootAbs);

  app.get("/api/nodes/meta", async (req, reply) => {
    try {
      const q = req.query as any;
      const nodeId = q.nodeId ? String(q.nodeId) : null;
      if (!nodeId) throw new AppError("INVALID_ARGUMENT", "nodeId is required");
      const meta = await store.get(nodeId);
      return { ok: true, data: meta };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.patch("/api/nodes/meta", async (req, reply) => {
    try {
      const q = req.query as any;
      const nodeId = q.nodeId ? String(q.nodeId) : null;
      if (!nodeId) throw new AppError("INVALID_ARGUMENT", "nodeId is required");
      const patch = PatchSchema.parse(req.body);
      const meta = await store.upsert(nodeId, patch);
      return { ok: true, data: meta };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
