import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost, apiPatch } from "./api/client";
import type { Annotation, FileData, TreeData, TreeNode } from "./api/types";
import { Sidebar } from "./components/Sidebar";
import { ReviewPanel } from "./components/ReviewPanel";
import { FeedbackBar } from "./components/FeedbackBar";
import { HistoryPanel } from "./components/history/HistoryPanel";

// Helper to collect all file nodes from tree
function collectFileNodes(node: TreeNode): TreeNode[] {
  const n = node as any;
  const result: TreeNode[] = [];
  if (n.kind === "file") result.push(node);
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      result.push(...collectFileNodes(child));
    }
  }
  return result;
}

function wsUrl(path: string) {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}${path}`;
}

export default function App() {
  const [tree, setTree] = useState<TreeData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, FileData>>({});
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  }, []);

  const reloadTree = useCallback(() => {
    apiGet<TreeData>("/api/tree")
      .then(setTree)
      .catch((err) => {
        console.error(err);
        showError("Failed to load file tree");
      })
      .finally(() => setIsLoading(false));
  }, [showError]);

  const reloadAnnotations = useCallback(() => {
    apiGet<Annotation[]>("/api/annotations?status=open")
      .then(setAnnotations)
      .catch((err) => {
        console.error(err);
        showError("Failed to load annotations");
      });
  }, [showError]);

  useEffect(() => {
    reloadTree();
    reloadAnnotations();

    const ws = new WebSocket(wsUrl("/api/events"));
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "index:updated") reloadTree();
        if (msg.type === "annotation:changed") reloadAnnotations();
        if (msg.type === "history:version:created" || msg.type === "history:snapshot:created" || msg.type === "history:snapshot:deleted") {
          setHistoryRefreshToken((t) => t + 1);
        }
      } catch {}
    };
    return () => ws.close();
  }, [reloadTree, reloadAnnotations]);

  const loadFileRef = useRef<(filePath: string) => Promise<void>>();
  loadFileRef.current = async (filePath: string) => {
    if (fileContents[filePath]) return;
    setLoadingFile(filePath);
    try {
      const data = await apiGet<FileData>(`/api/file?path=${encodeURIComponent(filePath)}`);
      setFileContents((prev) => ({ ...prev, [filePath]: data }));
    } catch (err) {
      console.error(err);
      showError(`Failed to load file: ${filePath.split("/").pop()}`);
    } finally {
      setLoadingFile(null);
    }
  };

  const loadFile = useCallback((filePath: string) => {
    loadFileRef.current?.(filePath);
  }, []);

  const handleFileSelect = useCallback((node: TreeNode) => {
    if (node.kind === "file" || node.kind === "section") {
      setActiveFile(node.path);
      loadFile(node.path);
      setSelectedFiles((prev) => new Set(prev).add(node.path));
    }
  }, [loadFile]);

  const handleFileToggle = (path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
        loadFile(path);
      }
      return next;
    });
  };

  const handleBatchToggle = useCallback((paths: string[], selected: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      for (const p of paths) {
        if (selected) {
          next.add(p);
          loadFile(p);
        } else {
          next.delete(p);
        }
      }
      return next;
    });
  }, [loadFile]);

  const handleAddFeedback = (filePath: string, lineNumber: number, text: string) => {
    const key = `${filePath}:${lineNumber}`;
    setPendingFeedback((prev) => ({ ...prev, [key]: text }));
  };

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSubmitFeedback = async (action: "approve" | "request_changes") => {
    const feedbackEntries = Object.entries(pendingFeedback);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `feedback-${action}-${timestamp}.json`;

    const feedbackData = {
      action,
      timestamp: new Date().toISOString(),
      selectedFiles: Array.from(selectedFiles),
      feedback: feedbackEntries.map(([key, text]) => {
        const [filePath, lineNumber] = key.split(":");
        return { filePath, lineNumber: parseInt(lineNumber, 10), text };
      }),
      annotations: annotations.filter((a) =>
        selectedFiles.has(a.filePath)
      ),
    };

    try {
      await apiPost("/api/feedback", { filename, data: feedbackData });
      setFeedbackMessage(`Feedback saved to .planote/feedback/${filename}`);
      setPendingFeedback({});

      // Clear message after 5 seconds
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error("Failed to save feedback:", err);
      setFeedbackMessage("Failed to save feedback. Check console for details.");
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleCreateAnnotation = async (filePath: string, quote: string, comment: string, type: string = "todo") => {
    await apiPost("/api/annotations", {
      filePath,
      target: {
        kind: "selection",
        quote,
        anchorV1: { strategy: "quote", quote }
      },
      title: comment.slice(0, 60),
      body: comment,
      type: type as "todo" | "note" | "question" | "risk",
      status: "open",
      priority: "medium",
      tags: [],
      workLinks: []
    });
    reloadAnnotations();
  };

  const feedbackCount = Object.keys(pendingFeedback).length;
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Collect all file paths for navigation
  const allFileNodes = useMemo(() => {
    if (!tree?.tree) return [];
    return collectFileNodes(tree.tree);
  }, [tree]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      switch (e.key) {
        case "j": {
          // Move down in file list
          e.preventDefault();
          const currentIndex = allFileNodes.findIndex((n) => (n as any).path === activeFile);
          const nextIndex = currentIndex < allFileNodes.length - 1 ? currentIndex + 1 : 0;
          const nextNode = allFileNodes[nextIndex];
          if (nextNode) {
            handleFileSelect(nextNode);
          }
          break;
        }
        case "k": {
          // Move up in file list
          e.preventDefault();
          const currentIndex = allFileNodes.findIndex((n) => (n as any).path === activeFile);
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : allFileNodes.length - 1;
          const prevNode = allFileNodes[prevIndex];
          if (prevNode) {
            handleFileSelect(prevNode);
          }
          break;
        }
        case "/": {
          // Focus search
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        }
        case "Escape": {
          // Clear selection/close panels
          e.preventDefault();
          break;
        }
        case "?": {
          // Show keyboard shortcuts help
          e.preventDefault();
          alert(
            "Keyboard Shortcuts:\n\n" +
            "j / k - Navigate files\n" +
            "/ - Focus search\n" +
            "Esc - Clear focus\n" +
            "? - Show this help"
          );
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, allFileNodes, handleFileSelect]);

  // Show loading spinner when initially loading
  if (isLoading) {
    return (
      <div className="h-screen bg-dark-bg text-dark-text flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-10 h-10 animate-spin text-dark-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-dark-muted">Loading Planote...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-bg text-dark-text flex flex-col">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-dark-error text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <header className="h-12 bg-dark-surface border-b border-dark-border flex items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-dark-accent" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          <span className="font-semibold text-lg">Planote</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {loadingFile && (
            <div className="flex items-center gap-2 text-dark-muted text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading...</span>
            </div>
          )}
          <span className="text-dark-muted text-sm">
            {selectedFiles.size} files selected
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          tree={tree}
          selectedFiles={selectedFiles}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          onFileToggle={handleFileToggle}
          onBatchToggle={handleBatchToggle}
          annotations={annotations}
          searchInputRef={searchInputRef}
          onHistoryClick={() => setShowHistory(!showHistory)}
        />

        {/* Review Panel */}
        <ReviewPanel
          selectedFiles={Array.from(selectedFiles)}
          activeFile={activeFile}
          fileContents={fileContents}
          annotations={annotations}
          pendingFeedback={pendingFeedback}
          onAddFeedback={handleAddFeedback}
          onCreateAnnotation={handleCreateAnnotation}
          onFileSelect={(path) => setActiveFile(path)}
        />

        {/* History Panel */}
        {showHistory && (
          <div className="w-[600px] shrink-0">
            <HistoryPanel
              refreshToken={historyRefreshToken}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
      </div>

      {/* Feedback Bar */}
      <FeedbackBar
        feedbackCount={feedbackCount}
        onSubmit={handleSubmitFeedback}
        message={feedbackMessage}
      />
    </div>
  );
}
