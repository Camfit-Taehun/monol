import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPost } from "./api/client";
import type { FileData, TreeData, TreeNode } from "./api/types";
import { AppShell } from "./components/AppShell";
import { PlanTree } from "./components/PlanTree";
import { TopBar } from "./components/TopBar";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { EmptyState } from "./components/EmptyState";
import { AnnotationPanel } from "./components/AnnotationPanel";
import { CyclePanel } from "./components/CyclePanel";
import { BundlePanel } from "./components/BundlePanel";
import { DiffPanel } from "./components/DiffPanel";
import { WorkLinksEditor } from "./components/WorkLinksEditor";


type Highlight = { start: number; end: number; annotationId: string };

function wsUrl(path: string) {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}${path}`;
}

function filterTree(node: any, q: string): any | null {
  if (!q.trim()) return node;
  const query = q.toLowerCase();
  const selfMatch = String(node.name ?? "").toLowerCase().includes(query) || String(node.path ?? "").toLowerCase().includes(query);
  const children = (node.children ?? []).map((c: any) => filterTree(c, q)).filter(Boolean);
  if (selfMatch || children.length > 0) {
    return { ...node, children };
  }
  return null;
}

function computeOwnCounts(annotations: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const a of annotations) {
    const filePath = a.filePath;
    let nodeId: string | null = null;

    if (a.target.kind === "file") nodeId = `node:file:${filePath}`;
    if (a.target.kind === "section") nodeId = `node:section:${filePath}#${a.target.sectionId}`;
    if (a.target.kind === "selection") {
      if (a.target.sectionIdHint) nodeId = `node:section:${filePath}#${a.target.sectionIdHint}`;
      else nodeId = `node:file:${filePath}`;
    }
    if (!nodeId) continue;
    map[nodeId] = (map[nodeId] ?? 0) + 1;
  }
  return map;
}

function computeRollups(node: any, own: Record<string, number>, out: Record<string, number>): number {
  const self = own[node.id] ?? 0;
  let sum = self;
  if (node.children) {
    for (const c of node.children) {
      sum += computeRollups(c, own, out);
    }
  }
  out[node.id] = sum;
  return sum;
}

export default function App() {
  const [tree, setTree] = useState<TreeData | null>(null);
  const [query, setQuery] = useState("");
  const [openAnnotations, setOpenAnnotations] = useState<Annotation[]>([]);
  const [activeNode, setActiveNode] = useState<TreeNode | null>(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [annRefresh, setAnnRefresh] = useState(0);
  const [cycleRefresh, setCycleRefresh] = useState(0);
  const [bundleRefresh, setBundleRefresh] = useState(0);
  const [revRefresh, setRevRefresh] = useState(0);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);

  const reloadOpenAnnotations = useCallback(() => {
    apiGet<Annotation[]>("/api/annotations?status=open")
      .then((d) => setOpenAnnotations(d))
      .catch(() => {});
  }, []);

  const reloadTree = useCallback(() => {
    apiGet<TreeData>("/api/tree")
      .then((d) => {
        setTree(d);
        setErr(null);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  useEffect(() => {
    reloadTree();
    reloadOpenAnnotations();
    const ws = new WebSocket(wsUrl("/api/events"));
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "index:updated") reloadTree();
        if (msg.type === "cycle:changed") setCycleRefresh((n) => n + 1);
        if (msg.type === "bundle:changed") setBundleRefresh((n) => n + 1);
        if (msg.type === "revision:changed") setRevRefresh((n) => n + 1);
        if (msg.type === "annotation:changed") {
          setAnnRefresh((n) => n + 1);
          reloadOpenAnnotations();
          if (activeNode && (activeNode.kind === "file" || activeNode.kind === "section")) {
            apiGet<FileData>(`/api/file?path=${encodeURIComponent(activeNode.path)}`).then(setFile).catch(() => {});
          }
        }
      } catch {
        // ignore
      }
    };
    return () => ws.close();
  }, [reloadTree]);

  const openNode = useCallback((n: TreeNode) => {
    setActiveNode(n);
    if (n.kind === "file" || n.kind === "section") {
      apiGet<FileData>(`/api/file?path=${encodeURIComponent(n.path)}`)
        .then((d) => {
          setFile(d);
          setErr(null);
        })
        .catch((e) => setErr(String(e)));
    }
  }, []);

  const scrollToSectionId = activeNode?.kind === "section" ? activeNode.sectionId : null;

  const highlights: Highlight[] = (file as any)?.matches ?? [];

  const filteredTree = tree?.tree ? filterTree(tree.tree, query) : null;
  const ownCounts = computeOwnCounts(openAnnotations);
  const rollupCounts: Record<string, number> = {};
  if (filteredTree) computeRollups(filteredTree, ownCounts, rollupCounts);


  return (
    <AppShell
      left={(
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <TopBar query={query} onQueryChange={setQuery} />
          <div style={{ flex: 1, overflow: "auto" }}>
            <PlanTree root={filteredTree ?? null} onOpen={openNode} activeNodeId={activeNode?.id ?? null} rollupCounts={rollupCounts} />
          </div>
        </div>
      )}
      center={
        file ? (
          <MarkdownPreview
            markdown={file.markdown}
            headings={file.headings}
            highlights={highlights}
            scrollToId={scrollToSectionId}
            onSelection={async (quote) => {
              if (!file) return;
              const sectionIdHint = activeNode?.kind === "section" ? activeNode.sectionId : undefined;

              // quick create (you can replace this with a nicer modal later)
              const title = quote.length > 60 ? quote.slice(0, 57) + "…" : quote;

              await apiPost<Annotation, any>("/api/annotations", {
                filePath: file.path,
                target: {
                  kind: "selection",
                  sectionIdHint,
                  quote,
                  anchorV1: { strategy: "quote", quote, sectionId: sectionIdHint }
                },
                title: `Selection: ${title}`,
                body: "",
                type: "todo",
                status: "open",
                priority: "medium",
                tags: [],
                workLinks: []
              });
            }}
          />
        ) : (
          <EmptyState title="Open a file or section" body={err ? `Error: ${err}` : "Select from the tree."} />
        )
      }
      right={(
        <div>
          <AnnotationPanel activeNode={activeNode} refreshToken={annRefresh} />
          <CyclePanel refreshToken={cycleRefresh} activeCycleId={activeCycleId} onSelectCycle={setActiveCycleId} />
          <BundlePanel refreshToken={bundleRefresh} cycleId={activeCycleId} />
          <DiffPanel refreshToken={revRefresh} cycleId={activeCycleId} />
          <WorkLinksEditor nodeId={activeNode?.id ?? null} />
        </div>
      )}
    />
  );
}
