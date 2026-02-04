import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { isAppError, AppError } from "../../core/errors";
import { RevisionStore } from "../../core/store/revisions";
import { CycleStore } from "../../core/store/cycles";
import { detectGit } from "../../core/git/detect";
import { computeDiffFromBase } from "../../core/git/diff";
import type { EventBus } from "../../core/events/bus";

const CreateSchema = z.object({
  cycleId: z.string(),
  title: z.string().optional()
});

export async function registerRevisionRoutes(app: FastifyInstance, projectRootAbs: string, bus: EventBus) {
  const store = new RevisionStore(projectRootAbs);
  const cycleStore = new CycleStore(projectRootAbs);

  app.get("/api/revisions", async (req, reply) => {
    try {
      const q = req.query as any;
      const cycleId = q.cycleId ? String(q.cycleId) : undefined;
      const list = await store.list({ cycleId });
      return { ok: true, data: list };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/revisions/:id", async (req, reply) => {
    const id = String((req.params as any).id);
    const r = await store.get(id);
    if (!r) {
      reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "Revision not found" } });
      return;
    }
    return { ok: true, data: r };
  });

  app.post("/api/revisions", async (req, reply) => {
    try {
      const body = CreateSchema.parse(req.body);
      const cycle = await cycleStore.get(body.cycleId);
      if (!cycle) throw new AppError("NOT_FOUND", "Cycle not found");

      const baseCommit = cycle.baseSnapshot.git?.headCommit;
      if (!baseCommit) throw new AppError("INVALID_ARGUMENT", "Cycle has no base git commit (not a git repo?)");

      const git = await detectGit(projectRootAbs);
      const patch = await computeDiffFromBase(projectRootAbs, baseCommit);

      const title = body.title ?? `Revision ${new Date().toISOString().slice(0, 10)}`;

      const created = await store.create({
        cycleId: cycle.id,
        title,
        baseCommit,
        headCommit: git.headCommit,
        headBranch: git.headBranch,
        dirty: git.dirty,
        patch
      });

      bus.emit({ type: "revision:changed" });

      return { ok: true, data: created };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/diff", async (req, reply) => {
    try {
      const q = req.query as any;
      const revisionId = q.revisionId ? String(q.revisionId) : null;
      if (!revisionId) throw new AppError("INVALID_ARGUMENT", "revisionId is required");
      const r = await store.get(revisionId);
      if (!r) throw new AppError("NOT_FOUND", "Revision not found");
      return { ok: true, data: { revisionId: r.id, patch: r.patch } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
