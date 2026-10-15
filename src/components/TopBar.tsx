import { useRef } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { EditableText } from './EditableText';

/** Minimal top bar: board tabs on the left, board actions on the right. */
export function TopBar() {
  const {
    boards,
    activeBoardId,
    setActiveBoard,
    addBoard,
    renameBoard,
    deleteBoard,
    undo,
    redo,
    addNote,
    addCard,
    exportJSON,
    importJSON,
  } = useBoardStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const board = boards.find((b) => b.id === activeBoardId) ?? boards[0];

  const addNoteAtCenter = () => {
    const vp = board.viewport;
    const x = (window.innerWidth / 2 - vp.x) / vp.zoom - 110;
    const y = (window.innerHeight / 2 - vp.y) / vp.zoom - 40;
    addNote({ x, y });
  };

  const addCardAtCenter = () => {
    const vp = board.viewport;
    const x = (window.innerWidth / 2 - vp.x) / vp.zoom - 280;
    const y = (window.innerHeight / 2 - vp.y) / vp.zoom - 210;
    addCard({ x, y });
  };

  const onExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-os-${board.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => importJSON(String(reader.result));
    reader.readAsText(file);
  };

  return (
    <header className="topbar">
      <div className="tabs">
        {boards.map((b) => (
          <div key={b.id} className={`tab ${b.id === board.id ? 'tab-on' : ''}`}>
            {b.id === board.id ? (
              <EditableText
                className="tab-name"
                value={b.name}
                placeholder="Board name"
                onChange={(v) => renameBoard(b.id, v)}
              />
            ) : (
              <button type="button" className="tab-name tab-switch" onClick={() => setActiveBoard(b.id)}>
                {b.name}
              </button>
            )}
            {boards.length > 1 && (
              <button
                type="button"
                className="tab-close"
                title="Delete board"
                onClick={() => {
                  if (window.confirm(`Delete board “${b.name}”?`)) deleteBoard(b.id);
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button type="button" className="tab-add" title="New board" onClick={addBoard}>
          +
        </button>
      </div>

      <div className="actions">
        <button type="button" className="ghost-btn" title="Undo (Ctrl+Z)" onClick={undo}>
          ↶
        </button>
        <button type="button" className="ghost-btn" title="Redo (Ctrl+Shift+Z)" onClick={redo}>
          ↷
        </button>
        <button type="button" className="ghost-btn" onClick={addNoteAtCenter}>
          + note
        </button>
        <button type="button" className="ghost-btn" onClick={addCardAtCenter}>
          + big note
        </button>
        <button type="button" className="ghost-btn" onClick={onExport}>
          export
        </button>
        <button type="button" className="ghost-btn" onClick={() => fileRef.current?.click()}>
          import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImportFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}