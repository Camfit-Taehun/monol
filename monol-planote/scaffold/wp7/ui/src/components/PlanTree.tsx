import { useState } from "react";
import type { TreeNode } from "../api/types";

export function PlanTree(props: {
  root: TreeNode | null;
  onOpen: (node: TreeNode) => void;
  activeNodeId: string | null;
  rollupCounts: Record<string, number>;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setCollapsed((m) => ({ ...m, [id]: !m[id] }));

  if (!props.root) return <div style={{ padding: 12 }}>Loading tree…</div>;

  return (
    <div style={{ padding: 8 }}>
      <TreeNodeView
        node={props.root}
        depth={0}
        collapsed={collapsed}
        toggle={toggle}
        onOpen={props.onOpen}
        activeNodeId={props.activeNodeId}
        rollupCounts={props.rollupCounts}
      />
    </div>
  );
}

function Badge(props: { n: number }) {
  return (
    <span
      style={{
        fontSize: 12,
        background: "#333",
        color: "#fff",
        borderRadius: 999,
        padding: "0px 6px",
        lineHeight: "18px"
      }}
      aria-label={`${props.n} open annotations`}
    >
      {props.n}
    </span>
  );
}

function TreeNodeView(props: {
  node: TreeNode;
  depth: number;
  collapsed: Record<string, boolean>;
  toggle: (id: string) => void;
  onOpen: (n: TreeNode) => void;
  activeNodeId: string | null;
  rollupCounts: Record<string, number>;
}) {
  const n: any = props.node;
  const hasChildren = Array.isArray(n.children) && n.children.length > 0;
  const isCollapsed = !!props.collapsed[n.id];

  const indent = { paddingLeft: props.depth * 12, display: "flex", gap: 6, alignItems: "center" };
  const isActive = props.activeNodeId === n.id;

  const count = props.rollupCounts[n.id] ?? 0;

  return (
    <div>
      <div style={indent}>
        {hasChildren ? (
          <button onClick={() => props.toggle(n.id)} aria-label={isCollapsed ? "Expand" : "Collapse"}>
            {isCollapsed ? "▸" : "▾"}
          </button>
        ) : (
          <span style={{ width: 22 }} />
        )}
        <button
          onClick={() => props.onOpen(n)}
          style={{
            textAlign: "left",
            background: isActive ? "#eef" : "transparent",
            border: "none",
            padding: "4px 6px",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8
          }}
        >
          <span>
            {n.kind === "section" ? `${"#".repeat(Math.min(6, Math.max(1, n.level)))} ${n.name}` : n.name}
          </span>
          {count > 0 && <Badge n={count} />}
        </button>
      </div>

      {hasChildren && !isCollapsed && (
        <div>
          {n.children.map((c: TreeNode) => (
            <TreeNodeView
              key={c.id}
              node={c}
              depth={props.depth + 1}
              collapsed={props.collapsed}
              toggle={props.toggle}
              onOpen={props.onOpen}
              activeNodeId={props.activeNodeId}
              rollupCounts={props.rollupCounts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
