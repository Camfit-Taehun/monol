import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import type { DiffData, Revision } from "../api/types";

export function DiffPanel(props: { refreshToken: number; cycleId: string | null }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [active, setActive] = useState<Revision | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => {
    if (!props.cycleId) {
      setRevisions([]);
      setActive(null);
      setDiff(null);
      return;
    }
    apiGet<Revision[]>(`/api/revisions?cycleId=${encodeURIComponent(props.cycleId)}`)
      .then((d) => {
        setRevisions(d);
        const first = d[0] ?? null;
        setActive(first);
        setErr(null);
        if (first) {
          apiGet<DiffData>(`/api/diff?revisionId=${encodeURIComponent(first.id)}`).then(setDiff).catch(() => {});
        } else {
          setDiff(null);
        }
      })
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.refreshToken, props.cycleId]);

  const create = async () => {
    if (!props.cycleId) return;
    const created = await apiPost<Revision, any>("/api/revisions", { cycleId: props.cycleId });
    setActive(created);
    const d = await apiGet<DiffData>(`/api/diff?revisionId=${encodeURIComponent(created.id)}`);
    setDiff(d);
    reload();
  };

  const open = async (r: Revision) => {
    setActive(r);
    const d = await apiGet<DiffData>(`/api/diff?revisionId=${encodeURIComponent(r.id)}`);
    setDiff(d);
  };

  return (
    <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Diffs</h3>
      {!props.cycleId && <p>Select a cycle.</p>}
      {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

      {props.cycleId && (
        <>
          <button onClick={create}>Create Revision</button>

          {revisions.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {revisions.map((r) => (
                <button
                  key={r.id}
                  onClick={() => open(r)}
                  style={{ background: active?.id === r.id ? "#eef" : "transparent" }}
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}

          {diff && (
            <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ddd", borderRadius: 6, padding: 8, marginTop: 8 }}>
              {diff.patch || "(no diff)"}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
