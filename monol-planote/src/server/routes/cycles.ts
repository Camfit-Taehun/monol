import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { isAppError } from "../../core/errors";
import { CycleStore } from "../../core/store/cycles";
import { AnnotationStore } from "../../core/store/annotations";
import type { EventBus } from "../../core/events/bus";

const CreateSchema = z.object({
  title: z.string().min(1).optional(),
  annotationIds: z.array(z.string()).optional()
});

const UpdateSchema = z.object({
  status: z.enum(["open", "closed"]).optional(),
  title: z.string().optional(),
  annotationIds: z.array(z.string()).optional()
});

export async function registerCycleRoutes(app: FastifyInstance, projectRootAbs: string, bus: EventBus) {
  const store = new CycleStore(projectRootAbs);
  const annStore = new AnnotationStore(projectRootAbs);

  app.get("/api/cycles", async (req, reply) => {
    try {
      const q = req.query as any;
      const status = q.status ? (String(q.status) as any) : undefined;
      const list = await store.list({ status });
      return { ok: true, data: list };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.post("/api/cycles", async (req, reply) => {
    try {
      const body = CreateSchema.parse(req.body);
      let annotationIds = body.annotationIds ?? [];
      if (annotationIds.length === 0) {
        const open = await annStore.list({ status: "open", includeDeleted: false });
        annotationIds = open.map((a) => a.id);
      }
      const title = body.title ?? `Cycle ${new Date().toISOString().slice(0, 10)}`;
      const created = await store.create({ title, annotationIds });
      bus.emit({ type: "cycle:changed" });
      return { ok: true, data: created };
    } catch (e: any) {
      const err = { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.patch("/api/cycles/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const patch = UpdateSchema.parse(req.body);
      const next = await store.update(id, {
        ...patch,
        closedAt: patch.status === "closed" ? new Date().toISOString() : null
      } as any);
      bus.emit({ type: "cycle:changed" });
      return { ok: true, data: next };
    } catch (e: any) {
      const err = String(e?.message) === "NOT_FOUND" ? { code: "NOT_FOUND", message: "Cycle not found" } : { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
