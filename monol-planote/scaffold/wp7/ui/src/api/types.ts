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

export type HighlightMatch = { annotationId: string; start: number; end: number };

export type FileData = { path: string; sha256: string; markdown: string; headings: Heading[]; matches: HighlightMatch[] };


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


export type Cycle = {
  schemaVersion: 1;
  id: string;
  title: string;
  status: "open" | "closed";
  annotationIds: string[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  baseSnapshot: { createdAt: string };
};

export type Bundle =
  | {
      schemaVersion: 1;
      id: string;
      cycleId: string;
      format: "json";
      json: any;
      createdAt: string;
      updatedAt: string;
    }
  | {
      schemaVersion: 1;
      id: string;
      cycleId: string;
      format: "prompt";
      prompt: string;
      createdAt: string;
      updatedAt: string;
    };


export type Revision = {
  schemaVersion: 1;
  id: string;
  cycleId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  baseCommit: string;
  headCommit: string | null;
  headBranch: string | null;
  dirty: boolean | null;
  patch: string;
};

export type DiffData = { revisionId: string; patch: string };
