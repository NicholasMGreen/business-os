import type { EdgeProps } from '@xyflow/react';

/**
 * Connector used for the trunk/branch lines: drops from the root, runs along a
 * horizontal trunk, then drops (or rises, for icon clusters) into the target.
 * Auto-follows both nodes when they move.
 */
export function TrunkEdge({ sourceX, sourceY, targetX, targetY, markerEnd, style }: EdgeProps) {
  const midY = sourceY + 90;
  const path = `M ${sourceX} ${sourceY} V ${midY} H ${targetX} V ${targetY}`;

  return (
    <path
      d={path}
      className="trunk-edge"
      markerEnd={markerEnd}
      style={style}
      fill="none"
    />
  );
}