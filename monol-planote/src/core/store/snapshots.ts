import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";
import { readJson } from "./json";
import { VersionStore } from "./versions";
import { detectGit } from "../git/detect";

export const SnapshotFileEntrySchema = z.object({
  filePath: z.string(),
  versionId: z.string(),
  contentHash: z.string(),
  size: z.number()
});

export const SnapshotStatsSchema = z.object({
  totalFiles: z.number(),
  totalSize: z.number()
});

export const SnapshotGitSchema = z.object({
  headCommit: z.string().nullable(),
  headBranch: z.string().nullable(),
  dirty: z.boolean().nullable()
});

export const SnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  fileManifest: z.array(SnapshotFileEntrySchema),
  stats: SnapshotStatsSchema,
  git: SnapshotGitSchema.nullable()
});

export type SnapshotFileEntry = z.infer<typeof SnapshotFileEntrySchema>;
export type SnapshotStats = z.infer<typeof SnapshotStatsSchema>;
export type SnapshotGit = z.infer<typeof SnapshotGitSchema>;
export type Snapshot = z.infer<typeof SnapshotSchema>;

export const SnapshotManifestSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string(),
  snapshots: z.array(z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    fileCount: z.number()
  }))
});

export type SnapshotManifest = z.infer<typeof SnapshotManifestSchema>;

function nowIso() {
  return new Date().toISOString();
}

export class SnapshotStore {
  private versionStore: VersionStore;

  constructor(private projectRootAbs: string, private planRoot: string) {
    this.versionStore = new VersionStore(projectRootAbs);
  }

  private snapshotsDir() {
    return path.join(this.projectRootAbs, ".planote", "snapshots");
  }

  private manifestPath() {
    return path.join(this.snapshotsDir(), "manifest.json");
  }

  private snapshotPath(id: string) {
    return path.join(this.snapshotsDir(), `${id}.json`);
  }

  private planRootAbs() {
    return path.join(this.projectRootAbs, this.planRoot);
  }

  async loadManifest(): Promise<SnapshotManifest> {
    try {
      const data = await readJson<unknown>(this.manifestPath());
      return SnapshotManifestSchema.parse(data);
    } catch {
      return {
        schemaVersion: 1,
        updatedAt: nowIso(),
        snapshots: []
      };
    }
  }

  private async saveManifest(manifest: SnapshotManifest): Promise<void> {
    manifest.updatedAt = nowIso();
    await writeJsonAtomic(this.manifestPath(), manifest);
  }

  private async collectPlanFiles(): Promise<string[]> {
    const planAbs = this.planRootAbs();
    const files: string[] = [];

    const walk = async (dir: string) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name !== ".planote" && entry.name !== "node_modules") {
              await walk(fullPath);
            }
          } else if (entry.isFile() && entry.name.endsWith(".md")) {
            const relativePath = path.relative(this.projectRootAbs, fullPath);
            files.push(relativePath);
          }
        }
      } catch {
        // ignore
      }
    };

    await walk(planAbs);
    return files.sort();
  }

  async create(name: string, description: string = ""): Promise<Snapshot> {
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const files = await this.collectPlanFiles();

    const fileManifest: SnapshotFileEntry[] = [];
    let totalSize = 0;

    for (const filePath of files) {
      const fullPath = path.join(this.projectRootAbs, filePath);
      try {
        const content = await fs.readFile(fullPath, "utf8");
        const version = await this.versionStore.createVersion(filePath, content, "manual");

        if (version) {
          fileManifest.push({
            filePath,
            versionId: version.id,
            contentHash: version.contentHash,
            size: version.size
          });
          totalSize += version.size;
        } else {
          const index = await this.versionStore.loadIndex();
          const info = index.files[filePath];
          if (info) {
            const latestVersion = await this.versionStore.getVersion(filePath, info.latestVersionId);
            if (latestVersion) {
              fileManifest.push({
                filePath,
                versionId: latestVersion.id,
                contentHash: latestVersion.contentHash,
                size: latestVersion.size
              });
              totalSize += latestVersion.size;
            }
          }
        }
      } catch {
        // skip files that can't be read
      }
    }

    let git: SnapshotGit | null = null;
    try {
      const gitInfo = await detectGit(this.projectRootAbs);
      if (gitInfo.isRepo) {
        git = {
          headCommit: gitInfo.headCommit,
          headBranch: gitInfo.headBranch,
          dirty: gitInfo.dirty
        };
      }
    } catch {
      // ignore git detection failures
    }

    const snapshot: Snapshot = {
      schemaVersion: 1,
      id,
      name,
      description,
      createdAt,
      fileManifest,
      stats: {
        totalFiles: fileManifest.length,
        totalSize
      },
      git
    };

    await writeJsonAtomic(this.snapshotPath(id), snapshot);

    const manifest = await this.loadManifest();
    manifest.snapshots.unshift({
      id,
      name,
      createdAt,
      fileCount: fileManifest.length
    });
    await this.saveManifest(manifest);

    return snapshot;
  }

  async list(): Promise<SnapshotManifest["snapshots"]> {
    const manifest = await this.loadManifest();
    return manifest.snapshots;
  }

  async get(id: string): Promise<Snapshot | null> {
    try {
      const data = await readJson<unknown>(this.snapshotPath(id));
      return SnapshotSchema.parse(data);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.snapshotPath(id));

      const manifest = await this.loadManifest();
      manifest.snapshots = manifest.snapshots.filter((s) => s.id !== id);
      await this.saveManifest(manifest);

      return true;
    } catch {
      return false;
    }
  }

  async restore(
    id: string,
    mode: "overwrite" | "extract",
    extractDir?: string
  ): Promise<{ restored: number; errors: string[] }> {
    const snapshot = await this.get(id);
    if (!snapshot) {
      return { restored: 0, errors: ["Snapshot not found"] };
    }

    const errors: string[] = [];
    let restored = 0;

    for (const entry of snapshot.fileManifest) {
      const content = await this.versionStore.getContent(entry.contentHash);
      if (!content) {
        errors.push(`Content not found for ${entry.filePath}`);
        continue;
      }

      let targetPath: string;
      if (mode === "overwrite") {
        targetPath = path.join(this.projectRootAbs, entry.filePath);
      } else {
        if (!extractDir) {
          errors.push("Extract directory not specified");
          break;
        }
        targetPath = path.join(extractDir, entry.filePath);
      }

      try {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content, "utf8");
        restored++;
      } catch (e: any) {
        errors.push(`Failed to write ${entry.filePath}: ${String(e)}`);
      }
    }

    return { restored, errors };
  }

  async diff(id: string): Promise<Array<{
    filePath: string;
    status: "unchanged" | "modified" | "deleted" | "added";
    snapshotHash: string | null;
    currentHash: string | null;
  }>> {
    const snapshot = await this.get(id);
    if (!snapshot) return [];

    const currentFiles = await this.collectPlanFiles();
    const snapshotFiles = new Set(snapshot.fileManifest.map((e) => e.filePath));
    const result: Array<{
      filePath: string;
      status: "unchanged" | "modified" | "deleted" | "added";
      snapshotHash: string | null;
      currentHash: string | null;
    }> = [];

    for (const entry of snapshot.fileManifest) {
      const fullPath = path.join(this.projectRootAbs, entry.filePath);
      try {
        const content = await fs.readFile(fullPath, "utf8");
        const currentHash = crypto.createHash("sha256").update(content, "utf8").digest("hex");

        if (currentHash === entry.contentHash) {
          result.push({
            filePath: entry.filePath,
            status: "unchanged",
            snapshotHash: entry.contentHash,
            currentHash
          });
        } else {
          result.push({
            filePath: entry.filePath,
            status: "modified",
            snapshotHash: entry.contentHash,
            currentHash
          });
        }
      } catch {
        result.push({
          filePath: entry.filePath,
          status: "deleted",
          snapshotHash: entry.contentHash,
          currentHash: null
        });
      }
    }

    for (const filePath of currentFiles) {
      if (!snapshotFiles.has(filePath)) {
        const fullPath = path.join(this.projectRootAbs, filePath);
        try {
          const content = await fs.readFile(fullPath, "utf8");
          const currentHash = crypto.createHash("sha256").update(content, "utf8").digest("hex");
          result.push({
            filePath,
            status: "added",
            snapshotHash: null,
            currentHash
          });
        } catch {
          // ignore
        }
      }
    }

    return result.sort((a, b) => a.filePath.localeCompare(b.filePath));
  }
}
