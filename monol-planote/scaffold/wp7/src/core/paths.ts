import path from "node:path";
import fs from "node:fs/promises";
import { AppError } from "./errors";

export function normalizeRelPath(p: string): string {
  return p.replaceAll("\\", "/");
}

export function assertNoTraversal(rel: string) {
  const parts = normalizeRelPath(rel).split("/");
  if (parts.some((s) => s === "..")) {
    throw new AppError("PATH_OUTSIDE_ROOT", "Path traversal is not allowed.", { rel });
  }
}

function isWithinRoot(rootRel: string, rel: string): boolean {
  const a = rootRel.replaceAll("\\", "/").replace(/\/+$/, "");
  const b = rel.replaceAll("\\", "/");
  if (a === "") return true;
  if (b === a) return true;
  return b.startsWith(a + "/");
}

export async function resolveSafePath(opts: {
  projectRootAbs: string;
  relPath: string;
  allowedRootsRel: string[]; // e.g., ["plan", ".planote"]
}): Promise<string> {
  const rel = normalizeRelPath(opts.relPath);
  assertNoTraversal(rel);

  const allowed = opts.allowedRootsRel.some((r) => isWithinRoot(normalizeRelPath(r), rel));
  if (!allowed) {
    throw new AppError("PATH_OUTSIDE_ROOT", "Path is outside allowed roots.", {
      rel,
      allowedRootsRel: opts.allowedRootsRel
    });
  }

  const abs = path.resolve(opts.projectRootAbs, rel);

  // Symlink escape prevention: ensure realpath stays inside projectRootAbs realpath.
  const [projectReal, absReal] = await Promise.all([fs.realpath(opts.projectRootAbs), fs.realpath(abs)]);
  const prefix = projectReal.endsWith(path.sep) ? projectReal : projectReal + path.sep;

  if (!(absReal === projectReal || absReal.startsWith(prefix))) {
    throw new AppError("PATH_OUTSIDE_ROOT", "Resolved path escapes project root.", {
      rel,
      absReal
    });
  }

  return absReal;
}
