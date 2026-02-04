import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";

export const RevisionSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  cycleId: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  baseCommit: z.string(),
  headCommit: z.string().nullable(),
  headBranch: z.string().nullable(),
  dirty: z.boolean().nullable(),
  patch: z.string()
});

export type Revision = z.infer<typeof RevisionSchema>;

function nowIso() {
  return new Date().toISOString();
}

export class RevisionStore {
  constructor(private projectRootAbs: string) {}

  private dir() {
    return path.join(this.projectRootAbs, ".planote", "revisions");
  }

  private filePath(id: string) {
    return path.join(this.dir(), `${id}.json`);
  }

  async list(filter?: { cycleId?: string }): Promise<Revision[]> {
    await fs.mkdir(this.dir(), { recursive: true });
    const entries = await fs.readdir(this.dir());
    const out: Revision[] = [];
    for (const f of entries) {
      if (!f.endsWith(".json")) continue;
      try {
        const r = RevisionSchema.parse(await readJson<unknown>(path.join(this.dir(), f)));
        if (filter?.cycleId && r.cycleId !== filter.cycleId) continue;
        out.push(r);
      } catch {
        // ignore
      }
    }
    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }

  async get(id: string): Promise<Revision | null> {
    try {
      return RevisionSchema.parse(await readJson<unknown>(this.filePath(id)));
    } catch {
      return null;
    }
  }

  async create(input: Omit<Revision, "schemaVersion" | "id" | "createdAt" | "updatedAt">): Promise<Revision> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const r: Revision = RevisionSchema.parse({
      schemaVersion: 1,
      id,
      ...input,
      createdAt,
      updatedAt: createdAt
    });
    await writeJsonAtomic(this.filePath(id), r);
    return r;
  }
}
