import type { AppIconRef, IconLocation } from '../types';
import { findApp } from '../data/appIcons';
import { tileColors } from '../utils/colors';
import { iconLabel, readIconDrag, writeIconDrag } from '../utils/dnd';
import { useBoardStore } from '../store/useBoardStore';

interface TileProps {
  icon: AppIconRef;
  location: IconLocation;
  size?: number;
}

/** A single draggable app-logo tile with brand color, hover name, right-click delete. */
export function IconTile({ icon, location, size = 26 }: TileProps) {
  const removeIcon = useBoardStore((s) => s.removeIcon);
  const app = icon.kind === 'builtin' ? findApp(icon.slug) : null;
  const label = iconLabel(icon);
  const colors = app ? tileColors('#' + app.hex.replace('#', '')) : { bg: '#f4f4f4', fg: '#141414' };

  return (
    <div
      className="icon-tile nodrag"
      style={{ width: size, height: size, background: colors.bg }}
      title={label}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        writeIconDrag(e.dataTransfer, { ref: icon, from: location });
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeIcon(location);
      }}
    >
      {icon.kind === 'custom' ? (
        <img src={icon.src} alt={icon.name} draggable={false} />
      ) : (
        <svg viewBox="0 0 24 24" width={size - 8} height={size - 8} aria-label={label}>
          <path d={app?.path ?? ''} fill={colors.fg} />
        </svg>
      )}
    </div>
  );
}

interface AddTileProps {
  onClick: () => void;
  size?: number;
}

export function AddIconTile({ onClick, size = 26 }: AddTileProps) {
  return (
    <button
      type="button"
      className="icon-tile icon-tile-add nodrag"
      style={{ width: size, height: size }}
      title="Add app"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      +
    </button>
  );
}

interface GridProps {
  icons: AppIconRef[];
  ownerId: string;
  scope: IconLocation['scope'];
  onAdd: () => void;
  size?: number;
}

/**
 * Tight grid of icon tiles that accepts drops from other clusters / Tools boxes.
 * Dropping an icon here re-assigns it to this cluster (or Tools box).
 */
export function IconGrid({ icons, ownerId, scope, onAdd, size = 26 }: GridProps) {
  const moveIcon = useBoardStore((s) => s.moveIcon);

  return (
    <div
      className={`icon-grid ${scope === 'tools' ? 'icon-grid-row' : ''}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('application/x-businessos-icon')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          e.currentTarget.classList.add('drop-hot');
        }
      }}
      onDragLeave={(e) => e.currentTarget.classList.remove('drop-hot')}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drop-hot');
        const payload = readIconDrag(e.dataTransfer);
        if (!payload) return;
        if (payload.from.ownerId === ownerId && payload.from.scope === scope) return;
        moveIcon(payload.from, { scope, ownerId });
      }}
    >
      {icons.map((icon, index) => (
        <IconTile
          key={`${icon.kind}-${icon.kind === 'builtin' ? icon.slug : icon.src}-${index}`}
          icon={icon}
          location={{ scope, ownerId, index }}
          size={size}
        />
      ))}
      <AddIconTile onClick={onAdd} size={size} />
    </div>
  );
}