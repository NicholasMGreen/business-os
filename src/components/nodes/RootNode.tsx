import { EditableText } from '../EditableText';
import { useBoardStore } from '../../store/useBoardStore';
import type { RootData } from '../../types';

interface Props {
  id: string;
  data: RootData;
}

/** Center-top card: asterisk logo + company summary. */
export function RootNode({ id, data }: Props) {
  const updateNodeData = useBoardStore((s) => s.updateNodeData);
  const pushHistory = useBoardStore((s) => s.pushHistory);

  return (
    <div className="root-node">
      <div className="root-logo" aria-hidden>
        ✳
      </div>
      <div className="root-body">
        <EditableText
          className="root-name"
          value={data.name}
          placeholder="Company name"
          onChange={(v) => updateNodeData(id, { name: v } as Partial<RootData>)}
          onFocusStart={pushHistory}
        />
        <EditableText
          className="root-industry"
          value={data.industry}
          placeholder="Industry"
          onChange={(v) => updateNodeData(id, { industry: v } as Partial<RootData>)}
          onFocusStart={pushHistory}
        />
        <EditableText
          className="root-statement"
          value={data.statement}
          placeholder="Strategy statement"
          multiline
          commitOnEnter={false}
          onChange={(v) => updateNodeData(id, { statement: v } as Partial<RootData>)}
          onFocusStart={pushHistory}
        />
      </div>
    </div>
  );
}