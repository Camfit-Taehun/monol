import type { Snapshot, SnapshotFileDiff } from "../../api/types";

type Props = {
  snapshot: Snapshot;
  diff: SnapshotFileDiff[];
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusColor(status: SnapshotFileDiff["status"]): string {
  switch (status) {
    case "unchanged":
      return "text-dark-muted";
    case "modified":
      return "text-dark-warning";
    case "deleted":
      return "text-dark-error";
    case "added":
      return "text-dark-success";
    default:
      return "text-dark-text";
  }
}

function getStatusBadge(status: SnapshotFileDiff["status"]): { text: string; className: string } {
  switch (status) {
    case "unchanged":
      return { text: "unchanged", className: "bg-dark-muted/20 text-dark-muted" };
    case "modified":
      return { text: "modified", className: "bg-dark-warning/20 text-dark-warning" };
    case "deleted":
      return { text: "deleted", className: "bg-dark-error/20 text-dark-error" };
    case "added":
      return { text: "added", className: "bg-dark-success/20 text-dark-success" };
    default:
      return { text: status, className: "bg-dark-muted/20 text-dark-muted" };
  }
}

export function SnapshotDiffView({ snapshot, diff }: Props) {
  const unchanged = diff.filter((d) => d.status === "unchanged");
  const modified = diff.filter((d) => d.status === "modified");
  const deleted = diff.filter((d) => d.status === "deleted");
  const added = diff.filter((d) => d.status === "added");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-border shrink-0">
        <h3 className="text-lg font-medium text-dark-text">{snapshot.name}</h3>
        {snapshot.description && (
          <p className="text-sm text-dark-muted mt-1">{snapshot.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-dark-muted">
          <span>{new Date(snapshot.createdAt).toLocaleString()}</span>
          <span>{snapshot.stats.totalFiles} files</span>
          <span>{formatSize(snapshot.stats.totalSize)}</span>
          {snapshot.git && (
            <>
              <span className="text-dark-border">|</span>
              <span className="font-mono">
                {snapshot.git.headBranch || "detached"}{" "}
                {snapshot.git.headCommit?.slice(0, 7)}
                {snapshot.git.dirty && " (dirty)"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-dark-border flex items-center gap-4 text-sm shrink-0">
        <span className="text-dark-muted">Current state:</span>
        <span className="text-dark-muted">{unchanged.length} unchanged</span>
        {modified.length > 0 && (
          <span className="text-dark-warning">{modified.length} modified</span>
        )}
        {deleted.length > 0 && (
          <span className="text-dark-error">{deleted.length} deleted</span>
        )}
        {added.length > 0 && (
          <span className="text-dark-success">{added.length} added</span>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {diff.length === 0 ? (
          <div className="p-4 text-dark-muted text-sm text-center">
            No files in snapshot
          </div>
        ) : (
          <div className="p-2">
            {/* Modified files first */}
            {modified.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-dark-warning uppercase tracking-wider px-2 py-1">
                  Modified ({modified.length})
                </h4>
                {modified.map((f) => (
                  <FileRow key={f.filePath} file={f} />
                ))}
              </div>
            )}

            {/* Deleted files */}
            {deleted.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-dark-error uppercase tracking-wider px-2 py-1">
                  Deleted ({deleted.length})
                </h4>
                {deleted.map((f) => (
                  <FileRow key={f.filePath} file={f} />
                ))}
              </div>
            )}

            {/* Added files */}
            {added.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-dark-success uppercase tracking-wider px-2 py-1">
                  Added ({added.length})
                </h4>
                {added.map((f) => (
                  <FileRow key={f.filePath} file={f} />
                ))}
              </div>
            )}

            {/* Unchanged files */}
            {unchanged.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-dark-muted uppercase tracking-wider px-2 py-1">
                  Unchanged ({unchanged.length})
                </h4>
                {unchanged.map((f) => (
                  <FileRow key={f.filePath} file={f} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FileRow({ file }: { file: SnapshotFileDiff }) {
  const badge = getStatusBadge(file.status);

  return (
    <div className="px-2 py-1.5 flex items-center gap-2 text-sm hover:bg-dark-hover rounded transition-colors">
      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${badge.className}`}>
        {badge.text}
      </span>
      <span className={`truncate ${getStatusColor(file.status)}`}>
        {file.filePath}
      </span>
    </div>
  );
}
