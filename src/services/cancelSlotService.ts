import { supabase } from "@/integrations/supabase/client";

/**
 * Cancellation rules across all hubs (workspace-wide):
 *
 *  - Teacher may cancel a single booked occurrence at any time, but the
 *    UI surfaces the 5-day rule (120 hours) so the teacher knows when a
 *    student's credit will be forfeited vs. refunded.
 *  - Cancelling an entire weekly series only removes FUTURE occurrences
 *    (>= now). Past occurrences are immutable history.
 *  - "Cancel single occurrence" releases the slot back to available
 *    (so another student can book it) and marks the linked
 *    class_bookings row as cancelled.
 *  - "Cancel series" deletes all future free occurrences AND cancels
 *    all future bookings in the same series.
 */

export const FIVE_DAY_RULE_HOURS = 120;

// Teacher-side consequence: cancelling a paid lesson inside 48 hours of its
// start incurs a penalty fee (enforced server-side in teacher_cancel_slot,
// re-verified against the DB's own clock — this constant is only for the
// pre-cancel warning banner).
export const LATE_CANCELLATION_PENALTY_HOURS = 48;

export function hoursUntil(start: string | Date): number {
  const ms = new Date(start).getTime() - Date.now();
  return ms / (1000 * 60 * 60);
}

export function isWithinFiveDayRule(start: string | Date): boolean {
  return hoursUntil(start) < FIVE_DAY_RULE_HOURS;
}

export function isWithinPenaltyWindow(start: string | Date): boolean {
  return hoursUntil(start) < LATE_CANCELLATION_PENALTY_HOURS;
}

interface CancelSingleArgs {
  slotId: string;
  reason?: string;
}

interface CancelSingleResult {
  refunded: boolean;
  penalized: boolean;
  penaltyAmount: number;
}

/**
 * Cancel a single booked occurrence via the teacher_cancel_slot RPC, which
 * atomically: refunds the student's credit (per the Refund Policy, teacher
 * cancellations always refund regardless of timing), marks the linked
 * class_bookings/lessons rows cancelled, re-opens the slot, and — if this
 * is a paid lesson cancelled inside the 48-hour window — charges the
 * teacher a penalty fee (re-verified server-side, not trusted from client
 * state).
 */
export async function cancelBookedSlot({ slotId, reason }: CancelSingleArgs): Promise<CancelSingleResult> {
  const { data, error } = await supabase.rpc("teacher_cancel_slot", {
    p_slot_id: slotId,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  const result = data as { refunded: boolean; penalized?: boolean; penalty_amount?: number } | null;
  return {
    refunded: result?.refunded ?? false,
    penalized: result?.penalized ?? false,
    penaltyAmount: result?.penalty_amount ?? 0,
  };
}

interface CancelSeriesArgs {
  slotId: string; // any slot belonging to the series — used to fetch recurring_pattern
  reason?: string;
  /** Only this slot and the ones after it (default: every future one). The clicked slot's own start is the usual value. */
  fromStart?: string | Date;
  /** Open-slot removal: leave booked lessons alone instead of cancelling them. */
  keepBooked?: boolean;
}

interface CancelSeriesResult {
  cancelledBookings: number;
  removedSlots: number;
  /** Booked lessons left untouched because `keepBooked` was set. */
  keptBooked: number;
}

interface SeriesRow {
  id: string;
  lesson_id: string | null;
  is_booked: boolean | null;
  student_id: string | null;
  start_time: string;
  recurring_pattern: unknown;
}

/** A booked row is either a lesson (has a lesson_id) or one made by "Invite a Student" (booked for a student). */
export const isBookedRow = (s: Pick<SeriesRow, "lesson_id" | "is_booked" | "student_id">) =>
  !!s.lesson_id || (!!s.is_booked && !!s.student_id);

/**
 * The rows of one weekly series: same recurring_pattern as the anchor, starting
 * at `from` or later. Past occurrences are history and never match.
 */
export function seriesMembers<T extends Pick<SeriesRow, "start_time" | "recurring_pattern">>(
  rows: T[],
  anchorPattern: unknown,
  from: Date,
): T[] {
  const sig = JSON.stringify(anchorPattern);
  const fromMs = from.getTime();
  return rows.filter(
    (r) => new Date(r.start_time).getTime() >= fromMs && JSON.stringify(r.recurring_pattern) === sig,
  );
}

/**
 * Remove a weekly series from one slot onward ("this and all later weeks").
 *
 * A "series" is identified by the slot's recurring_pattern JSON, scoped to the
 * same teacher. Only FUTURE occurrences (and nothing before `fromStart`) are
 * touched. Booked occurrences are cancelled through the same atomic RPC as a
 * single cancellation (refund, notification, late-cancel penalty) unless
 * `keepBooked` is set, in which case only the open slots are removed.
 */
export async function cancelBookedSeries({
  slotId,
  reason,
  fromStart,
  keepBooked = false,
}: CancelSeriesArgs): Promise<CancelSeriesResult> {
  const { data: anchor, error: anchorErr } = await supabase
    .from("teacher_availability")
    .select("id, teacher_id, start_time, duration, recurring_pattern")
    .eq("id", slotId)
    .maybeSingle();

  if (anchorErr) throw anchorErr;
  if (!anchor) throw new Error("Slot not found");
  if (!anchor.recurring_pattern) {
    throw new Error("This slot is not part of a weekly series.");
  }

  const now = new Date();
  const from = new Date(Math.max(now.getTime(), fromStart ? new Date(fromStart).getTime() : 0));

  // Every future slot of this teacher; the series is picked out below.
  const { data: seriesSlots, error: listErr } = await supabase
    .from("teacher_availability")
    .select("id, lesson_id, is_booked, student_id, start_time, recurring_pattern")
    .eq("teacher_id", anchor.teacher_id)
    .gte("start_time", from.toISOString());

  if (listErr) throw listErr;

  const matching = seriesMembers((seriesSlots ?? []) as SeriesRow[], anchor.recurring_pattern, from);
  const booked = matching.filter(isBookedRow);
  const open = matching.filter((s) => !isBookedRow(s));

  // 1. Cancel every booked occurrence through the same atomic RPC as the
  // single-occurrence path (refund, class_bookings/lessons update, student
  // notification, late-cancel penalty). Done one by one so a failure on one
  // lesson never leaves the others half-cancelled.
  let cancelledBookings = 0;
  if (!keepBooked) {
    for (const s of booked) {
      try {
        await cancelBookedSlot({
          slotId: s.id,
          reason: reason ?? "Series cancelled by teacher",
        });
        cancelledBookings += 1;
      } catch (err: any) {
        // The two halves of a one-hour lesson are two rows of ONE booking:
        // cancelling the first removes the second, so it is already gone here.
        if (err?.code === "P0002") continue;
        throw err;
      }
    }
  }

  // 2. Remove the slots: every open one, plus (unless kept) the freed booked ones.
  const slotIds = [...open.map((s) => s.id), ...(keepBooked ? [] : booked.map((s) => s.id))];
  if (slotIds.length > 0) {
    let del = supabase.from("teacher_availability").delete().in("id", slotIds);
    if (keepBooked) del = del.eq("is_booked", false); // belt and braces: never delete a booked row
    const { error: delErr } = await del;
    if (delErr) throw delErr;
  }

  return { cancelledBookings, removedSlots: slotIds.length, keptBooked: keepBooked ? booked.length : 0 };
}

/** Remove one OPEN slot from the schedule. A booked slot is never deleted here. */
export async function removeOpenSlot({ slotId, teacherId }: { slotId: string; teacherId: string }): Promise<void> {
  const { data, error } = await supabase
    .from("teacher_availability")
    .delete()
    .eq("id", slotId)
    .eq("teacher_id", teacherId)
    .eq("is_booked", false)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("This slot was already removed, or a student has just booked it.");
  }
}

/**
 * Cancel a booked lesson AND take its time off the schedule (instead of
 * re-opening it for other students, which is what a plain cancel does).
 * The student is refunded and notified by teacher_cancel_slot as usual.
 */
export async function cancelAndRemoveBookedSlot({
  slotId,
  reason,
}: CancelSingleArgs): Promise<CancelSingleResult & { removedSlots: number }> {
  // The calendar rows of this lesson (a one-hour Playground lesson has two),
  // read BEFORE cancelling because the cancel clears their lesson link.
  const { data: anchor } = await supabase
    .from("teacher_availability")
    .select("id, teacher_id, student_id, lesson_id, start_time")
    .eq("id", slotId)
    .maybeSingle();

  let siblingIds: string[] = [slotId];
  if (anchor?.lesson_id) {
    const startMs = new Date(anchor.start_time).getTime();
    const { data: rows } = await supabase
      .from("teacher_availability")
      .select("id, start_time")
      .eq("teacher_id", anchor.teacher_id)
      .eq("lesson_id", anchor.lesson_id)
      .gte("start_time", new Date(startMs - 30 * 60_000).toISOString())
      .lte("start_time", new Date(startMs + 30 * 60_000).toISOString());
    siblingIds = Array.from(new Set([slotId, ...(rows ?? []).map((r: any) => r.id as string)]));
  }

  const result = await cancelBookedSlot({ slotId, reason });

  // Whatever the cancel re-opened is now removed. (Rows made by an invite were already deleted.)
  const { data: removed, error } = await supabase
    .from("teacher_availability")
    .delete()
    .in("id", siblingIds)
    .eq("is_booked", false)
    .select("id");
  if (error) throw error;

  return { ...result, removedSlots: removed?.length ?? 0 };
}

interface MoveArgs {
  slotId: string;
  newStart: string | Date;
  reason?: string;
}

/**
 * Move a booked lesson to another of the teacher's open slots
 * (teacher_move_booked_lesson). The student keeps the lesson and the credits and
 * is told the new time.
 */
export async function moveBookedLesson({ slotId, newStart, reason }: MoveArgs): Promise<{ oldScheduledAt: string; newScheduledAt: string }> {
  const { data, error } = await (supabase as any).rpc("teacher_move_booked_lesson", {
    p_slot_id: slotId,
    p_new_start: new Date(newStart).toISOString(),
    p_reason: reason?.trim() ? reason.trim() : null,
  });
  if (error) {
    // The function ships in a migration the owner runs; say so instead of a bare "not found".
    if (error.code === "PGRST202" || /could not find the function/i.test(error.message ?? "")) {
      throw new Error("Moving lessons needs a one-time database update (teacher_move_booked_lesson). Please ask the site owner to run it.");
    }
    throw error;
  }
  const r = data as { old_scheduled_at: string; new_scheduled_at: string } | null;
  return { oldScheduledAt: r?.old_scheduled_at ?? "", newScheduledAt: r?.new_scheduled_at ?? new Date(newStart).toISOString() };
}

export interface MoveCalendarRow {
  id: string;
  start_time: string;
  duration: number | null;
  hub_specialty: string | null;
}

/** What the "Move lesson" picker needs: the booking, its own calendar rows and the teacher's open rows. */
export async function loadMoveContext(args: { teacherId: string; studentId: string; slotStart: string }) {
  const { teacherId, studentId, slotStart } = args;
  const slotMs = new Date(slotStart).getTime();

  const { data: bookings, error: bErr } = await supabase
    .from("class_bookings")
    .select("id, scheduled_at, duration, lesson_id, status")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .not("status", "in", "(cancelled,completed)")
    .lte("scheduled_at", new Date(slotMs).toISOString())
    .order("scheduled_at", { ascending: false })
    .limit(5);
  if (bErr) throw bErr;

  const booking = (bookings ?? []).find((b: any) => {
    const start = new Date(b.scheduled_at).getTime();
    return start <= slotMs && slotMs < start + (b.duration ?? 30) * 60_000;
  }) as { id: string; scheduled_at: string; duration: number | null } | undefined;
  if (!booking) throw new Error("This lesson's booking could not be found.");

  const minutes: 30 | 60 = (booking.duration ?? 30) >= 55 ? 60 : 30;
  const startMs = new Date(booking.scheduled_at).getTime();

  const { data: ownRows, error: oErr } = await supabase
    .from("teacher_availability")
    .select("id, start_time, duration, hub_specialty")
    .eq("teacher_id", teacherId)
    .eq("is_booked", true)
    .eq("student_id", studentId)
    .gte("start_time", new Date(startMs).toISOString())
    .lt("start_time", new Date(startMs + minutes * 60_000).toISOString());
  if (oErr) throw oErr;

  const { data: openRows, error: rErr } = await supabase
    .from("teacher_availability")
    .select("id, start_time, duration, hub_specialty")
    .eq("teacher_id", teacherId)
    .eq("is_booked", false)
    .eq("is_available", true)
    .gt("start_time", new Date().toISOString())
    .lt("start_time", new Date(Date.now() + 70 * 24 * 3600_000).toISOString())
    .order("start_time", { ascending: true })
    .limit(1500);
  if (rErr) throw rErr;

  return {
    bookingId: booking.id,
    scheduledAt: booking.scheduled_at,
    minutes,
    ownRows: (ownRows ?? []) as MoveCalendarRow[],
    openRows: (openRows ?? []) as MoveCalendarRow[],
  };
}
