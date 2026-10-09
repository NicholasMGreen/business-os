import { Handle, Position } from '@xyflow/react';
import { EditableText } from '../EditableText';
import { useBoardStore } from '../../store/useBoardStore';
import type { NoteData } from '../../types';

interface Props {
  id: string;
  data: NoteData;
}

/** Free-standing note box (double-click the canvas to create one). */
export function NoteNode({ id, data }: Props) {
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const pushHistory = useBoardStore((s) => s.pushHistory);

  return (
    <div className="note-node">
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Bottom} id="s" />
      <EditableText
        className="note-text"
        value={data.text}
        placeholder="Write a note…"
        multiline
        commitOnEnter={false}
        onChange={(v) => updateNodeData(id, { text: v } as Partial<NoteData>)}
        onFocusStart={pushHistory}
      />
    </div>
  );
}