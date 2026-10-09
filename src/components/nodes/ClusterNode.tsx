import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EditableText } from '../EditableText';
import { AppPicker } from '../AppPicker';
import { IconGrid } from '../Icons';
import { useBoardStore } from '../../store/useBoardStore';
import type { ClusterData } from '../../types';

interface Props {
  id: string;
  data: ClusterData;
}

/** Top-row cluster of app icon tiles with a small category label. */
export function ClusterNode({ id, data }: Props) {
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const pushHistory = useBoardStore((s) => s.pushHistory);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="cluster-node">
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="target" position={Position.Bottom} id="b" />
      <Handle type="source" position={Position.Bottom} id="s" />
      <EditableText
        className="cluster-label"
        value={data.label}
        placeholder="Cluster name"
        onChange={(v) => updateNodeData(id, { label: v } as Partial<ClusterData>)}
        onFocusStart={pushHistory}
      />
      <IconGrid
        icons={data.icons}
        ownerId={id}
        scope="cluster"
        onAdd={() => setPickerOpen(true)}
        size={28}
      />
      {pickerOpen && <AppPicker target={{ scope: 'cluster', ownerId: id }} onClose={() => setPickerOpen(false)} />}
    </div>
  );
}