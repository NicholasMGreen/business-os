import { getBezierPath, type EdgeProps } from '@xyflow/react';

/**
 * Connector used for the trunk/branch lines: drops from the root,
 * runs along a horizontal trunk, then drops into the column.
 * Auto-follows both nodes when they move.
 */
export function TrunkEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
}: EdgeProps) {
  const goingDown = targetY >= sourceY;
  const midY = goingDown ? sourceY + 90 : sourceY - 90;

  const path = goingDown
    ? `M ${sourceX} ${sourceY} V ${midY} H ${targetX} V ${targetY}`
    : getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      })[0];

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