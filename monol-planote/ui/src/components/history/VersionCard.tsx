import type { FileVersion } from "../../api/types";

type Props = {
  version: FileVersion;
  isSelected: boolean;
  selectionIndex: number;
  isLatest: boolean;
  onClick: () => void;
  onRestore: () => void;
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VersionCard({ version, isSelected, selectionIndex, isLatest, onClick, onRestore }: Props) {
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
        <div className="flex items-center gap-2">
          {/* Selection indicator */}
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
            isSelected
              ? "border-dark-accent bg-dark-accent text-white"
              : "border-dark-border"
          }`}>
            {isSelected ? selectionIndex + 1 : ""}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-text">{formatDate(version.createdAt)}</span>
              {isLatest && (
                <span className="text-xs px-1.5 py-0.5 bg-dark-success/20 text-dark-success rounded">
                  latest
                </span>
              )}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                version.createdBy === "auto"
                  ? "bg-dark-warning/20 text-dark-warning"
                  : "bg-dark-accent/20 text-dark-accent"
              }`}>
                {version.createdBy}
              </span>
            </div>
            <div className="text-xs text-dark-muted mt-1 flex items-center gap-3">
              <span>{version.metadata.lineCount} lines</span>
              <span>{formatSize(version.size)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRestore();
          }}
          className="text-xs text-dark-muted hover:text-dark-accent transition-colors px-2 py-1 rounded hover:bg-dark-accent/10"
        >
          Restore
        </button>
      </div>

      <div className="mt-2 text-xs text-dark-muted font-mono truncate">
        {version.contentHash.slice(0, 12)}...
      </div>
    </div>
  );
}
