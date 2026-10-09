import { useEffect, useRef } from 'react';

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
 * Lightweight inline editor. Uses contentEditable so text renders as part of the
 * board typography, but stays uncontrolled to avoid cursor jumps.
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
  // Last value we emitted to onChange. When the incoming `value` differs from
  // this, the change came from outside (undo/redo, board switch) and must be
  // written into the DOM even while focused.
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== lastEmitted.current) {
      el.innerText = value;
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      className={`editable ${className}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
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
      onFocus={() => onFocusStart?.()}
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  );
}