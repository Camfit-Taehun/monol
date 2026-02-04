import { describe, it, expect } from "vitest";
import { parseHeadings } from "../../src/core/indexer/parseHeadings";

describe("WP1 parseHeadings", () => {
  it("detects explicit ids and computes ranges", async () => {
    const md = "# Title\n\n## Alpha {#alpha}\nHello\n\n## Beta\nWorld\n";
    const hs = await parseHeadings(md, "plan/a.md");
    expect(hs.length).toBe(2);
    expect(hs[0].sectionId).toBe("alpha");
    expect(hs[0].title).toBe("Alpha");
    expect(hs[1].title).toBe("Beta");
    expect(hs[0].charStart).toBeLessThan(hs[0].charEnd);
  });
});
