import { useState } from "react";
import { apiPost } from "../../api/client";
import type { Snapshot } from "../../api/types";

type Props = {
  onClose: () => void;
  onComplete: () => void;
};

export function CreateSnapshotDialog({ onClose, onComplete }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPost<Snapshot, { name: string; description?: string }>("/api/snapshots", {
        name: name.trim(),
        description: description.trim() || undefined
      });
      onComplete();
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
          <h3 className="text-lg font-medium text-dark-text">Create Snapshot</h3>
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
          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Name <span className="text-dark-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Before refactoring"
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-text mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded px-3 py-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent resize-none"
            />
          </div>

          <p className="text-xs text-dark-muted">
            A snapshot will save the current state of all markdown files in the plan directory.
          </p>

          {error && (
            <div className="p-3 bg-dark-error/10 border border-dark-error/30 rounded text-sm text-dark-error">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-dark-muted hover:text-dark-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Snapshot"}
          </button>
        </div>
      </div>
    </div>
  );
}
