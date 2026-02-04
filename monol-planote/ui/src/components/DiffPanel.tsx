import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost } from "../api/client";
import type { DiffData, Revision } from "../api/types";
import { html as diff2Html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

type ViewMode = "line-by-line" | "side-by-side";

export function DiffPanel(props: { refreshToken: number; cycleId: string | null }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [active, setActive] = useState<Revision | null>(null);
  const [diff, setDiff] = useState<DiffData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("line-by-line");

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

  const diffHtml = useMemo(() => {
    if (!diff?.patch) return "";
    try {
      return diff2Html(diff.patch, {
        drawFileList: false,
        matching: "lines",
        outputFormat: viewMode,
      });
    } catch {
      return "";
    }
  }, [diff?.patch, viewMode]);

  return (
    <div className="bg-dark-surface border-t border-dark-border">
      <div className="p-3 border-b border-dark-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-dark-text m-0">Diffs</h3>
        {props.cycleId && diff && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("line-by-line")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === "line-by-line"
                  ? "bg-dark-accent text-white"
                  : "bg-dark-bg text-dark-muted hover:text-dark-text"
              }`}
            >
              Unified
            </button>
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === "side-by-side"
                  ? "bg-dark-accent text-white"
                  : "bg-dark-bg text-dark-muted hover:text-dark-text"
              }`}
            >
              Split
            </button>
          </div>
        )}
      </div>

      <div className="p-3">
        {!props.cycleId && (
          <p className="text-dark-muted text-sm">Select a cycle.</p>
        )}
        {err && (
          <pre className="text-dark-error text-sm whitespace-pre-wrap">{err}</pre>
        )}

        {props.cycleId && (
          <>
            <button
              onClick={create}
              className="px-3 py-1.5 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors"
            >
              Create Revision
            </button>

            {revisions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {revisions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => open(r)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      active?.id === r.id
                        ? "bg-dark-accent/20 text-dark-accent border border-dark-accent"
                        : "bg-dark-bg text-dark-muted hover:text-dark-text border border-dark-border"
                    }`}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}

            {diff && (
              <div className="mt-3 rounded border border-dark-border overflow-hidden">
                {diffHtml ? (
                  <div
                    className="diff-container"
                    dangerouslySetInnerHTML={{ __html: diffHtml }}
                  />
                ) : (
                  <pre className="p-3 text-sm text-dark-muted whitespace-pre-wrap">
                    {diff.patch || "(no diff)"}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
