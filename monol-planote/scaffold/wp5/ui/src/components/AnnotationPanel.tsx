import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../api/client";
import type { Annotation, TreeNode } from "../api/types";

function nodeContext(node: TreeNode | null): { filePath: string | null; sectionId: string | null } {
  if (!node) return { filePath: null, sectionId: null };
  if (node.kind === "file") return { filePath: node.path, sectionId: null };
  if (node.kind === "section") return { filePath: node.path, sectionId: node.sectionId };
  return { filePath: null, sectionId: null };
}

export function AnnotationPanel(props: {
  activeNode: TreeNode | null;
  refreshToken: number;
  onCreated?: (a: Annotation) => void;
}) {
  const ctx = nodeContext(props.activeNode);
  const [list, setList] = useState<Annotation[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const query = useMemo(() => {
    if (!ctx.filePath) return null;
    const qp = new URLSearchParams();
    qp.set("filePath", ctx.filePath);
    if (ctx.sectionId) qp.set("sectionId", ctx.sectionId);
    qp.set("status", "open");
    return `/api/annotations?${qp.toString()}`;
  }, [ctx.filePath, ctx.sectionId]);

  const reload = () => {
    if (!query) {
      setList([]);
      return;
    }
    apiGet<Annotation[]>(query)
      .then((d) => {
        setList(d);
        setErr(null);
      })
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, props.refreshToken]);

  const create = async () => {
    if (!ctx.filePath) return;
    const target =
      props.activeNode?.kind === "section"
        ? { kind: "section" as const, sectionId: props.activeNode.sectionId }
        : { kind: "file" as const };

    const created = await apiPost<Annotation, any>("/api/annotations", {
      filePath: ctx.filePath,
      target,
      title: title.trim() || "(untitled)",
      body,
      type: "todo",
      status: "open",
      priority: "medium",
      tags: [],
      workLinks: []
    });

    setTitle("");
    setBody("");
    props.onCreated?.(created);
    reload();
  };

  const closeAnn = async (id: string) => {
    await apiPatch<Annotation, any>(`/api/annotations/${encodeURIComponent(id)}`, { status: "closed" });
    reload();
  };

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Annotations</h3>

      {!ctx.filePath && <p>Select a file or section.</p>}

      {ctx.filePath && (
        <>
          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body" rows={4} />
            <button onClick={create}>Add</button>
          </div>

          {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

          {list.length === 0 ? (
            <p>No open annotations.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {list.map((a) => (
                <div key={a.id} style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{a.title}</strong>
                    <button onClick={() => closeAnn(a.id)}>Close</button>
                  </div>
                  {a.body && <p style={{ marginBottom: 0 }}>{a.body}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
