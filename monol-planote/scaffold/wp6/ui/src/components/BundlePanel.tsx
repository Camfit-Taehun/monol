import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";
import type { Bundle } from "../api/types";

export function BundlePanel(props: { refreshToken: number; cycleId: string | null }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [active, setActive] = useState<Bundle | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = () => {
    if (!props.cycleId) {
      setBundles([]);
      setActive(null);
      return;
    }
    apiGet<Bundle[]>(`/api/bundles?cycleId=${encodeURIComponent(props.cycleId)}`)
      .then((d) => {
        setBundles(d);
        setActive(d[0] ?? null);
        setErr(null);
      })
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.refreshToken, props.cycleId]);

  const create = async (format: "json" | "prompt") => {
    if (!props.cycleId) return;
    const created = await apiPost<Bundle, any>("/api/bundles", { cycleId: props.cycleId, format });
    setActive(created);
    reload();
  };

  return (
    <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
      <h3 style={{ marginTop: 0 }}>Bundles</h3>
      {!props.cycleId && <p>Select a cycle.</p>}
      {err && <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>}

      {props.cycleId && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => create("prompt")}>Create Prompt</button>
            <button onClick={() => create("json")}>Create JSON</button>
          </div>

          {bundles.length === 0 ? (
            <p>No bundles yet.</p>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              {bundles.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setActive(b)}
                  style={{ background: active?.id === b.id ? "#eef" : "transparent" }}
                >
                  {b.format} • {b.id.slice(0, 6)}
                </button>
              ))}
            </div>
          )}

          {active && (
            <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
              {active.format === "prompt" ? (
                <pre style={{ whiteSpace: "pre-wrap" }}>{active.prompt}</pre>
              ) : (
                <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(active.json, null, 2)}</pre>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
