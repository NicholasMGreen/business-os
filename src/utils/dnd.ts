import type { AppIconRef, IconLocation } from '../types';
import { findApp } from '../data/appIcons';

export const ICON_DND_MIME = 'application/x-businessos-icon';

export interface IconDragPayload {
  ref: AppIconRef;
  from: IconLocation;
}

export function writeIconDrag(dt: DataTransfer, payload: IconDragPayload): void {
  dt.setData(ICON_DND_MIME, JSON.stringify(payload));
  dt.effectAllowed = 'move';
}

export function readIconDrag(dt: DataTransfer): IconDragPayload | null {
  const raw = dt.getData(ICON_DND_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IconDragPayload;
  } catch {
    return null;
  }
}

export function iconLabel(ref: AppIconRef): string {
  return ref.kind === 'builtin' ? (findApp(ref.slug)?.name ?? ref.slug) : ref.name;
}