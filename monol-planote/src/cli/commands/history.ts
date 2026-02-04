import { Command } from "commander";
import path from "node:path";
import fs from "node:fs/promises";
import { VersionStore, FileVersion } from "../../core/store/versions";
import { createTwoFilesPatch } from "diff";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function findVersion(versions: FileVersion[], partialId: string): FileVersion | undefined {
  return versions.find((v) => v.id.startsWith(partialId));
}

export function registerHistoryCommand(program: Command) {
  const history = program
    .command("history")
    .description("Manage file version history");

  // planote history list
  history
    .command("list")
    .alias("ls")
    .description("List files with version history")
    .action(async () => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);
      const files = await store.listFiles();

      if (files.length === 0) {
        console.log("No version history yet.");
        console.log("Edit files in plan/ to create automatic versions.");
        return;
      }

      console.log("Files with version history:\n");
      for (const f of files) {
        console.log(`  ${f.filePath}`);
        console.log(`    Versions: ${f.versionCount}`);
        console.log("");
      }
    });

  // planote history show <path>
  history
    .command("show <path>")
    .description("Show version history for a file")
    .action(async (filePath: string) => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);
      const versions = await store.listVersions(filePath);

      if (versions.length === 0) {
        console.log(`No versions found for: ${filePath}`);
        return;
      }

      console.log(`Version history for: ${filePath}\n`);
      for (let i = 0; i < versions.length; i++) {
        const v = versions[i];
        const label = i === 0 ? " (latest)" : "";
        console.log(`  [${i + 1}] ${v.id.slice(0, 8)}${label}`);
        console.log(`      Created: ${formatDate(v.createdAt)}`);
        console.log(`      By: ${v.createdBy}`);
        console.log(`      Size: ${formatSize(v.size)} (${v.metadata.lineCount} lines)`);
        console.log("");
      }
    });

  // planote history diff <path> [--from <id>] [--to <id>]
  history
    .command("diff <path>")
    .description("Show diff between versions")
    .option("--from <id>", "From version ID (default: previous)")
    .option("--to <id>", "To version ID (default: current file)")
    .action(async (filePath: string, opts: { from?: string; to?: string }) => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);
      const versions = await store.listVersions(filePath);

      let fromContent = "";
      let toContent = "";
      let fromLabel = "(empty)";
      let toLabel = "current";

      if (opts.from) {
        const match = findVersion(versions, opts.from);
        if (!match) {
          console.error(`Version not found: ${opts.from}`);
          process.exit(1);
        }
        const content = await store.getVersionContent(filePath, match.id);
        if (!content) {
          console.error(`Version content not found: ${opts.from}`);
          process.exit(1);
        }
        fromContent = content;
        fromLabel = match.id.slice(0, 8);
      } else {
        // Get latest version as "from"
        if (versions.length > 0) {
          const latest = versions[0];
          const content = await store.getVersionContent(filePath, latest.id);
          if (content) {
            fromContent = content;
            fromLabel = latest.id.slice(0, 8);
          }
        }
      }

      if (opts.to) {
        const match = findVersion(versions, opts.to);
        if (!match) {
          console.error(`Version not found: ${opts.to}`);
          process.exit(1);
        }
        const content = await store.getVersionContent(filePath, match.id);
        if (!content) {
          console.error(`Version content not found: ${opts.to}`);
          process.exit(1);
        }
        toContent = content;
        toLabel = match.id.slice(0, 8);
      } else {
        // Read current file
        const fullPath = path.join(projectRoot, filePath);
        try {
          toContent = await fs.readFile(fullPath, "utf8");
          toLabel = "current";
        } catch {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }
      }

      const patch = createTwoFilesPatch(filePath, filePath, fromContent, toContent, fromLabel, toLabel);
      console.log(patch);
    });

  // planote history restore <path> <versionId> [--extract <newPath>]
  history
    .command("restore <path> <versionId>")
    .description("Restore a file to a specific version")
    .option("--extract <newPath>", "Extract to new file instead of overwriting")
    .action(async (filePath: string, versionId: string, opts: { extract?: string }) => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);
      const versions = await store.listVersions(filePath);

      const match = findVersion(versions, versionId);
      if (!match) {
        console.error(`Version not found: ${versionId}`);
        process.exit(1);
      }

      const content = await store.getVersionContent(filePath, match.id);
      if (!content) {
        console.error(`Version content not found: ${versionId}`);
        process.exit(1);
      }

      const targetPath = opts.extract
        ? path.join(projectRoot, opts.extract)
        : path.join(projectRoot, filePath);

      // Safety check
      if (!targetPath.startsWith(projectRoot)) {
        console.error("Path traversal not allowed");
        process.exit(1);
      }

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content, "utf8");

      if (opts.extract) {
        console.log(`Extracted to: ${opts.extract}`);
      } else {
        console.log(`Restored: ${filePath}`);
      }
    });

  // planote history create <path>
  history
    .command("create <path>")
    .description("Manually create a version for a file")
    .action(async (filePath: string) => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);

      const fullPath = path.join(projectRoot, filePath);
      let content: string;
      try {
        content = await fs.readFile(fullPath, "utf8");
      } catch {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const version = await store.createVersion(filePath, content, "manual");
      if (version) {
        console.log(`Created version: ${version.id.slice(0, 8)}`);
        console.log(`  File: ${filePath}`);
        console.log(`  Size: ${formatSize(version.size)}`);
      } else {
        console.log("No changes detected. Version not created.");
      }
    });

  // planote history cat <path> <versionId>
  history
    .command("cat <path> <versionId>")
    .description("Output version content to stdout")
    .action(async (filePath: string, versionId: string) => {
      const projectRoot = process.cwd();
      const store = new VersionStore(projectRoot);
      const versions = await store.listVersions(filePath);

      const match = findVersion(versions, versionId);
      if (!match) {
        console.error(`Version not found: ${versionId}`);
        process.exit(1);
      }

      const content = await store.getVersionContent(filePath, match.id);
      if (!content) {
        console.error(`Version content not found: ${versionId}`);
        process.exit(1);
      }

      process.stdout.write(content);
    });
}
