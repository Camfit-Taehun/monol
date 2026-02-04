import { useMemo, useState } from "react";
import type { VersionDiff } from "../../api/types";
import { html as diff2Html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";

type ViewMode = "line-by-line" | "side-by-side";

type Props = {
  diff: VersionDiff;
};

export function VersionDiffViewer({ diff }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("line-by-line");

  const diffHtml = useMemo(() => {
    if (!diff.patch) return "";
    try {
      return diff2Html(diff.patch, {
        drawFileList: false,
        matching: "lines",
        outputFormat: viewMode
      });
    } catch {
      return "";
    }
  }, [diff.patch, viewMode]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-dark-border flex items-center justify-between shrink-0">
        <div className="text-sm text-dark-muted">
          {diff.fromVersionId ? (
            <>
              <span className="text-dark-text">{diff.fromVersionId.slice(0, 8)}</span>
              <span className="mx-2">vs</span>
              <span className="text-dark-text">
                {diff.toVersionId ? diff.toVersionId.slice(0, 8) : "current"}
              </span>
            </>
          ) : (
            "Diff"
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("line-by-line")}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === "line-by-line"
                ? "bg-dark-accent text-white"
                : "bg-dark-bg text-dark-muted hover:text-dark-text"
            }`}
          >
            Unified
          </button>
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              viewMode === "side-by-side"
                ? "bg-dark-accent text-white"
                : "bg-dark-bg text-dark-muted hover:text-dark-text"
            }`}
          >
            Split
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="flex-1 overflow-auto">
        {diffHtml ? (
          <div
            className="diff-container"
            dangerouslySetInnerHTML={{ __html: diffHtml }}
          />
        ) : (
          <div className="p-4 text-center text-dark-muted text-sm">
            {diff.patch ? "No changes" : "Unable to generate diff"}
          </div>
        )}
      </div>
    </div>
  );
}
