import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCalendarBookings, type CalendarBooking } from '@/hooks/useCalendarBookings';
import { WeekCalendar, type CalendarEvent } from '@/components/calendar/WeekCalendar';
import { CalendarColorPicker } from '@/components/calendar/CalendarColorPicker';
import { CALENDAR_PALETTES, calendarHub, resolveCalendarColor } from '@/lib/calendarColors';
import { cn } from '@/lib/utils';

interface Child {
  id: string;
  name: string;
  hub: string | null;
  color: string | null;
}

interface FamilyCalendarViewProps {
  parentId: string;
}

/**
 * One calendar for the whole family. Each child has their own colour, picked from
 * their hub's palette (the parent can choose it for a younger child). A child who
 * hasn't chosen yet gets the first colour in their hub's palette that no sibling
 * in the same hub is using, so two children are never the same colour by default.
 */
export const FamilyCalendarView: React.FC<FamilyCalendarViewProps> = ({ parentId }) => {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loadingKids, setLoadingKids] = useState(true);
  const [selected, setSelected] = useState<CalendarBooking | null>(null);

  const loadChildren = useCallback(async () => {
    const { data: rels, error } = await supabase
      .from('student_parent_relationships')
      .select('student_id, student:users!student_parent_relationships_student_id_fkey(id, full_name)')
      .eq('parent_id', parentId);
    if (error) { console.warn('[FamilyCalendarView] children load failed:', error); setLoadingKids(false); return; }
    const kids = ((rels ?? []) as any[]).map((r) => {
      const s = Array.isArray(r.student) ? r.student[0] : r.student;
      return { id: r.student_id as string, name: (s?.full_name as string) || 'Child' };
    });
    const ids = kids.map((k) => k.id);
    const profiles = new Map<string, any>();
    if (ids.length) {
      const { data: profs } = await (supabase as any).from('student_profiles').select('user_id, hub_type, calendar_color').in('user_id', ids);
      (profs ?? []).forEach((p: any) => profiles.set(p.user_id, p));
    }
    setChildren(kids.map((k) => ({
      ...k,
      hub: profiles.get(k.id)?.hub_type ?? null,
      color: profiles.get(k.id)?.calendar_color ?? null,
    })));
    setLoadingKids(false);
  }, [parentId]);
  useEffect(() => { void loadChildren(); }, [loadChildren]);

  const ids = useMemo(() => children.map((c) => c.id), [children]);
  const { bookings, loading, reload } = useCalendarBookings(ids);

  // Effective colour per child (chosen, else the first free one in their hub's palette).
  const colorOf = useMemo(() => {
    const out = new Map<string, string>();
    const taken = new Map<string, Set<string>>(); // hub -> keys in use
    const hubOf = (c: Child) => calendarHub(c.hub ?? bookings.find((b) => b.studentId === c.id)?.hub);
    children.forEach((c) => {
      const hub = hubOf(c);
      const valid = CALENDAR_PALETTES[hub].some((p) => p.key === c.color);
      if (valid && c.color) {
        out.set(c.id, c.color);
        taken.set(hub, (taken.get(hub) ?? new Set()).add(c.color));
      }
    });
    children.forEach((c) => {
      if (out.has(c.id)) return;
      const hub = hubOf(c);
      const used = taken.get(hub) ?? new Set();
      const free = CALENDAR_PALETTES[hub].find((p) => !used.has(p.key)) ?? CALENDAR_PALETTES[hub][0];
      out.set(c.id, free.key);
      taken.set(hub, used.add(free.key));
    });
    return out;
  }, [children, bookings]);

  const firstName = (id: string) => (children.find((c) => c.id === id)?.name ?? '').split(' ')[0];

  const events: CalendarEvent[] = useMemo(
    () => bookings.map((b) => {
      const kid = children.find((c) => c.id === b.studentId);
      const sameHub = kid ? calendarHub(kid.hub ?? b.hub) === calendarHub(b.hub) : true;
      return {
        id: b.id,
        start: b.start,
        durationMin: b.durationMin,
        title: firstName(b.studentId) || b.title,
        subtitle: b.title,
        hub: b.hub,
        colorKey: sameHub ? colorOf.get(b.studentId) : null,
        status: b.status,
      };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings, children, colorOf],
  );

  const saveColor = async (childId: string, key: string) => {
    const { error } = await (supabase as any).rpc('set_calendar_color', { p_student: childId, p_color: key });
    if (error) {
      toast({ title: 'Could not save the colour', description: error.message, variant: 'destructive' });
      return;
    }
    setChildren((prev) => prev.map((c) => (c.id === childId ? { ...c, color: key } : c)));
  };

  if (loadingKids) return <div className="h-80 animate-pulse rounded-3xl bg-muted/60" />;

  if (children.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-card/50 p-10 text-center text-muted-foreground">
        Add a child to see their lessons here.
      </div>
    );
  }

  const sel = selected;
  const selColor = sel ? resolveCalendarColor(sel.hub, colorOf.get(sel.studentId)) : null;

  return (
    <div className="space-y-4">
      {/* Who is who: each child with their own colour */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        {children.map((c) => {
          const col = resolveCalendarColor(c.hub, colorOf.get(c.id));
          return (
            <div key={c.id} className="flex items-center gap-2 rounded-full bg-muted/50 py-1 pl-1.5 pr-1">
              <span className={cn('grid h-6 w-6 place-items-center rounded-full text-[11px] font-extrabold text-white shadow', col.card)}>
                {c.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="text-sm font-semibold">{c.name.split(' ')[0]}</span>
              <CalendarColorPicker
                hub={c.hub ?? bookings.find((b) => b.studentId === c.id)?.hub}
                value={colorOf.get(c.id)}
                onChange={(key) => saveColor(c.id, key)}
                label="Colour"
              />
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="h-80 animate-pulse rounded-3xl bg-muted/60" />
      ) : (
        <WeekCalendar events={events} onSelect={(ev) => setSelected(bookings.find((b) => b.id === ev.id) ?? null)} />
      )}

      <Dialog open={!!sel} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          {sel && selColor && (
            <DialogHeader>
              <div className={cn('-mx-6 -mt-6 rounded-t-lg px-6 pb-4 pt-6 text-white', selColor.card)}>
                <DialogTitle className="text-xl font-bold">{firstName(sel.studentId)} · {sel.title}</DialogTitle>
                <DialogDescription className="text-white/85">
                  {format(sel.start, 'EEEE, MMMM d')} · {format(sel.start, 'h:mm a')} ({sel.durationMin} min)
                </DialogDescription>
              </div>
              <div className="space-y-2 pt-3 text-left text-sm text-foreground">
                {sel.teacherName && <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {sel.teacherName}</div>}
                <div className="flex items-center gap-2 capitalize"><Clock className="h-4 w-4 text-muted-foreground" /> {sel.status}{sel.isTrial ? ' · trial lesson' : ''}</div>
              </div>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
