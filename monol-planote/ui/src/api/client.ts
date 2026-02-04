export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiOk<T> = { ok: true; data: T };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new Error(`${json.error.code}: ${json.error.message}`);
  }
  return json.data;
}

export async function apiPost<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) {
    throw new Error(`${json.error.code}: ${json.error.message}`);
  }
  return json.data;
}

export async function apiPatch<T, B>(path: string, body: B): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) throw new Error(`${json.error.code}: ${json.error.message}`);
  return json.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: "DELETE" });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok) throw new Error(`${json.error.code}: ${json.error.message}`);
  return json.data;
}
