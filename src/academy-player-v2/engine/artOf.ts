import type { LessonScript } from '../types';
import type { ComicScene } from '../scenes/comic/Comic';
import { moduleFor } from '../scenes/registry';
import { castArtOf } from './castArt';

/** Every picture a lesson shows, as 'bg/<id>' or 'cast/<name>/happy' (path under public/academy-art, no extension). Comic plates are listed apart: they must be 16:9. */
export function artOf(s: LessonScript): { all: string[]; comic: string[] } {
  const all = new Set<string>();
  const comic = new Set<string>();
  for (const sc of s.scenes) {
    if (sc.plate) all.add(`bg/${sc.plate}`);
    for (const a of moduleFor(sc.kind)?.art?.(sc) ?? []) all.add(a);
    for (const a of castArtOf(sc)) all.add(a);
    if (sc.kind === 'lobby') for (const c of s.cast) all.add(`cast/${c.toLowerCase()}/happy`);
    if (sc.kind === 'comic') for (const b of (sc as ComicScene).beats) { all.add(`bg/${b.plate}`); comic.add(`bg/${b.plate}`); }
  }
  return { all: [...all].sort(), comic: [...comic].sort() };
}

/** Width and height from a WebP header (VP8, VP8L, VP8X). */
export function webpSize(buf: Uint8Array): { w: number; h: number } | null {
  const tag = (o: number) => String.fromCharCode(buf[o], buf[o + 1], buf[o + 2], buf[o + 3]);
  if (tag(0) !== 'RIFF' || tag(8) !== 'WEBP') return null;
  const t = tag(12);
  const u24 = (o: number) => buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
  if (t === 'VP8X') return { w: u24(24) + 1, h: u24(27) + 1 };
  if (t === 'VP8 ') return { w: (buf[26] | (buf[27] << 8)) & 0x3fff, h: (buf[28] | (buf[29] << 8)) & 0x3fff };
  if (t === 'VP8L') { const b = buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
  return null;
}
