import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "../api/client";
import type { Bundle } from "../api/types";

export function BundlePanel(props: { refreshToken: number; cycleId: string | null }) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [active, setActive] = useState<Bundle | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const getActiveContent = useCallback(() => {
    if (!active) return "";
    return active.format === "prompt"
      ? active.prompt
      : JSON.stringify(active.json, null, 2);
  }, [active]);

  const handleCopy = async () => {
    const content = getActiveContent();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "json" | "md") => {
    const content = getActiveContent();
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bundle-${active?.id.slice(0, 8)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-dark-surface border-t border-dark-border">
      <div className="p-3 border-b border-dark-border">
        <h3 className="text-sm font-medium text-dark-text m-0">Bundles</h3>
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
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => create("prompt")}
                className="px-3 py-1.5 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors"
              >
                Create Prompt
              </button>
              <button
                onClick={() => create("json")}
                className="px-3 py-1.5 text-sm bg-dark-bg text-dark-text border border-dark-border rounded hover:bg-dark-hover transition-colors"
              >
                Create JSON
              </button>
            </div>

            {bundles.length === 0 ? (
              <p className="text-dark-muted text-sm">No bundles yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {bundles.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setActive(b)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      active?.id === b.id
                        ? "bg-dark-accent/20 text-dark-accent border border-dark-accent"
                        : "bg-dark-bg text-dark-muted hover:text-dark-text border border-dark-border"
                    }`}
                  >
                    {b.format} • {b.id.slice(0, 6)}
                  </button>
                ))}
              </div>
            )}

            {active && (
              <div className="border border-dark-border rounded overflow-hidden">
                {/* Action buttons */}
                <div className="flex gap-2 p-2 bg-dark-bg border-b border-dark-border">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-dark-surface text-dark-text border border-dark-border rounded hover:bg-dark-hover transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-dark-success" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload("json")}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-dark-surface text-dark-text border border-dark-border rounded hover:bg-dark-hover transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    JSON
                  </button>
                  <button
                    onClick={() => handleDownload("md")}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs bg-dark-surface text-dark-text border border-dark-border rounded hover:bg-dark-hover transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Markdown
                  </button>
                </div>

                {/* Content */}
                <pre className="p-3 text-xs text-dark-text whitespace-pre-wrap max-h-64 overflow-auto font-mono">
                  {getActiveContent()}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
