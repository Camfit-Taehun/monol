import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";

const WorkLinkSchema = z.object({
  kind: z.enum(["github", "linear", "jira", "notion", "google-doc", "figma", "url", "other"]),
  url: z.string().url(),
  title: z.string().optional(),
  meta: z.record(z.any()).optional()
});

export const NodeMetaSchema = z.object({
  schemaVersion: z.literal(1),
  nodeId: z.string(),
  workLinks: z.array(WorkLinkSchema),
  lastOpenedAt: z.string().nullable(),
  updatedAt: z.string()
});

export type NodeMeta = z.infer<typeof NodeMetaSchema>;
export type WorkLink = z.infer<typeof WorkLinkSchema>;

function nowIso() {
  return new Date().toISOString();
}

function fileNameForNodeId(nodeId: string): string {
  return crypto.createHash("sha256").update(nodeId).digest("hex").slice(0, 24);
}

export class NodeStore {
  constructor(private projectRootAbs: string) {}

  private dir() {
    return path.join(this.projectRootAbs, ".planote", "nodes");
  }

  private filePath(nodeId: string) {
    return path.join(this.dir(), `${fileNameForNodeId(nodeId)}.json`);
  }

  async get(nodeId: string): Promise<NodeMeta> {
    await fs.mkdir(this.dir(), { recursive: true });
    try {
      const meta = NodeMetaSchema.parse(await readJson<unknown>(this.filePath(nodeId)));
      if (meta.nodeId !== nodeId) throw new Error("hash collision");
      return meta;
    } catch {
      return NodeMetaSchema.parse({
        schemaVersion: 1,
        nodeId,
        workLinks: [],
        lastOpenedAt: null,
        updatedAt: nowIso()
      });
    }
  }

  async upsert(nodeId: string, patch: Partial<Omit<NodeMeta, "schemaVersion" | "nodeId">>): Promise<NodeMeta> {
    const prev = await this.get(nodeId);
    const next: NodeMeta = NodeMetaSchema.parse({
      ...prev,
      ...patch,
      nodeId,
      updatedAt: nowIso()
    });
    await writeJsonAtomic(this.filePath(nodeId), next);
    return next;
  }
}
