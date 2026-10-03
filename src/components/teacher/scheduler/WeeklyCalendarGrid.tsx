import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AvailabilitySlot, TIME_SLOTS } from './types';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Moon, Sunrise, Sun, Sunset, Plus } from 'lucide-react';

interface WeeklyCalendarGridProps {
  weekDates: Array<{ day: string; date: Date; formatted: string }>;
  getSlotAt: (day: string, time: string) => AvailabilitySlot | undefined;
  isSlotInPast: (day: string, time: string) => boolean;
  onSlotClick: (day: string, time: string) => void;
  onBookedSlotClick?: (slot: AvailabilitySlot) => void;
  slotDuration: 30 | 60;
}

type Period = 'night' | 'morning' | 'afternoon' | 'evening';

const periodFor = (hour: number): Period => {
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const PERIOD_META: Record<Period, { label: string; icon: React.ReactNode; tint: string; chip: string }> = {
  night:     { label: 'Night',     icon: <Moon className="h-3 w-3" />,    tint: 'bg-indigo-500/[0.035]', chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
  morning:   { label: 'Morning',   icon: <Sunrise className="h-3 w-3" />, tint: 'bg-amber-400/[0.05]',   chip: 'bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30' },
  afternoon: { label: 'Afternoon', icon: <Sun className="h-3 w-3" />,     tint: 'bg-sky-400/[0.045]',    chip: 'bg-sky-400/15 text-sky-700 dark:text-sky-300 border-sky-400/30' },
  evening:   { label: 'Evening',   icon: <Sunset className="h-3 w-3" />,  tint: 'bg-rose-400/[0.045]',   chip: 'bg-rose-400/15 text-rose-700 dark:text-rose-300 border-rose-400/30' },
};

/** Booked lessons are coloured by hub; a cancelled / available slot has its own calmer look. */
const HUB_BOOKED: Record<'playground' | 'academy' | 'success', string> = {
  playground: 'bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 shadow-orange-500/25 ring-orange-300/50 hover:brightness-105',
  academy:    'bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-600 shadow-violet-500/25 ring-violet-300/50 hover:brightness-105',
  success:    'bg-gradient-to-br from-teal-500 via-emerald-600 to-cyan-600 shadow-emerald-500/25 ring-emerald-300/50 hover:brightness-105',
};

const formatHour12 = (time: string) => {
  const [h] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return { hr, period };
};

const COLS = 'grid-cols-[76px_repeat(7,1fr)]';

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
  weekDates,
  getSlotAt,
  isSlotInPast,
  onSlotClick,
  onBookedSlotClick,
  slotDuration,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Minute tick so the "now" line moves while the page stays open.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const getSlotStyle = (day: string, time: string, joinTop: boolean, joinBottom: boolean) => {
    const slot = getSlotAt(day, time);
    const isPast = isSlotInPast(day, time);

    if (isPast) {
      // Lessons that already happened keep their full hub colour (only very
      // slightly softened), so the history of the week stays vivid and readable.
      // Empty past time just gets a fine diagonal hatch.
      if (slot?.status === 'booked') {
        return cn(
          HUB_BOOKED[slot.hub ?? 'academy'],
          'text-white opacity-90 cursor-default shadow-md ring-1',
          (joinTop || joinBottom) && 'shadow-none bg-[length:100%_200%]',
          joinBottom && !joinTop && 'bg-top',
          joinTop && !joinBottom && 'bg-bottom',
        );
      }
      if (slot?.cancelledBy === 'teacher') {
        return 'cursor-default bg-slate-100 text-slate-600 ring-1 ring-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-600';
      }
      if (slot?.cancelledBy === 'student') {
        return 'cursor-default bg-amber-50 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/40';
      }
      return 'cursor-not-allowed bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(100,116,139,0.07)_6px,rgba(100,116,139,0.07)_7px)] opacity-80';
    }

    if (!slot) {
      return 'bg-transparent hover:bg-primary/10 cursor-pointer hover:shadow-inner transition-all duration-150';
    }

    if (slot.status === 'booked') {
      // Safety-locked: click opens the cancel modal, never deletes directly.
      return cn(
        HUB_BOOKED[slot.hub ?? 'academy'],
        'text-white shadow-lg ring-1 cursor-pointer transition-all duration-150',
        // One continuous gradient across both halves of a one-hour lesson, so there is no seam.
        (joinTop || joinBottom) && 'shadow-none bg-[length:100%_200%]',
        joinBottom && !joinTop && 'bg-top',
        joinTop && !joinBottom && 'bg-bottom',
      );
    }

    if (slot.status === 'selected') {
      return 'bg-primary text-primary-foreground cursor-pointer shadow-md ring-2 ring-primary/40 transition-all';
    }

    // Reopened after a cancellation — still bookable, but tinted so the teacher
    // can see whose call it was to cancel.
    if (slot.cancelledBy === 'teacher') {
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-300 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-600 cursor-pointer transition-all';
    }
    if (slot.cancelledBy === 'student') {
      return 'bg-amber-50 text-amber-800 ring-1 ring-amber-300 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/40 cursor-pointer transition-all';
    }

    // Available: a calm mint chip, so it never competes with booked lessons.
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 hover:ring-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/30 cursor-pointer shadow-sm transition-all duration-150';
  };

  const renderSlotContent = (day: string, time: string, joinTop: boolean, joinBottom: boolean) => {
    const slot = getSlotAt(day, time);
    const isPast = isSlotInPast(day, time);

    // A past slot that was never booked has nothing worth showing — but a past
    // slot that WAS booked (or booked and later cancelled) should still show
    // who/what it was for.
    if (isPast && !slot) return null;
    if (isPast && slot?.status !== 'booked' && !slot?.cancelledBy) return null;

    if (!slot) {
      return (
        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <Plus className="h-3 w-3" strokeWidth={3} />
        </span>
      );
    }

    if (slot.status === 'booked') {
      const hubEmoji = slot.hub === 'playground' ? '🎪' : slot.hub === 'success' ? '🏆' : '📘';
      const tooltip = [slot.studentName, slot.studentShortId, slot.studentEmail, slot.lessonTitle]
        .filter(Boolean)
        .join(' • ');
      // The lower half of a one-hour lesson stays clean — the card above carries the details.
      if (joinTop) {
        return <div className="h-full w-full" title={tooltip} />;
      }
      const initial = (slot.studentName || '?').trim().charAt(0).toUpperCase();
      return (
        <div
          className="flex h-full w-full min-w-0 flex-col items-stretch justify-center gap-[1px] overflow-hidden px-1.5 py-0.5 text-left leading-tight"
          title={tooltip}
        >
          <div className="flex w-full min-w-0 items-center gap-1.5">
            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/25 text-[9px] font-extrabold" aria-hidden>
              {initial}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11px] font-bold">{slot.studentName || 'Booked'}</span>
            <span className="shrink-0 text-[10px]" aria-hidden>{hubEmoji}</span>
          </div>
          {(joinBottom || slot.studentShortId || slot.lessonTitle) && (
            <span className="block w-full truncate pl-[22px] text-[9.5px] font-medium opacity-85">
              {joinBottom ? '1 hour' : ''}
              {joinBottom && slot.studentShortId ? ' · ' : ''}
              {slot.studentShortId ? `#${String(slot.studentShortId).replace(/^#/, '')}` : ''}
              {!joinBottom && !slot.studentShortId ? slot.lessonTitle : ''}
            </span>
          )}
        </div>
      );
    }

    // Not currently booked, but this time carries a cancellation — show who
    // cancelled instead of a blank "Open" cell.
    if (slot.cancelledBy) {
      const label = slot.cancelledBy === 'teacher' ? 'Cancelled by you' : 'Cancelled by student';
      return (
        <div className="flex h-full w-full flex-col items-stretch justify-center gap-[1px] overflow-hidden px-1.5 py-0.5 leading-tight" title={slot.cancelledStudentName ? `${label} · ${slot.cancelledStudentName}` : label}>
          <span className="w-full truncate text-left text-[9px] font-bold uppercase tracking-wide opacity-90 line-through decoration-1">
            {label}
          </span>
          {slot.cancelledStudentName && (
            <span className="w-full truncate text-left text-[9.5px] opacity-80">
              {slot.cancelledStudentName}
            </span>
          )}
        </div>
      );
    }

    if (slot.status === 'selected') {
      return <span className="text-[10px] font-bold">Selected</span>;
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {slot.duration}m
      </span>
    );
  };

  // Build rows. For 60-min hubs (Academy / Success) only render hour-aligned rows
  // so each cell visually represents a full one-hour slot. For 30-min hubs
  // (Playground) keep both :00 and :30.
  const rows = useMemo(() => {
    const all = TIME_SLOTS.map((time) => {
      const [h, m] = time.split(':').map(Number);
      return { time, hour: h, minute: m, isHour: m === 0, period: periodFor(h) };
    });
    return slotDuration === 60 ? all.filter((r) => r.isHour) : all;
  }, [slotDuration]);

  // Auto-scroll to morning (06:00) on first render so the 24h grid isn't disorienting
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rowPx = slotDuration === 60 ? 56 : 36;
    const targetIdx = slotDuration === 60 ? 6 : 12; // 06:00
    el.scrollTop = targetIdx * rowPx;
  }, [slotDuration]);

  /** Same lesson, same student, directly adjacent → draw as one joined block. */
  const sameLesson = (a?: AvailabilitySlot, b?: AvailabilitySlot) =>
    !!a && !!b && a.status === 'booked' && b.status === 'booked' &&
    (a.studentId ?? a.studentName) === (b.studentId ?? b.studentName) &&
    (a.hub ?? null) === (b.hub ?? null);

  const todayIdx = weekDates.findIndex(({ date }) => isToday(date));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/5 ring-1 ring-black/[0.02]">
      {/* Below md, the 7 day columns don't fit a phone width — this min-width keeps
          each column usable and lets the card scroll horizontally instead of
          squeezing every column down to an unreadable sliver. */}
      <div className="min-w-[720px] md:min-w-0">
        {/* Sticky header with days */}
        <div className={cn('sticky top-0 z-20 grid border-b border-border/60 bg-card/85 backdrop-blur-md', COLS)}>
          <div className="flex items-center justify-center p-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Time
          </div>
          {weekDates.map(({ day, date }) => {
            const today = isToday(date);
            return (
              <div
                key={day}
                className={cn(
                  'flex flex-col items-center gap-0.5 border-l border-border/40 px-2 py-2.5 transition-colors',
                  today && 'bg-primary/[0.07]',
                )}
              >
                <p className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', today ? 'text-primary' : 'text-muted-foreground')}>
                  {day.slice(0, 3)}
                </p>
                <span
                  className={cn(
                    'grid h-8 min-w-8 place-items-center rounded-full px-1 text-base font-extrabold tabular-nums leading-none',
                    today
                      ? 'bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/30'
                      : 'text-foreground',
                  )}
                >
                  {format(date, 'd')}
                </span>
                <p className="text-[10px] font-medium text-muted-foreground/80">{format(date, 'MMM')}</p>
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div ref={scrollRef} className="max-h-[640px] overflow-y-auto scroll-smooth">
          {rows.map((row, idx) => {
            const prev = rows[idx - 1];
            const next = rows[idx + 1];
            const showPeriodDivider = !prev || prev.period !== row.period;
            const meta = PERIOD_META[row.period];
            const { hr, period } = formatHour12(row.time);

            // Where "now" falls inside this row (0..1), if it does.
            const rowStartMin = row.hour * 60 + row.minute;
            const rowSpan = slotDuration === 60 ? 60 : 30;
            const nowFraction = nowMinutes >= rowStartMin && nowMinutes < rowStartMin + rowSpan
              ? (nowMinutes - rowStartMin) / rowSpan
              : null;

            return (
              <React.Fragment key={row.time}>
                {showPeriodDivider && (
                  <div className={cn('grid bg-muted/20', COLS)}>
                    <div className="col-span-8 flex items-center gap-3 px-3 py-1.5">
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', meta.chip)}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="h-px flex-1 bg-gradient-to-r from-border/70 to-transparent" />
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    'relative grid',
                    COLS,
                    row.isHour ? 'border-t border-border/50' : 'border-t border-dashed border-border/25',
                    meta.tint,
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-end gap-1 border-r border-border/30 pr-2.5 text-muted-foreground',
                      row.isHour ? 'text-xs font-semibold text-foreground/80' : 'text-[10px] text-muted-foreground/60',
                    )}
                  >
                    {slotDuration === 60 ? (
                      <span className="whitespace-nowrap text-[11px] font-semibold tabular-nums">
                        {hr}–{((hr % 12) + 1) || 12} <span className="text-[9px] opacity-70">{period}</span>
                      </span>
                    ) : row.isHour ? (
                      <>
                        <span className="tabular-nums">{hr}</span>
                        <span className="text-[9px] font-bold opacity-70">{period}</span>
                      </>
                    ) : (
                      <span className="tabular-nums">:30</span>
                    )}
                  </div>

                  {weekDates.map(({ day, date }) => {
                    const today = isToday(date);
                    const slot = getSlotAt(day, row.time);
                    const joinTop = !!prev && sameLesson(slot, getSlotAt(day, prev.time));
                    const joinBottom = !!next && sameLesson(slot, getSlotAt(day, next.time));
                    return (
                      <button
                        key={`${day}-${row.time}`}
                        onClick={() => {
                          if (slot?.status === 'booked') onBookedSlotClick?.(slot);
                          else onSlotClick(day, row.time);
                        }}
                        className={cn(
                          'group relative m-[2px] flex items-center justify-center border-l border-transparent',
                          slotDuration === 60 ? 'h-14' : row.isHour ? 'h-9' : 'h-8',
                          // A one-hour lesson: square the touching edges and close the gap.
                          joinTop && joinBottom ? 'rounded-none' : joinTop ? 'rounded-t-none rounded-b-xl' : joinBottom ? 'rounded-b-none rounded-t-xl' : 'rounded-xl',
                          joinTop && '-mt-[4px] pt-[4px] z-[1]',
                          today && !slot && 'bg-primary/[0.035]',
                          getSlotStyle(day, row.time, joinTop, joinBottom),
                        )}
                        disabled={isSlotInPast(day, row.time)}
                        aria-label={`${day} ${row.time}`}
                      >
                        {renderSlotContent(day, row.time, joinTop, joinBottom)}
                      </button>
                    );
                  })}

                  {/* "Now" line across today's column */}
                  {todayIdx >= 0 && nowFraction !== null && (
                    <div
                      className="pointer-events-none absolute z-10"
                      style={{
                        left: `calc(76px + (100% - 76px) * ${todayIdx} / 7)`,
                        width: 'calc((100% - 76px) / 7)',
                        top: `${nowFraction * 100}%`,
                      }}
                      aria-hidden
                    >
                      <div className="relative h-0.5 w-full rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                        <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-rose-500" />
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
