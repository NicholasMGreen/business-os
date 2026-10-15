import { EditableText } from './EditableText';
import { useBoardStore } from '../store/useBoardStore';
import type { Section } from '../types';

/**
 * A collapsible dropdown section: pill header + 2–3 column table of bullet notes.
 * Shared by framework columns and big-note cards.
 */
export function SectionBlock({ nodeId, section }: { nodeId: string; section: Section }) {
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
            updateSection(nodeId, section.id, { collapsed: !collapsed });
          }}
        >
          {collapsed ? '▸' : '▾'}
        </button>
        <EditableText
          className="section-title"
          value={section.title}
          placeholder="Section"
          onChange={(v) => updateSection(nodeId, section.id, { title: v })}
          onFocusStart={pushHistory}
        />
        <button
          type="button"
          className="row-del nodrag"
          title="Delete section"
          onClick={(e) => {
            e.stopPropagation();
            removeSection(nodeId, section.id);
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
                    onChange={(v) => updateBullet(nodeId, section.id, ci, bi, v)}
                    onFocusStart={pushHistory}
                  />
                  <button
                    type="button"
                    className="row-del nodrag"
                    title="Delete note"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBullet(nodeId, section.id, ci, bi);
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
                  addBullet(nodeId, section.id, ci);
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
              addSectionTableColumn(nodeId, section.id);
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}