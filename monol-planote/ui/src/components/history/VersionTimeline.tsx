import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost } from "../../api/client";
import type { FileVersion, VersionDiff } from "../../api/types";
import { VersionCard } from "./VersionCard";
import { VersionDiffViewer } from "./VersionDiffViewer";
import { RestoreDialog } from "./RestoreDialog";

type Props = {
  filePath: string;
  refreshToken: number;
};

export function VersionTimeline({ filePath, refreshToken }: Props) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [diffData, setDiffData] = useState<VersionDiff | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [restoreVersion, setRestoreVersion] = useState<FileVersion | null>(null);
  const [creating, setCreating] = useState(false);

  const encodedPath = encodeURIComponent(filePath);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setSelectedVersions([]);
      setDiffData(null);
      try {
        const data = await apiGet<FileVersion[]>(`/api/history/file/${encodedPath}`);
        setVersions(data);
      } catch (e: any) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [encodedPath, refreshToken]);

  const handleSelectVersion = (versionId: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(versionId)) {
        return prev.filter((id) => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  useEffect(() => {
    if (selectedVersions.length === 2) {
      const loadDiff = async () => {
        setDiffLoading(true);
        try {
          const [from, to] = selectedVersions;
          const data = await apiGet<VersionDiff>(
            `/api/history/file/${encodedPath}/diff?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
          );
          setDiffData(data);
        } catch (e: any) {
          setError(String(e));
        } finally {
          setDiffLoading(false);
        }
      };
      loadDiff();
    } else if (selectedVersions.length === 1) {
      const loadDiffWithCurrent = async () => {
        setDiffLoading(true);
        try {
          const from = selectedVersions[0];
          const data = await apiGet<VersionDiff>(
            `/api/history/file/${encodedPath}/diff?from=${encodeURIComponent(from)}`
          );
          setDiffData(data);
        } catch (e: any) {
          setError(String(e));
        } finally {
          setDiffLoading(false);
        }
      };
      loadDiffWithCurrent();
    } else {
      setDiffData(null);
    }
  }, [selectedVersions, encodedPath]);

  const handleCreateVersion = async () => {
    setCreating(true);
    try {
      await apiPost(`/api/history/file/${encodedPath}/version`, {});
      const data = await apiGet<FileVersion[]>(`/api/history/file/${encodedPath}`);
      setVersions(data);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreComplete = () => {
    setRestoreVersion(null);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-dark-muted">
        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading versions...
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-dark-border flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-medium text-dark-text truncate">{filePath}</h3>
          <p className="text-xs text-dark-muted mt-0.5">
            {versions.length} version{versions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleCreateVersion}
          disabled={creating}
          className="px-3 py-1.5 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Version"}
        </button>
      </div>

      {/* Instructions */}
      {versions.length > 0 && (
        <div className="p-2 border-b border-dark-border bg-dark-bg/50 text-xs text-dark-muted">
          Select one version to compare with current, or two versions to compare them.
        </div>
      )}

      {/* Timeline + Diff */}
      <div className="flex-1 overflow-hidden flex">
        {/* Version list */}
        <div className="w-80 border-r border-dark-border overflow-auto shrink-0">
          {versions.length === 0 ? (
            <div className="p-4 text-dark-muted text-sm text-center">
              No versions yet. Click "Create Version" to save current state.
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {versions.map((version, idx) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  isSelected={selectedVersions.includes(version.id)}
                  selectionIndex={selectedVersions.indexOf(version.id)}
                  isLatest={idx === 0}
                  onClick={() => handleSelectVersion(version.id)}
                  onRestore={() => setRestoreVersion(version)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Diff viewer */}
        <div className="flex-1 overflow-auto">
          {diffLoading ? (
            <div className="p-4 flex items-center justify-center text-dark-muted">
              <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading diff...
            </div>
          ) : diffData ? (
            <VersionDiffViewer diff={diffData} />
          ) : (
            <div className="h-full flex items-center justify-center text-dark-muted text-sm">
              Select version(s) to view diff
            </div>
          )}
        </div>
      </div>

      {/* Restore Dialog */}
      {restoreVersion && (
        <RestoreDialog
          filePath={filePath}
          version={restoreVersion}
          onClose={() => setRestoreVersion(null)}
          onComplete={handleRestoreComplete}
        />
      )}
    </div>
  );
}
