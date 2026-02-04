import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { z } from "zod";
import { writeJsonAtomic, writeTextAtomic } from "./atomic";
import { readJson } from "./json";

export const FileVersionMetadataSchema = z.object({
  previousVersionId: z.string().nullable(),
  lineCount: z.number()
});

export const FileVersionSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  filePath: z.string(),
  contentHash: z.string(),
  size: z.number(),
  createdAt: z.string(),
  createdBy: z.enum(["auto", "manual"]),
  metadata: FileVersionMetadataSchema
});

export type FileVersion = z.infer<typeof FileVersionSchema>;
export type FileVersionMetadata = z.infer<typeof FileVersionMetadataSchema>;

export const VersionIndexSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: z.string(),
  files: z.record(z.string(), z.object({
    latestVersionId: z.string(),
    versionCount: z.number(),
    latestContentHash: z.string()
  }))
});

export type VersionIndex = z.infer<typeof VersionIndexSchema>;

function nowIso() {
  return new Date().toISOString();
}

function computeSha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function pathHash(filePath: string): string {
  return crypto.createHash("sha256").update(filePath, "utf8").digest("hex").slice(0, 16);
}

export class VersionStore {
  constructor(private projectRootAbs: string) {}

  private historyDir() {
    return path.join(this.projectRootAbs, ".planote", "history");
  }

  private versionsDir() {
    return path.join(this.historyDir(), "versions");
  }

  private contentDir() {
    return path.join(this.historyDir(), "content");
  }

  private indexPath() {
    return path.join(this.historyDir(), "index.json");
  }

  private versionDirForFile(filePath: string) {
    return path.join(this.versionsDir(), pathHash(filePath));
  }

  private versionFilePath(filePath: string, versionId: string) {
    return path.join(this.versionDirForFile(filePath), `${versionId}.json`);
  }

  private contentPath(hash: string) {
    const prefix = hash.slice(0, 2);
    return path.join(this.contentDir(), prefix, `${hash}.txt`);
  }

  async loadIndex(): Promise<VersionIndex> {
    try {
      const data = await readJson<unknown>(this.indexPath());
      return VersionIndexSchema.parse(data);
    } catch {
      return {
        schemaVersion: 1,
        updatedAt: nowIso(),
        files: {}
      };
    }
  }

  private async saveIndex(index: VersionIndex): Promise<void> {
    index.updatedAt = nowIso();
    await writeJsonAtomic(this.indexPath(), index);
  }

  async storeContent(content: string): Promise<string> {
    const hash = computeSha256(content);
    const contentPath = this.contentPath(hash);
    try {
      await fs.access(contentPath);
    } catch {
      await writeTextAtomic(contentPath, content);
    }
    return hash;
  }

  async getContent(hash: string): Promise<string | null> {
    try {
      return await fs.readFile(this.contentPath(hash), "utf8");
    } catch {
      return null;
    }
  }

  async createVersion(
    filePath: string,
    content: string,
    createdBy: "auto" | "manual"
  ): Promise<FileVersion | null> {
    const index = await this.loadIndex();
    const contentHash = computeSha256(content);

    if (index.files[filePath]?.latestContentHash === contentHash) {
      return null;
    }

    await this.storeContent(content);

    const id = crypto.randomUUID();
    const createdAt = nowIso();
    const lineCount = content.split("\n").length;
    const previousVersionId = index.files[filePath]?.latestVersionId ?? null;

    const version: FileVersion = {
      schemaVersion: 1,
      id,
      filePath,
      contentHash,
      size: Buffer.byteLength(content, "utf8"),
      createdAt,
      createdBy,
      metadata: {
        previousVersionId,
        lineCount
      }
    };

    await writeJsonAtomic(this.versionFilePath(filePath, id), version);

    index.files[filePath] = {
      latestVersionId: id,
      versionCount: (index.files[filePath]?.versionCount ?? 0) + 1,
      latestContentHash: contentHash
    };
    await this.saveIndex(index);

    return version;
  }

  async getVersion(filePath: string, versionId: string): Promise<FileVersion | null> {
    try {
      const data = await readJson<unknown>(this.versionFilePath(filePath, versionId));
      return FileVersionSchema.parse(data);
    } catch {
      return null;
    }
  }

  async getVersionContent(filePath: string, versionId: string): Promise<string | null> {
    const version = await this.getVersion(filePath, versionId);
    if (!version) return null;
    return this.getContent(version.contentHash);
  }

  async listVersions(filePath: string): Promise<FileVersion[]> {
    const dir = this.versionDirForFile(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
      const entries = await fs.readdir(dir);
      const versions: FileVersion[] = [];

      for (const f of entries) {
        if (!f.endsWith(".json")) continue;
        try {
          const data = await readJson<unknown>(path.join(dir, f));
          const version = FileVersionSchema.parse(data);
          if (version.filePath === filePath) {
            versions.push(version);
          }
        } catch {
          // ignore invalid files
        }
      }

      versions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return versions;
    } catch {
      return [];
    }
  }

  async listFiles(): Promise<Array<{ filePath: string; versionCount: number; latestVersionId: string }>> {
    const index = await this.loadIndex();
    return Object.entries(index.files).map(([filePath, info]) => ({
      filePath,
      versionCount: info.versionCount,
      latestVersionId: info.latestVersionId
    }));
  }

  async deleteVersion(filePath: string, versionId: string): Promise<boolean> {
    const versionPath = this.versionFilePath(filePath, versionId);
    try {
      await fs.unlink(versionPath);

      const index = await this.loadIndex();
      if (index.files[filePath]?.latestVersionId === versionId) {
        const remaining = await this.listVersions(filePath);
        if (remaining.length > 0) {
          const latest = remaining[0];
          index.files[filePath] = {
            latestVersionId: latest.id,
            versionCount: remaining.length,
            latestContentHash: latest.contentHash
          };
        } else {
          delete index.files[filePath];
        }
        await this.saveIndex(index);
      } else if (index.files[filePath]) {
        index.files[filePath].versionCount = Math.max(0, index.files[filePath].versionCount - 1);
        await this.saveIndex(index);
      }

      return true;
    } catch {
      return false;
    }
  }

  async pruneOldVersions(filePath: string, maxVersions: number): Promise<number> {
    const versions = await this.listVersions(filePath);
    if (versions.length <= maxVersions) return 0;

    const toDelete = versions.slice(maxVersions);
    let deleted = 0;

    for (const v of toDelete) {
      if (await this.deleteVersion(filePath, v.id)) {
        deleted++;
      }
    }

    return deleted;
  }

  async pruneByRetention(retentionDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffIso = cutoff.toISOString();

    const index = await this.loadIndex();
    let deleted = 0;

    for (const filePath of Object.keys(index.files)) {
      const versions = await this.listVersions(filePath);
      for (const v of versions) {
        if (v.createdAt < cutoffIso && v.id !== index.files[filePath]?.latestVersionId) {
          if (await this.deleteVersion(filePath, v.id)) {
            deleted++;
          }
        }
      }
    }

    return deleted;
  }
}
