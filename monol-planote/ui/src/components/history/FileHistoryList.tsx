import { useEffect, useState } from "react";
import { apiGet } from "../../api/client";
import type { FileHistoryInfo } from "../../api/types";

type Props = {
  refreshToken: number;
  selectedFilePath: string | null;
  onSelectFile: (path: string) => void;
};

export function FileHistoryList({ refreshToken, selectedFilePath, onSelectFile }: Props) {
  const [files, setFiles] = useState<FileHistoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<FileHistoryInfo[]>("/api/history/files");
        setFiles(data);
      } catch (e: any) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshToken]);

  const filteredFiles = files.filter((f) =>
    f.filePath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-dark-muted">
        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading...
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
      {/* Search */}
      <div className="p-2 border-b border-dark-border">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter files..."
          className="w-full bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent"
        />
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-4 text-dark-muted text-sm text-center">
            {files.length === 0 ? "No version history yet" : "No files match"}
          </div>
        ) : (
          <div className="p-1">
            {filteredFiles.map((file) => (
              <button
                key={file.filePath}
                onClick={() => onSelectFile(file.filePath)}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                  selectedFilePath === file.filePath
                    ? "bg-dark-accent/20 text-dark-accent"
                    : "hover:bg-dark-hover text-dark-text"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{file.filePath.split("/").pop()}</span>
                  <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                    selectedFilePath === file.filePath
                      ? "bg-dark-accent/30 text-dark-accent"
                      : "bg-dark-bg text-dark-muted"
                  }`}>
                    {file.versionCount}
                  </span>
                </div>
                <div className="text-xs text-dark-muted truncate mt-0.5">
                  {file.filePath}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
