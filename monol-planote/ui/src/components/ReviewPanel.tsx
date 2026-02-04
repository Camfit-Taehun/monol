import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Annotation, FileData } from "../api/types";

type Props = {
  selectedFiles: string[];
  activeFile: string | null;
  fileContents: Record<string, FileData>;
  annotations: Annotation[];
  pendingFeedback: Record<string, string>;
  onAddFeedback: (filePath: string, lineNumber: number, text: string) => void;
  onCreateAnnotation: (filePath: string, quote: string, comment: string, type: string) => void;
  onFileSelect: (path: string) => void;
};

export function ReviewPanel({
  selectedFiles,
  activeFile,
  fileContents,
  annotations,
  pendingFeedback,
  onAddFeedback,
  onCreateAnnotation,
  onFileSelect,
}: Props) {
  if (selectedFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-dark-border mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-dark-text mb-2">No files selected</h3>
          <p className="text-dark-muted text-sm">
            Select files from the sidebar to start reviewing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-bg overflow-hidden">
      {/* File Tabs */}
      <div className="flex border-b border-dark-border bg-dark-surface overflow-x-auto shrink-0">
        {selectedFiles.map((path) => {
          const fileName = path.split("/").pop();
          const isActive = path === activeFile;
          const fileAnnotations = annotations.filter((a) => a.filePath === path);

          return (
            <button
              key={path}
              onClick={() => onFileSelect(path)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                isActive
                  ? "border-dark-accent text-dark-text bg-dark-bg"
                  : "border-transparent text-dark-muted hover:text-dark-text hover:bg-dark-hover"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{fileName}</span>
              {fileAnnotations.length > 0 && (
                <span className="bg-dark-warning/20 text-dark-warning text-xs px-1.5 rounded">
                  {fileAnnotations.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* File Content */}
      {activeFile && fileContents[activeFile] ? (
        <FileReview
          filePath={activeFile}
          content={fileContents[activeFile]}
          annotations={annotations.filter((a) => a.filePath === activeFile)}
          pendingFeedback={pendingFeedback}
          onAddFeedback={onAddFeedback}
          onCreateAnnotation={onCreateAnnotation}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-dark-muted">Loading file...</div>
        </div>
      )}
    </div>
  );
}

function FileReview({
  filePath,
  content,
  annotations,
  pendingFeedback,
  onAddFeedback,
  onCreateAnnotation,
}: {
  filePath: string;
  content: FileData;
  annotations: Annotation[];
  pendingFeedback: Record<string, string>;
  onAddFeedback: (filePath: string, lineNumber: number, text: string) => void;
  onCreateAnnotation: (filePath: string, quote: string, comment: string, type: string) => void;
}) {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentType, setCommentType] = useState<"todo" | "note" | "question" | "risk">("todo");
  const [activeLineComment, setActiveLineComment] = useState<number | null>(null);
  const [lineCommentInput, setLineCommentInput] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = (e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate popup position with boundary handling
      const popupWidth = 320;
      const popupHeight = 200;
      let x = rect.left + rect.width / 2 - popupWidth / 2;
      let y = rect.bottom + 8;

      // Boundary checks
      if (x < 8) x = 8;
      if (x + popupWidth > window.innerWidth - 8) x = window.innerWidth - popupWidth - 8;
      if (y + popupHeight > window.innerHeight - 8) {
        y = rect.top - popupHeight - 8;
      }

      setSelection({ text: sel.toString(), x, y });
    }
  };

  const handleAddComment = () => {
    if (selection && commentInput.trim()) {
      onCreateAnnotation(filePath, selection.text, commentInput.trim(), commentType);
      setSelection(null);
      setCommentInput("");
      setCommentType("todo");
    }
  };

  const handleAddLineComment = () => {
    if (activeLineComment !== null && lineCommentInput.trim()) {
      onAddFeedback(filePath, activeLineComment, lineCommentInput.trim());
      setActiveLineComment(null);
      setLineCommentInput("");
    }
  };

  const lines = content.markdown.split("\n");

  return (
    <div className="flex-1 overflow-auto">
      {/* Selection Popup */}
      {selection && (
        <div
          className="fixed z-50 bg-dark-surface border border-dark-border rounded-lg shadow-xl p-3 w-80"
          style={{ left: selection.x, top: selection.y }}
        >
          <div className="text-xs text-dark-muted mb-2">Add comment to selection:</div>
          <div className="bg-dark-bg text-dark-text text-sm p-2 rounded mb-2 max-h-20 overflow-auto">
            "{selection.text.slice(0, 100)}{selection.text.length > 100 ? "..." : ""}"
          </div>
          <div className="flex gap-2 mb-2">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value as typeof commentType)}
              className="bg-dark-bg border border-dark-border rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:border-dark-accent"
            >
              <option value="todo">Todo</option>
              <option value="note">Note</option>
              <option value="question">Question</option>
              <option value="risk">Risk</option>
            </select>
          </div>
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Enter your comment..."
            className="w-full bg-dark-bg border border-dark-border rounded p-2 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent resize-none"
            rows={2}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelection(null);
              if (e.key === "Enter" && e.metaKey) handleAddComment();
            }}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setSelection(null)}
              className="flex-1 px-3 py-1.5 text-sm text-dark-muted hover:text-dark-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim()}
              className="flex-1 px-3 py-1.5 text-sm bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors disabled:opacity-50"
            >
              Add Comment
            </button>
          </div>
        </div>
      )}

      {/* Content with Line Numbers */}
      <div className="flex" ref={contentRef} onMouseUp={handleMouseUp}>
        {/* Line Numbers */}
        <div className="shrink-0 bg-dark-surface border-r border-dark-border select-none">
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const feedbackKey = `${filePath}:${lineNum}`;
            const feedbackText = pendingFeedback[feedbackKey];
            const hasFeedback = !!feedbackText;
            const hasAnnotation = annotations.some(
              (a) => a.target.kind === "selection" && content.markdown.indexOf(a.target.quote) !== -1
            );
            const isActive = activeLineComment === lineNum;

            return (
              <div key={i} className="relative">
                <div
                  className={`px-3 py-0.5 text-right text-xs font-mono cursor-pointer transition-colors ${
                    hasFeedback
                      ? "text-dark-warning bg-dark-warning/10"
                      : hasAnnotation
                      ? "text-dark-accent bg-dark-accent/10"
                      : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                  }`}
                  onClick={() => {
                    setActiveLineComment(isActive ? null : lineNum);
                    setLineCommentInput(feedbackText || "");
                  }}
                  title={feedbackText ? `Feedback: ${feedbackText}` : "Click to add comment"}
                >
                  {lineNum}
                  {hasFeedback && (
                    <span className="ml-1 text-dark-warning">*</span>
                  )}
                </div>
                {/* Inline Line Comment Input */}
                {isActive && (
                  <div className="absolute left-full top-0 z-40 bg-dark-surface border border-dark-border rounded-lg shadow-lg p-2 w-64 ml-2">
                    <div className="text-xs text-dark-muted mb-1">Line {lineNum} comment:</div>
                    <textarea
                      value={lineCommentInput}
                      onChange={(e) => setLineCommentInput(e.target.value)}
                      placeholder="Enter feedback..."
                      className="w-full bg-dark-bg border border-dark-border rounded p-2 text-xs text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent resize-none"
                      rows={2}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setActiveLineComment(null);
                          setLineCommentInput("");
                        }
                        if (e.key === "Enter" && e.metaKey) handleAddLineComment();
                      }}
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => {
                          setActiveLineComment(null);
                          setLineCommentInput("");
                        }}
                        className="flex-1 px-2 py-1 text-xs text-dark-muted hover:text-dark-text transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddLineComment}
                        disabled={!lineCommentInput.trim()}
                        className="flex-1 px-2 py-1 text-xs bg-dark-accent text-white rounded hover:bg-dark-accent/90 transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 markdown-content">
          <ReactMarkdown>{content.markdown}</ReactMarkdown>
        </div>

        {/* Annotation Sidebar */}
        <div className="w-64 shrink-0 border-l border-dark-border bg-dark-surface p-3 overflow-auto">
          <div className="text-xs text-dark-muted mb-3 font-medium">ANNOTATIONS</div>
          {annotations.length === 0 ? (
            <div className="text-sm text-dark-muted">
              No annotations yet. Select text to add a comment.
            </div>
          ) : (
            <div className="space-y-3">
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-dark-bg rounded-lg p-3 border border-dark-border"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        ann.type === "todo"
                          ? "bg-dark-accent"
                          : ann.type === "risk"
                          ? "bg-dark-error"
                          : ann.type === "question"
                          ? "bg-dark-warning"
                          : "bg-dark-success"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-dark-text truncate">
                        {ann.title}
                      </div>
                      {ann.body && (
                        <div className="text-xs text-dark-muted mt-1">{ann.body}</div>
                      )}
                      {ann.target.kind === "selection" && (
                        <div className="text-xs text-dark-accent/70 mt-2 italic truncate">
                          "{ann.target.quote.slice(0, 50)}..."
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
