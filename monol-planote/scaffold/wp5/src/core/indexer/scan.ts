import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { parseHeadings } from "./parseHeadings";
import type { IndexedFile } from "../types/domain";
import { writeJsonAtomic } from "../store/atomic";
import { readJson } from "../store/json";

type ManifestFileEntry = {
  fileId: string;
  mtimeMs: number;
  size: number;
  sha256: string;
};

export type IndexManifest = {
  schemaVersion: 1;
  generatedAt: string;
  planRoot: string;
  files: Record<string, ManifestFileEntry>;
};

function fileIdFor(relPath: string): string {
  return crypto.createHash("sha256").update(relPath).digest("hex").slice(0, 16);
}

async function sha256File(absPath: string): Promise<string> {
  const buf = await fs.readFile(absPath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export class Indexer {
  constructor(
    private projectRootAbs: string,
    private planRootRel: string
  ) {}

  private planRootAbs() {
    return path.join(this.projectRootAbs, this.planRootRel);
  }

  private manifestPath() {
    return path.join(this.projectRootAbs, ".planote", "index", "manifest.json");
  }

  private indexedFilePath(fileId: string) {
    return path.join(this.projectRootAbs, ".planote", "index", "files", `${fileId}.json`);
  }

  private relFromAbs(abs: string) {
    return path.relative(this.projectRootAbs, abs).replaceAll("\\", "/");
  }

  async loadManifest(): Promise<IndexManifest | null> {
    try {
      return await readJson<IndexManifest>(this.manifestPath());
    } catch {
      return null;
    }
  }

  async scanIncremental(): Promise<{ files: IndexedFile[]; manifest: IndexManifest }> {
    const planAbs = this.planRootAbs();

    const mdAbsPaths = await fg(["**/*.md"], {
      cwd: planAbs,
      absolute: true,
      dot: false,
      followSymbolicLinks: false
    });

    const prev = await this.loadManifest();
    const nextFiles: Record<string, ManifestFileEntry> = {};
    const indexed: IndexedFile[] = [];

    for (const abs of mdAbsPaths) {
      const rel = this.relFromAbs(abs);
      const st = await fs.stat(abs);

      const fid = fileIdFor(rel);

      const prevEntry = prev?.files?.[rel];
      let sha = prevEntry?.sha256 ?? "";
      let needRehash = true;

      if (prevEntry && prevEntry.mtimeMs === st.mtimeMs && prevEntry.size === st.size) {
        needRehash = false;
      }
      if (needRehash) {
        sha = await sha256File(abs);
      }

      const entry: ManifestFileEntry = { fileId: fid, mtimeMs: st.mtimeMs, size: st.size, sha256: sha };
      nextFiles[rel] = entry;

      const cachedPath = this.indexedFilePath(fid);
      let cached: IndexedFile | null = null;

      if (prevEntry && prevEntry.sha256 === sha) {
        try {
          cached = await readJson<IndexedFile>(cachedPath);
        } catch {
          cached = null;
        }
      }

      if (cached && cached.sha256 === sha) {
        indexed.push(cached);
        continue;
      }

      const buf = await fs.readFile(abs);
      const text = buf.toString("utf8");
      const headings = await parseHeadings(text, rel);

      const idx: IndexedFile = {
        schemaVersion: 1,
        fileId: fid,
        path: rel,
        sha256: sha,
        size: st.size,
        mtimeMs: st.mtimeMs,
        headings
      };

      await writeJsonAtomic(cachedPath, idx);
      indexed.push(idx);
    }

    const manifest: IndexManifest = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      planRoot: this.planRootRel,
      files: nextFiles
    };

    await writeJsonAtomic(this.manifestPath(), manifest);

    indexed.sort((a, b) => a.path.localeCompare(b.path));
    return { files: indexed, manifest };
  }

  async readIndexedFileByPath(relPath: string): Promise<IndexedFile | null> {
    const fid = fileIdFor(relPath);
    try {
      return await readJson<IndexedFile>(this.indexedFilePath(fid));
    } catch {
      return null;
    }
  }
}
