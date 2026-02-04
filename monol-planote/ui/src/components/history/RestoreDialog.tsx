import { useState } from "react";
import { apiPost } from "../../api/client";
import type { FileVersion } from "../../api/types";

type Props = {
  filePath: string;
  version: FileVersion;
  onClose: () => void;
  onComplete: () => void;
};

type Mode = "overwrite" | "extract";

export function RestoreDialog({ filePath, version, onClose, onComplete }: Props) {
  const [mode, setMode] = useState<Mode>("overwrite");
  const [extractPath, setExtractPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    setError(null);

    try {
      const body: { mode: Mode; extractPath?: string } = { mode };
      if (mode === "extract") {
        if (!extractPath.trim()) {
          setError("Please enter an extract path");
          setLoading(false);
          return;
        }
        body.extractPath = extractPath;
      }

      const encodedPath = encodeURIComponent(filePath);
      await apiPost(
        `/api/history/file/${encodedPath}/restore?versionId=${encodeURIComponent(version.id)}`,
        body
      );

      setSuccess(true);
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-surface border border-dark-border rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="p-4 border-b border-dark-border flex items-center justify-between">
          <h3 className="text-lg font-medium text-dark-text">Restore Version</h3>
          <button
            onClick={onClose}
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
          {success ? (
            <div className="flex items-center gap-3 text-dark-success">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Version restored successfully!</span>
            </div>
          ) : (
            <>
              {/* File info */}
              <div className="text-sm">
                <p className="text-dark-muted">Restoring version from:</p>
                <p className="text-dark-text font-medium mt-1">
                  {new Date(version.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-dark-muted mt-1 font-mono">
                  {version.contentHash.slice(0, 16)}...
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
                    <p className="text-sm text-dark-text font-medium">Overwrite current file</p>
                    <p className="text-xs text-dark-muted mt-0.5">
                      Replace the current file content with this version
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
                    <p className="text-sm text-dark-text font-medium">Extract to new file</p>
                    <p className="text-xs text-dark-muted mt-0.5">
                      Save this version to a different location
                    </p>
                    {mode === "extract" && (
                      <input
                        type="text"
                        value={extractPath}
                        onChange={(e) => setExtractPath(e.target.value)}
                        placeholder="e.g., plan/restored/spec.md"
                        className="mt-2 w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent"
                      />
                    )}
                  </div>
                </label>
              </div>

              {/* Warning */}
              {mode === "overwrite" && (
                <div className="p-3 bg-dark-warning/10 border border-dark-warning/30 rounded text-sm text-dark-warning">
                  <strong>Warning:</strong> This will overwrite the current file. A new version will be created automatically before restoring.
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
        {!success && (
          <div className="p-4 border-t border-dark-border flex justify-end gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
