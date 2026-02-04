import { describe, it, expect } from "vitest";
import { parseHeadings } from "../../src/core/indexer/parseHeadings";

describe("WP1 parseHeadings", () => {
  it("detects explicit ids and computes ranges", async () => {
    const md = "# Title\n\n## Alpha {#alpha}\nHello\n\n## Beta\nWorld\n";
    const hs = await parseHeadings(md, "plan/a.md");
    expect(hs.length).toBe(3);
    expect(hs[0].title).toBe("Title");
    expect(hs[1].sectionId).toBe("alpha");
    expect(hs[1].title).toBe("Alpha");
    expect(hs[2].title).toBe("Beta");
    expect(hs[1].charStart).toBeLessThan(hs[1].charEnd);
  });

  it("generates auto ids for headings without explicit ids", async () => {
    const md = "# My Heading\n\nSome text.\n";
    const hs = await parseHeadings(md, "plan/test.md");
    expect(hs.length).toBe(1);
    expect(hs[0].sectionId).toMatch(/^h:my-heading:/);
  });

  it("handles nested headings correctly", async () => {
    const md = "# H1\n\n## H2\n\n### H3\n\n## H2b\n";
    const hs = await parseHeadings(md, "plan/nested.md");
    expect(hs.length).toBe(4);
    expect(hs[0].level).toBe(1);
    expect(hs[1].level).toBe(2);
    expect(hs[2].level).toBe(3);
    expect(hs[3].level).toBe(2);
  });
});
