/**
 * Local, honest completion tracking for the public solo library — no
 * fabricated streaks/counters. Just remembers which lesson ids this browser
 * has actually finished, per hub, so the library can show a real "done"
 * badge and progress count. No account or backend needed since the library
 * itself is a public, unauthenticated browse page.
 */
import type { Hub } from './types';

const keyFor = (hub: Hub) => `unified-completed:${hub}`;

export function getCompletedLessonIds(hub: Hub): Set<string> {
  try {
    const raw = localStorage.getItem(keyFor(hub));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markLessonCompleted(hub: Hub, lessonId: string): void {
  try {
    const ids = getCompletedLessonIds(hub);
    ids.add(lessonId);
    localStorage.setItem(keyFor(hub), JSON.stringify(Array.from(ids)));
  } catch {
    // localStorage unavailable (private mode, etc.) — nothing to do
  }
}
