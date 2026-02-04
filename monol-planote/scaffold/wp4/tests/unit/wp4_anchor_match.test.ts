import { describe, it, expect } from "vitest";
import { matchQuoteAnchor } from "../../src/core/anchors/match";

describe("WP4 matchQuoteAnchor", () => {
  it("matches unique quote", () => {
    const md = "Hello world\nHello again\n";
    const headings: any[] = [];
    const m = matchQuoteAnchor(md, headings, { strategy: "quote", quote: "world" });
    expect(m.status).toBe("ok");
    if (m.status === "ok") {
      expect(md.slice(m.start, m.end)).toBe("world");
    }
  });

  it("returns ambiguous when multiple", () => {
    const md = "foo bar foo bar";
    const headings: any[] = [];
    const m = matchQuoteAnchor(md, headings, { strategy: "quote", quote: "foo" });
    expect(m.status).toBe("ambiguous");
  });
});
