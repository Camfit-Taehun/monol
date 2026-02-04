import { useState } from "react";
import { apiPost } from "../../api/client";
import type { Snapshot } from "../../api/types";

type Props = {
  snapshot: Snapshot;
  onClose: () => void;
  onComplete: () => void;
};

type Mode = "overwrite" | "extract";

export function SnapshotRestoreDialog({ snapshot, onClose, onComplete }: Props) {
  const [mode, setMode] = useState<Mode>("overwrite");
  const [extractDir, setExtractDir] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ restored: number; errors: string[] } | null>(null);

  const handleRestore = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: { mode: Mode; extractDir?: string } = { mode };
      if (mode === "extract") {
        if (!extractDir.trim()) {
          setError("Please enter an extract directory");
          setLoading(false);
          return;
        }
        body.extractDir = extractDir;
      }

      const res = await apiPost<{ restored: number; errors: string[] }, typeof body>(
        `/api/snapshots/${snapshot.id}/restore`,
        body
      );
      setResult(res);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result && result.restored > 0) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-surface border border-dark-border rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-lg font-medium text-dark-text">Restore Snapshot</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-dark-muted hover:text-dark-text transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {result ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-dark-success">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Restored {result.restored} file(s)</span>
              </div>
              {result.errors.length > 0 && (
                <div className="p-3 bg-dark-error/10 border border-dark-error/30 rounded">
                  <p className="text-sm text-dark-error font-medium mb-2">
                    {result.errors.length} error(s):
                  </p>
                  <ul className="text-xs text-dark-error space-y-1">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Snapshot info */}
              <div className="text-sm">
                <p className="text-dark-muted">Restoring snapshot:</p>
                <p className="text-dark-text font-medium mt-1">{snapshot.name}</p>
                <p className="text-xs text-dark-muted mt-1">
                  {snapshot.stats.totalFiles} files |{" "}
                  {new Date(snapshot.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Mode selection */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded border border-dark-border hover:border-dark-accent/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "overwrite"}
                    onChange={() => setMode("overwrite")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm text-dark-text font-medium">Overwrite current files</p>
                    <p className="text-xs text-dark-muted mt-0.5">
                      Replace all files with their snapshot versions
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded border border-dark-border hover:border-dark-accent/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === "extract"}
                    onChange={() => setMode("extract")}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-dark-text font-medium">Extract to directory</p>
                    <p className="text-xs text-dark-muted mt-0.5">
                      Save snapshot files to a different location
                    </p>
                    {mode === "extract" && (
                      <input
                        type="text"
                        value={extractDir}
                        onChange={(e) => setExtractDir(e.target.value)}
                        placeholder="e.g., restored/v1"
                        className="mt-2 w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent"
                      />
                    )}
                  </div>
                </label>
              </div>

              {/* Warning */}
              {mode === "overwrite" && (
                <div className="p-3 bg-dark-warning/10 border border-dark-warning/30 rounded text-sm text-dark-warning">
                  <strong>Warning:</strong> This will overwrite {snapshot.stats.totalFiles} file(s).
                  Current versions will be saved to history before restoring.
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-dark-error/10 border border-dark-error/30 rounded text-sm text-dark-error">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-end gap-2">
          {result ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm text-dark-muted hover:text-dark-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={loading}
                className="px-4 py-2 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Restoring..." : "Restore"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
