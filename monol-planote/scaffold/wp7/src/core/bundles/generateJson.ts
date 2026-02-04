import type { Cycle } from "../store/cycles";
import type { Annotation } from "../store/annotations";
import { orderAnnotations } from "./ordering";

export type BundleJson = {
  schemaVersion: 1;
  cycle: Pick<Cycle, "id" | "title" | "status" | "createdAt" | "updatedAt" | "closedAt">;
  annotations: Array<{
    id: string;
    filePath: string;
    target: Annotation["target"];
    title: string;
    body: string;
    type: Annotation["type"];
    status: Annotation["status"];
    priority: Annotation["priority"];
    tags: string[];
    workLinks: Annotation["workLinks"];
    updatedAt: string;
  }>;
};

export function generateBundleJson(cycle: Cycle, annotations: Annotation[]): BundleJson {
  const ordered = orderAnnotations(annotations);
  return {
    schemaVersion: 1,
    cycle: {
      id: cycle.id,
      title: cycle.title,
      status: cycle.status,
      createdAt: cycle.createdAt,
      updatedAt: cycle.updatedAt,
      closedAt: cycle.closedAt
    },
    annotations: ordered.map((a) => ({
      id: a.id,
      filePath: a.filePath,
      target: a.target,
      title: a.title,
      body: a.body,
      type: a.type,
      status: a.status,
      priority: a.priority,
      tags: a.tags,
      workLinks: a.workLinks,
      updatedAt: a.updatedAt
    }))
  };
}
