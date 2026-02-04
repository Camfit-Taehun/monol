import { Command } from "commander";
import path from "node:path";
import { SnapshotStore } from "../../core/store/snapshots";
import { ConfigStore } from "../../core/store/config";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function registerSnapshotCommand(program: Command) {
  const snapshot = program
    .command("snapshot")
    .description("Manage plan directory snapshots");

  // planote snapshot list
  snapshot
    .command("list")
    .alias("ls")
    .description("List all snapshots")
    .action(async () => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);
      const snapshots = await store.list();

      if (snapshots.length === 0) {
        console.log("No snapshots yet.");
        console.log("Use 'planote snapshot create <name>' to create one.");
        return;
      }

      console.log("Snapshots:\n");
      for (const s of snapshots) {
        console.log(`  [${s.id.slice(0, 8)}] ${s.name}`);
        console.log(`    Created: ${formatDate(s.createdAt)}`);
        console.log(`    Files: ${s.fileCount}`);
        console.log("");
      }
    });

  // planote snapshot create <name> [--description <desc>]
  snapshot
    .command("create <name>")
    .description("Create a new snapshot")
    .option("-d, --description <desc>", "Snapshot description")
    .action(async (name: string, opts: { description?: string }) => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);

      console.log("Creating snapshot...");
      const snap = await store.create(name, opts.description ?? "");

      console.log(`\nSnapshot created: ${snap.id.slice(0, 8)}`);
      console.log(`  Name: ${snap.name}`);
      console.log(`  Files: ${snap.stats.totalFiles}`);
      console.log(`  Size: ${formatSize(snap.stats.totalSize)}`);
      if (snap.git) {
        console.log(`  Git: ${snap.git.headBranch} @ ${snap.git.headCommit?.slice(0, 7)}${snap.git.dirty ? " (dirty)" : ""}`);
      }
    });

  // planote snapshot show <id>
  snapshot
    .command("show <id>")
    .description("Show snapshot details")
    .action(async (id: string) => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);

      // Support partial ID matching
      const snapshots = await store.list();
      const match = snapshots.find((s) => s.id.startsWith(id));
      if (!match) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      const snap = await store.get(match.id);
      if (!snap) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      console.log(`Snapshot: ${snap.name}\n`);
      console.log(`  ID: ${snap.id}`);
      console.log(`  Created: ${formatDate(snap.createdAt)}`);
      if (snap.description) {
        console.log(`  Description: ${snap.description}`);
      }
      console.log(`  Files: ${snap.stats.totalFiles}`);
      console.log(`  Size: ${formatSize(snap.stats.totalSize)}`);
      if (snap.git) {
        console.log(`  Git: ${snap.git.headBranch} @ ${snap.git.headCommit?.slice(0, 7)}${snap.git.dirty ? " (dirty)" : ""}`);
      }

      console.log("\nFiles:");
      for (const f of snap.fileManifest) {
        console.log(`  - ${f.filePath} (${formatSize(f.size)})`);
      }
    });

  // planote snapshot diff <id>
  snapshot
    .command("diff <id>")
    .description("Compare snapshot with current state")
    .action(async (id: string) => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);

      // Support partial ID matching
      const snapshots = await store.list();
      const match = snapshots.find((s) => s.id.startsWith(id));
      if (!match) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      const diff = await store.diff(match.id);

      const unchanged = diff.filter((d) => d.status === "unchanged");
      const modified = diff.filter((d) => d.status === "modified");
      const deleted = diff.filter((d) => d.status === "deleted");
      const added = diff.filter((d) => d.status === "added");

      console.log(`Comparing with snapshot: ${match.name}\n`);

      if (modified.length > 0) {
        console.log(`Modified (${modified.length}):`);
        for (const f of modified) {
          console.log(`  M ${f.filePath}`);
        }
        console.log("");
      }

      if (deleted.length > 0) {
        console.log(`Deleted (${deleted.length}):`);
        for (const f of deleted) {
          console.log(`  D ${f.filePath}`);
        }
        console.log("");
      }

      if (added.length > 0) {
        console.log(`Added (${added.length}):`);
        for (const f of added) {
          console.log(`  A ${f.filePath}`);
        }
        console.log("");
      }

      if (unchanged.length > 0) {
        console.log(`Unchanged (${unchanged.length}):`);
        for (const f of unchanged) {
          console.log(`  = ${f.filePath}`);
        }
      }

      if (modified.length === 0 && deleted.length === 0 && added.length === 0) {
        console.log("No changes since snapshot.");
      }
    });

  // planote snapshot restore <id> [--extract <dir>]
  snapshot
    .command("restore <id>")
    .description("Restore files from snapshot")
    .option("--extract <dir>", "Extract to directory instead of overwriting")
    .option("-y, --yes", "Skip confirmation")
    .action(async (id: string, opts: { extract?: string; yes?: boolean }) => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);

      // Support partial ID matching
      const snapshots = await store.list();
      const match = snapshots.find((s) => s.id.startsWith(id));
      if (!match) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      const snap = await store.get(match.id);
      if (!snap) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      const mode = opts.extract ? "extract" : "overwrite";
      let extractDir: string | undefined;

      if (opts.extract) {
        extractDir = path.join(projectRoot, opts.extract);
        if (!extractDir.startsWith(projectRoot)) {
          console.error("Path traversal not allowed");
          process.exit(1);
        }
      }

      if (!opts.yes && mode === "overwrite") {
        console.log(`This will overwrite ${snap.stats.totalFiles} file(s).`);
        console.log("Use --yes to skip this confirmation, or --extract <dir> to extract elsewhere.");
        process.exit(0);
      }

      console.log(`Restoring snapshot: ${snap.name}...`);
      const result = await store.restore(match.id, mode, extractDir);

      console.log(`\nRestored: ${result.restored} file(s)`);
      if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.length}`);
        for (const err of result.errors) {
          console.log(`  - ${err}`);
        }
      }
    });

  // planote snapshot delete <id>
  snapshot
    .command("delete <id>")
    .description("Delete a snapshot")
    .option("-y, --yes", "Skip confirmation")
    .action(async (id: string, opts: { yes?: boolean }) => {
      const projectRoot = process.cwd();
      const cfg = await new ConfigStore(projectRoot).load();
      const store = new SnapshotStore(projectRoot, cfg.planRoot);

      // Support partial ID matching
      const snapshots = await store.list();
      const match = snapshots.find((s) => s.id.startsWith(id));
      if (!match) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }

      if (!opts.yes) {
        console.log(`This will delete snapshot: ${match.name}`);
        console.log("Use --yes to skip this confirmation.");
        process.exit(0);
      }

      const deleted = await store.delete(match.id);
      if (deleted) {
        console.log(`Deleted: ${match.name}`);
      } else {
        console.error("Failed to delete snapshot");
        process.exit(1);
      }
    });
}
