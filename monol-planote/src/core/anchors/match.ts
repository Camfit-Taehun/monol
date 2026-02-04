import type { AnchorMatch, QuoteAnchorV1 } from "./types";
import type { Heading } from "../types/domain";

function findAll(haystack: string, needle: string): number[] {
  if (!needle) return [];
  const out: number[] = [];
  let i = 0;
  while (true) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) break;
    out.push(idx);
    i = idx + Math.max(1, needle.length);
  }
  return out;
}

function constrainBySection(markdown: string, occurrences: number[], quoteLen: number, headings: Heading[], sectionId?: string) {
  if (!sectionId) return occurrences;
  const h = headings.find((x) => x.sectionId === sectionId);
  if (!h) return occurrences;
  const start = h.charStart;
  const end = h.charEnd;
  return occurrences.filter((pos) => pos >= start && pos + quoteLen <= end);
}

function constrainByAffixes(markdown: string, occurrences: number[], quoteLen: number, prefix?: string, suffix?: string) {
  if (!prefix && !suffix) return occurrences;
  return occurrences.filter((pos) => {
    const okPrefix = prefix ? markdown.slice(Math.max(0, pos - prefix.length), pos) === prefix : true;
    const okSuffix = suffix ? markdown.slice(pos + quoteLen, pos + quoteLen + suffix.length) === suffix : true;
    return okPrefix && okSuffix;
  });
}

export function matchQuoteAnchor(markdown: string, headings: Heading[], anchor: QuoteAnchorV1): AnchorMatch {
  const quote = anchor.quote;
  const occ = findAll(markdown, quote);
  if (occ.length === 0) return { status: "missing" };
  if (occ.length === 1) return { status: "ok", start: occ[0], end: occ[0] + quote.length };

  const bySection = constrainBySection(markdown, occ, quote.length, headings, anchor.sectionId);
  if (bySection.length === 1) return { status: "ok", start: bySection[0], end: bySection[0] + quote.length };

  const byAffix = constrainByAffixes(markdown, bySection.length > 0 ? bySection : occ, quote.length, anchor.prefix, anchor.suffix);
  if (byAffix.length === 1) return { status: "ok", start: byAffix[0], end: byAffix[0] + quote.length };

  return { status: "ambiguous", candidates: (byAffix.length > 0 ? byAffix : bySection.length > 0 ? bySection : occ).length };
}
