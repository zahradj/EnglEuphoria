import React, { useState, useMemo } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
  format,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, User, CheckCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useThemeMode } from "@/hooks/useThemeMode";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isAvailable: boolean;
}

interface StudentBookingCalendarGridProps {
  availableSlots: TimeSlot[];
  onBookLesson: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

// Cap the chips rendered directly in a day cell before folding the rest
// into a "+N more" popover — a teacher with a fully-open day can easily
// have 8+ half-hour slots, which would blow out the row height of every
// other week in the grid.
const MAX_VISIBLE_CHIPS_PER_DAY = 3;

/** Month-grid alternative to StudentBookingCalendarList — same data, same
 *  onBookLesson contract, laid out as a full month so a parent/student can
 *  see a teacher's whole month of openings at a glance instead of one day
 *  at a time. Selected from StudentBookingCalendar's list/calendar toggle. */
export const StudentBookingCalendarGrid = ({
  availableSlots,
  onBookLesson,
  isLoading = false,
}: StudentBookingCalendarGridProps) => {
  const navigate = useNavigate();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === "dark";

  const [localSlots, setLocalSlots] = useState<TimeSlot[]>(availableSlots);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  // Anchored to the month of the earliest slot so a student never lands
  // on an empty "today" page when the first opening is next month.
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const earliest = [...availableSlots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
    return startOfMonth(earliest ? earliest.startTime : new Date());
  });

  // Real-time subscription for availability changes.
  // No column filter — DELETE events under default replica identity don't
  // carry column values, so a filter like `is_available=eq.true` silently
  // drops them and the student keeps seeing "ghost" slots after a teacher
  // removes them. Listening to all events and re-fetching is correct.
  React.useEffect(() => {
    const subscription = supabase
      .channel('availability-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_availability',
        },
        () => {
          window.dispatchEvent(new CustomEvent('availability-changed'));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update local slots when prop changes, and re-anchor the visible month
  // the first time real slots arrive (covers the initial "loading -> data"
  // transition where availableSlots starts empty).
  const hadSlotsRef = React.useRef(false);
  React.useEffect(() => {
    setLocalSlots(availableSlots);
    if (!hadSlotsRef.current && availableSlots.length > 0) {
      hadSlotsRef.current = true;
      const earliest = [...availableSlots].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];
      setViewMonth(startOfMonth(earliest.startTime));
    }
  }, [availableSlots]);

  // Clear selection if the selected slot disappears (booked by someone
  // else, or the teacher removed it) from under the student.
  React.useEffect(() => {
    if (selectedSlot && !localSlots.some((s) => s.id === selectedSlot.id)) {
      setSelectedSlot(null);
    }
  }, [localSlots, selectedSlot]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    for (const slot of localSlots) {
      const key = format(slot.startTime, "yyyy-MM-dd");
      const existing = map.get(key);
      if (existing) existing.push(slot);
      else map.set(key, [slot]);
    }
    for (const slots of map.values()) {
      slots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
    return map;
  }, [localSlots]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const today = startOfDay(new Date());
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const glassPanel = cn(
    "rounded-2xl border p-6 transition-all duration-300",
    isDark
      ? "bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      : "bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
  );

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={glassPanel}>
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="w-5 h-5 text-primary" />
          {format(viewMonth, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {localSlots.length === 0 && (
        <div className={cn("mb-4 p-3 rounded-lg text-sm text-muted-foreground", isDark ? "bg-white/5" : "bg-muted/50")}>
          No open slots yet for this hub — browse another month, or check back soon.
        </div>
      )}

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const daySlots = slotsByDate.get(key) ?? [];
          const inMonth = isSameMonth(day, viewMonth);
          const isPast = isBefore(day, today);
          const visibleSlots = daySlots.slice(0, MAX_VISIBLE_CHIPS_PER_DAY);
          const overflowSlots = daySlots.slice(MAX_VISIBLE_CHIPS_PER_DAY);

          return (
            <div
              key={key}
              className={cn(
                "min-h-[6.5rem] rounded-lg border p-1 flex flex-col gap-1",
                isDark ? "border-white/10" : "border-gray-200/60",
                !inMonth && "opacity-40",
                isToday(day) && (isDark ? "bg-primary/10" : "bg-primary/5")
              )}
            >
              <span className={cn("text-xs px-1", isPast ? "text-muted-foreground/60" : "text-muted-foreground")}>
                {format(day, "d")}
              </span>

              {!isPast && visibleSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => slot.isAvailable && setSelectedSlot(isSelected ? null : slot)}
                    disabled={!slot.isAvailable || isLoading}
                    title={`${formatTime(slot.startTime)} – ${formatTime(slot.endTime)} · ${slot.teacherName}`}
                    className={cn(
                      "w-full rounded px-1.5 py-1 text-[11px] font-medium leading-tight text-left truncate transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      !slot.isAvailable && "opacity-40 cursor-not-allowed",
                      slot.isAvailable && !isSelected && (
                        isDark
                          ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                          : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      ),
                      isSelected && "bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                    )}
                  >
                    {formatTime(slot.startTime)}
                  </button>
                );
              })}

              {!isPast && overflowSlots.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full rounded px-1.5 py-1 text-[11px] font-medium text-left",
                        isDark ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      +{overflowSlots.length} more
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="flex flex-col gap-1">
                      {daySlots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => slot.isAvailable && setSelectedSlot(isSelected ? null : slot)}
                            disabled={!slot.isAvailable || isLoading}
                            className={cn(
                              "w-full rounded px-2 py-1.5 text-xs text-left transition-colors",
                              !slot.isAvailable && "opacity-40 cursor-not-allowed",
                              slot.isAvailable && !isSelected && "hover:bg-muted",
                              isSelected && "bg-indigo-600 text-white"
                            )}
                          >
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)} · {slot.teacherName}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          );
        })}
      </div>

      <div className={cn("mt-4 p-3 rounded-lg text-sm text-muted-foreground flex items-center gap-4", isDark ? "bg-white/5" : "bg-muted/50")}>
        <span className="flex items-center gap-1.5">
          <span className={cn("inline-block w-3 h-3 rounded-sm", isDark ? "bg-emerald-500/40" : "bg-emerald-200")} />
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-indigo-600" />
          Selected
        </span>
        <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => window.dispatchEvent(new Event('availability-changed'))}>
          <RefreshCcw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Selected slot confirmation bar */}
      {selectedSlot && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-4 transition-all duration-200",
            isDark ? "bg-white/5 border-indigo-500/30" : "bg-indigo-50/50 border-indigo-200/50"
          )}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{selectedSlot.teacherName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {format(selectedSlot.startTime, "EEE, MMM d")} · {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                </span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {selectedSlot.duration}min
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => onBookLesson(selectedSlot)}
              disabled={isLoading || !selectedSlot.isAvailable}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
            >
              {isLoading ? (
                <span className="animate-pulse">Booking…</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Book Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {localSlots.length === 0 && (
        <div className="mt-2 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/student')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};
