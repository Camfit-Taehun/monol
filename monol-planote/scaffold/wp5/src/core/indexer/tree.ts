import path from "node:path";
import type { IndexedFile, TreeNode, TreeFolderNode, TreeFileNode, TreeSectionNode } from "../types/domain";

function folderNode(id: string, name: string, p: string): TreeFolderNode {
  return { id, kind: "folder", name, path: p, children: [] };
}

function fileNode(id: string, name: string, p: string): TreeFileNode {
  return { id, kind: "file", name, path: p, children: [] };
}

function sectionNode(filePath: string, sectionId: string, title: string, level: number): TreeSectionNode {
  return {
    id: `node:section:${filePath}#${sectionId}`,
    kind: "section",
    name: title,
    path: filePath,
    sectionId,
    level,
    children: []
  };
}

export function buildTree(planRootRel: string, indexedFiles: IndexedFile[]): TreeFolderNode {
  const root: TreeFolderNode = folderNode(`node:folder:${planRootRel}`, path.basename(planRootRel), planRootRel);

  const folderMap = new Map<string, TreeFolderNode>();
  folderMap.set(planRootRel, root);

  const ensureFolder = (folderRel: string): TreeFolderNode => {
    if (folderMap.has(folderRel)) return folderMap.get(folderRel)!;
    const parent = path.posix.dirname(folderRel);
    const parentNode = ensureFolder(parent);
    const node = folderNode(`node:folder:${folderRel}`, path.posix.basename(folderRel), folderRel);
    parentNode.children.push(node);
    folderMap.set(folderRel, node);
    return node;
  };

  for (const f of indexedFiles) {
    const dir = path.posix.dirname(f.path);
    const parentFolder = ensureFolder(dir);

    const fn = fileNode(`node:file:${f.path}`, path.posix.basename(f.path), f.path);

    const stack: TreeSectionNode[] = [];

    for (const h of f.headings) {
      const sn = sectionNode(f.path, h.sectionId, h.title, h.level);

      while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
        stack.pop();
      }
      if (stack.length === 0) {
        fn.children.push(sn);
      } else {
        const parent = stack[stack.length - 1];
        parent.children = parent.children ?? [];
        parent.children.push(sn);
      }
      stack.push(sn);
    }

    // Remove empty children arrays to keep payload smaller
    const strip = (n: any): TreeNode => {
      if (n.kind === "section") {
        if (!n.children || n.children.length === 0) delete n.children;
      }
      if (n.children) n.children = n.children.map(strip);
      return n;
    };

    fn.children = fn.children.map(strip);
    parentFolder.children.push(fn);
  }

  const sortFolder = (node: TreeFolderNode) => {
    node.children.sort((a: any, b: any) => {
      if (a.kind !== b.kind) {
        if (a.kind === "folder") return -1;
        if (b.kind === "folder") return 1;
      }
      return a.name.localeCompare(b.name);
    });
    for (const c of node.children) {
      if (c.kind === "folder") sortFolder(c as any);
    }
  };
  sortFolder(root);

  return root;
}
