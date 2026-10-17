// Academy twin of the Playground lesson checklist's activity log (owner 2026-10-15: "do the same in the Academy classroom").
// In a LIVE class the student's deck saves one row per activity into `quiz_responses`; the teacher's classroom pop-up and the
// end-of-class report turn those rows into suggested marks for the lesson's success criteria. The teacher can change every mark.
import type { Slide } from '../types';
import type { Mark } from '../../curriculum/academy';

/** skill_tag = "acd:<criteria this slide trains, comma separated>"; selected_option_id = "w<wrong tries>"; is_correct = won. */
export const AC_TAG_PREFIX = 'acd:';
export const acTag = (s: Pick<Slide, 'trains'>) => `${AC_TAG_PREFIX}${(s.trains ?? []).join(',')}`;
export const acWrongTag = (wrong: number) => `w${Math.max(0, Math.round(wrong))}`;

export interface ActivityRow { slide_id: string; is_correct: boolean | null; selected_option_id: string | null; skill_tag: string | null }

/** Slides that never ask anything are not logged. */
export const isLoggedSlide = (s: Slide): boolean => !['title', 'brief', 'dial', 'wrap', 'story', 'model', 'teach', 'rule'].includes(s.kind) && (s.trains?.length ?? 0) > 0;

/**
 * One mark per criterion (1-based `trains`): every logged page that trains it was won first try = nailed; some were won but with
 * wrong tries, or only some pages were done = almost; a page tried and not won = not-yet; nothing logged = undefined (the teacher decides).
 */
export function suggestMarks(slides: readonly Slide[], criteriaCount: number, rows: readonly ActivityRow[]): (Mark | undefined)[] {
  const byId = new Map(rows.map((r) => [r.slide_id, r]));
  return Array.from({ length: criteriaCount }, (_, i) => {
    const mine = slides.filter((s) => isLoggedSlide(s) && s.trains?.includes(i + 1));
    const seen = mine.map((s) => byId.get(s.id)).filter((r): r is ActivityRow => !!r);
    if (seen.length === 0) return undefined;
    const lost = seen.some((r) => r.is_correct === false);
    const wrongTries = seen.some((r) => (r.selected_option_id ?? 'w0') !== 'w0');
    if (lost) return 'not-yet';
    if (wrongTries || seen.length < mine.length) return 'almost';
    return 'nailed';
  });
}

/** The criteria (1-based) the slide on screen trains: the pop-up highlights them. */
export const criteriaOf = (s: Slide | undefined): number[] => s?.trains ?? [];

/** The teacher's marks for one class, kept in this browser until the report is sent (the pop-up and the report share them). */
const storeKey = (bookingId?: string) => (bookingId ? `ac-checklist:${bookingId}` : null);
export function loadAcademyChecklist<T>(bookingId?: string): T | null {
  const k = storeKey(bookingId);
  if (!k) return null;
  try { const raw = window.localStorage.getItem(k); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
export function saveAcademyChecklist(bookingId: string | undefined, v: unknown) {
  const k = storeKey(bookingId);
  if (k) try { window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: the report still has the in-memory list */ }
}
export function clearAcademyChecklist(bookingId?: string) {
  const k = storeKey(bookingId);
  if (k) try { window.localStorage.removeItem(k); } catch { /* noop */ }
}
