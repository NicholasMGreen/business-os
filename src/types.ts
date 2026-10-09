// ---------- App icon system ----------

export type AppIconRef =
  | { kind: 'builtin'; slug: string }
  | { kind: 'custom'; name: string; src: string };

/** Where an icon lives: an icon cluster, or a column's Tools box. */
export interface IconLocation {
  scope: 'cluster' | 'tools';
  ownerId: string;
  index: number;
}

// ---------- Node payloads ----------

export interface Section {
  id: string;
  title: string;
  /** 2–3 visual columns of bullet notes */
  columns: string[][];
  collapsed?: boolean;
}

export interface RootData {
  kind: 'root';
  name: string;
  industry: string;
  statement: string;
}

export interface ClusterData {
  kind: 'cluster';
  label: string;
  icons: AppIconRef[];
}

export interface ColumnData {
  kind: 'column';
  title: string;
  objective: string;
  tools: AppIconRef[];
  sections: Section[];
  collapsed?: boolean;
}

export interface NoteData {
  kind: 'note';
  text: string;
}

export type NodePayload = RootData | ClusterData | ColumnData | NoteData;

export type NodeKind = NodePayload['kind'];

// ---------- Board ----------

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface BoardNode {
  id: string;
  type: NodeKind;
  position: { x: number; y: number };
  data: NodePayload;
  width?: number;
  style?: Record<string, unknown>;
}

export interface BoardEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Board {
  id: string;
  name: string;
  nodes: BoardNode[];
  edges: BoardEdge[];
  viewport: Viewport;
}

export interface Snapshot {
  boardId: string;
  nodes: BoardNode[];
  edges: BoardEdge[];
}