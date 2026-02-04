import chokidar from "chokidar";
import path from "node:path";
import { Indexer } from "./scan";

export type WatchEvent =
  | { type: "index:updated" }
  | { type: "index:error"; message: string };

export class PlanWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private projectRootAbs: string,
    private planRootRel: string,
    private indexer: Indexer,
    private onEvent: (e: WatchEvent) => void
  ) {}

  start() {
    const planAbs = path.join(this.projectRootAbs, this.planRootRel);
    this.watcher = chokidar.watch(["**/*.md"], {
      cwd: planAbs,
      ignoreInitial: true,
      ignored: ["**/.planote/**", "**/node_modules/**"],
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
    });

    const schedule = () => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        try {
          await this.indexer.scanIncremental();
          this.onEvent({ type: "index:updated" });
        } catch (e: any) {
          this.onEvent({ type: "index:error", message: String(e) });
        }
      }, 250);
    };

    this.watcher.on("add", schedule);
    this.watcher.on("change", schedule);
    this.watcher.on("unlink", schedule);
  }

  async stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.watcher) await this.watcher.close();
    this.watcher = null;
  }
}
