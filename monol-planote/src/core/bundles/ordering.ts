import type { Annotation } from "../store/annotations";

function prio(p: Annotation["priority"]) {
  return p === "high" ? 3 : p === "medium" ? 2 : 1;
}

export function orderAnnotations(list: Annotation[]): Annotation[] {
  return [...list].sort((a, b) => {
    const pa = prio(a.priority);
    const pb = prio(b.priority);
    if (pa !== pb) return pb - pa;
    if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}
