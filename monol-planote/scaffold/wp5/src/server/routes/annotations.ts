import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError, isAppError } from "../../core/errors";
import { AnnotationStore, AnnotationSchema } from "../../core/store/annotations";
import type { EventBus } from "../../core/events/bus";

const CreateSchema = AnnotationSchema.omit({
  schemaVersion: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true
}).partial({
  workLinks: true
});

const UpdateSchema = AnnotationSchema.omit({
  schemaVersion: true,
  id: true,
  filePath: true,
  createdAt: true,
  deletedAt: true
}).partial();

export async function registerAnnotationRoutes(app: FastifyInstance, projectRootAbs: string, bus: EventBus) {
  const store = new AnnotationStore(projectRootAbs);

  app.get("/api/annotations", async (req, reply) => {
    try {
      const q = req.query as any;
      const filePath = q.filePath ? String(q.filePath) : undefined;
      const sectionId = q.sectionId ? String(q.sectionId) : undefined;
      const status = q.status ? (String(q.status) as any) : undefined;
      const includeDeleted = q.includeDeleted === "1";

      const list = await store.list({ filePath, sectionId, status, includeDeleted });
      return { ok: true, data: list };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.post("/api/annotations", async (req, reply) => {
    try {
      const input = CreateSchema.parse(req.body);
      const created = await store.create(input as any);
      bus.emit({ type: "annotation:changed" });
      return { ok: true, data: created };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.patch("/api/annotations/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const patch = UpdateSchema.parse(req.body);
      const next = await store.update(id, patch as any);
      bus.emit({ type: "annotation:changed" });
      return { ok: true, data: next };
    } catch (e: any) {
      const err =
        String(e?.message) === "NOT_FOUND"
          ? { code: "NOT_FOUND", message: "Annotation not found" }
          : isAppError(e)
            ? { code: e.code, message: e.message, details: e.details }
            : { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.delete("/api/annotations/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const next = await store.softDelete(id);
      bus.emit({ type: "annotation:changed" });
      return { ok: true, data: next };
    } catch (e: any) {
      const err =
        String(e?.message) === "NOT_FOUND"
          ? { code: "NOT_FOUND", message: "Annotation not found" }
          : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
