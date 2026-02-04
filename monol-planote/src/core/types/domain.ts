export type RepoRelativePath = string;

export type Heading = {
  sectionId: string;
  level: number; // 1..6
  title: string;

  lineStart: number; // 1-based
  lineEnd: number; // 1-based inclusive

  charStart: number; // 0-based
  charEnd: number; // 0-based exclusive
};

export type IndexedFile = {
  schemaVersion: 1;
  fileId: string;
  path: RepoRelativePath;
  sha256: string;
  size: number;
  mtimeMs: number;
  headings: Heading[];
};

export type TreeFolderNode = {
  id: string;
  kind: "folder";
  name: string;
  path: RepoRelativePath;
  children: TreeNode[];
};

export type TreeFileNode = {
  id: string;
  kind: "file";
  name: string;
  path: RepoRelativePath;
  children: TreeNode[];
};

export type TreeSectionNode = {
  id: string;
  kind: "section";
  name: string;
  path: RepoRelativePath;
  sectionId: string;
  level: number;
  children?: TreeNode[];
};

export type TreeNode = TreeFolderNode | TreeFileNode | TreeSectionNode;

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;
