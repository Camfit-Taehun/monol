import { useEffect, useRef, useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import DOMPurify from "dompurify";
import type { Heading } from "../api/types";

type Highlight = { start: number; end: number; annotationId: string };

const MARK_START = (id: string) => `[[[PLANOTE_MARK_START:${id}]]]`;
const MARK_END = (id: string) => `[[[PLANOTE_MARK_END:${id}]]]`;

function injectMarks(markdown: string, highlights: Highlight[]): string {
  const hs = [...highlights].sort((a, b) => b.start - a.start); // descending
  let out = markdown;
  for (const h of hs) {
    if (h.start < 0 || h.end > out.length || h.start >= h.end) continue;
    out = out.slice(0, h.end) + MARK_END(h.annotationId) + out.slice(h.end);
    out = out.slice(0, h.start) + MARK_START(h.annotationId) + out.slice(h.start);
  }
  return out;
}

function escapeAttr(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function markdownToSafeHtml(markdown: string): Promise<string> {
  const schema = {
    ...defaultSchema,
    attributes: {
      ...(defaultSchema.attributes || {}),
      mark: ["data-ann"],
      a: ["href", "title", "rel", "target"]
    },
    tagNames: [...(defaultSchema.tagNames || []), "mark"]
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, schema as any)
    .use(rehypeStringify)
    .process(markdown);

  let html = String(file);

  html = html.replace(/\[\[\[PLANOTE_MARK_START:([^\]]+)\]\]\]/g, (_m, id) => `<mark data-ann="${escapeAttr(String(id))}">`);
  html = html.replace(/\[\[\[PLANOTE_MARK_END:([^\]]+)\]\]\]/g, () => `</mark>`);

  html = DOMPurify.sanitize(html, { ADD_TAGS: ["mark"], ADD_ATTR: ["data-ann"] });
  return html;
}

function addHeadingAttributes(html: string, headings: Heading[]): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const els = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  const n = Math.min(els.length, headings.length);

  for (let i = 0; i < n; i++) {
    const el = els[i];
    const id = headings[i].sectionId;
    el.setAttribute("data-section-id", id);
    if (!el.id) el.id = id;
  }

  const out = doc.body.innerHTML;
  return DOMPurify.sanitize(out, { ADD_ATTR: ["data-section-id", "id"], ADD_TAGS: ["mark"] });
}

export function MarkdownPreview(props: {
  markdown: string;
  headings: Heading[];
  highlights: Highlight[];
  onSelection: (quote: string) => void;
  scrollToId: string | null;
}) {
  const [html, setHtml] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const decorated = injectMarks(props.markdown, props.highlights);
    markdownToSafeHtml(decorated)
      .then((h) => setHtml(addHeadingAttributes(h, props.headings)))
      .catch((e) => setHtml(`<pre>${escapeAttr(String(e))}</pre>`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.markdown, JSON.stringify(props.highlights), JSON.stringify(props.headings)]);

  useEffect(() => {
    if (!props.scrollToId) return;
    const el = containerRef.current?.querySelector(`[data-section-id="${CSS.escape(props.scrollToId)}"]`);
    if (el) el.scrollIntoView({ block: "start" });
  }, [props.scrollToId, html]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseUp = () => {
      const sel = window.getSelection();
      const quote = sel?.toString() ?? "";
      const cleaned = quote.trim();
      if (cleaned.length < 1) return;
      props.onSelection(cleaned);
    };

    el.addEventListener("mouseup", onMouseUp);
    return () => el.removeEventListener("mouseup", onMouseUp);
  }, [props.onSelection]);

  return (
    <div style={{ padding: 16 }}>
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
