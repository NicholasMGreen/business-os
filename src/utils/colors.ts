/** Contrast helpers for rendering brand logos as colorful tiles on a black board. */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function toHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Tile background + glyph color for a brand hex.
 * Near-black brands (Notion, X…) are lifted just enough to stay visible on a
 * black canvas while keeping their identity.
 */
export function tileColors(hex: string): { bg: string; fg: string } {
  const [r, g, b] = parseHex(hex);
  const L = luminance(hex);
  const fg = L > 150 ? '#141414' : '#ffffff';
  if (L < 26) {
    const lift = 26 - L;
    return { bg: toHex(r + lift, g + lift, b + lift), fg: '#ffffff' };
  }
  return { bg: hex, fg };
}

/** Glyph color for a brand logo drawn on the black canvas (no tile fill). */
export function glyphColor(hex: string): string {
  return luminance(hex) > 60 ? hex : '#e8e8e8';
}