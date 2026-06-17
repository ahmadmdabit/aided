import { DocumentNode } from "./types";

// 1. RECURSIVE SCAN: Matches all Markdown files in all depths of the folder
const rawDocumentModules = import.meta.glob("../../public/documentation/**/*.md");

export const rootNodes: DocumentNode[] = [];
export const FlatDocuments = new Map<string, { filename: string; path: string }>();

// Helper: Formats filenames into clean, title-cased labels
function formatTitle(name: string): string {
  return name
    .replace(/\.md$/, "")
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper: Selects icons based on common names
function getIcon(name: string, isDir: boolean): string {
  if (isDir) return "📁";
  const lower = name.toLowerCase();
  if (lower.includes("readme")) return "📖";
  if (lower.includes("contributing")) return "🤝";
  if (lower.includes("conduct")) return "⚖️";
  if (lower.includes("security")) return "🛡️";
  if (lower.includes("license")) return "📄";
  if (lower.includes("changelog")) return "📋";
  return "📄";
}

const dirMap = new Map<string, DocumentNode>();

// Parse the flat glob matches into a nested directory/file tree
Object.keys(rawDocumentModules).forEach((key) => {
  const relativePath = key.replace(/^\.\.\/\.\.\/public\/documentation\//, "");
  const parts = relativePath.split("/");

  let currentList = rootNodes;
  let currentPathPrefix = "documentation";

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    currentPathPrefix += `/${part}`;

    if (!isLast) {
      // Directory node processing
      const dirKey = currentPathPrefix;
      let dirNode = dirMap.get(dirKey);
      if (!dirNode) {
        dirNode = {
          type: "directory",
          id: dirKey,
          title: formatTitle(part),
          filename: "",
          path: dirKey,
          icon: "📁",
          children: []
        };
        dirMap.set(dirKey, dirNode);
        currentList.push(dirNode);
      }
      currentList = dirNode.children!;
    } else {
      // File node processing
      const id = relativePath.replace(/\.md$/, "");
      const fileNode: DocumentNode = {
        type: "file",
        id: id,
        title: formatTitle(part),
        filename: part,
        path: `documentation/${relativePath}`,
        icon: getIcon(part, false)
      };
      currentList.push(fileNode);
      FlatDocuments.set(id, { filename: part, path: `documentation/${relativePath}` });
    }
  });
});

// Recursively sort directories first, then files alphabetically
function sortNodes(nodes: DocumentNode[]) {
  nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });
  nodes.forEach((node) => {
    if (node.children) sortNodes(node.children);
  });
}
sortNodes(rootNodes);

// Setup default landing route (falls back to first file if README doesn't exist)
const fallbackDocumentId = Array.from(FlatDocuments.keys())[0] || "readme";
const readmeKey = Array.from(FlatDocuments.keys()).find(k => k.toLowerCase() === "core/readme");
export const defaultDocumentId = readmeKey || fallbackDocumentId;
