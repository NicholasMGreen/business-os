import { Handle, Position } from '@xyflow/react';
import { EditableText } from '../EditableText';
import { SectionBlock } from '../SectionBlock';
import { useBoardStore } from '../../store/useBoardStore';
import type { CardData } from '../../types';

interface Props {
  id: string;
  data: CardData;
}

/**
 * A "big note": a free-floating card on the canvas with collapsible
 * dropdown sections of bullet tables — same anatomy as a framework column,
 * but usable as a standalone note.
 */
export function CardNode({ id, data }: Props) {
  const { updateNodeData, addSection, pushHistory } = useBoardStore();

  return (
    <div className={`card-node ${data.collapsed ? 'is-collapsed' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Bottom} id="s" />
      <div className="card-header">
        <button
          type="button"
          className="collapse-btn nodrag"
          title={data.collapsed ? 'Expand note' : 'Collapse note'}
          onClick={(e) => {
            e.stopPropagation();
            updateNodeData(id, { collapsed: !data.collapsed } as Partial<CardData>);
          }}
        >
          {data.collapsed ? '▸' : '▾'}
        </button>
        <EditableText
          className="card-title"
          value={data.title}
          placeholder="BIG NOTE TITLE"
          onChange={(v) => updateNodeData(id, { title: v.toUpperCase() } as Partial<CardData>)}
          onFocusStart={pushHistory}
        />
      </div>

      {!data.collapsed && (
        <>
          <div className="card-objective">
            <EditableText
              className="objective-text"
              value={data.objective}
              placeholder="What is this about?"
              multiline
              commitOnEnter={false}
              onChange={(v) => updateNodeData(id, { objective: v } as Partial<CardData>)}
              onFocusStart={pushHistory}
            />
          </div>

          <div className="section-stack">
            {data.sections.map((sec) => (
              <SectionBlock key={sec.id} nodeId={id} section={sec} />
            ))}
            <button
              type="button"
              className="add-section nodrag"
              onClick={(e) => {
                e.stopPropagation();
                addSection(id);
              }}
            >
              + section
            </button>
          </div>
        </>
      )}
    </div>
  );
}