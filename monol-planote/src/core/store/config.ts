import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";
import { writeJsonAtomic } from "./atomic";

export const HistoryConfigSchema = z.object({
  enabled: z.boolean(),
  autoSave: z.boolean(),
  debounceMs: z.number(),
  maxVersionsPerFile: z.number(),
  retentionDays: z.number()
});

export type HistoryConfig = z.infer<typeof HistoryConfigSchema>;

export const ConfigSchema = z.object({
  schemaVersion: z.literal(1),
  projectRoot: z.string(),
  planRoot: z.string(),
  ignoreGlobs: z.array(z.string()),
  server: z.object({
    host: z.string(),
    port: z.number(),
    openBrowser: z.boolean()
  }),
  author: z.object({
    name: z.string().optional(),
    email: z.string().optional()
  }),
  features: z.object({
    gitIntegration: z.boolean(),
    sideBySideDiff: z.boolean()
  }),
  history: HistoryConfigSchema
});

export type PlanoteConfig = z.infer<typeof ConfigSchema>;

export function defaultConfig(projectRootAbs: string): PlanoteConfig {
  return {
    schemaVersion: 1,
    projectRoot: projectRootAbs,
    planRoot: "plan",
    ignoreGlobs: ["**/.planote/**", "**/node_modules/**"],
    server: { host: "127.0.0.1", port: 8787, openBrowser: false },
    author: {},
    features: { gitIntegration: true, sideBySideDiff: true },
    history: {
      enabled: true,
      autoSave: true,
      debounceMs: 5000,
      maxVersionsPerFile: 50,
      retentionDays: 30
    }
  };
}

export class ConfigStore {
  constructor(private projectRootAbs: string) {}

  private configPath() {
    return path.join(this.projectRootAbs, ".planote", "config.json");
  }

  async load(): Promise<PlanoteConfig> {
    try {
      const text = await fs.readFile(this.configPath(), "utf8");
      const json = JSON.parse(text);
      return ConfigSchema.parse(json);
    } catch {
      return defaultConfig(this.projectRootAbs);
    }
  }

  async save(cfg: PlanoteConfig): Promise<void> {
    const parsed = ConfigSchema.parse(cfg);
    await writeJsonAtomic(this.configPath(), parsed);
  }
}
