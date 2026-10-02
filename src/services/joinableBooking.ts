import { bookedMinutesFor, type ClassroomHub } from '@/components/classroom/LessonWindowGate';

/**
 * Which booking should a student's "Join class" button open?
 *
 * The dashboard used to look only for classes that started in the last 5
 * minutes (`scheduled_at >= now - 5min`). A student who arrived later — e.g.
 * still finishing the previous class, or the teacher opened the room late —
 * lost the Join button even though the classroom itself stays open until
 * `scheduled_at + duration + 5 min` (see LessonWindowGate). So the rule here
 * is the classroom's own: a booking is joinable while its window is open and
 * it hasn't been ended.
 */
export interface JoinableBookingRow {
  id: string;
  scheduled_at: string;
  duration?: number | null;
  hub_type?: string | null;
  ended_at?: string | null;
}

/** Same grace the classroom door allows after the booked end. */
export const JOIN_BONUS_MINUTES = 5;
/** Longest booking we ever look back for (minutes). */
export const JOIN_LOOKBACK_MINUTES = 125;

const toHub = (v?: string | null): ClassroomHub =>
  v === 'playground' || v === 'professional' ? v : 'academy';

export function isBookingJoinable(row: JoinableBookingRow, now: Date = new Date()): boolean {
  if (row.ended_at) return false;
  const start = new Date(row.scheduled_at).getTime();
  if (!Number.isFinite(start)) return false;
  const bookedMin = bookedMinutesFor(toHub(row.hub_type), row.duration);
  const end = start + (bookedMin + JOIN_BONUS_MINUTES) * 60_000;
  return now.getTime() <= end;
}

/** The open booking whose start is closest to now (so back-to-back classes pick the current one). */
export function pickJoinableBooking<T extends JoinableBookingRow>(rows: T[] | null | undefined, now: Date = new Date()): T | null {
  const open = (rows ?? []).filter((r) => isBookingJoinable(r, now));
  if (!open.length) return null;
  const dist = (r: T) => Math.abs(new Date(r.scheduled_at).getTime() - now.getTime());
  return open.sort((a, b) => dist(a) - dist(b))[0];
}

/** ISO timestamp to use as the lower bound when querying bookings for this purpose. */
export function joinLookbackIso(now: Date = new Date()): string {
  return new Date(now.getTime() - JOIN_LOOKBACK_MINUTES * 60_000).toISOString();
}
