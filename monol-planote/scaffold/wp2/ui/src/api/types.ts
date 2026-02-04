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
