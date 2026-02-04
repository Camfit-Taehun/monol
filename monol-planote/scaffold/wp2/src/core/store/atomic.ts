import writeFileAtomic from "write-file-atomic";
import stringify from "json-stable-stringify";
import fs from "node:fs/promises";
import path from "node:path";

export async function writeTextAtomic(dest: string, content: string) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await writeFileAtomic(dest, content, { encoding: "utf8" });
}

export async function writeJsonAtomic(dest: string, data: unknown) {
  const content = stringify(data, { space: 2 }) + "\n";
  await writeTextAtomic(dest, content);
}
