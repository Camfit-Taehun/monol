import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../../api/client";
import type { SnapshotSummary, Snapshot, SnapshotFileDiff } from "../../api/types";
import { SnapshotCard } from "./SnapshotCard";
import { CreateSnapshotDialog } from "./CreateSnapshotDialog";
import { SnapshotRestoreDialog } from "./SnapshotRestoreDialog";
import { SnapshotDiffView } from "./SnapshotDiffView";

type Props = {
  refreshToken: number;
};

export function SnapshotPanel({ refreshToken }: Props) {
  const [snapshots, setSnapshots] = useState<SnapshotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [restoreSnapshot, setRestoreSnapshot] = useState<Snapshot | null>(null);
  const [diffData, setDiffData] = useState<SnapshotFileDiff[] | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);

  const loadSnapshots = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<SnapshotSummary[]>("/api/snapshots");
      setSnapshots(data);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, [refreshToken]);

  const handleSelectSnapshot = async (summary: SnapshotSummary) => {
    try {
      const snapshot = await apiGet<Snapshot>(`/api/snapshots/${summary.id}`);
      setSelectedSnapshot(snapshot);

      setDiffLoading(true);
      const diff = await apiGet<SnapshotFileDiff[]>(`/api/snapshots/${summary.id}/diff`);
      setDiffData(diff);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setDiffLoading(false);
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;

    try {
      await apiDelete(`/api/snapshots/${id}`);
      setSnapshots((prev) => prev.filter((s) => s.id !== id));
      if (selectedSnapshot?.id === id) {
        setSelectedSnapshot(null);
        setDiffData(null);
      }
    } catch (e: any) {
      setError(String(e));
    }
  };

  const handleCreateComplete = () => {
    setShowCreate(false);
    loadSnapshots();
  };

  const handleRestoreComplete = () => {
    setRestoreSnapshot(null);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-dark-muted">
        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading snapshots...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-dark-error text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Snapshot list */}
      <div className="w-80 border-r border-dark-border flex flex-col shrink-0">
        {/* Header */}
        <div className="p-3 border-b border-dark-border flex items-center justify-between shrink-0">
          <span className="text-sm text-dark-muted">
            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="px-3 py-1.5 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors"
          >
            Create
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-2 space-y-2">
          {snapshots.length === 0 ? (
            <div className="p-4 text-dark-muted text-sm text-center">
              No snapshots yet. Create one to save the current state.
            </div>
          ) : (
            snapshots.map((s) => (
              <SnapshotCard
                key={s.id}
                snapshot={s}
                isSelected={selectedSnapshot?.id === s.id}
                onClick={() => handleSelectSnapshot(s)}
                onRestore={() => {
                  apiGet<Snapshot>(`/api/snapshots/${s.id}`).then(setRestoreSnapshot);
                }}
                onDelete={() => handleDeleteSnapshot(s.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail view */}
      <div className="flex-1 overflow-auto">
        {selectedSnapshot && diffData ? (
          <SnapshotDiffView snapshot={selectedSnapshot} diff={diffData} />
        ) : diffLoading ? (
          <div className="h-full flex items-center justify-center text-dark-muted">
            <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-dark-muted text-sm">
            Select a snapshot to view details
          </div>
        )}
      </div>

      {/* Create dialog */}
      {showCreate && (
        <CreateSnapshotDialog
          onClose={() => setShowCreate(false)}
          onComplete={handleCreateComplete}
        />
      )}

      {/* Restore dialog */}
      {restoreSnapshot && (
        <SnapshotRestoreDialog
          snapshot={restoreSnapshot}
          onClose={() => setRestoreSnapshot(null)}
          onComplete={handleRestoreComplete}
        />
      )}
    </div>
  );
}
