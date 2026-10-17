// What the story remembers between lessons, saved on the device ("Previously on…"). Flags only, no student text: the highlight reel is NOT kept here.
// Fails soft: blocked or private storage forgets, and the lobby falls back to the beats that need no flag.
import type { StoryValue } from '../types';

const KEY = 'academy-player-chapters-v2';
type Memory = Record<string, { story: Record<string, StoryValue>; at: number }>;

const read = (): Memory => { try { return JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Memory; } catch { return {}; } };

export function rememberChapter(blueprintId: string, story: Record<string, StoryValue>): void {
  try {
    const all = read();
    all[blueprintId] = { story, at: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* nothing is remembered, nothing breaks */ }
}

/** the story flags remembered from a finished lesson, or null */
export function recallChapter(blueprintId: string): Record<string, StoryValue> | null {
  const v = read()[blueprintId];
  return v && typeof v.story === 'object' ? v.story : null;
}
