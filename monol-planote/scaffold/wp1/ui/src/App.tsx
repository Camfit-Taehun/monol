import { useEffect, useState } from "react";

type ProjectData = {
  projectRoot: string;
  planRoot: string;
  isGitRepo: boolean;
  headBranch: string | null;
  headCommit: string | null;
  dirty: boolean | null;
  schemaVersion: number;
};

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export default function App() {
  const [data, setData] = useState<ProjectData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/project")
      .then((r) => r.json())
      .then((j: ApiResponse<ProjectData>) => {
        if (!j.ok) throw new Error(`${j.error.code}: ${j.error.message}`);
        setData(j.data);
      })
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>Planote</h1>
      {err && <pre>{err}</pre>}
      {!data && !err && <p>Loading…</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
