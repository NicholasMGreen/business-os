import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  /** Stop Enter from inserting a newline (single-line fields) */
  commitOnEnter?: boolean;
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
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerText !== value) {
      el.innerText = value;
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
      onInput={(e) => onChange((e.target as HTMLDivElement).innerText)}
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
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  );
}