import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../api/client";
import type { Cycle } from "../api/types";

export function CyclePanel(props: {
  refreshToken: number;
  activeCycleId: string | null;
  onSelectCycle: (id: string | null) => void;
}) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const reload = () => {
    apiGet<Cycle[]>("/api/cycles?status=open")
      .then((d) => {
        setCycles(d);
        setErr(null);
      })
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.refreshToken]);

  const create = async () => {
    const created = await apiPost<Cycle, any>("/api/cycles", { title: title.trim() || undefined });
    setTitle("");
    props.onSelectCycle(created.id);
    reload();
  };

  const close = async (id: string) => {
    await apiPatch<Cycle, any>(`/api/cycles/${encodeURIComponent(id)}`, { status: "closed" });
    if (props.activeCycleId === id) props.onSelectCycle(null);
    reload();
  };

  return (
    <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Cycles</h3>
      {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New cycle title" />
        <button onClick={create}>New</button>
      </div>

      {cycles.length === 0 ? (
        <p>No open cycles.</p>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {cycles.map((c) => (
            <div key={c.id} style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button
                  onClick={() => props.onSelectCycle(c.id)}
                  style={{
                    background: props.activeCycleId === c.id ? "#eef" : "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <strong>{c.title}</strong>
                </button>
                <button onClick={() => close(c.id)}>Close</button>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{c.annotationIds.length} annotations</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
