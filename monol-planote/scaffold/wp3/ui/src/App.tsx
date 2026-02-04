import { useCallback, useEffect, useState } from "react";
import { apiGet } from "./api/client";
import type { FileData, TreeData, TreeNode } from "./api/types";
import { AppShell } from "./components/AppShell";
import { PlanTree } from "./components/PlanTree";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { EmptyState } from "./components/EmptyState";
import { AnnotationPanel } from "./components/AnnotationPanel";

type Highlight = { start: number; end: number; annotationId: string };

function wsUrl(path: string) {
  const proto = location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${location.host}${path}`;
}

export default function App() {
  const [tree, setTree] = useState<TreeData | null>(null);
  const [activeNode, setActiveNode] = useState<TreeNode | null>(null);
  const [file, setFile] = useState<FileData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [annRefresh, setAnnRefresh] = useState(0);

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
    const ws = new WebSocket(wsUrl("/api/events"));
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "index:updated") reloadTree();
        if (msg.type === "annotation:changed") setAnnRefresh((n) => n + 1);
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

  const highlights: Highlight[] = [];

  return (
    <AppShell
      left={<PlanTree root={tree?.tree ?? null} onOpen={openNode} activeNodeId={activeNode?.id ?? null} />}
      center={
        file ? (
          <MarkdownPreview
            markdown={file.markdown}
            headings={file.headings}
            highlights={highlights}
            scrollToId={scrollToSectionId}
            onSelection={(quote) => {
              console.log("Selected quote:", quote);
            }}
          />
        ) : (
          <EmptyState title="Open a file or section" body={err ? `Error: ${err}` : "Select from the tree."} />
        )
      }
      right={<AnnotationPanel activeNode={activeNode} refreshToken={annRefresh} />}
    />
  );
}
