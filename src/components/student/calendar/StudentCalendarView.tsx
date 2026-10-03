import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarClock, Clock, User, Video, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCalendarBookings, type CalendarBooking } from '@/hooks/useCalendarBookings';
import { WeekCalendar, type CalendarEvent } from '@/components/calendar/WeekCalendar';
import { CalendarColorPicker } from '@/components/calendar/CalendarColorPicker';
import { LessonManagementModal } from '@/components/student/LessonManagementModal';
import { calendarHub, resolveCalendarColor } from '@/lib/calendarColors';
import { cn } from '@/lib/utils';

/** The student's own calendar: every lesson (booked by them or invited by a teacher), in their colour. */
export const StudentCalendarView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const ids = useMemo(() => (user?.id ? [user.id] : []), [user?.id]);
  const { bookings, loading, reload } = useCalendarBookings(ids);

  const [profile, setProfile] = useState<{ hub: string | null; color: string | null }>({ hub: null, color: null });
  const [selected, setSelected] = useState<CalendarBooking | null>(null);
  const [manage, setManage] = useState<{ mode: 'cancel' | 'reschedule'; booking: CalendarBooking } | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await (supabase as any)
      .from('student_profiles')
      .select('hub_type, calendar_color')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) { console.warn('[StudentCalendarView] profile load failed:', error); return; }
    setProfile({ hub: data?.hub_type ?? null, color: data?.calendar_color ?? null });
  }, [user?.id]);
  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const myHub = profile.hub ?? bookings[0]?.hub ?? 'academy';

  const saveColor = async (key: string) => {
    if (!user?.id) return;
    const { error } = await (supabase as any).rpc('set_calendar_color', { p_student: user.id, p_color: key });
    if (error) {
      toast({ title: 'Could not save your colour', description: error.message, variant: 'destructive' });
      return;
    }
    setProfile((p) => ({ ...p, color: key }));
  };

  // A chosen colour belongs to the child's own hub palette; lessons from another hub keep that hub's colour.
  const events: CalendarEvent[] = useMemo(
    () => bookings.map((b) => ({
      id: b.id,
      start: b.start,
      durationMin: b.durationMin,
      title: b.title,
      subtitle: b.teacherName ?? undefined,
      hub: b.hub,
      colorKey: calendarHub(b.hub) === calendarHub(myHub) ? profile.color : null,
      status: b.status,
    })),
    [bookings, myHub, profile.color],
  );

  const open = (ev: CalendarEvent) => setSelected(bookings.find((b) => b.id === ev.id) ?? null);

  const isUpcoming = !!selected && selected.start.getTime() + selected.durationMin * 60_000 > Date.now();
  const isActive = !!selected && !['cancelled', 'canceled', 'completed'].includes(selected.status.toLowerCase());
  const canManage = !!selected && !!selected.lessonId && isUpcoming && isActive;
  const color = selected ? resolveCalendarColor(selected.hub, calendarHub(selected.hub) === calendarHub(myHub) ? profile.color : null) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Every lesson in one place. Tap a lesson to see it, join it or change it.
        </p>
        <CalendarColorPicker hub={myHub} value={profile.color} onChange={saveColor} />
      </div>

      {loading ? (
        <div className="h-80 animate-pulse rounded-3xl bg-muted/60" />
      ) : (
        <WeekCalendar events={events} onSelect={open} />
      )}

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {selected && color && (
            <>
              <DialogHeader>
                <div className={cn('-mx-6 -mt-6 rounded-t-lg px-6 pb-4 pt-6 text-white', color.card)}>
                  <DialogTitle className="text-xl font-bold">{selected.title}</DialogTitle>
                  <DialogDescription className="text-white/85">
                    {format(selected.start, 'EEEE, MMMM d')} · {format(selected.start, 'h:mm a')} ({selected.durationMin} min)
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="space-y-2 py-2 text-sm">
                {selected.teacherName && (
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {selected.teacherName}</div>
                )}
                <div className="flex items-center gap-2 capitalize"><Clock className="h-4 w-4 text-muted-foreground" /> {selected.status}{selected.isTrial ? ' · trial lesson' : ''}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {isUpcoming && isActive && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate(`/classroom/${selected.id}`)}>
                    <Video className="mr-1.5 h-4 w-4" /> Join class
                  </Button>
                )}
                {canManage && (
                  <>
                    <Button variant="outline" onClick={() => { setManage({ mode: 'reschedule', booking: selected }); setSelected(null); }}>
                      <CalendarClock className="mr-1.5 h-4 w-4" /> Reschedule
                    </Button>
                    <Button variant="outline" className="text-destructive" onClick={() => { setManage({ mode: 'cancel', booking: selected }); setSelected(null); }}>
                      <XCircle className="mr-1.5 h-4 w-4" /> Cancel
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {manage && manage.booking.lessonId && (
        <LessonManagementModal
          open
          mode={manage.mode}
          onClose={() => setManage(null)}
          onSuccess={() => { void reload(); }}
          lesson={{
            id: manage.booking.lessonId,
            title: manage.booking.title,
            scheduled_at: manage.booking.start.toISOString(),
            teacher_id: manage.booking.teacherId ?? undefined,
            teacher_name: manage.booking.teacherName ?? 'Teacher',
            duration: manage.booking.durationMin,
            lesson_price: manage.booking.lessonPrice ?? 0,
            credits_used: manage.booking.creditsUsed ?? undefined,
            hub_type: manage.booking.hub,
          }}
        />
      )}
    </div>
  );
};
