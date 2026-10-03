import React, { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAvailabilityManager } from './useAvailabilityManager';
import { SchedulerHeader } from './SchedulerHeader';
import { WeeklyCalendarGrid } from './WeeklyCalendarGrid';
import { supabase } from '@/integrations/supabase/client';
import { insertAvailabilitySlotsWithFallback } from '@/services/availabilityInsert';
import { openWeeklyRecurringSelections } from '@/services/recurringSlotsService';
import { addMinutes, setHours, setMinutes, format } from 'date-fns';
import { useTeacherHubRole } from '@/hooks/useTeacherHubRole';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, RotateCcw, Lock, Repeat, CalendarDays, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookedSlotManager } from './BookedSlotManager';
import { InviteStudentDialog } from './InviteStudentDialog';
import type { AvailabilitySlot } from './types';

interface ClassSchedulerProps {
  teacherName: string;
  teacherId: string;
  /** Optional override; otherwise derived from the teacher's hub role. */
  hubSpecialty?: 'Playground' | 'Academy' | 'Professional';
}

type SlotMode = 'single' | 'weekly';

export const ClassScheduler: React.FC<ClassSchedulerProps> = ({
  teacherName,
  teacherId,
  hubSpecialty,
}) => {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<SlotMode>('single');
  const [bookedSlot, setBookedSlot] = useState<AvailabilitySlot | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { hubKind, allowedDurations, loading: hubLoading, hubs, isMultiHub } = useTeacherHubRole(teacherId);

  // A teacher holding two or more hubs picks which hub they are opening slots for.
  const [pickedHub, setPickedHub] = useState<'playground' | 'academy' | 'success' | null>(null);
  const activeHub = isMultiHub
    ? (pickedHub && hubs.includes(pickedHub) ? pickedHub : (hubs.find((h) => h !== 'playground') ?? hubs[0]))
    : null;

  const resolvedHubSpecialty = useMemo<'Playground' | 'Academy' | 'Professional'>(() => {
    if (hubSpecialty) return hubSpecialty;
    if (activeHub) return activeHub === 'playground' ? 'Playground' : activeHub === 'success' ? 'Professional' : 'Academy';
    if (hubKind === 'playground') return 'Playground';
    if (hubKind === 'professional') return 'Professional';
    return 'Academy';
  }, [hubSpecialty, hubKind, activeHub]);

  const {
    slotDuration,
    setSlotDuration,
    getSlotAt,
    getOpenSlotsCount,
    getBookedSlotsCount,
    getWeekDates,
    isSlotInPast,
    isLoading,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
    goToThisWeek,
    refresh,
  } = useAvailabilityManager(allowedDurations, teacherId);

  // Slot length follows the hub: Playground 30 min, Academy / Success 60 min.
  React.useEffect(() => {
    if (activeHub) setSlotDuration(activeHub === 'playground' ? 30 : 60);
  }, [activeHub, setSlotDuration]);
  // With Playground in the mix the grid needs 30-minute rows to show every slot.
  const gridDuration: 30 | 60 = isMultiHub && hubs.includes('playground') ? 30 : slotDuration;

  const weekDates = getWeekDates();
  const hubForSlots: 'playground' | 'academy' | 'success' =
    resolvedHubSpecialty === 'Playground'
      ? 'playground'
      : resolvedHubSpecialty === 'Professional'
        ? 'success'
        : 'academy';

  const weekRangeLabel = useMemo(() => {
    if (weekDates.length === 0) return '';
    const first = weekDates[0].date;
    const last = weekDates[weekDates.length - 1].date;
    return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`;
  }, [weekDates]);

  // ── Direct click-to-toggle: insert single / insert weekly / delete open ──
  const handleCellClick = useCallback(
    async (day: string, time: string) => {
      const existing = getSlotAt(day, time);

      // Safety lock: never let a click delete a booked slot.
      if (existing?.status === 'booked') {
        setBookedSlot(existing);
        return;
      }

      if (isSlotInPast(day, time)) return;
      if (busy) return;

      const dayData = weekDates.find((d) => d.day === day);
      if (!dayData) return;
      const [h, m] = time.split(':').map(Number);
      // Build a precise local Date, then ship to Supabase as a UTC ISO string.
      const startTime = setMinutes(setHours(dayData.date, h), m);
      const endTime = addMinutes(startTime, slotDuration);

      setBusy(true);
      try {
        // ── DELETE: tap an existing OPEN slot ──
        if (existing && existing.status === 'open' && existing.id) {
          const { error } = await supabase
            .from('teacher_availability')
            .delete()
            .eq('id', existing.id)
            .eq('teacher_id', teacherId)
            .eq('is_booked', false); // never delete a booked row

          if (error) throw error;

          toast({
            title: 'Slot removed',
            description: `${day} · ${time} is no longer available.`,
          });
        }
        // ── INSERT: tap an empty cell ──
        else if (!existing) {
          // Mixed 30/60-minute slots must never overlap.
          if (isMultiHub) {
            const shift = (t: string, delta: number) => {
              const [hh, mm] = t.split(':').map(Number);
              const total = hh * 60 + mm + delta;
              if (total < 0 || total >= 1440) return null;
              return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
            };
            const before = shift(time, -30);
            const after = shift(time, 30);
            const prevLong = before ? getSlotAt(day, before) : undefined;
            const nextAny = after ? getSlotAt(day, after) : undefined;
            if ((prevLong && prevLong.duration === 60) || (slotDuration === 60 && nextAny)) {
              toast({
                title: 'That overlaps another slot',
                description: 'A 60-minute slot and a 30-minute slot cannot share the same time. Pick a free time.',
                variant: 'destructive',
              });
              return;
            }
          }
          if (mode === 'weekly') {
            const created = await openWeeklyRecurringSelections({
              teacherId,
              selections: [{ weekday: dayData.date.getDay(), time }],
              duration: slotDuration,
              weeksAhead: 12,
              startFrom: weekDates[0]?.date ?? new Date(),
              hub: hubForSlots,
            });
            toast({
              title: 'Weekly slot opened ✅',
              description: `${day} ${time} every week — ${created} slot${created === 1 ? '' : 's'} across the next 12 weeks.`,
            });
          } else {
            await insertAvailabilitySlotsWithFallback(supabase, [
              {
                teacher_id: teacherId,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration: slotDuration,
                lesson_type: 'free_slot',
                is_available: true,
                is_booked: false,
                hub_specialty: resolvedHubSpecialty,
              },
            ]);
            toast({
              title: 'Slot opened ✅',
              description: `${day} · ${time} is now available for students.`,
            });
          }
        }

        window.dispatchEvent(new Event('availability-changed'));
        await refresh();
      } catch (err: any) {
        console.error('[ClassScheduler] cell click failed:', err);
        toast({
          title: 'Could not save change',
          description: err?.message || 'Please try again in a moment.',
          variant: 'destructive',
        });
      } finally {
        setBusy(false);
      }
    },
    [busy, getSlotAt, isSlotInPast, weekDates, slotDuration, mode, teacherId, hubForSlots, resolvedHubSpecialty, refresh, toast, isMultiHub],
  );

  const onlyOneDuration = allowedDurations.length === 1;

  return (
    <div className="space-y-6">
      <SchedulerHeader
        teacherName={teacherName}
        openSlotsCount={getOpenSlotsCount()}
        bookedSlotsCount={getBookedSlotsCount()}
        hubSpecialty={resolvedHubSpecialty}
        slotDuration={slotDuration}
      />

      {/* Toolbar: Week nav + Mode toggle + Duration toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={weekOffset === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={goToThisWeek}
          >
            This week
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-semibold text-foreground tabular-nums">
            {weekRangeLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode toggle: Single ↔ Weekly */}
          <div className="inline-flex rounded-lg bg-muted p-1" role="tablist" aria-label="Slot mode">
            <button
              onClick={() => setMode('single')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                mode === 'single'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Single Slot
            </button>
            <button
              onClick={() => setMode('weekly')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                mode === 'weekly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Repeat className="h-3.5 w-3.5" />
              Weekly Recurring
            </button>
          </div>

          {/* Multi-hub teacher: choose the hub; the slot length follows it */}
          {isMultiHub ? (
            <div className="inline-flex rounded-xl bg-muted p-1" role="tablist" aria-label="Hub for new slots">
              {([
                ['playground', '🎪 Playground', '30 min', 'from-orange-400 to-rose-500'],
                ['academy', '📘 Academy', '60 min', 'from-violet-500 to-indigo-600'],
                ['success', '🏆 Success', '60 min', 'from-teal-500 to-emerald-600'],
              ] as const).filter(([k]) => hubs.includes(k)).map(([k, label, len, grad]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={activeHub === k}
                  onClick={() => setPickedHub(k)}
                  className={cn(
                    'flex flex-col items-center rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                    activeHub === k ? `bg-gradient-to-br ${grad} text-white shadow-sm` : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span>{label}</span>
                  <span className="text-[9px] font-medium opacity-80">{len}</span>
                </button>
              ))}
            </div>
          ) : onlyOneDuration ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">
              <Lock className="h-3 w-3" />
              {allowedDurations[0]}-min only
            </div>
          ) : (
            <div className="inline-flex rounded-lg bg-muted p-1">
              {allowedDurations.includes(30) && (
                <button
                  onClick={() => setSlotDuration(30)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    slotDuration === 30
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  30 min
                </button>
              )}
              {allowedDurations.includes(60) && (
                <button
                  onClick={() => setSlotDuration(60)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-semibold transition-all',
                    slotDuration === 60
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  60 min
                </button>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            disabled={isLoading}
            aria-label="Refresh schedule"
            title="Refresh schedule"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          </Button>

          <Button variant="default" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite a Student
          </Button>
        </div>
      </div>

      {/* Helper hint + legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border/50 bg-card/70 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur">
        <span className="font-semibold text-foreground">
          Tap a cell to {mode === 'weekly' ? 'open it every week for 12 weeks' : 'open a single slot'}.
        </span>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-md bg-emerald-50 ring-1 ring-emerald-300" /> Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex -space-x-1">
            <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 ring-2 ring-card" />
            <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ring-2 ring-card" />
            <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 ring-2 ring-card" />
          </span>
          Booked (Playground · Academy · Success)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-md bg-slate-100 ring-1 ring-slate-300" /> Cancelled by you
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-md bg-amber-50 ring-1 ring-amber-300" /> Cancelled by student
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 rounded-full bg-rose-500" /> Now
        </span>
      </div>

      {/* Calendar grid — full width, no sidebar */}
      <div className="relative">
        {(isLoading || busy) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/40 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <WeeklyCalendarGrid
          weekDates={weekDates}
          getSlotAt={getSlotAt}
          isSlotInPast={isSlotInPast}
          onSlotClick={handleCellClick}
          onBookedSlotClick={setBookedSlot}
          slotDuration={gridDuration}
          showHubTags={isMultiHub}
        />
      </div>

      <BookedSlotManager
        open={!!bookedSlot}
        onOpenChange={(open) => { if (!open) setBookedSlot(null); }}
        slot={bookedSlot ? {
          slotId: bookedSlot.id,
          studentName: bookedSlot.studentName,
          studentShortId: bookedSlot.studentShortId,
          lessonTitle: bookedSlot.lessonTitle,
          hub: bookedSlot.hub ?? null,
          startTime: bookedSlot.startTime ? new Date(bookedSlot.startTime) : new Date(),
          duration: bookedSlot.duration,
          isRecurring: !!bookedSlot.recurringPattern,
        } : null}
        onCancelled={() => {
          setBookedSlot(null);
          refresh();
        }}
      />

      <InviteStudentDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        teacherId={teacherId}
        hub={hubForSlots}
        onInvited={() => refresh()}
      />
    </div>
  );
};
