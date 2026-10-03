import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calendarHub } from '@/lib/calendarColors';

/**
 * Lessons for one or more students, straight from class_bookings — so lessons a
 * teacher created through "Invite a Student" (which have no `lessons` row) show
 * up too. Students read their own bookings and approved parents read their
 * children's (existing row-level rules). Window: ±70 days around today.
 */
export interface CalendarBooking {
  id: string;
  studentId: string;
  teacherId: string | null;
  teacherName: string | null;
  lessonId: string | null;
  start: Date;
  durationMin: number;
  status: string;
  hub: 'playground' | 'academy' | 'professional';
  isTrial: boolean;
  title: string;
  /** From the linked `lessons` row, when there is one. */
  creditsUsed: number | null;
  lessonPrice: number | null;
}

const HUB_LABEL = { playground: 'Playground', academy: 'Academy', professional: 'Success' } as const;
const DAY = 86_400_000;

export function useCalendarBookings(studentIds: string[]) {
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const key = studentIds.join(',');

  const load = useCallback(async () => {
    if (studentIds.length === 0) {
      setBookings([]);
      setLoading(false);
      return;
    }
    const from = new Date(Date.now() - 70 * DAY).toISOString();
    const to = new Date(Date.now() + 70 * DAY).toISOString();
    const { data, error } = await supabase
      .from('class_bookings')
      .select('id, student_id, teacher_id, lesson_id, scheduled_at, duration, status, hub_type, booking_type')
      .in('student_id', studentIds)
      .gte('scheduled_at', from)
      .lte('scheduled_at', to)
      .order('scheduled_at', { ascending: true });
    if (error) {
      console.warn('[useCalendarBookings] load failed:', error);
      setLoading(false);
      return;
    }
    const rows = (data ?? []) as any[];

    const teacherIds = Array.from(new Set(rows.map((r) => r.teacher_id).filter(Boolean))) as string[];
    const lessonIds = Array.from(new Set(rows.map((r) => r.lesson_id).filter(Boolean))) as string[];
    const [teachers, lessons] = await Promise.all([
      teacherIds.length
        ? supabase.from('users').select('id, full_name').in('id', teacherIds)
        : Promise.resolve({ data: [] as any[] }),
      lessonIds.length
        ? (supabase as any).from('lessons').select('id, title, credits_used, lesson_price').in('id', lessonIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const teacherName = new Map<string, string>(((teachers as any).data ?? []).map((t: any) => [t.id, t.full_name]));
    const lessonInfo = new Map<string, any>(((lessons as any).data ?? []).map((l: any) => [l.id, l]));

    setBookings(
      rows.map((r): CalendarBooking => {
        const hub = calendarHub(r.hub_type);
        const isTrial = String(r.booking_type ?? '').toLowerCase() === 'trial';
        const lesson = r.lesson_id ? lessonInfo.get(r.lesson_id) : null;
        return {
          id: r.id,
          studentId: r.student_id,
          teacherId: r.teacher_id ?? null,
          teacherName: r.teacher_id ? teacherName.get(r.teacher_id) ?? null : null,
          lessonId: r.lesson_id ?? null,
          start: new Date(r.scheduled_at),
          durationMin: Number(r.duration) || 30,
          status: String(r.status ?? 'scheduled'),
          hub,
          isTrial,
          title: lesson?.title || (isTrial ? 'Trial lesson' : `${HUB_LABEL[hub]} lesson`),
          creditsUsed: lesson ? (lesson.credits_used ?? 0) : null,
          lessonPrice: lesson ? Number(lesson.lesson_price ?? 0) : null,
        };
      }),
    );
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  // Live: a booking made, moved or cancelled anywhere refreshes the calendar.
  useEffect(() => {
    if (studentIds.length === 0) return;
    const channel = supabase.channel(`calendar-bookings-${key}`);
    studentIds.forEach((id) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'class_bookings', filter: `student_id=eq.${id}` }, () => { void load(); });
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, load]);

  return { bookings, loading, reload: load };
}
