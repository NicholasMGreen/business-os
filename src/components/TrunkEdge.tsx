import type { EdgeProps } from '@xyflow/react';

/**
 * Connector used for the trunk/branch lines: drops from the root, runs along a
 * horizontal trunk, then drops (or rises, for icon clusters) into the target.
 * Auto-follows both nodes when they move.
 */
export function TrunkEdge({ sourceX, sourceY, targetX, targetY, markerEnd, style }: EdgeProps) {
  // Keep a uniform trunk (sourceY + 90) for the big board connectors so all
  // branches share one horizontal line; compress only when the target sits
  // very close below the source (e.g. small notes linked side by side).
  const gap = targetY - sourceY;
  const midY = gap > 24 && gap < 140 ? sourceY + gap / 2 : sourceY + 90;
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