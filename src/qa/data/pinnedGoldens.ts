/**
 * User-pinned golden lessons — overrides static GOLDEN_LESSONS at runtime.
 * Stored in localStorage; one pin per (hub, cefr). Pinning replaces the existing pin.
 */
import type { Cefr, GoldenLesson, Hub } from './goldenLessons';

const KEY = 'engl:pinned-goldens:v1';

type Store = Record<string, GoldenLesson>; // key = `${hub}:${cefr}`

function read(): Store {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getPinnedGolden(cefr: Cefr, hub: Hub): GoldenLesson | null {
  return read()[`${hub}:${cefr}`] ?? null;
}

export function pinGolden(g: GoldenLesson): void {
  const s = read();
  s[`${g.hub}:${g.cefr}`] = g;
  write(s);
}

export function unpinGolden(cefr: Cefr, hub: Hub): void {
  const s = read();
  delete s[`${hub}:${cefr}`];
  write(s);
}

export function listPinnedGoldens(): GoldenLesson[] {
  return Object.values(read());
}
