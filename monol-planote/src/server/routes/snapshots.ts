import type { FastifyInstance } from "fastify";
import path from "node:path";
import { z } from "zod";
import { isAppError, AppError } from "../../core/errors";
import { SnapshotStore } from "../../core/store/snapshots";
import { VersionStore } from "../../core/store/versions";
import { ConfigStore } from "../../core/store/config";
import type { EventBus } from "../../core/events/bus";
import { createTwoFilesPatch } from "diff";

const CreateSnapshotSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

const RestoreSnapshotSchema = z.object({
  mode: z.enum(["overwrite", "extract"]),
  extractDir: z.string().optional()
});

export async function registerSnapshotRoutes(
  app: FastifyInstance,
  projectRootAbs: string,
  bus: EventBus
) {
  const configStore = new ConfigStore(projectRootAbs);

  const getStore = async () => {
    const cfg = await configStore.load();
    return new SnapshotStore(projectRootAbs, cfg.planRoot);
  };

  const getVersionStore = () => new VersionStore(projectRootAbs);

  app.get("/api/snapshots", async (req, reply) => {
    try {
      const store = await getStore();
      const snapshots = await store.list();
      return { ok: true, data: snapshots };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.post("/api/snapshots", async (req, reply) => {
    try {
      const body = CreateSnapshotSchema.parse(req.body);
      const store = await getStore();

      const snapshot = await store.create(body.name, body.description ?? "");

      bus.emit({
        type: "history:snapshot:created",
        snapshotId: snapshot.id
      });

      return { ok: true, data: snapshot };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INVALID_ARGUMENT", message: "Invalid request", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/snapshots/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const store = await getStore();

      const snapshot = await store.get(id);
      if (!snapshot) {
        throw new AppError("NOT_FOUND", "Snapshot not found");
      }

      return { ok: true, data: snapshot };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "NOT_FOUND", message: "Snapshot not found", details: String(e) };
      reply.code(404).send({ ok: false, error: err });
    }
  });

  app.delete("/api/snapshots/:id", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const store = await getStore();

      const deleted = await store.delete(id);
      if (!deleted) {
        throw new AppError("NOT_FOUND", "Snapshot not found");
      }

      bus.emit({
        type: "history:snapshot:deleted",
        snapshotId: id
      });

      return { ok: true, data: { deleted: true } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "NOT_FOUND", message: "Snapshot not found", details: String(e) };
      reply.code(404).send({ ok: false, error: err });
    }
  });

  app.post("/api/snapshots/:id/restore", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const body = RestoreSnapshotSchema.parse(req.body);
      const store = await getStore();

      let extractDir: string | undefined;
      if (body.mode === "extract" && body.extractDir) {
        const safePath = body.extractDir.replace(/\.\./g, "");
        extractDir = path.join(projectRootAbs, safePath);
        if (!extractDir.startsWith(projectRootAbs)) {
          throw new AppError("INVALID_ARGUMENT", "Path traversal not allowed");
        }
      }

      const result = await store.restore(id, body.mode, extractDir);

      return { ok: true, data: result };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/snapshots/:id/diff", async (req, reply) => {
    try {
      const id = String((req.params as any).id);
      const store = await getStore();

      const diffResult = await store.diff(id);
      return { ok: true, data: diffResult };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });

  app.get("/api/snapshots/:id/diff/:filePath", async (req, reply) => {
    try {
      const params = req.params as any;
      const id = String(params.id);
      const filePath = decodeURIComponent(String(params.filePath));

      const store = await getStore();
      const versionStore = getVersionStore();

      const snapshot = await store.get(id);
      if (!snapshot) {
        throw new AppError("NOT_FOUND", "Snapshot not found");
      }

      const entry = snapshot.fileManifest.find((e) => e.filePath === filePath);
      if (!entry) {
        throw new AppError("NOT_FOUND", "File not in snapshot");
      }

      const snapshotContent = await versionStore.getContent(entry.contentHash);
      if (snapshotContent === null) {
        throw new AppError("NOT_FOUND", "Snapshot content not found");
      }

      const cfg = await configStore.load();
      const currentPath = path.join(projectRootAbs, filePath);
      let currentContent = "";
      try {
        const fs = await import("node:fs/promises");
        currentContent = await fs.readFile(currentPath, "utf8");
      } catch {
        currentContent = "";
      }

      const patch = createTwoFilesPatch(
        filePath,
        filePath,
        snapshotContent,
        currentContent,
        `snapshot: ${snapshot.name}`,
        "current"
      );

      return { ok: true, data: { filePath, patch } };
    } catch (e: any) {
      const err = isAppError(e)
        ? { code: e.code, message: e.message, details: e.details }
        : { code: "INTERNAL_ERROR", message: "Internal error", details: String(e) };
      reply.code(400).send({ ok: false, error: err });
    }
  });
}
