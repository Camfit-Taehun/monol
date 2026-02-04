import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api/client";
import type { WorkLink } from "../api/types";

type NodeMeta = {
  schemaVersion: 1;
  nodeId: string;
  workLinks: WorkLink[];
  lastOpenedAt: string | null;
  updatedAt: string;
};

export function WorkLinksEditor(props: { nodeId: string | null }) {
  const [meta, setMeta] = useState<NodeMeta | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [newUrl, setNewUrl] = useState("");
  const [newKind, setNewKind] = useState<WorkLink["kind"]>("url");

  const reload = () => {
    if (!props.nodeId) {
      setMeta(null);
      return;
    }
    apiGet<NodeMeta>(`/api/nodes/meta?nodeId=${encodeURIComponent(props.nodeId)}`)
      .then((d) => {
        setMeta(d);
        setErr(null);
      })
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.nodeId]);

  const add = async () => {
    if (!props.nodeId || !meta) return;
    const url = newUrl.trim();
    if (!url) return;

    const nextLinks: WorkLink[] = [...meta.workLinks, { kind: newKind, url }];
    const next = await apiPatch<NodeMeta, any>(`/api/nodes/meta?nodeId=${encodeURIComponent(props.nodeId)}`, {
      workLinks: nextLinks,
      lastOpenedAt: new Date().toISOString()
    });
    setNewUrl("");
    setMeta(next);
  };

  const remove = async (idx: number) => {
    if (!props.nodeId || !meta) return;
    const nextLinks = meta.workLinks.filter((_, i) => i !== idx);
    const next = await apiPatch<NodeMeta, any>(`/api/nodes/meta?nodeId=${encodeURIComponent(props.nodeId)}`, {
      workLinks: nextLinks
    });
    setMeta(next);
  };

  return (
    <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Work Links</h3>
      {!props.nodeId && <p>Select a node.</p>}
      {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

      {props.nodeId && meta && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <select value={newKind} onChange={(e) => setNewKind(e.target.value as any)}>
              <option value="url">url</option>
              <option value="github">github</option>
              <option value="linear">linear</option>
              <option value="jira">jira</option>
              <option value="notion">notion</option>
              <option value="google-doc">google-doc</option>
              <option value="figma">figma</option>
              <option value="other">other</option>
            </select>
            <input style={{ flex: 1 }} value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://…" />
            <button onClick={add}>Add</button>
          </div>

          {meta.workLinks.length === 0 ? (
            <p>No links.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {meta.workLinks.map((w, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <a href={w.url} target="_blank" rel="noreferrer">
                    [{w.kind}] {w.title ?? w.url}
                  </a>
                  <button onClick={() => remove(idx)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
