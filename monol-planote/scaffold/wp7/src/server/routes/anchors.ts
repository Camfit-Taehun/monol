import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import { AppError, isAppError } from "../../core/errors";
import { AnnotationStore } from "../../core/store/annotations";
import { ConfigStore } from "../../core/store/config";
import { resolveSafePath } from "../../core/paths";
import { Indexer } from "../../core/indexer/scan";
import { parseHeadings } from "../../core/indexer/parseHeadings";
import { matchQuoteAnchor } from "../../core/anchors/match";
import type { EventBus } from "../../core/events/bus";

export async function registerAnchorRoutes(app: FastifyInstance, projectRootAbs: string, bus: EventBus) {
  const store = new AnnotationStore(projectRootAbs);

  app.post("/api/anchors/reanchor/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const ann = await store.get(id);
      if (!ann) throw new AppError("NOT_FOUND", "Annotation not found");

      if (ann.target.kind !== "selection" || ann.target.anchorV1?.strategy !== "quote") {
        throw new AppError("INVALID_ARGUMENT", "Annotation is not a selection/quote anchor");
      }

      const cfg = await new ConfigStore(projectRootAbs).load();
      const abs = await resolveSafePath({
        projectRootAbs,
        relPath: ann.filePath,
        allowedRootsRel: [cfg.planRoot]
      });

      const markdown = (await fs.readFile(abs)).toString("utf8");
      const indexer = new Indexer(projectRootAbs, cfg.planRoot);
      const indexed = await indexer.readIndexedFileByPath(ann.filePath);
      const headings = indexed?.headings ?? (await parseHeadings(markdown, ann.filePath));

      const m = matchQuoteAnchor(markdown, headings, ann.target.anchorV1 as any);
      if (m.status !== "ok") {
        return { ok: true, data: { status: m.status, candidates: (m as any).candidates ?? 0 } };
      }

      // Save updated anchor sectionId hint if missing and we can infer it from heading ranges
      let sectionId = ann.target.anchorV1.sectionId;
      if (!sectionId) {
        const h = headings.find((hh) => m.start >= hh.charStart && m.end <= hh.charEnd);
        if (h) sectionId = h.sectionId;
      }

      const next = await store.update(id, {
        target: {
          ...ann.target,
          sectionIdHint: ann.target.sectionIdHint ?? sectionId,
          anchorV1: { ...ann.target.anchorV1, sectionId }
        }
      } as any);

      bus.emit({ type: "annotation:changed" });

      return { ok: true, data: { status: "ok", match: { start: m.start, end: m.end }, annotation: next } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
