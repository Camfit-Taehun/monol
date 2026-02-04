import { useState } from "react";
import { FileHistoryList } from "./FileHistoryList";
import { VersionTimeline } from "./VersionTimeline";
import { SnapshotPanel } from "./SnapshotPanel";

type Tab = "files" | "snapshots";

type Props = {
  refreshToken: number;
  onClose: () => void;
};

export function HistoryPanel({ refreshToken, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("files");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-dark-surface border-l border-dark-border">
      {/* Header */}
      <div className="p-3 border-b border-dark-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-medium text-dark-text">History</h2>
        <button
          onClick={onClose}
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

      {/* Tabs */}
      <div className="flex border-b border-dark-border shrink-0">
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "files"
              ? "text-dark-accent border-b-2 border-dark-accent bg-dark-accent/5"
              : "text-dark-muted hover:text-dark-text"
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("snapshots")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "snapshots"
              ? "text-dark-accent border-b-2 border-dark-accent bg-dark-accent/5"
              : "text-dark-muted hover:text-dark-text"
          }`}
        >
          Snapshots
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "files" && (
          <div className="h-full flex">
            <div className="w-64 border-r border-dark-border overflow-auto">
              <FileHistoryList
                refreshToken={refreshToken}
                selectedFilePath={selectedFilePath}
                onSelectFile={setSelectedFilePath}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {selectedFilePath ? (
                <VersionTimeline
                  filePath={selectedFilePath}
                  refreshToken={refreshToken}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-dark-muted text-sm">
                  Select a file to view its history
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "snapshots" && (
          <SnapshotPanel refreshToken={refreshToken} />
        )}
      </div>
    </div>
  );
}
