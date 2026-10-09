import { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';

export interface MenuState {
  x: number;
  y: number;
  nodeId?: string;
  flowPosition?: { x: number; y: number };
}

/** Minimal right-click menu: node actions, or "add note" on empty canvas. */
export function ContextMenu({ state, onClose }: { state: MenuState; onClose: () => void }) {
  const { addChildNote, duplicateNode, deleteNode, addNote } = useBoardStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <div className="context-menu" style={{ left: state.x, top: state.y }} onMouseLeave={onClose}>
      {state.nodeId ? (
        <>
          <button type="button" onClick={() => run(() => addChildNote(state.nodeId!))}>
            Add child note
          </button>
          <button type="button" onClick={() => run(() => duplicateNode(state.nodeId!))}>
            Duplicate
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => {
              if (confirmDelete) run(() => deleteNode(state.nodeId!));
              else setConfirmDelete(true);
            }}
          >
            {confirmDelete ? 'Click again to delete' : 'Delete'}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() =>
            run(() =>
              addNote(state.flowPosition ?? { x: 0, y: 0 }),
            )
          }
        >
          Add note here
        </button>
      )}
    </div>
  );
}