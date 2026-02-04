import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";

export const CycleSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: z.string(),
  status: z.enum(["open", "closed"]),
  annotationIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  closedAt: z.string().nullable(),
  baseSnapshot: z.object({
    createdAt: z.string()
  })
});

export type Cycle = z.infer<typeof CycleSchema>;

function nowIso() {
  return new Date().toISOString();
}

export class CycleStore {
  constructor(private projectRootAbs: string) {}

  private dir() {
    return path.join(this.projectRootAbs, ".planote", "cycles");
  }

  private filePath(id: string) {
    return path.join(this.dir(), `${id}.json`);
  }

  async list(filter?: { status?: "open" | "closed" }): Promise<Cycle[]> {
    await fs.mkdir(this.dir(), { recursive: true });
    const entries = await fs.readdir(this.dir());
    const out: Cycle[] = [];
    for (const f of entries) {
      if (!f.endsWith(".json")) continue;
      try {
        const c = CycleSchema.parse(await readJson<unknown>(path.join(this.dir(), f)));
        if (filter?.status && c.status !== filter.status) continue;
        out.push(c);
      } catch {
        // ignore
      }
    }
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }

  async get(id: string): Promise<Cycle | null> {
    try {
      return CycleSchema.parse(await readJson<unknown>(this.filePath(id)));
    } catch {
      return null;
    }
  }

  async create(input: { title: string; annotationIds: string[] }): Promise<Cycle> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const c: Cycle = CycleSchema.parse({
      schemaVersion: 1,
      id,
      title: input.title,
      status: "open",
      annotationIds: input.annotationIds,
      createdAt,
      updatedAt: createdAt,
      closedAt: null,
      baseSnapshot: { createdAt }
    });

    await writeJsonAtomic(this.filePath(id), c);
    return c;
  }

  async update(id: string, patch: Partial<Omit<Cycle, "schemaVersion" | "id" | "createdAt">>): Promise<Cycle> {
    const prev = await this.get(id);
    if (!prev) throw new Error("NOT_FOUND");
    const next: Cycle = CycleSchema.parse({
      ...prev,
      ...patch,
      updatedAt: nowIso()
    });
    await writeJsonAtomic(this.filePath(id), next);
    return next;
  }
}
