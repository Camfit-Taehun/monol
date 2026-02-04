import type { FastifyInstance } from "fastify";
import fs from "node:fs/promises";
import path from "node:path";

export async function registerFeedbackRoutes(app: FastifyInstance, projectRoot: string) {
  const feedbackDir = path.join(projectRoot, ".planote", "feedback");

  app.post<{
    Body: { filename: string; data: unknown };
  }>("/api/feedback", async (req, reply) => {
    const { filename, data } = req.body;

    if (!filename || !data) {
      reply.code(400).send({ ok: false, error: { code: "BAD_REQUEST", message: "Missing filename or data" } });
      return;
    }

    // Validate filename (prevent path traversal)
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      reply.code(400).send({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid filename" } });
      return;
    }

    try {
      await fs.mkdir(feedbackDir, { recursive: true });
      const filePath = path.join(feedbackDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
      reply.send({ ok: true, path: `.planote/feedback/${filename}` });
    } catch (err) {
      app.log.error({ err }, "Failed to save feedback");
      reply.code(500).send({ ok: false, error: { code: "INTERNAL", message: "Failed to save feedback" } });
    }
  });

  app.get("/api/feedback", async (_req, reply) => {
    try {
      await fs.mkdir(feedbackDir, { recursive: true });
      const files = await fs.readdir(feedbackDir);
      const feedbackFiles = files.filter((f) => f.endsWith(".json"));
      reply.send({ ok: true, files: feedbackFiles });
    } catch (err) {
      app.log.error({ err }, "Failed to list feedback");
      reply.code(500).send({ ok: false, error: { code: "INTERNAL", message: "Failed to list feedback" } });
    }
  });
}
