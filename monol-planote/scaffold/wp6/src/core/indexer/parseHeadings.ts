import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import crypto from "node:crypto";
import type { Heading } from "../types/domain";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function shortHash(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 8);
}

export async function parseHeadings(markdown: string, filePath: string): Promise<Heading[]> {
  const lines = markdown.split(/\r?\n/);
  const lineStartOffsets: number[] = [];
  let acc = 0;
  for (let i = 0; i < lines.length; i++) {
    lineStartOffsets.push(acc);
    acc += lines[i].length + 1; // + newline
  }

  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  const raw: Array<{
    level: number;
    rawTitle: string;
    title: string;
    explicitId: string | null;
    lineStart: number;
    charStart: number;
  }> = [];

  visit(tree, "heading", (node: any) => {
    const level: number = node.depth;
    const rawTitle = toString(node) ?? "";

    const lineStart = node.position?.start?.line ?? 1;
    const colStart = node.position?.start?.column ?? 1;

    const lineText = lines[lineStart - 1] ?? "";
    const idMatch = lineText.match(/\{#([A-Za-z0-9_\-:.]+)\}\s*$/);
    const explicitId = idMatch ? idMatch[1] : null;

    const title = rawTitle.replace(/\s*\{#([^\}]+)\}\s*$/, "").trim();
    const charStart = (lineStartOffsets[lineStart - 1] ?? 0) + Math.max(0, colStart - 1);

    raw.push({ level, rawTitle, title, explicitId, lineStart, charStart });
  });

  raw.sort((a, b) => a.charStart - b.charStart);

  const headings: Heading[] = raw.map((h) => ({
    sectionId: h.explicitId ? h.explicitId : `h:${slugify(h.title || "section")}:${shortHash(`${filePath}:${h.lineStart}`)}`,
    level: h.level,
    title: h.title || "(untitled)",
    lineStart: h.lineStart,
    lineEnd: lines.length,
    charStart: h.charStart,
    charEnd: markdown.length
  }));

  for (let i = 0; i < headings.length; i++) {
    const cur = headings[i];
    for (let j = i + 1; j < headings.length; j++) {
      const nxt = headings[j];
      if (nxt.level <= cur.level) {
        cur.charEnd = nxt.charStart;
        cur.lineEnd = Math.max(cur.lineStart, nxt.lineStart - 1);
        break;
      }
    }
  }

  return headings;
}
