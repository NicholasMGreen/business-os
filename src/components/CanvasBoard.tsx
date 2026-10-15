import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  useViewport,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type Node,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react';
import { useBoardStore } from '../store/useBoardStore';
import { RootNode } from './nodes/RootNode';
import { ClusterNode } from './nodes/ClusterNode';
import { ColumnNode } from './nodes/ColumnNode';
import { NoteNode } from './nodes/NoteNode';
import { CardNode } from './nodes/CardNode';
import { TrunkEdge } from './TrunkEdge';
import { ContextMenu, type MenuState } from './ContextMenu';

const nodeTypes: NodeTypes = {
  root: RootNode as unknown as NodeTypes[string],
  cluster: ClusterNode as unknown as NodeTypes[string],
  column: ColumnNode as unknown as NodeTypes[string],
  note: NoteNode as unknown as NodeTypes[string],
  card: CardNode as unknown as NodeTypes[string],
};

const edgeTypes: EdgeTypes = {
  trunk: TrunkEdge as unknown as EdgeTypes[string],
};

function ZoomBadge() {
  const { zoom } = useViewport();
  return <div className="zoom-badge">{Math.round(zoom * 100)}%</div>;
}

export function CanvasBoard() {
  const board = useBoardStore((s) => s.boards.find((b) => b.id === s.activeBoardId) ?? s.boards[0]);
  const setNodes = useBoardStore((s) => s.setNodes);
  const setEdges = useBoardStore((s) => s.setEdges);
  const addEdge = useBoardStore((s) => s.addEdge);
  const setViewport = useBoardStore((s) => s.setViewport);
  const pushHistory = useBoardStore((s) => s.pushHistory);
  const addNote = useBoardStore((s) => s.addNote);
  const { screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Double-click on empty canvas → add a connected note.
  // A native capture listener is required: React Flow's d3-zoom stops the
  // dblclick on the pane (its zoom-on-double-click handler), so the event
  // never bubbles up to React.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.classList?.contains('react-flow__pane')) return;
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addNote({ x: pos.x - 110, y: pos.y - 40 });
    };
    el.addEventListener('dblclick', handler, true);
    return () => el.removeEventListener('dblclick', handler, true);
  }, [screenToFlowPosition, addNote]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) pushHistory();
      setNodes((nodes) => applyNodeChanges(changes, nodes as unknown as Node[]) as unknown as typeof nodes);
    },
    [setNodes, pushHistory],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (changes.some((c) => c.type === 'remove')) pushHistory();
      setEdges((edges) => applyEdgeChanges(changes, edges as unknown as Edge[]) as unknown as typeof edges);
    },
    [setEdges, pushHistory],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) addEdge(connection.source, connection.target);
    },
    [addEdge],
  );

  return (
    <div
      className="canvas-wrap"
      ref={wrapRef}
      onPointerDown={(e) => {
        // close the context menu on click outside it (but let its items receive
        // the full mousedown → click sequence)
        if (!(e.target as Element).closest?.('.context-menu')) setMenu(null);
      }}
    >
      <ReactFlow
        key={board.id}
        nodes={board.nodes as unknown as Node[]}
        edges={board.edges as unknown as Edge[]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={() => pushHistory()}
        onMoveEnd={(_, viewport) => setViewport(viewport)}
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          setMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
        }}
        onPaneContextMenu={(e) => {
          e.preventDefault();
          setMenu({
            x: e.clientX,
            y: e.clientY,
            flowPosition: screenToFlowPosition({ x: e.clientX, y: e.clientY }),
          });
        }}
        defaultViewport={board.viewport}
        minZoom={0.1}
        maxZoom={4}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        panOnDrag
        panOnScroll={false}
        selectionKeyCode="Shift"
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <ZoomBadge />
      </ReactFlow>
      {menu && (
        <div ref={menuRef}>
          <ContextMenu state={menu} onClose={() => setMenu(null)} />
        </div>
      )}
    </div>
  );
}