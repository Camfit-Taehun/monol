export type Heading = {
  sectionId: string;
  level: number;
  title: string;
  lineStart: number;
  lineEnd: number;
  charStart: number;
  charEnd: number;
};

export type TreeNode =
  | { id: string; kind: "folder"; name: string; path: string; children: TreeNode[] }
  | { id: string; kind: "file"; name: string; path: string; children: TreeNode[] }
  | { id: string; kind: "section"; name: string; path: string; sectionId: string; level: number; children?: TreeNode[] };

export type TreeData = { planRoot: string; tree: TreeNode };

export type FileData = { path: string; sha256: string; markdown: string; headings: Heading[] };


export type WorkLink = {
  kind: "github" | "linear" | "jira" | "notion" | "google-doc" | "figma" | "url" | "other";
  url: string;
  title?: string;
  meta?: Record<string, any>;
};

export type AnnotationTarget =
  | { kind: "file" }
  | { kind: "section"; sectionId: string }
  | { kind: "selection"; sectionIdHint?: string; quote: string; anchorV1?: any };

export type Annotation = {
  schemaVersion: 1;
  id: string;
  filePath: string;
  target: AnnotationTarget;
  title: string;
  body: string;
  type: "todo" | "note" | "question" | "risk";
  status: "open" | "closed";
  priority: "low" | "medium" | "high";
  tags: string[];
  workLinks: WorkLink[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
