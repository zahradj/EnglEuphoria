import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Teacher "Legacy Embers" standing — challenging progression.
 *
 * 10 embers max. START AT 5 (must be earned, not gifted).
 * Rolling 30d for penalties + reviews; rolling 60d for booking-derived signals.
 *
 * PENALTIES (each dims embers):
 *   · same-day teacher cancel  (< 24h)                                → −2
 *   · late teacher cancel      (24–72h)                               → −1
 *   · no-show                  (status='no_show')                     → −2
 *   · late arrival             (teacher_penalties.penalty_type LIKE %late%) → −1
 *
 * REIGNITIONS (thresholded — hard to earn):
 *   · every 3× 5★ feedback in 30d                     → +1
 *   · every 2 retained regulars (≥4 wks in 8w)        → +1
 *   · every 2 trial→paid conversions                  → +1
 *   · every 30 completed lessons in cancel-free streak → +1
 *   · attendance_rate ≥ 95% → +1  ·  ≥ 98% → +2
 *
 * Also surfaces: earnings30d, attendanceRate, lateArrivals.
 */

export type EmberEvent = {
  kind:
    | "same_day_cancel" | "late_cancel" | "no_show" | "late_arrival"
    | "five_star" | "trial_paid" | "regular_retained";
  label: string;
  delta: number;
  tone: "good" | "bad";
  when: string;
  bookingId?: string;
};

export type TeacherEmbers = {
  lit: number;
  max: 10;
  regulars: number;
  trialsConverted: number;
  fiveStarFb: number;
  lessonsStreak: number;
  lateArrivals: number;
  attendanceRate: number;   // 0..1
  earnings30d: number;
  events: EmberEvent[];
};

const DAY_MS = 86_400_000;
const isTeacherReason = (r: string | null) => !!r && /teacher/i.test(r);

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / DAY_MS);
  if (days <= 0) {
    const hours = Math.max(1, Math.floor(diff / 3_600_000));
    return `${hours}h ago`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function weekKey(iso: string): string {
  const d = new Date(iso);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

export function useTeacherEmbers(teacherId: string | undefined) {
  const [data, setData] = useState<TeacherEmbers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const now = Date.now();
      const since30 = new Date(now - 30 * DAY_MS).toISOString();
      const since60 = new Date(now - 60 * DAY_MS).toISOString();

      const [bookingsRes, reviewsRes, penaltiesRes, metricRes, earningsRes] = await Promise.all([
        supabase
          .from("class_bookings")
          .select("id, status, cancellation_reason, cancelled_at, scheduled_at, student_id, booking_type, price_paid")
          .eq("teacher_id", teacherId)
          .gte("scheduled_at", since60)
          .order("scheduled_at", { ascending: false }),
        supabase
          .from("teacher_reviews")
          .select("id, rating, created_at, student_id")
          .eq("teacher_id", teacherId)
          .gte("created_at", since30)
          .order("created_at", { ascending: false }),
        supabase
          .from("teacher_penalties")
          .select("id, penalty_type, penalty_date")
          .eq("teacher_id", teacherId)
          .gte("penalty_date", since30),
        supabase
          .from("teacher_performance_metrics")
          .select("attendance_rate")
          .eq("teacher_id", teacherId)
          .maybeSingle(),
        supabase
          .from("teacher_earnings")
          .select("teacher_amount, earned_at")
          .eq("teacher_id", teacherId)
          .gte("earned_at", since30),
      ]);

      const bookings = bookingsRes.data ?? [];
      const reviews = reviewsRes.data ?? [];
      const penalties = penaltiesRes.data ?? [];
      const events: EmberEvent[] = [];
      let penalty = 0;
      let cancelFreeStreak = 0;
      let streakBroken = false;

      for (const b of bookings) {
        const sched = new Date(b.scheduled_at).getTime();
        const cancelledAt = b.cancelled_at ? new Date(b.cancelled_at).getTime() : null;
        const within30 = sched >= now - 30 * DAY_MS;

        const isTeacherCancel = b.status === "cancelled" && isTeacherReason(b.cancellation_reason);
        const isNoShow = b.status === "no_show";
        const isCompleted = b.status === "completed";

        if (!streakBroken) {
          if (isCompleted) cancelFreeStreak += 1;
          else if (isTeacherCancel || isNoShow) streakBroken = true;
        }

        if (!within30) continue;

        if (isNoShow) {
          penalty += 2;
          events.push({ kind: "no_show", label: "No-show", delta: -2, tone: "bad", when: b.scheduled_at, bookingId: b.id });
        } else if (isTeacherCancel && cancelledAt) {
          const leadMs = sched - cancelledAt;
          if (leadMs < 24 * 3_600_000) {
            penalty += 2;
            events.push({ kind: "same_day_cancel", label: "Same-day cancel", delta: -2, tone: "bad", when: b.cancelled_at!, bookingId: b.id });
          } else if (leadMs < 72 * 3_600_000) {
            penalty += 1;
            events.push({ kind: "late_cancel", label: "Late cancel (<72h)", delta: -1, tone: "bad", when: b.cancelled_at!, bookingId: b.id });
          }
        }
      }

      // Late arrivals (teacher_penalties with 'late' in type)
      const latePenalties = penalties.filter(p => /late|tard/i.test(p.penalty_type ?? ""));
      const lateArrivals = latePenalties.length;
      penalty += lateArrivals;
      for (const p of latePenalties.slice(0, 3)) {
        events.push({ kind: "late_arrival", label: "Late to class", delta: -1, tone: "bad", when: p.penalty_date });
      }

      // 5★ reviews
      const fiveStar = reviews.filter(r => Number(r.rating) >= 5);
      const fiveStarFb = fiveStar.length;
      for (const r of fiveStar.slice(0, 3)) {
        events.push({ kind: "five_star", label: "5★ feedback", delta: +1, tone: "good", when: r.created_at });
      }

      // Regulars
      const perStudentWeeks = new Map<string, Set<string>>();
      const perStudentBookings = new Map<string, typeof bookings>();
      for (const b of bookings) {
        if (b.status !== "completed") continue;
        const sched = new Date(b.scheduled_at).getTime();
        if (sched < now - 56 * DAY_MS) continue;
        const wk = weekKey(b.scheduled_at);
        if (!perStudentWeeks.has(b.student_id)) perStudentWeeks.set(b.student_id, new Set());
        perStudentWeeks.get(b.student_id)!.add(wk);
        if (!perStudentBookings.has(b.student_id)) perStudentBookings.set(b.student_id, []);
        perStudentBookings.get(b.student_id)!.push(b);
      }
      const regularStudentIds = [...perStudentWeeks.entries()]
        .filter(([, weeks]) => weeks.size >= 4)
        .map(([sid]) => sid);
      const regulars = regularStudentIds.length;
      for (const sid of regularStudentIds.slice(0, 2)) {
        const latest = perStudentBookings.get(sid)?.[0];
        if (latest) events.push({ kind: "regular_retained", label: "Regular student retained", delta: +1, tone: "good", when: latest.scheduled_at });
      }

      // Trial → paid
      const byStudent = new Map<string, typeof bookings>();
      for (const b of bookings) {
        if (!byStudent.has(b.student_id)) byStudent.set(b.student_id, []);
        byStudent.get(b.student_id)!.push(b);
      }
      let trialsConverted = 0;
      for (const [, list] of byStudent) {
        const asc = [...list].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
        const trialIdx = asc.findIndex(b => b.booking_type === "trial");
        if (trialIdx < 0) continue;
        const laterPaid = asc.slice(trialIdx + 1).find(b => b.booking_type !== "trial" && Number(b.price_paid) > 0);
        if (laterPaid) {
          trialsConverted += 1;
          if (new Date(laterPaid.scheduled_at).getTime() >= now - 30 * DAY_MS) {
            events.push({ kind: "trial_paid", label: "Trial → paid", delta: +1, tone: "good", when: laterPaid.scheduled_at });
          }
        }
      }

      // Attendance + earnings
      const attendanceRate = Number((metricRes.data as any)?.attendance_rate ?? 0);
      const earnings30d = (earningsRes.data ?? []).reduce(
        (s: number, x: any) => s + Number(x.teacher_amount ?? 0), 0,
      );

      // CHALLENGING reignition thresholds — earn slowly
      const reignitions =
        Math.floor(fiveStarFb / 3) +
        Math.floor(regulars / 2) +
        Math.floor(trialsConverted / 2) +
        Math.floor(cancelFreeStreak / 30) +
        (attendanceRate >= 0.98 ? 2 : attendanceRate >= 0.95 ? 1 : 0);

      // START AT 5, not 10 — must be earned
      const BASE = 5;
      const litFinal = Math.max(0, Math.min(10, BASE - penalty + reignitions));

      events.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

      if (cancelled) return;
      setData({
        lit: litFinal,
        max: 10,
        regulars,
        trialsConverted,
        fiveStarFb,
        lessonsStreak: cancelFreeStreak,
        lateArrivals,
        attendanceRate,
        earnings30d,
        events: events.slice(0, 6).map(e => ({ ...e, when: relTime(e.when) })),
      });
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [teacherId]);

  return { data, loading };
}
