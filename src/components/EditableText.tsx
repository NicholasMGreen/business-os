import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  /** Stop Enter from inserting a newline (single-line fields) */
  commitOnEnter?: boolean;
  /** Called once when an edit session begins — used to push a single undo step. */
  onFocusStart?: () => void;
}

/**
 * Inline editor with whiteboard-style semantics:
 *  - single click / drag passes through to the node (select, move),
 *  - double-click enters edit mode (caret at the click point),
 *  - blur or Escape leaves edit mode.
 *
 * contentEditable is uncontrolled to avoid cursor jumps; external value
 * changes (undo/redo, board switch) are written into the DOM explicitly.
 */
export function EditableText({
  value,
  onChange,
  className = '',
  placeholder = '…',
  multiline = false,
  commitOnEnter = true,
  onFocusStart,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  // Last value we emitted to onChange. When the incoming `value` differs from
  // this, the change came from outside (undo/redo, board switch) and must be
  // written into the DOM even while focused.
  const lastEmitted = useRef<string | null>(null);
  const pendingCaret = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastEmitted.current) {
      el.innerText = value;
      lastEmitted.current = value;
    }
  }, [value]);

  // entering edit mode: focus and place the caret where the user double-clicked
  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    const caretPoint = pendingCaret.current;
    pendingCaret.current = null;
    const rangeFromPoint =
      (document as unknown as { caretRangeFromPoint?: (x: number, y: number) => Range | null })
        .caretRangeFromPoint;
    const range =
      caretPoint && rangeFromPoint ? rangeFromPoint.call(document, caretPoint.x, caretPoint.y) : null;
    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (sel) {
      const full = document.createRange();
      full.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(full);
    }
  }, [editing]);

  return (
    <div
      ref={ref}
      className={`editable ${editing ? 'is-editing' : ''} ${className}`}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      onDoubleClick={(e) => {
        e.stopPropagation();
        pendingCaret.current = { x: e.clientX, y: e.clientY };
        if (!editing) {
          onFocusStart?.();
          setEditing(true);
        }
      }}
      onBlur={() => setEditing(false)}
      onInput={(e) => {
        const v = (e.target as HTMLDivElement).innerText;
        lastEmitted.current = v;
        onChange(v);
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter' && (!multiline || commitOnEnter)) {
          e.preventDefault();
          (e.target as HTMLDivElement).blur();
        }
        if (e.key === 'Escape') {
          (e.target as HTMLDivElement).blur();
        }
      }}
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        // while editing, keep pointer events local (caret placement);
        // while not editing, let them through so the node can be dragged
        if (editing) e.stopPropagation();
      }}
    />
  );
}