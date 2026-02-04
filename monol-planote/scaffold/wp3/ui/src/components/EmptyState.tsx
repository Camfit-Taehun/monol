export function EmptyState(props: { title: string; body?: string }) {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{props.title}</h2>
      {props.body && <p>{props.body}</p>}
    </div>
  );
}
