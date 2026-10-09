import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { EditableText } from '../EditableText';
import { AppPicker } from '../AppPicker';
import { IconGrid } from '../Icons';
import { useBoardStore } from '../../store/useBoardStore';
import type { ColumnData, Section } from '../../types';

interface Props {
  id: string;
  data: ColumnData;
}

/**
 * One vertical column of the framework:
 * bracketed title → Tools box + Objective box → stacked sections,
 * each section opening into a 2–3 column table of bullet notes.
 */
export function ColumnNode({ id, data }: Props) {
  const { updateNodeData, addSection, pushHistory } = useBoardStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className={`column-node ${data.collapsed ? 'is-collapsed' : ''}`}>
      <Handle type="target" position={Position.Top} id="t" />
      <Handle type="source" position={Position.Bottom} id="s" />
      <div className="column-header">
        <button
          type="button"
          className="collapse-btn nodrag"
          title={data.collapsed ? 'Expand column' : 'Collapse column'}
          onClick={(e) => {
            e.stopPropagation();
            updateNodeData(id, { collapsed: !data.collapsed } as Partial<ColumnData>);
          }}
        >
          {data.collapsed ? '▸' : '▾'}
        </button>
        <span className="bracket">[</span>
        <EditableText
          className="column-title"
          value={data.title}
          placeholder="COLUMN TITLE"
          onChange={(v) => updateNodeData(id, { title: v.toUpperCase() } as Partial<ColumnData>)}
          onFocusStart={pushHistory}
        />
        <span className="bracket">]</span>
      </div>

      {!data.collapsed && (
        <>
          <div className="column-top">
            <div className="tools-box">
              <div className="box-label">TOOLS</div>
              <IconGrid
                icons={data.tools}
                ownerId={id}
                scope="tools"
                onAdd={() => setPickerOpen(true)}
                size={22}
              />
            </div>
            <div className="objective-box">
              <div className="box-label">OBJECTIVE</div>
              <EditableText
                className="objective-text"
                value={data.objective}
                placeholder="What is this column trying to achieve?"
                multiline
                commitOnEnter={false}
                onChange={(v) => updateNodeData(id, { objective: v } as Partial<ColumnData>)}
                onFocusStart={pushHistory}
              />
            </div>
          </div>

          <div className="section-stack">
            {data.sections.map((sec) => (
              <SectionBlock key={sec.id} columnId={id} section={sec} />
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

      {pickerOpen && (
        <AppPicker target={{ scope: 'tools', ownerId: id }} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}

function SectionBlock({ columnId, section }: { columnId: string; section: Section }) {
  const {
    updateSection,
    removeSection,
    addSectionTableColumn,
    addBullet,
    updateBullet,
    removeBullet,
    pushHistory,
  } = useBoardStore();
  const collapsed = !!section.collapsed;

  return (
    <div className={`section ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="section-pill">
        <button
          type="button"
          className="collapse-btn nodrag"
          title={collapsed ? 'Expand section' : 'Collapse section'}
          onClick={(e) => {
            e.stopPropagation();
            updateSection(columnId, section.id, { collapsed: !collapsed });
          }}
        >
          {collapsed ? '▸' : '▾'}
        </button>
        <EditableText
          className="section-title"
          value={section.title}
          placeholder="Section"
          onChange={(v) => updateSection(columnId, section.id, { title: v })}
          onFocusStart={pushHistory}
        />
        <button
          type="button"
          className="row-del nodrag"
          title="Delete section"
          onClick={(e) => {
            e.stopPropagation();
            removeSection(columnId, section.id);
          }}
        >
          ✕
        </button>
      </div>

      {!collapsed && (
        <div className="section-table">
          {section.columns.map((col, ci) => (
            <div className="section-col" key={ci}>
              {col.map((bullet, bi) => (
                <div className="bullet-row" key={bi}>
                  <span className="bullet-dot">•</span>
                  <EditableText
                    className="bullet-text"
                    value={bullet}
                    placeholder="Note"
                    onChange={(v) => updateBullet(columnId, section.id, ci, bi, v)}
                    onFocusStart={pushHistory}
                  />
                  <button
                    type="button"
                    className="row-del nodrag"
                    title="Delete note"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBullet(columnId, section.id, ci, bi);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-row nodrag"
                onClick={(e) => {
                  e.stopPropagation();
                  addBullet(columnId, section.id, ci);
                }}
              >
                + note
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-col nodrag"
            title="Add table column"
            onClick={(e) => {
              e.stopPropagation();
              addSectionTableColumn(columnId, section.id);
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}