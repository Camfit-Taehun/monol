import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs/promises";
import { VersionStore } from "../store/versions";
import type { HistoryConfig } from "../store/config";

export type HistoryWatchEvent =
  | { type: "version:created"; filePath: string; versionId: string }
  | { type: "version:error"; filePath: string; message: string };

export class HistoryWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private versionStore: VersionStore;

  constructor(
    private projectRootAbs: string,
    private planRootRel: string,
    private config: HistoryConfig,
    private onEvent: (e: HistoryWatchEvent) => void
  ) {
    this.versionStore = new VersionStore(projectRootAbs);
  }

  start() {
    if (!this.config.enabled || !this.config.autoSave) {
      return;
    }

    const planAbs = path.join(this.projectRootAbs, this.planRootRel);
    this.watcher = chokidar.watch(["**/*.md"], {
      cwd: planAbs,
      ignoreInitial: true,
      ignored: ["**/.planote/**", "**/node_modules/**"],
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
    });

    const scheduleVersion = (relativePath: string) => {
      const filePath = path.join(this.planRootRel, relativePath);

      const existingTimer = this.timers.get(filePath);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(async () => {
        this.timers.delete(filePath);
        await this.createVersionForFile(filePath);
      }, this.config.debounceMs);

      this.timers.set(filePath, timer);
    };

    this.watcher.on("add", scheduleVersion);
    this.watcher.on("change", scheduleVersion);
  }

  private async createVersionForFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.projectRootAbs, filePath);

    try {
      const content = await fs.readFile(fullPath, "utf8");
      const version = await this.versionStore.createVersion(filePath, content, "auto");

      if (version) {
        this.onEvent({
          type: "version:created",
          filePath,
          versionId: version.id
        });

        if (this.config.maxVersionsPerFile > 0) {
          await this.versionStore.pruneOldVersions(filePath, this.config.maxVersionsPerFile);
        }
      }
    } catch (e: any) {
      this.onEvent({
        type: "version:error",
        filePath,
        message: String(e)
      });
    }
  }

  async createManualVersion(filePath: string): Promise<string | null> {
    const fullPath = path.join(this.projectRootAbs, filePath);

    try {
      const content = await fs.readFile(fullPath, "utf8");
      const version = await this.versionStore.createVersion(filePath, content, "manual");

      if (version) {
        this.onEvent({
          type: "version:created",
          filePath,
          versionId: version.id
        });
        return version.id;
      }

      return null;
    } catch (e: any) {
      this.onEvent({
        type: "version:error",
        filePath,
        message: String(e)
      });
      return null;
    }
  }

  async stop() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }
}
