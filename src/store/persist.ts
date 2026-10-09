import type { Board } from '../types';

const KEY = 'business-os:v2';

export interface PersistedState {
  boards: Board[];
  activeBoardId: string;
}

export function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.boards || parsed.boards.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

let timer: ReturnType<typeof setTimeout> | null = null;

export function savePersisted(state: PersistedState): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, 250);
}