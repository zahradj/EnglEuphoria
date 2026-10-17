// Resume per lesson, saved on the device. Fails soft: blocked or private storage simply forgets.
import type { EngineState } from '../engine/lessonReducer';

const KEY = 'academy-player-progress-v2';
type Saved = Pick<EngineState, 'index' | 'furthest' | 'results' | 'wrong' | 'xp' | 'gems' | 'doneIds'> & { sceneIds: string[]; at: number };

export function saveProgress(lesson: string, sceneIds: string[], s: EngineState): void {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, Saved>;
    all[lesson] = { index: s.index, furthest: s.furthest, results: s.results, wrong: s.wrong, xp: s.xp, gems: s.gems, doneIds: s.doneIds, sceneIds, at: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* nothing is remembered, nothing breaks */ }
}

/** Saved state for a lesson, or null if none, or if the lesson's scenes changed since (then resume would point at the wrong page). */
export function loadProgress(lesson: string, sceneIds: string[]): Saved | null {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, Saved>;
    const v = all[lesson];
    if (!v || !Array.isArray(v.sceneIds) || v.sceneIds.join('|') !== sceneIds.join('|')) return null;
    return v.index > 0 ? v : null;
  } catch { return null; }
}

export function clearProgress(lesson: string): void {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Record<string, Saved>;
    delete all[lesson];
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}
