import fs from "node:fs/promises";

export async function readJson<T>(filePath: string): Promise<T> {
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text) as T;
}
