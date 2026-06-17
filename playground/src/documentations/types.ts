export interface DocumentNode {
  type: "file" | "directory";
  id: string; // Unified path-like ID (e.g. "api/endpoints")
  title: string;
  filename: string;
  path: string;
  icon: string;
  children?: DocumentNode[];
}
