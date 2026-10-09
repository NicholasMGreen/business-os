import { useMemo, useState } from 'react';
import { APP_CATEGORIES, APP_LIBRARY } from '../data/appIcons';
import { tileColors } from '../utils/colors';
import type { AppIconRef, IconLocation } from '../types';
import { useBoardStore } from '../store/useBoardStore';

interface Props {
  target: Omit<IconLocation, 'index'>;
  onClose: () => void;
}

/** Searchable picker for built-in app logos + custom image URL. */
export function AppPicker({ target, onClose }: Props) {
  const addIcon = useBoardStore((s) => s.addIcon);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APP_LIBRARY.filter(
      (a) =>
        (!category || a.category === category) &&
        (!q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const commit = (ref: AppIconRef) => {
    addIcon(target, ref);
    onClose();
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal nodrag" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span>ADD APP</span>
          <button type="button" className="ghost-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          autoFocus
          className="modal-input"
          placeholder="Search apps…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <div className="chip-row">
          <button
            type="button"
            className={`chip ${category === null ? 'chip-on' : ''}`}
            onClick={() => setCategory(null)}
          >
            All
          </button>
          {APP_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${category === c ? 'chip-on' : ''}`}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="picker-grid">
          {results.map((a) => {
            const colors = tileColors('#' + a.hex.replace('#', ''));
            return (
              <button
                key={a.slug}
                type="button"
                className="picker-item"
                title={a.name}
                onClick={() => commit({ kind: 'builtin', slug: a.slug })}
              >
                <span className="picker-tile" style={{ background: colors.bg }}>
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path d={a.path} fill={colors.fg} />
                  </svg>
                </span>
                <span>{a.name}</span>
              </button>
            );
          })}
          {results.length === 0 && <div className="picker-empty">No apps match “{query}”</div>}
        </div>

        <div className="custom-row">
          <input
            className="modal-input small"
            placeholder="Custom name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
          <input
            className="modal-input small"
            placeholder="Image URL (.png / .svg)"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && customUrl.trim()) {
                commit({
                  kind: 'custom',
                  name: customName.trim() || 'Custom app',
                  src: customUrl.trim(),
                });
              }
            }}
          />
          <button
            type="button"
            className="ghost-btn"
            disabled={!customUrl.trim()}
            onClick={() =>
              commit({
                kind: 'custom',
                name: customName.trim() || 'Custom app',
                src: customUrl.trim(),
              })
            }
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}