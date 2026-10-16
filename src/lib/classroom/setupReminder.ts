/**
 * "Check your setup before class" reminder for teachers. It is a nudge, never a score: it only decides whether
 * to show a friendly banner shortly before a lesson, and remembers on THIS device that the teacher checked today.
 * Nothing about the check is sent to the server.
 */

/** Start nudging this long before the lesson. */
export const REMIND_WITHIN_MINUTES = 90;

const CHECKED_KEY = 'ee-setup-checked-on';
const DISMISSED_KEY = 'ee-setup-dismissed-lesson';

/** Local calendar day as YYYY-MM-DD (the teacher's own "today"). */
export function localDateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function minutesUntil(now: Date, scheduledAt: Date): number {
  return Math.round((scheduledAt.getTime() - now.getTime()) / 60000);
}

export function shouldShowSetupReminder(args: {
  now: Date;
  scheduledAt: Date | null;
  lessonId: string | null;
  checkedOn: string | null;
  dismissedLessonId: string | null;
}): boolean {
  const { now, scheduledAt, lessonId, checkedOn, dismissedLessonId } = args;
  if (!scheduledAt || !lessonId) return false;
  const mins = minutesUntil(now, scheduledAt);
  if (mins <= 0 || mins > REMIND_WITHIN_MINUTES) return false; // too early, or already started
  if (checkedOn === localDateKey(now)) return false; // already checked today
  if (dismissedLessonId === lessonId) return false; // said "not now" for this lesson
  return true;
}

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* storage can be unavailable: the banner just comes back */ }
}

export const getCheckedOn = () => read(CHECKED_KEY);
export const markCheckedToday = (now: Date = new Date()) => write(CHECKED_KEY, localDateKey(now));
export const getDismissedLesson = () => read(DISMISSED_KEY);
export const dismissForLesson = (lessonId: string) => write(DISMISSED_KEY, lessonId);
