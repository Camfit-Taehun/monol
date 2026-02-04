import type { SnapshotSummary } from "../../api/types";

type Props = {
  snapshot: SnapshotSummary;
  isSelected: boolean;
  onClick: () => void;
  onRestore: () => void;
  onDelete: () => void;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  });
}

export function SnapshotCard({ snapshot, isSelected, onClick, onRestore, onDelete }: Props) {
  return (
    <div
      className={`p-3 rounded border transition-colors cursor-pointer ${
        isSelected
          ? "border-dark-accent bg-dark-accent/10"
          : "border-dark-border bg-dark-bg hover:border-dark-accent/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-dark-text truncate">
            {snapshot.name}
          </h4>
          <div className="text-xs text-dark-muted mt-1 flex items-center gap-2">
            <span>{formatDate(snapshot.createdAt)}</span>
            <span className="text-dark-border">|</span>
            <span>{snapshot.fileCount} files</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestore();
            }}
            className="p-1.5 text-dark-muted hover:text-dark-accent hover:bg-dark-accent/10 rounded transition-colors"
            title="Restore"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-dark-muted hover:text-dark-error hover:bg-dark-error/10 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
