import React, { useEffect, useMemo, useRef } from 'react';
import { AvailabilitySlot, TIME_SLOTS } from './types';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Moon, Sunrise, Sun, Sunset } from 'lucide-react';

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
  night:     { label: 'Night',     icon: <Moon className="h-3 w-3" />,    tint: 'bg-indigo-500/[0.04]', chip: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
  morning:   { label: 'Morning',   icon: <Sunrise className="h-3 w-3" />, tint: 'bg-amber-500/[0.04]',  chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
  afternoon: { label: 'Afternoon', icon: <Sun className="h-3 w-3" />,     tint: 'bg-sky-500/[0.04]',    chip: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20' },
  evening:   { label: 'Evening',   icon: <Sunset className="h-3 w-3" />,  tint: 'bg-rose-500/[0.04]',   chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' },
};

const formatHour12 = (time: string) => {
  const [h] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return { hr, period };
};

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
  weekDates,
  getSlotAt,
  isSlotInPast,
  onSlotClick,
  onBookedSlotClick,
  slotDuration,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getSlotStyle = (day: string, time: string) => {
    const slot = getSlotAt(day, time);
    const isPast = isSlotInPast(day, time);

    if (isPast) {
      return 'bg-muted/40 cursor-not-allowed opacity-50';
    }

    if (!slot) {
      return 'bg-background/60 hover:bg-primary/10 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all';
    }

    if (slot.status === 'booked') {
      // Safety-locked: cursor stays default-ish; click opens cancel modal, never deletes directly.
      return 'bg-violet-600 text-white shadow-md ring-1 ring-violet-400/50 cursor-pointer hover:bg-violet-700 transition-all';
    }

    if (slot.status === 'selected') {
      return 'bg-primary text-primary-foreground cursor-pointer shadow-md ring-2 ring-primary/40 transition-all';
    }

    return 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white cursor-pointer shadow-md ring-1 ring-emerald-400/40 transition-all';
  };

  const renderSlotContent = (day: string, time: string) => {
    const slot = getSlotAt(day, time);
    const isPast = isSlotInPast(day, time);

    if (isPast) return null;

    if (!slot) {
      return (
        <span className="text-[11px] text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
          +
        </span>
      );
    }

    if (slot.status === 'booked') {
      const hubEmoji = slot.hub === 'playground' ? '🎪' : slot.hub === 'success' ? '🏆' : '📘';
      const tooltip = [slot.studentName, slot.studentShortId, slot.studentEmail, slot.lessonTitle]
        .filter(Boolean)
        .join(' • ');
      return (
        <div
          className="flex flex-col items-stretch justify-center gap-[1px] px-1 py-0.5 w-full h-full leading-tight overflow-hidden"
          title={tooltip}
        >
          {/* Row 1: hub badge + student name. Badge is fixed-width so the name truncates cleanly. */}
          <div className="flex items-center gap-1 w-full min-w-0">
            {slot.hub && (
              <span className="shrink-0 rounded-full bg-white/25 px-1 text-[9px] leading-none flex items-center justify-center h-3.5">
                {hubEmoji}
              </span>
            )}
            <span className="flex-1 min-w-0 text-[10px] font-semibold truncate text-left">
              {slot.studentName || 'Booked'}
            </span>
          </div>

          {/* Row 2: short ID — own line so it never collides with the name or badge. */}
          {slot.studentShortId && (
            <span className="block text-[9px] font-mono opacity-90 truncate w-full text-left">
              #{String(slot.studentShortId).replace(/^#/, '')}
            </span>
          )}

          {/* Row 3 (only if there is vertical room — hidden on the densest rows). */}
          {slot.lessonTitle && (
            <span className="hidden sm:block text-[9px] opacity-80 truncate w-full text-left leading-tight">
              {slot.lessonTitle}
            </span>
          )}
        </div>
      );
    }

    if (slot.status === 'selected') {
      return <span className="text-[10px] font-bold">Selected</span>;
    }

    return <span className="text-[10px] font-bold">{slot.duration}m</span>;
  };

  // Build rows. For 60-min hubs (Academy / Success) only render hour-aligned rows
  // so each cell visually represents a full one-hour slot (e.g. 6→7, 7→8…).
  // For 30-min hubs (Playground) keep both :00 and :30.
  const rows = useMemo(() => {
    const all = TIME_SLOTS.map((time) => {
      const [h, m] = time.split(':').map(Number);
      return { time, hour: h, minute: m, isHour: m === 0, period: periodFor(h) };
    });
    return slotDuration === 60 ? all.filter((r) => r.isHour) : all;
  }, [slotDuration]);

  // Auto-scroll to morning (06:00) on first render so 24h grid isn't disorienting
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const rowPx = slotDuration === 60 ? 56 : 36;
    const targetIdx = slotDuration === 60 ? 6 : 12; // 06:00
    el.scrollTop = targetIdx * rowPx;
  }, [slotDuration]);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Sticky Header row with days */}
      <div className="grid grid-cols-[88px_repeat(7,1fr)] border-b border-border bg-gradient-to-b from-muted/60 to-muted/20 backdrop-blur sticky top-0 z-20">
        <div className="p-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-center">
          Time
        </div>
        {weekDates.map(({ day, date, formatted }) => {
          const today = isToday(date);
          return (
            <div
              key={day}
              className={cn(
                'p-2 text-center border-l border-border/60 transition-colors',
                today && 'bg-primary/15'
              )}
            >
              <p className={cn('text-xs font-bold tracking-wide', today ? 'text-primary' : 'text-foreground')}>
                {day.slice(0, 3).toUpperCase()}
              </p>
              <p className={cn('text-[10px] mt-0.5', today ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                {formatted}
              </p>
              {today && (
                <span className="mt-1 inline-block h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid — taller for 24h coverage */}
      <div ref={scrollRef} className="max-h-[640px] overflow-y-auto scroll-smooth">
        {rows.map((row, idx) => {
          const prev = rows[idx - 1];
          const showPeriodDivider = !prev || prev.period !== row.period;
          const meta = PERIOD_META[row.period];
          const { hr, period } = formatHour12(row.time);

          return (
            <React.Fragment key={row.time}>
              {showPeriodDivider && (
                <div className="grid grid-cols-[88px_repeat(7,1fr)] border-b border-border/60 bg-muted/20">
                  <div className="col-span-8 px-3 py-1.5 flex items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', meta.chip)}>
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>
                </div>
              )}

              <div
                className={cn(
                  'grid grid-cols-[88px_repeat(7,1fr)]',
                  row.isHour ? 'border-b border-border/60' : 'border-b border-border/20',
                  meta.tint,
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-end gap-1 pr-2 text-muted-foreground border-r border-border/40',
                    row.isHour ? 'text-xs font-semibold text-foreground/80' : 'text-[10px] text-muted-foreground/70'
                  )}
                >
                  {slotDuration === 60 ? (
                    <span className="tabular-nums whitespace-nowrap text-[11px] font-semibold">
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
                  return (
                    <button
                      key={`${day}-${row.time}`}
                      onClick={() => {
                        if (slot?.status === 'booked') onBookedSlotClick?.(slot);
                        else onSlotClick(day, row.time);
                      }}
                      className={cn(
                        'group border-l border-border/40 flex items-center justify-center rounded-[3px] m-[1px]',
                        slotDuration === 60 ? 'h-14' : row.isHour ? 'h-9' : 'h-8',
                        today && 'ring-inset ring-1 ring-primary/10',
                        getSlotStyle(day, row.time)
                      )}
                      disabled={isSlotInPast(day, row.time)}
                      aria-label={`${day} ${row.time}`}
                    >
                      {renderSlotContent(day, row.time)}
                    </button>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
