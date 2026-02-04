import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";

export const AnnotationSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  filePath: z.string(),
  target: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("file") }),
    z.object({ kind: z.literal("section"), sectionId: z.string() }),
    z.object({
      kind: z.literal("selection"),
      sectionIdHint: z.string().optional(),
      quote: z.string(),
      anchorV1: z
        .object({
          strategy: z.literal("quote"),
          quote: z.string(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          sectionId: z.string().optional()
        })
        .optional()
    })
  ]),
  title: z.string(),
  body: z.string(),
  type: z.enum(["todo", "note", "question", "risk"]),
  status: z.enum(["open", "closed"]),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.array(z.string()),
  workLinks: z.array(
    z.object({
      kind: z.enum(["github", "linear", "jira", "notion", "google-doc", "figma", "url", "other"]),
      url: z.string().url(),
      title: z.string().optional(),
      meta: z.record(z.any()).optional()
    })
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable()
});

export type Annotation = z.infer<typeof AnnotationSchema>;

export type CreateAnnotationInput = Omit<
  Annotation,
  "schemaVersion" | "id" | "createdAt" | "updatedAt" | "deletedAt" | "workLinks"
> & { workLinks?: Annotation["workLinks"] };

export type UpdateAnnotationInput = Partial<
  Omit<Annotation, "schemaVersion" | "id" | "filePath" | "createdAt" | "deletedAt">
> & { workLinks?: Annotation["workLinks"] };

function nowIso() {
  return new Date().toISOString();
}

export class AnnotationStore {
  constructor(private projectRootAbs: string) {}

  private dir() {
    return path.join(this.projectRootAbs, ".planote", "annotations");
  }

  private filePath(id: string) {
    return path.join(this.dir(), `${id}.json`);
  }

  async list(filter?: {
    filePath?: string;
    sectionId?: string;
    status?: "open" | "closed";
    includeDeleted?: boolean;
  }): Promise<Annotation[]> {
    await fs.mkdir(this.dir(), { recursive: true });
    const entries = await fs.readdir(this.dir());
    const out: Annotation[] = [];

    for (const f of entries) {
      if (!f.endsWith(".json")) continue;
      try {
        const a = AnnotationSchema.parse(await readJson<unknown>(path.join(this.dir(), f)));
        if (!filter?.includeDeleted && a.deletedAt) continue;

        if (filter?.filePath && a.filePath !== filter.filePath) continue;

        if (filter?.sectionId) {
          const sid = filter.sectionId;
          const matches =
            (a.target.kind === "section" && a.target.sectionId === sid) ||
            (a.target.kind === "selection" && a.target.sectionIdHint === sid);
          if (!matches) continue;
        }

        if (filter?.status && a.status !== filter.status) continue;
        out.push(a);
      } catch {
        // ignore
      }
    }

    out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return out;
  }

  async get(id: string): Promise<Annotation | null> {
    try {
      const a = AnnotationSchema.parse(await readJson<unknown>(this.filePath(id)));
      return a;
    } catch {
      return null;
    }
  }

  async create(input: CreateAnnotationInput): Promise<Annotation> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const a: Annotation = AnnotationSchema.parse({
      schemaVersion: 1,
      id,
      filePath: input.filePath,
      target: input.target,
      title: input.title,
      body: input.body,
      type: input.type,
      status: input.status,
      priority: input.priority,
      tags: input.tags ?? [],
      workLinks: input.workLinks ?? [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null
    });

    await writeJsonAtomic(this.filePath(id), a);
    return a;
  }

  async update(id: string, patch: UpdateAnnotationInput): Promise<Annotation> {
    const prev = await this.get(id);
    if (!prev) throw new Error("NOT_FOUND");
    const updatedAt = nowIso();

    const next: Annotation = AnnotationSchema.parse({
      ...prev,
      ...patch,
      workLinks: patch.workLinks ?? prev.workLinks,
      updatedAt
    });

    await writeJsonAtomic(this.filePath(id), next);
    return next;
  }

  async softDelete(id: string): Promise<Annotation> {
    const prev = await this.get(id);
    if (!prev) throw new Error("NOT_FOUND");
    if (prev.deletedAt) return prev;

    const next: Annotation = { ...prev, deletedAt: nowIso(), updatedAt: nowIso() };
    await writeJsonAtomic(this.filePath(id), next);
    return next;
  }
}
