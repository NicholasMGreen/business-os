import type { BoardNode, NodeKind } from '../types';

/** Rough render sizes, used to find the nearest node when wiring new notes. */
const SIZE: Record<NodeKind, { w: number; h: number }> = {
  root: { w: 460, h: 130 },
  cluster: { w: 440, h: 130 },
  column: { w: 620, h: 520 },
  note: { w: 240, h: 80 },
  card: { w: 560, h: 420 },
};

function centerOf(node: BoardNode): { x: number; y: number } {
  const s = SIZE[node.type] ?? SIZE.note;
  return { x: node.position.x + s.w / 2, y: node.position.y + s.h / 2 };
}

/**
 * Nearest existing node to a new node's top-left position.
 * Used to auto-connect freshly created notes/cards into the tree.
 */
export function nearestNode(
  nodes: BoardNode[],
  position: { x: number; y: number },
  newKind: NodeKind = 'note',
): BoardNode | null {
  const s = SIZE[newKind] ?? SIZE.note;
  const target = { x: position.x + s.w / 2, y: position.y + s.h / 2 };
  let best: BoardNode | null = null;
  let bestDist = Infinity;
  for (const node of nodes) {
    const c = centerOf(node);
    const dx = c.x - target.x;
    const dy = c.y - target.y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = node;
    }
  }
  return best;
}