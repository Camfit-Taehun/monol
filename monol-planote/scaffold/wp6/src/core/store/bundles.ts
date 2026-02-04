import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";
import type { BundleJson } from "../bundles/generateJson";

const BundleSchema = z.discriminatedUnion("format", [
  z.object({
    schemaVersion: z.literal(1),
    id: z.string(),
    cycleId: z.string(),
    format: z.literal("json"),
    json: z.any(),
    createdAt: z.string(),
    updatedAt: z.string()
  }),
  z.object({
    schemaVersion: z.literal(1),
    id: z.string(),
    cycleId: z.string(),
    format: z.literal("prompt"),
    prompt: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
]);

export type Bundle = z.infer<typeof BundleSchema>;

function nowIso() {
  return new Date().toISOString();
}

export class BundleStore {
  constructor(private projectRootAbs: string) {}

  private dir() {
    return path.join(this.projectRootAbs, ".planote", "bundles");
  }

  private filePath(id: string) {
    return path.join(this.dir(), `${id}.json`);
  }

  async list(filter?: { cycleId?: string }): Promise<Bundle[]> {
    await fs.mkdir(this.dir(), { recursive: true });
    const entries = await fs.readdir(this.dir());
    const out: Bundle[] = [];
    for (const f of entries) {
      if (!f.endsWith(".json")) continue;
      try {
        const b = BundleSchema.parse(await readJson<unknown>(path.join(this.dir(), f)));
        if (filter?.cycleId && b.cycleId !== filter.cycleId) continue;
        out.push(b);
      } catch {
        // ignore
      }
    }
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }

  async get(id: string): Promise<Bundle | null> {
    try {
      return BundleSchema.parse(await readJson<unknown>(this.filePath(id)));
    } catch {
      return null;
    }
  }

  async createJson(cycleId: string, json: BundleJson): Promise<Bundle> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const b: Bundle = BundleSchema.parse({
      schemaVersion: 1,
      id,
      cycleId,
      format: "json",
      json,
      createdAt,
      updatedAt: createdAt
    });
    await writeJsonAtomic(this.filePath(id), b);
    return b;
  }

  async createPrompt(cycleId: string, prompt: string): Promise<Bundle> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const b: Bundle = BundleSchema.parse({
      schemaVersion: 1,
      id,
      cycleId,
      format: "prompt",
      prompt,
      createdAt,
      updatedAt: createdAt
    });
    await writeJsonAtomic(this.filePath(id), b);
    return b;
  }
}
