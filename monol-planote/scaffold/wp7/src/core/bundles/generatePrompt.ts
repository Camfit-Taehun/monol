import type { BundleJson } from "./generateJson";

export function generateBundlePrompt(bundle: BundleJson): string {
  const lines: string[] = [];
  lines.push(`# Planote Bundle — ${bundle.cycle.title}`);
  lines.push(`Cycle: ${bundle.cycle.id}`);
  lines.push(`Updated: ${bundle.cycle.updatedAt}`);
  lines.push("");
  lines.push("## Tasks / Notes");
  lines.push("");

  for (const a of bundle.annotations) {
    lines.push(`### [${a.type.toUpperCase()}] ${a.title}`);
    lines.push(`- id: ${a.id}`);
    lines.push(`- file: ${a.filePath}`);
    lines.push(`- priority: ${a.priority}`);
    lines.push(`- status: ${a.status}`);
    if (a.target.kind === "section") lines.push(`- section: ${a.target.sectionId}`);
    if (a.target.kind === "selection") lines.push(`- quote: ${JSON.stringify(a.target.quote)}`);
    if (a.tags.length) lines.push(`- tags: ${a.tags.join(", ")}`);
    if (a.workLinks.length) {
      lines.push(`- links:`);
      for (const w of a.workLinks) {
        lines.push(`  - [${w.kind}] ${w.title ?? ""} ${w.url}`.trim());
      }
    }
    lines.push("");
    if (a.body) {
      lines.push(a.body);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("Return results as: (1) summary, (2) proposed file edits, (3) risks, (4) checklist.");
  lines.push("");
  return lines.join("\n");
}
