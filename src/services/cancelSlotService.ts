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

  // 1. Cancel every booked occurrence through the same atomic RPC as the
  // single-occurrence path (refund, class_bookings/lessons update, student
  // notification, late-cancel penalty). Done one by one so a failure on one
  // lesson never leaves the others half-cancelled.
  const bookedSlots = matching.filter((s: any) => s.lesson_id);
  let cancelledBookings = 0;
  for (const s of bookedSlots) {
    await cancelBookedSlot({
      slotId: s.id,
      reason: reason ?? "Series cancelled by teacher",
    });
    cancelledBookings += 1;
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
