/**
 * Where can a booked lesson be moved to? Pure helpers behind the teacher's
 * "Move lesson" picker, mirroring the rules of the teacher_move_booked_lesson RPC:
 *  - the new time must be one of the teacher's own OPEN calendar rows;
 *  - a one-hour lesson that sits on two back-to-back 30-minute rows needs two
 *    open 30-minute rows in a row; every other lesson needs one row of its own length;
 *  - the lesson's own rows count as free (a 30-minute shift reuses its own half);
 *  - the hub must match (a row with no hub tag fits anywhere).
 * The database re-checks all of this; this only decides what to offer.
 */

export interface CalendarRow {
  id: string;
  start_time: string;
  duration: number | null;
  hub_specialty?: string | null;
}

export interface MoveShape {
  /** The lesson's length in minutes (30 or 60). */
  minutes: number;
  /** True when a 60-minute lesson sits on two back-to-back 30-minute rows. */
  split: boolean;
  /** The lesson's hub tag, if the calendar row carries one. */
  hub?: string | null;
}

const MIN = 60_000;

const hubFits = (shapeHub: string | null | undefined, rowHub: string | null | undefined) =>
  !shapeHub || !rowHub || shapeHub.toLowerCase() === rowHub.toLowerCase();

/** Is this lesson held on two 30-minute rows? */
export function isSplitLesson(minutes: number, ownRowCount: number): boolean {
  return minutes === 60 && ownRowCount >= 2;
}

/**
 * Start times (ISO, ascending) the lesson can be moved to. `rows` are the
 * teacher's open rows PLUS the lesson's own rows. `currentStart` and anything
 * not strictly in the future are left out.
 */
export function findMoveOptions(
  rows: CalendarRow[],
  shape: MoveShape,
  currentStart: string | Date,
  now: Date = new Date(),
): string[] {
  const current = new Date(currentStart).getTime();
  const usable = rows.filter((r) => hubFits(shape.hub, r.hub_specialty));
  const starts = new Set<number>();

  if (shape.split) {
    const halves = new Set(usable.filter((r) => (r.duration ?? 30) === 30).map((r) => new Date(r.start_time).getTime()));
    for (const t of halves) if (halves.has(t + 30 * MIN)) starts.add(t);
  } else {
    for (const r of usable) {
      if ((r.duration ?? 30) === shape.minutes) starts.add(new Date(r.start_time).getTime());
    }
  }

  return [...starts]
    .filter((t) => t > now.getTime() && t !== current)
    .sort((a, b) => a - b)
    .map((t) => new Date(t).toISOString());
}

/** Group ISO start times by local calendar day, for display. */
export function groupByDay(starts: string[]): Array<{ dayKey: string; day: Date; starts: string[] }> {
  const groups = new Map<string, { dayKey: string; day: Date; starts: string[] }>();
  for (const iso of starts) {
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const g = groups.get(key) ?? { dayKey: key, day: new Date(d.getFullYear(), d.getMonth(), d.getDate()), starts: [] };
    g.starts.push(iso);
    groups.set(key, g);
  }
  return [...groups.values()];
}
