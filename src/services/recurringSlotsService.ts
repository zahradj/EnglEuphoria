import { supabase } from "@/integrations/supabase/client";
import { insertAvailabilitySlotsWithFallback } from "@/services/availabilityInsert";

/**
 * Unified slot opener for teachers across all hubs (Playground / Academy / Success).
 *
 * Two modes:
 *  - openSingleSlot:    one slot on a chosen date+time
 *  - openWeeklyRecurring: same weekday(s) + time(s) every week, materialized
 *                        for the next N weeks (default 12 weeks per workspace rule)
 *
 * Idempotency: relies on insertAvailabilitySlotsWithFallback, which pre-filters
 * existing (teacher_id, start_time) collisions and treats unique-violations
 * as success — so re-running this is always safe.
 */

export type HubKind = "playground" | "academy" | "success";

export interface OpenSingleSlotInput {
  teacherId: string;
  date: Date;        // Local date (year/month/day used)
  time: string;      // "HH:MM"
  duration: 30 | 60;
  hub?: HubKind;     // optional hub tag → stored in hub_specialty
}

export interface OpenWeeklyRecurringInput {
  teacherId: string;
  /** 0 = Sunday, 1 = Monday … 6 = Saturday. Multiple weekdays supported. */
  weekdays: number[];
  /** One or more "HH:MM" times to open on each chosen weekday. */
  times: string[];
  duration: 30 | 60;
  /** Number of future weeks to materialize. Defaults to 12 (one quarter). */
  weeksAhead?: number;
  /** Anchor date — first week considered. Defaults to today. */
  startFrom?: Date;
  hub?: HubKind;
}

export interface OpenWeeklyRecurringSelectionsInput {
  teacherId: string;
  /** Exact weekday+time pairs selected on the calendar. */
  selections: Array<{ weekday: number; time: string }>;
  duration: 30 | 60;
  weeksAhead?: number;
  startFrom?: Date;
  hub?: HubKind;
}

const DEFAULT_HORIZON_WEEKS = 12;

/**
 * The DB check constraint allows only: 'Playground' | 'Academy' | 'Professional'.
 * Map our lowercase HubKind (incl. legacy "success") to the capitalized DB value.
 */
const toDbHubSpecialty = (hub: HubKind | undefined): string | null => {
  if (!hub) return null;
  switch (hub) {
    case "playground": return "Playground";
    case "academy": return "Academy";
    case "success": return "Professional";
    default: return null;
  }
};

const buildSlotRow = (
  teacherId: string,
  start: Date,
  duration: 30 | 60,
  hub: HubKind | undefined,
  recurringPattern?: Record<string, unknown> | null,
) => {
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + duration);
  return {
    teacher_id: teacherId,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    duration,
    lesson_type: "free_slot",
    is_available: true,
    is_booked: false,
    hub_specialty: toDbHubSpecialty(hub),
    recurring_pattern: recurringPattern ?? null,
  };
};

const setLocalTime = (date: Date, time: string): Date => {
  const [h, m] = time.split(":").map(Number);
  const out = new Date(date);
  out.setHours(h, m, 0, 0);
  return out;
};

/** Open one slot (e.g. "today at 3 PM"). */
export async function openSingleSlot(input: OpenSingleSlotInput): Promise<number> {
  const start = setLocalTime(input.date, input.time);
  const row = buildSlotRow(input.teacherId, start, input.duration, input.hub);
  await insertAvailabilitySlotsWithFallback(supabase as any, [row]);
  return 1;
}

/**
 * Open a weekly-recurring set of slots and materialize them for the next
 * `weeksAhead` weeks. Returns the number of slot rows submitted.
 *
 * The recurring_pattern JSON is stamped on every row so the UI can later
 * display "Repeats weekly" or bulk-cancel a series.
 */
export async function openWeeklyRecurring(
  input: OpenWeeklyRecurringInput,
): Promise<number> {
  const horizon = input.weeksAhead ?? DEFAULT_HORIZON_WEEKS;
  const anchor = input.startFrom ? new Date(input.startFrom) : new Date();
  anchor.setHours(0, 0, 0, 0);

  const recurringPattern = {
    type: "weekly" as const,
    weekdays: [...input.weekdays].sort((a, b) => a - b),
    times: [...input.times].sort(),
    duration: input.duration,
    horizon_weeks: horizon,
    created_at: new Date().toISOString(),
  };

  const rows: ReturnType<typeof buildSlotRow>[] = [];

  for (let w = 0; w < horizon; w++) {
    for (const weekday of input.weekdays) {
      // Step from the anchor's current weekday to the target weekday inside week `w`.
      const dayOffset = ((weekday - anchor.getDay()) + 7) % 7 + w * 7;
      const targetDate = new Date(anchor);
      targetDate.setDate(anchor.getDate() + dayOffset);

      for (const time of input.times) {
        const start = setLocalTime(targetDate, time);
        // Skip slots in the past (e.g. earlier today)
        if (start.getTime() <= Date.now()) continue;
        rows.push(
          buildSlotRow(input.teacherId, start, input.duration, input.hub, recurringPattern),
        );
      }
    }
  }

  if (rows.length === 0) return 0;
  await insertAvailabilitySlotsWithFallback(supabase as any, rows);
  return rows.length;
}

/** Open exact selected calendar cells every week without creating a weekday/time cross-product. */
export async function openWeeklyRecurringSelections(
  input: OpenWeeklyRecurringSelectionsInput,
): Promise<number> {
  const horizon = input.weeksAhead ?? DEFAULT_HORIZON_WEEKS;
  const anchor = input.startFrom ? new Date(input.startFrom) : new Date();
  anchor.setHours(0, 0, 0, 0);

  const selections = input.selections
    .map((s) => ({ weekday: s.weekday, time: s.time }))
    .sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));

  const recurringPattern = {
    type: "weekly" as const,
    selections,
    duration: input.duration,
    horizon_weeks: horizon,
    created_at: new Date().toISOString(),
  };

  const rows: ReturnType<typeof buildSlotRow>[] = [];
  for (let w = 0; w < horizon; w++) {
    for (const selection of selections) {
      const dayOffset = ((selection.weekday - anchor.getDay()) + 7) % 7 + w * 7;
      const targetDate = new Date(anchor);
      targetDate.setDate(anchor.getDate() + dayOffset);
      const start = setLocalTime(targetDate, selection.time);
      if (start.getTime() <= Date.now()) continue;
      rows.push(buildSlotRow(input.teacherId, start, input.duration, input.hub, recurringPattern));
    }
  }

  if (rows.length === 0) return 0;
  await insertAvailabilitySlotsWithFallback(supabase as any, rows);
  return rows.length;
}
