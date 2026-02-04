import { useEffect, useMemo, useState } from "react";
import type { Annotation, TreeData, TreeNode } from "../api/types";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// Highlight matching text component
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-dark-warning/30 text-dark-warning rounded px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

type Props = {
  tree: TreeData | null;
  selectedFiles: Set<string>;
  activeFile: string | null;
  onFileSelect: (node: TreeNode) => void;
  onFileToggle: (path: string) => void;
  onBatchToggle?: (paths: string[], selected: boolean) => void;
  annotations: Annotation[];
  searchInputRef?: React.RefObject<HTMLInputElement>;
  onHistoryClick?: () => void;
};

// Helper to collect all file paths from tree
function collectFilePaths(node: TreeNode): string[] {
  const n = node as any;
  const paths: string[] = [];
  if (n.kind === "file" && n.path) paths.push(n.path);
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      paths.push(...collectFilePaths(child));
    }
  }
  return paths;
}

export function Sidebar({ tree, selectedFiles, activeFile, onFileSelect, onFileToggle, onBatchToggle, annotations, searchInputRef, onHistoryClick }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInAnnotations, setSearchInAnnotations] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [lastSelectedPath, setLastSelectedPath] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Collect all visible file paths for range selection
  const allFilePaths = useMemo(() => {
    if (!tree?.tree) return [];
    return collectFilePaths(tree.tree);
  }, [tree]);

  const getAnnotationCount = (path: string): number => {
    return annotations.filter((a) => a.filePath === path).length;
  };

  const filterNode = useMemo(() => {
    const filter = (node: TreeNode): TreeNode | null => {
      if (!debouncedQuery.trim()) return node;
      const query = debouncedQuery.toLowerCase();

      const n = node as any;
      const selfMatch =
        n.name?.toLowerCase().includes(query) || n.path?.toLowerCase().includes(query);

      // Check if any annotations match the search
      const annotationMatch = searchInAnnotations && annotations.some(
        (a) =>
          a.filePath === n.path &&
          (a.title.toLowerCase().includes(query) || a.body.toLowerCase().includes(query))
      );

      const filteredChildren = (n.children || [])
        .map(filter)
        .filter(Boolean) as TreeNode[];

      if (selfMatch || annotationMatch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren } as any;
      }
      return null;
    };
    return filter;
  }, [debouncedQuery, searchInAnnotations, annotations]);

  const filteredTree = tree?.tree ? filterNode(tree.tree) : null;

  const handleRangeSelect = (path: string, shiftKey: boolean) => {
    if (shiftKey && lastSelectedPath && onBatchToggle) {
      const startIdx = allFilePaths.indexOf(lastSelectedPath);
      const endIdx = allFilePaths.indexOf(path);
      if (startIdx !== -1 && endIdx !== -1) {
        const start = Math.min(startIdx, endIdx);
        const end = Math.max(startIdx, endIdx);
        const rangePaths = allFilePaths.slice(start, end + 1);
        onBatchToggle(rangePaths, true);
        return true;
      }
    }
    setLastSelectedPath(path);
    return false;
  };

  const handleSelectAll = () => {
    if (onBatchToggle && filteredTree) {
      const visiblePaths = collectFilePaths(filteredTree);
      onBatchToggle(visiblePaths, true);
    }
  };

  const handleDeselectAll = () => {
    if (onBatchToggle) {
      onBatchToggle(Array.from(selectedFiles), false);
    }
  };

  return (
    <aside className="w-64 bg-dark-surface border-r border-dark-border flex flex-col shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-dark-border">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files... (press /)"
            className="w-full bg-dark-bg border border-dark-border rounded-md py-1.5 pl-9 pr-8 text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-dark-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-muted hover:text-dark-text"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 mt-2 text-xs text-dark-muted cursor-pointer">
          <input
            type="checkbox"
            checked={searchInAnnotations}
            onChange={(e) => setSearchInAnnotations(e.target.checked)}
            className="w-3 h-3 rounded border-dark-border bg-dark-bg text-dark-accent focus:ring-dark-accent focus:ring-offset-0"
          />
          Search in annotations
        </label>
        {/* Batch actions */}
        {onBatchToggle && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-dark-muted hover:text-dark-text"
            >
              Select all
            </button>
            <span className="text-dark-border">|</span>
            <button
              onClick={handleDeselectAll}
              className="text-xs text-dark-muted hover:text-dark-text"
              disabled={selectedFiles.size === 0}
            >
              Deselect all
            </button>
          </div>
        )}
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        {filteredTree ? (
          <TreeNodeView
            node={filteredTree}
            depth={0}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            selectedFiles={selectedFiles}
            activeFile={activeFile}
            onFileSelect={onFileSelect}
            onFileToggle={onFileToggle}
            onRangeSelect={handleRangeSelect}
            getAnnotationCount={getAnnotationCount}
            searchQuery={debouncedQuery}
          />
        ) : (
          <div className="text-dark-muted text-sm p-2">Loading...</div>
        )}
      </div>

      {/* Selected Files Summary */}
      {selectedFiles.size > 0 && (
        <div className="p-3 border-t border-dark-border">
          <div className="text-xs text-dark-muted mb-2">SELECTED FOR REVIEW</div>
          <div className="space-y-1 max-h-32 overflow-auto">
            {Array.from(selectedFiles).map((path) => (
              <div
                key={path}
                className="flex items-center gap-2 text-sm text-dark-text hover:bg-dark-hover rounded px-2 py-1 cursor-pointer"
                onClick={() => onFileToggle(path)}
              >
                <svg className="w-3 h-3 text-dark-success shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="truncate">{path.split("/").pop()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Button */}
      {onHistoryClick && (
        <div className="p-3 border-t border-dark-border">
          <button
            onClick={onHistoryClick}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-muted hover:text-dark-text hover:bg-dark-hover rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
        </div>
      )}
    </aside>
  );
}

function TreeNodeView({
  node,
  depth,
  collapsed,
  setCollapsed,
  selectedFiles,
  activeFile,
  onFileSelect,
  onFileToggle,
  onRangeSelect,
  getAnnotationCount,
  searchQuery,
}: {
  node: TreeNode;
  depth: number;
  collapsed: Record<string, boolean>;
  setCollapsed: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  selectedFiles: Set<string>;
  activeFile: string | null;
  onFileSelect: (node: TreeNode) => void;
  onFileToggle: (path: string) => void;
  onRangeSelect: (path: string, shiftKey: boolean) => boolean;
  getAnnotationCount: (path: string) => number;
  searchQuery: string;
}) {
  const n = node as any;
  const hasChildren = Array.isArray(n.children) && n.children.length > 0;
  const isCollapsed = collapsed[n.id];
  const isSelected = selectedFiles.has(n.path);
  const isActive = activeFile === n.path;
  const annotationCount = node.kind === "file" ? getAnnotationCount(n.path) : 0;

  const toggle = () => setCollapsed((prev) => ({ ...prev, [n.id]: !prev[n.id] }));

  const getIcon = () => {
    if (node.kind === "folder") {
      return isCollapsed ? (
        <svg className="w-4 h-4 text-dark-muted" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-dark-muted" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    }
    if (node.kind === "file") {
      return (
        <svg className="w-4 h-4 text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-dark-warning" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer transition-colors ${
          isActive ? "bg-dark-accent/20 text-dark-accent" : isSelected ? "bg-dark-hover" : "hover:bg-dark-hover"
        }`}
        style={{ paddingLeft: depth * 12 + 8 }}
        onClick={() => {
          if (node.kind === "folder") {
            toggle();
          } else {
            onFileSelect(node);
          }
        }}
      >
        {/* Checkbox for files */}
        {node.kind === "file" && (
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              // Handle shift+click for range selection
              if (e.shiftKey && onRangeSelect(n.path, true)) {
                return;
              }
              onFileToggle(n.path);
            }}
            onChange={() => {}}
            className="w-3.5 h-3.5 rounded border-dark-border bg-dark-bg text-dark-accent focus:ring-dark-accent focus:ring-offset-0"
          />
        )}

        {/* Icon */}
        <span className="shrink-0" onClick={node.kind === "folder" ? toggle : undefined}>
          {getIcon()}
        </span>

        {/* Name */}
        <span className="truncate text-sm">
          <HighlightText text={n.name} query={searchQuery} />
        </span>

        {/* Annotation badge */}
        {annotationCount > 0 && (
          <span className="ml-auto bg-dark-accent/20 text-dark-accent text-xs px-1.5 py-0.5 rounded-full">
            {annotationCount}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div>
          {n.children.map((child: TreeNode) => (
            <TreeNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              selectedFiles={selectedFiles}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onFileToggle={onFileToggle}
              onRangeSelect={onRangeSelect}
              getAnnotationCount={getAnnotationCount}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
