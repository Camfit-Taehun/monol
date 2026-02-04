import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd, maxBuffer: 20 * 1024 * 1024 });
  return String(stdout);
}

export async function computeDiffFromBase(projectRootAbs: string, baseCommit: string): Promise<string> {
  // Compare working tree to base commit
  return await git(["diff", baseCommit], projectRootAbs);
}
