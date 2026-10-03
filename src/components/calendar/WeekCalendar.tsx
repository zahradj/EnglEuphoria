import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveCalendarColor } from '@/lib/calendarColors';

/**
 * Week calendar for students and families — one lesson per card, placed by its
 * real start time and length (so 30 min, 60 min and invited lessons all line up
 * the same way). Lessons are coloured by hub, or by the colour the child chose
 * from their hub's palette. Same look as the teacher's schedule.
 */
export interface CalendarEvent {
  id: string;
  start: Date;
  durationMin: number;
  title: string;
  /** Second line (teacher, or the child's name on a family calendar). */
  subtitle?: string;
  hub: string | null | undefined;
  /** The child's chosen colour key (must belong to the hub's palette). */
  colorKey?: string | null;
  status: string;
}

interface WeekCalendarProps {
  events: CalendarEvent[];
  onSelect?: (event: CalendarEvent) => void;
  className?: string;
}

const HOUR_PX = 56;
const HALF = HOUR_PX / 2;
const GUTTER = 56;
const FIRST_VISIBLE_HOUR = 7;

const isCancelled = (s: string) => ['cancelled', 'canceled', 'rescheduled', 'refunded'].includes(s.toLowerCase());

/** Side-by-side lanes for lessons that overlap in the same day. */
function layoutDay(events: CalendarEvent[]) {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: { ev: CalendarEvent; lane: number; lanes: number }[] = [];
  let cluster: { ev: CalendarEvent; lane: number; end: number }[] = [];
  let clusterEnd = 0;

  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.push({ ev: c.ev, lane: c.lane, lanes }));
    cluster = [];
  };

  for (const ev of sorted) {
    const s = ev.start.getTime();
    const e = s + ev.durationMin * 60_000;
    if (cluster.length && s >= clusterEnd) flush();
    const used = new Set(cluster.filter((c) => c.end > s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ ev, lane, end: e });
    clusterEnd = Math.max(clusterEnd, e);
  }
  if (cluster.length) flush();
  return out;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({ events, onSelect, className }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const weekStart = useMemo(() => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 }), [weekOffset]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const byDay = useMemo(
    () => days.map((d) => layoutDay(events.filter((e) => isSameDay(e.start, d)))),
    [days, events],
  );
  const weekCount = byDay.reduce((n, d) => n + d.filter((x) => !isCancelled(x.ev.status)).length, 0);

  // Start the view at the first lesson of the week (or 7 AM) instead of midnight.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstHour = Math.min(
      FIRST_VISIBLE_HOUR,
      ...events
        .filter((e) => days.some((d) => isSameDay(e.start, d)))
        .map((e) => Math.max(0, e.start.getHours() - 1)),
    );
    el.scrollTop = firstHour * HOUR_PX;
  }, [weekStart, events, days]);

  const nowOffset = (now.getHours() * 60 + now.getMinutes()) * (HOUR_PX / 60);
  const todayIdx = days.findIndex((d) => isSameDay(d, now));
  const rangeLabel = `${format(days[0], 'MMM d')} – ${format(days[6], 'MMM d, yyyy')}`;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant={weekOffset === 0 ? 'default' : 'outline'} size="sm" onClick={() => setWeekOffset(0)}>
            This week
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-sm font-semibold tabular-nums text-foreground">{rangeLabel}</span>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {weekCount} lesson{weekCount === 1 ? '' : 's'} this week
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-3xl border border-border/60 bg-card shadow-xl shadow-primary/5">
        <div className="min-w-[680px] md:min-w-0">
          {/* Day header */}
          <div className="sticky top-0 z-20 grid border-b border-border/60 bg-card/85 backdrop-blur-md" style={{ gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)` }}>
            <div />
            {days.map((d) => {
              const today = isSameDay(d, now);
              return (
                <div key={d.toISOString()} className={cn('flex flex-col items-center gap-0.5 border-l border-border/40 px-2 py-2.5', today && 'bg-primary/[0.07]')}>
                  <p className={cn('text-[10px] font-bold uppercase tracking-[0.14em]', today ? 'text-primary' : 'text-muted-foreground')}>{format(d, 'EEE')}</p>
                  <span
                    className={cn(
                      'grid h-8 min-w-8 place-items-center rounded-full px-1 text-base font-extrabold tabular-nums leading-none',
                      today ? 'bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-md shadow-primary/30' : 'text-foreground',
                    )}
                  >
                    {format(d, 'd')}
                  </span>
                  <p className="text-[10px] font-medium text-muted-foreground/80">{format(d, 'MMM')}</p>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div ref={scrollRef} className="max-h-[560px] overflow-y-auto" style={{ scrollBehavior: 'auto' }}>
            <div className="relative grid" style={{ gridTemplateColumns: `${GUTTER}px repeat(7, 1fr)`, height: 24 * HOUR_PX }}>
              {/* Hour labels + lines */}
              <div className="relative border-r border-border/30">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="absolute right-2 -translate-y-1/2 text-[10px] font-semibold tabular-nums text-muted-foreground/80" style={{ top: h * HOUR_PX }}>
                    {h === 0 ? '' : `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? 'PM' : 'AM'}`}
                  </div>
                ))}
              </div>

              {days.map((d, di) => {
                const today = isSameDay(d, now);
                return (
                  <div key={d.toISOString()} className={cn('relative border-l border-border/40', today && 'bg-primary/[0.035]')}>
                    {Array.from({ length: 24 }, (_, h) => (
                      <React.Fragment key={h}>
                        <div className="absolute inset-x-0 border-t border-border/50" style={{ top: h * HOUR_PX }} />
                        <div className="absolute inset-x-0 border-t border-dashed border-border/25" style={{ top: h * HOUR_PX + HALF }} />
                      </React.Fragment>
                    ))}

                    {byDay[di].map(({ ev, lane, lanes }) => {
                      const top = (ev.start.getHours() * 60 + ev.start.getMinutes()) * (HOUR_PX / 60);
                      const height = Math.max(HALF - 4, ev.durationMin * (HOUR_PX / 60) - 4);
                      const end = new Date(ev.start.getTime() + ev.durationMin * 60_000);
                      const past = end.getTime() < now.getTime();
                      const cancelled = isCancelled(ev.status);
                      const color = resolveCalendarColor(ev.hub, ev.colorKey);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => onSelect?.(ev)}
                          className={cn(
                            'absolute z-[1] overflow-hidden rounded-xl px-2 py-1 text-left leading-tight transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            cancelled
                              ? 'bg-slate-100 text-slate-500 ring-1 ring-slate-300 dark:bg-slate-800/70 dark:text-slate-300 dark:ring-slate-600'
                              : cn(color.card, 'text-white ring-1 ring-white/30', past ? 'opacity-60 shadow-sm' : 'shadow-lg hover:brightness-105'),
                          )}
                          style={{
                            top: top + 2,
                            height,
                            left: `calc(${(lane / lanes) * 100}% + 3px)`,
                            width: `calc(${100 / lanes}% - 6px)`,
                          }}
                          title={`${ev.title} · ${format(ev.start, 'HH:mm')}–${format(end, 'HH:mm')}`}
                        >
                          <span className={cn('block truncate text-[11px] font-bold', cancelled && 'line-through decoration-1')}>{ev.title}</span>
                          <span className="block truncate text-[10px] font-medium opacity-90">
                            {format(ev.start, 'h:mm')}–{format(end, 'h:mm a')}
                            {ev.subtitle ? ` · ${ev.subtitle}` : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* "Now" line across today's column */}
              {todayIdx >= 0 && (
                <div
                  className="pointer-events-none absolute z-10"
                  style={{
                    left: `calc(${GUTTER}px + (100% - ${GUTTER}px) * ${todayIdx} / 7)`,
                    width: `calc((100% - ${GUTTER}px) / 7)`,
                    top: nowOffset,
                  }}
                  aria-hidden
                >
                  <div className="relative h-0.5 w-full rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                    <span className="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-rose-500" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
