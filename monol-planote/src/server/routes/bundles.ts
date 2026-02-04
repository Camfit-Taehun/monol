import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { isAppError } from "../../core/errors";
import { BundleStore } from "../../core/store/bundles";
import { CycleStore } from "../../core/store/cycles";
import { AnnotationStore } from "../../core/store/annotations";
import { generateBundleJson } from "../../core/bundles/generateJson";
import { generateBundlePrompt } from "../../core/bundles/generatePrompt";
import type { EventBus } from "../../core/events/bus";

const CreateSchema = z.object({
  cycleId: z.string(),
  format: z.enum(["json", "prompt"])
});

export async function registerBundleRoutes(app: FastifyInstance, projectRootAbs: string, bus: EventBus) {
  const store = new BundleStore(projectRootAbs);
  const cycleStore = new CycleStore(projectRootAbs);
  const annStore = new AnnotationStore(projectRootAbs);

  app.get("/api/bundles", async (req, reply) => {
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

  app.get("/api/bundles/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const b = await store.get(id);
      if (!b) {
        reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "Bundle not found" } });
        return;
      }
      return { ok: true, data: b };
    } catch (e: any) {
      reply.code(400).send({ ok: false, error: { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) } });
    }
  });

  app.post("/api/bundles", async (req, reply) => {
    try {
      const body = CreateSchema.parse(req.body);

      const cycle = await cycleStore.get(body.cycleId);
      if (!cycle) {
        reply.code(404).send({ ok: false, error: { code: "NOT_FOUND", message: "Cycle not found" } });
        return;
      }

      const all = await annStore.list({ includeDeleted: false });
      const anns = all.filter((a) => cycle.annotationIds.includes(a.id));

      const bundleJson = generateBundleJson(cycle, anns);

      const created =
        body.format === "json"
          ? await store.createJson(cycle.id, bundleJson)
          : await store.createPrompt(cycle.id, generateBundlePrompt(bundleJson));

      bus.emit({ type: "bundle:changed" });
      return { ok: true, data: created };
    } catch (e: any) {
      const err = { code: "INVALID_ARGUMENT", message: "Invalid body", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
