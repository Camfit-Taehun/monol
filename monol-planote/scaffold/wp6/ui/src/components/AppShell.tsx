import type { ReactNode } from "react";

export function AppShell(props: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 380px", height: "100vh" }}>
      <div style={{ borderRight: "1px solid #ddd", overflow: "auto" }}>{props.left}</div>
      <div style={{ overflow: "auto" }}>{props.center}</div>
      <div style={{ borderLeft: "1px solid #ddd", overflow: "auto" }}>{props.right}</div>
    </div>
  );
}
