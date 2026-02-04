import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type GitInfo = {
  isRepo: boolean;
  headBranch: string | null;
  headCommit: string | null;
  dirty: boolean | null;
};

async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return String(stdout).trim();
}

export async function detectGit(projectRootAbs: string): Promise<GitInfo> {
  try {
    const inside = await git(["rev-parse", "--is-inside-work-tree"], projectRootAbs);
    if (inside !== "true") return { isRepo: false, headBranch: null, headCommit: null, dirty: null };
  } catch {
    return { isRepo: false, headBranch: null, headCommit: null, dirty: null };
  }

  let headCommit: string | null = null;
  let headBranch: string | null = null;
  let dirty: boolean | null = null;

  try {
    headCommit = await git(["rev-parse", "HEAD"], projectRootAbs);
  } catch {
    headCommit = null;
  }
  try {
    headBranch = await git(["rev-parse", "--abbrev-ref", "HEAD"], projectRootAbs);
  } catch {
    headBranch = null;
  }
  try {
    const status = await git(["status", "--porcelain"], projectRootAbs);
    dirty = status.length > 0;
  } catch {
    dirty = null;
  }

  return { isRepo: true, headBranch, headCommit, dirty };
}
