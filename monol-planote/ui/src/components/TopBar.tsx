export function TopBar(props: { query: string; onQueryChange: (q: string) => void }) {
  return (
    <div style={{ padding: 8, borderBottom: "1px solid #ddd", display: "flex", gap: 8, alignItems: "center" }}>
      <strong>Plan</strong>
      <input
        style={{ flex: 1 }}
        value={props.query}
        onChange={(e) => props.onQueryChange(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}
