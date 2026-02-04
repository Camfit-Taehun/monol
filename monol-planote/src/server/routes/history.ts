import type { FastifyInstance } from "fastify";
import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { isAppError, AppError } from "../../core/errors";
import { VersionStore } from "../../core/store/versions";
import { ConfigStore } from "../../core/store/config";
import type { EventBus } from "../../core/events/bus";
import { createTwoFilesPatch } from "diff";

const RestoreSchema = z.object({
  mode: z.enum(["overwrite", "extract"]),
  extractPath: z.string().optional()
});

export async function registerHistoryRoutes(
  app: FastifyInstance,
  projectRootAbs: string,
  bus: EventBus
) {
  const store = new VersionStore(projectRootAbs);
  const configStore = new ConfigStore(projectRootAbs);

  app.get("/api/history/files", async (req, reply) => {
    try {
      const files = await store.listFiles();
      return { ok: true, data: files };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/history/file/:path", async (req, reply) => {
    try {
      const filePath = String((req.params as any).path);
      const decodedPath = decodeURIComponent(filePath);
      const versions = await store.listVersions(decodedPath);
      return { ok: true, data: versions };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/history/file/:path/:versionId", async (req, reply) => {
    try {
      const params = req.params as any;
      const filePath = decodeURIComponent(String(params.path));
      const versionId = String(params.versionId);

      const version = await store.getVersion(filePath, versionId);
      if (!version) {
        throw new AppError("NOT_FOUND", "Version not found");
      }

      const content = await store.getVersionContent(filePath, versionId);
      return { ok: true, data: { version, content } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "NOT_FOUND", message: "Version not found", details: String(e) };
      reply.code(404).send({ ok: false, error: err });
    }
  });

  app.get("/api/history/file/:path/diff", async (req, reply) => {
    try {
      const params = req.params as any;
      const query = req.query as any;
      const filePath = decodeURIComponent(String(params.path));
      const fromVersionId = query.from ? String(query.from) : null;
      const toVersionId = query.to ? String(query.to) : null;

      let fromContent = "";
      let toContent = "";
      let fromLabel = "(empty)";
      let toLabel = "current";

      if (fromVersionId) {
        const content = await store.getVersionContent(filePath, fromVersionId);
        if (content === null) throw new AppError("NOT_FOUND", "From version not found");
        fromContent = content;
        const v = await store.getVersion(filePath, fromVersionId);
        fromLabel = v ? v.createdAt : fromVersionId;
      }

      if (toVersionId) {
        const content = await store.getVersionContent(filePath, toVersionId);
        if (content === null) throw new AppError("NOT_FOUND", "To version not found");
        toContent = content;
        const v = await store.getVersion(filePath, toVersionId);
        toLabel = v ? v.createdAt : toVersionId;
      } else {
        const fullPath = path.join(projectRootAbs, filePath);
        try {
          toContent = await fs.readFile(fullPath, "utf8");
          toLabel = "current";
        } catch {
          throw new AppError("NOT_FOUND", "Current file not found");
        }
      }

      const patch = createTwoFilesPatch(
        filePath,
        filePath,
        fromContent,
        toContent,
        fromLabel,
        toLabel
      );

      return { ok: true, data: { filePath, fromVersionId, toVersionId, patch } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.post("/api/history/file/:path/restore", async (req, reply) => {
    try {
      const params = req.params as any;
      const filePath = decodeURIComponent(String(params.path));
      const query = req.query as any;
      const versionId = String(query.versionId);
      const body = RestoreSchema.parse(req.body);

      const content = await store.getVersionContent(filePath, versionId);
      if (content === null) {
        throw new AppError("NOT_FOUND", "Version not found");
      }

      let targetPath: string;
      if (body.mode === "overwrite") {
        targetPath = path.join(projectRootAbs, filePath);
      } else {
        if (!body.extractPath) {
          throw new AppError("INVALID_ARGUMENT", "extractPath required for extract mode");
        }
        const safePath = body.extractPath.replace(/\.\./g, "");
        targetPath = path.join(projectRootAbs, safePath);
      }

      if (!targetPath.startsWith(projectRootAbs)) {
        throw new AppError("INVALID_ARGUMENT", "Path traversal not allowed");
      }

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, "utf8");

      return { ok: true, data: { restored: true, path: targetPath } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.post("/api/history/file/:path/version", async (req, reply) => {
    try {
      const params = req.params as any;
      const filePath = decodeURIComponent(String(params.path));

      const fullPath = path.join(projectRootAbs, filePath);
      if (!fullPath.startsWith(projectRootAbs)) {
        throw new AppError("INVALID_ARGUMENT", "Path traversal not allowed");
      }

      const content = await fs.readFile(fullPath, "utf8");
      const version = await store.createVersion(filePath, content, "manual");

      if (!version) {
        return { ok: true, data: { created: false, message: "Content unchanged" } };
      }

      bus.emit({
        type: "history:version:created",
        filePath,
        versionId: version.id
      });

      const cfg = await configStore.load();
      if (cfg.history.maxVersionsPerFile > 0) {
        await store.pruneOldVersions(filePath, cfg.history.maxVersionsPerFile);
      }

      return { ok: true, data: { created: true, version } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
