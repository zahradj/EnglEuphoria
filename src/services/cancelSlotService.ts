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

export function hoursUntil(start: string | Date): number {
  const ms = new Date(start).getTime() - Date.now();
  return ms / (1000 * 60 * 60);
}

export function isWithinFiveDayRule(start: string | Date): boolean {
  return hoursUntil(start) < FIVE_DAY_RULE_HOURS;
}

interface CancelSingleArgs {
  slotId: string;
  reason?: string;
}

/**
 * Cancel a single booked occurrence via the teacher_cancel_slot RPC, which
 * atomically: refunds the student's credit (per the Refund Policy, teacher
 * cancellations always refund regardless of timing), marks the linked
 * class_bookings/lessons rows cancelled, and re-opens the slot.
 */
export async function cancelBookedSlot({ slotId, reason }: CancelSingleArgs): Promise<{ refunded: boolean }> {
  const { data, error } = await supabase.rpc("teacher_cancel_slot", {
    p_slot_id: slotId,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  return (data as { refunded: boolean } | null) ?? { refunded: false };
}

interface CancelSeriesArgs {
  slotId: string; // any slot belonging to the series — used to fetch recurring_pattern
  reason?: string;
}

interface CancelSeriesResult {
  cancelledBookings: number;
  removedSlots: number;
}

/**
 * Cancel an entire weekly series — all FUTURE occurrences only.
 *
 * A "series" is identified by the slot's recurring_pattern JSON +
 * (teacher_id, weekday, time-of-day, duration). We scope the delete to
 * the same teacher and the same recurring_pattern signature.
 */
export async function cancelBookedSeries({
  slotId,
  reason,
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

  const nowIso = new Date().toISOString();

  // Find every future slot in the series (matched by teacher + identical pattern)
  const { data: seriesSlots, error: listErr } = await supabase
    .from("teacher_availability")
    .select("id, lesson_id, start_time, recurring_pattern")
    .eq("teacher_id", anchor.teacher_id)
    .gte("start_time", nowIso);

  if (listErr) throw listErr;

  const anchorSig = JSON.stringify(anchor.recurring_pattern);
  const matching = (seriesSlots ?? []).filter(
    (s: any) => JSON.stringify(s.recurring_pattern) === anchorSig,
  );

  // 1. Refund each student's credit (teacher cancellations always refund,
  // regardless of timing — same rule as the single-occurrence path) and
  // cancel every booked lesson in the series.
  const lessonIds = matching.map((s: any) => s.lesson_id).filter(Boolean) as string[];
  let cancelledBookings = 0;
  if (lessonIds.length > 0) {
    await Promise.all(
      lessonIds.map((lessonId) =>
        supabase.rpc("refund_lesson_credit", { p_lesson_id: lessonId }).then(({ error }) => {
          if (error) console.error(`Failed to refund credit for lesson ${lessonId}:`, error);
        }),
      ),
    );

    const { error: lessonErr } = await supabase
      .from("lessons")
      .update({ status: "cancelled", cancellation_reason: reason ?? "Series cancelled by teacher" })
      .in("id", lessonIds);
    if (lessonErr) throw lessonErr;

    const { error: bookErr, count } = await supabase
      .from("class_bookings")
      .update(
        {
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason ?? "Series cancelled by teacher",
        },
        { count: "exact" },
      )
      .in("lesson_id", lessonIds);
    if (bookErr) throw bookErr;
    cancelledBookings = count ?? 0;
  }

  // 2. Remove every future slot in the series
  const slotIds = matching.map((s: any) => s.id);
  if (slotIds.length > 0) {
    const { error: delErr } = await supabase
      .from("teacher_availability")
      .delete()
      .in("id", slotIds);
    if (delErr) throw delErr;
  }

  return { cancelledBookings, removedSlots: slotIds.length };
}
