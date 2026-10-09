import { create } from 'zustand';
import type {
  AppIconRef,
  Board,
  BoardEdge,
  BoardNode,
  ColumnData,
  IconLocation,
  NodePayload,
  Section,
  Snapshot,
  Viewport,
} from '../types';
import { clone, uid } from '../utils/id';
import { seedBoards } from '../data/seedBoard';
import { loadPersisted, savePersisted } from './persist';

interface StoreState {
  boards: Board[];
  activeBoardId: string;
  past: Snapshot[];
  future: Snapshot[];

  // history
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // graph
  setNodes: (updater: (nodes: BoardNode[]) => BoardNode[], recordHistory?: boolean) => void;
  setEdges: (updater: (edges: BoardEdge[]) => BoardEdge[], recordHistory?: boolean) => void;
  addEdge: (source: string, target: string) => void;
  setViewport: (viewport: Viewport) => void;

  // nodes
  updateNodeData: (id: string, patch: Partial<NodePayload>) => void;
  addNote: (position: { x: number; y: number }, text?: string) => string;
  addChildNote: (parentId: string) => void;
  duplicateNode: (id: string) => void;
  deleteNode: (id: string) => void;

  // column sections & notes
  addSection: (columnId: string) => void;
  updateSection: (columnId: string, sectionId: string, patch: Partial<Section>) => void;
  removeSection: (columnId: string, sectionId: string) => void;
  addSectionTableColumn: (columnId: string, sectionId: string) => void;
  addBullet: (columnId: string, sectionId: string, colIndex: number) => void;
  updateBullet: (columnId: string, sectionId: string, colIndex: number, bulletIndex: number, text: string) => void;
  removeBullet: (columnId: string, sectionId: string, colIndex: number, bulletIndex: number) => void;

  // icons
  addIcon: (target: Omit<IconLocation, 'index'>, ref: AppIconRef) => void;
  moveIcon: (from: IconLocation, to: Omit<IconLocation, 'index'>) => void;
  removeIcon: (location: IconLocation) => void;

  // boards
  addBoard: () => void;
  renameBoard: (id: string, name: string) => void;
  setActiveBoard: (id: string) => void;
  deleteBoard: (id: string) => void;

  // io
  exportJSON: () => string;
  importJSON: (json: string) => void;
}

function activeBoard(s: StoreState): Board {
  return s.boards.find((b) => b.id === s.activeBoardId) ?? s.boards[0];
}

function withBoards(s: StoreState, board: Board): Board[] {
  return s.boards.map((b) => (b.id === board.id ? board : b));
}

function getColumn(nodes: BoardNode[], id: string): ColumnData | null {
  const node = nodes.find((n) => n.id === id);
  if (node && node.data.kind === 'column') return node.data as ColumnData;
  return null;
}

function iconList(data: NodePayload, scope: IconLocation['scope']): AppIconRef[] | null {
  if (scope === 'cluster' && data.kind === 'cluster') return data.icons;
  if (scope === 'tools' && data.kind === 'column') return data.tools;
  return null;
}

const HISTORY_LIMIT = 60;

const seeded = seedBoards();

export const useBoardStore = create<StoreState>((set, get) => ({
  boards: seeded,
  activeBoardId: seeded[0].id,
  past: [],
  future: [],

  pushHistory: () =>
    set((s) => {
      const board = activeBoard(s);
      const snap: Snapshot = {
        boardId: board.id,
        nodes: clone(board.nodes),
        edges: clone(board.edges),
      };
      return { past: [...s.past.slice(-HISTORY_LIMIT + 1), snap], future: [] };
    }),

  undo: () =>
    set((s) => {
      const snap = s.past[s.past.length - 1];
      if (!snap) return s;
      const board = activeBoard(s);
      const current: Snapshot = {
        boardId: board.id,
        nodes: clone(board.nodes),
        edges: clone(board.edges),
      };
      const restored: Board = { ...board, nodes: clone(snap.nodes), edges: clone(snap.edges) };
      return {
        boards: withBoards(s, restored),
        past: s.past.slice(0, -1),
        future: [current, ...s.future].slice(0, HISTORY_LIMIT),
      };
    }),

  redo: () =>
    set((s) => {
      const snap = s.future[0];
      if (!snap) return s;
      const board = activeBoard(s);
      const current: Snapshot = {
        boardId: board.id,
        nodes: clone(board.nodes),
        edges: clone(board.edges),
      };
      const restored: Board = { ...board, nodes: clone(snap.nodes), edges: clone(snap.edges) };
      return {
        boards: withBoards(s, restored),
        past: [...s.past, current],
        future: s.future.slice(1),
      };
    }),

  setNodes: (updater, recordHistory = false) =>
    set((s) => {
      if (recordHistory) get().pushHistory();
      const board = activeBoard(s);
      const next: Board = { ...board, nodes: updater(clone(board.nodes)) };
      return { boards: withBoards(s, next) };
    }),

  setEdges: (updater, recordHistory = false) =>
    set((s) => {
      if (recordHistory) get().pushHistory();
      const board = activeBoard(s);
      const next: Board = { ...board, edges: updater(clone(board.edges)) };
      return { boards: withBoards(s, next) };
    }),

  addEdge: (source, target) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      if (board.edges.some((e) => e.source === source && e.target === target)) return s;
      const edge: BoardEdge = { id: uid('e'), source, target, type: 'default' };
      return { boards: withBoards(s, { ...board, edges: [...board.edges, edge] }) };
    }),

  setViewport: (viewport) =>
    set((s) => {
      const board = activeBoard(s);
      return { boards: withBoards(s, { ...board, viewport }) };
    }),

  // NOTE: text edits do not push history per keystroke — EditableText calls
  // pushHistory() once when an edit session starts (on focus).
  updateNodeData: (id, patch) =>
    set((s) => {
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } as NodePayload } : n,
      );
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  addNote: (position, text = 'Note') => {
    const id = uid('note');
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const node: BoardNode = { id, type: 'note', position, data: { kind: 'note', text } };
      return { boards: withBoards(s, { ...board, nodes: [...board.nodes, node] }) };
    });
    return id;
  },

  addChildNote: (parentId) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const parent = board.nodes.find((n) => n.id === parentId);
      if (!parent) return s;
      const node: BoardNode = {
        id: uid('note'),
        type: 'note',
        position: { x: parent.position.x + 40, y: parent.position.y + 260 },
        data: { kind: 'note', text: 'New note' },
      };
      const edge: BoardEdge = {
        id: uid('e'),
        source: parentId,
        target: node.id,
        type: 'default',
      };
      return {
        boards: withBoards(s, {
          ...board,
          nodes: [...board.nodes, node],
          edges: [...board.edges, edge],
        }),
      };
    }),

  duplicateNode: (id) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const node = board.nodes.find((n) => n.id === id);
      if (!node) return s;
      const copy: BoardNode = {
        ...clone(node),
        id: uid(node.type),
        position: { x: node.position.x + 60, y: node.position.y + 60 },
      };
      return { boards: withBoards(s, { ...board, nodes: [...board.nodes, copy] }) };
    }),

  deleteNode: (id) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      return {
        boards: withBoards(s, {
          ...board,
          nodes: board.nodes.filter((n) => n.id !== id),
          edges: board.edges.filter((e) => e.source !== id && e.target !== id),
        }),
      };
    }),

  addSection: (columnId) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        const section: Section = {
          id: uid('sec'),
          title: 'New Section',
          columns: [['Bullet point'], ['Bullet point']],
        };
        return { ...n, data: { ...data, sections: [...data.sections, section] } };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  updateSection: (columnId, sectionId, patch) =>
    set((s) => {
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return {
          ...n,
          data: {
            ...data,
            sections: data.sections.map((sec) => (sec.id === sectionId ? { ...sec, ...patch } : sec)),
          },
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  removeSection: (columnId, sectionId) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return { ...n, data: { ...data, sections: data.sections.filter((sec) => sec.id !== sectionId) } };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  addSectionTableColumn: (columnId, sectionId) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return {
          ...n,
          data: {
            ...data,
            sections: data.sections.map((sec) =>
              sec.id === sectionId ? { ...sec, columns: [...sec.columns, ['New note']] } : sec,
            ),
          },
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  addBullet: (columnId, sectionId, colIndex) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return {
          ...n,
          data: {
            ...data,
            sections: data.sections.map((sec) => {
              if (sec.id !== sectionId) return sec;
              const columns = sec.columns.map((col, i) => (i === colIndex ? [...col, 'New note'] : col));
              return { ...sec, columns };
            }),
          },
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  updateBullet: (columnId, sectionId, colIndex, bulletIndex, text) =>
    set((s) => {
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return {
          ...n,
          data: {
            ...data,
            sections: data.sections.map((sec) => {
              if (sec.id !== sectionId) return sec;
              const columns = sec.columns.map((col, i) =>
                i === colIndex ? col.map((b, j) => (j === bulletIndex ? text : b)) : col,
              );
              return { ...sec, columns };
            }),
          },
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  removeBullet: (columnId, sectionId, colIndex, bulletIndex) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== columnId || n.data.kind !== 'column') return n;
        const data = n.data as ColumnData;
        return {
          ...n,
          data: {
            ...data,
            sections: data.sections.map((sec) => {
              if (sec.id !== sectionId) return sec;
              const columns = sec.columns.map((col, i) =>
                i === colIndex ? col.filter((_, j) => j !== bulletIndex) : col,
              );
              return { ...sec, columns };
            }),
          },
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  addIcon: (target, ref) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== target.ownerId) return n;
        const list = iconList(n.data, target.scope);
        if (!list) return n;
        return { ...n, data: { ...n.data, [target.scope === 'cluster' ? 'icons' : 'tools']: [...list, ref] } as NodePayload };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  moveIcon: (from, to) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      let moved: AppIconRef | null = null;
      // remove from source
      let nodes = board.nodes.map((n) => {
        if (n.id !== from.ownerId) return n;
        const list = iconList(n.data, from.scope);
        if (!list || from.index < 0 || from.index >= list.length) return n;
        moved = list[from.index];
        const nextList = list.filter((_, i) => i !== from.index);
        return {
          ...n,
          data: { ...n.data, [from.scope === 'cluster' ? 'icons' : 'tools']: nextList } as NodePayload,
        };
      });
      if (!moved) return s;
      const ref = moved;
      // add to target
      nodes = nodes.map((n) => {
        if (n.id !== to.ownerId) return n;
        const list = iconList(n.data, to.scope);
        if (!list) return n;
        return {
          ...n,
          data: { ...n.data, [to.scope === 'cluster' ? 'icons' : 'tools']: [...list, ref] } as NodePayload,
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  removeIcon: (location) =>
    set((s) => {
      get().pushHistory();
      const board = activeBoard(s);
      const nodes = board.nodes.map((n) => {
        if (n.id !== location.ownerId) return n;
        const list = iconList(n.data, location.scope);
        if (!list) return n;
        return {
          ...n,
          data: {
            ...n.data,
            [location.scope === 'cluster' ? 'icons' : 'tools']: list.filter((_, i) => i !== location.index),
          } as NodePayload,
        };
      });
      return { boards: withBoards(s, { ...board, nodes }) };
    }),

  addBoard: () =>
    set((s) => {
      const board: Board = {
        id: uid('board'),
        name: `Board ${s.boards.length + 1}`,
        nodes: [
          {
            id: uid('root'),
            type: 'root',
            position: { x: -220, y: 0 },
            data: {
              kind: 'root',
              name: 'New Company',
              industry: 'Industry',
              statement: 'Describe the strategy of this company in one or two sentences.',
            },
          },
        ],
        edges: [],
        viewport: { x: 600, y: 300, zoom: 0.8 },
      };
      return { boards: [...s.boards, board], activeBoardId: board.id };
    }),

  renameBoard: (id, name) =>
    set((s) => ({ boards: s.boards.map((b) => (b.id === id ? { ...b, name } : b)) })),

  setActiveBoard: (id) => set({ activeBoardId: id }),

  deleteBoard: (id) =>
    set((s) => {
      if (s.boards.length <= 1) return s;
      const boards = s.boards.filter((b) => b.id !== id);
      return {
        boards,
        activeBoardId: s.activeBoardId === id ? boards[0].id : s.activeBoardId,
      };
    }),

  exportJSON: () => {
    const s = get();
    return JSON.stringify({ boards: s.boards, activeBoardId: s.activeBoardId }, null, 2);
  },

  importJSON: (json) =>
    set((s) => {
      try {
        const parsed = JSON.parse(json) as { boards: Board[]; activeBoardId?: string };
        if (!parsed.boards || !Array.isArray(parsed.boards) || parsed.boards.length === 0) return s;
        return {
          boards: parsed.boards,
          activeBoardId: parsed.activeBoardId ?? parsed.boards[0].id,
          past: [],
          future: [],
        };
      } catch {
        return s;
      }
    }),
}));

// ---------- persistence wiring ----------

const initial = loadPersisted();
if (initial) {
  useBoardStore.setState({
    boards: initial.boards,
    activeBoardId: initial.activeBoardId,
  });
}

useBoardStore.subscribe((s) => {
  savePersisted({ boards: s.boards, activeBoardId: s.activeBoardId });
});

// ---------- selectors / helpers ----------

export function getActiveBoard(s: StoreState): Board {
  return activeBoard(s);
}

export function getNode(s: StoreState, id: string): BoardNode | undefined {
  return activeBoard(s).nodes.find((n) => n.id === id);
}

export type { StoreState };