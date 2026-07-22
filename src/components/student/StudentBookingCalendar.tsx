import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, CheckCircle, Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
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

interface StudentBookingCalendarProps {
  availableSlots: TimeSlot[];
  onBookLesson: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export const StudentBookingCalendar = ({ 
  availableSlots, 
  onBookLesson, 
  isLoading = false 
}: StudentBookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [localSlots, setLocalSlots] = useState<TimeSlot[]>(availableSlots);
  const navigate = useNavigate();
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === 'dark';

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


  // Update local slots when prop changes
  React.useEffect(() => {
    setLocalSlots(availableSlots);
  }, [availableSlots]);

  // Clear selected slot when date changes
  React.useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const getSlotsForDate = (date: Date) => {
    return localSlots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return slotDate.toDateString() === date.toDateString();
    });
  };

  const getDatesWithSlots = () => {
    const dates = new Set<string>();
    localSlots.forEach(slot => {
      dates.add(new Date(slot.startTime).toDateString());
    });
    return Array.from(dates).map(dateStr => new Date(dateStr));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const availableDates = getDatesWithSlots();
  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  // Auto-jump to the first date that actually has slots if today (or selected date) has none
  React.useEffect(() => {
    if (localSlots.length === 0) return;
    if (!selectedDate) return;
    const hasOnSelected = localSlots.some(
      s => new Date(s.startTime).toDateString() === selectedDate.toDateString()
    );
    if (!hasOnSelected) {
      const firstWithSlots = [...localSlots]
        .map(s => new Date(s.startTime))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      if (firstWithSlots) {
        const normalised = new Date(firstWithSlots.toDateString());
        setSelectedDate(normalised);
      }
    }
    // Only react when the slot set changes — not on every selectedDate change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSlots]);

  // Glass panel base classes
  const glassPanel = cn(
    "rounded-2xl border p-6 transition-all duration-300",
    isDark
      ? "bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      : "bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
  );

  // Empty state — keep the calendar visible so the user can still browse dates
  if (localSlots.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={glassPanel}>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Select a Date
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            className="rounded-md border-0 pointer-events-auto"
          />
        </div>
        <div className={glassPanel}>
          <div className="text-center py-12 space-y-4">
            <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold mb-2">No Available Slots Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find open times for your hub right now. Try a different date, or check back soon.
              </p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={() => window.location.reload()}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => navigate('/student')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Glass Calendar */}
      <div className={glassPanel}>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Select a Date
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isBeforeToday = date < today;
            const hasSlots = availableDates.some(availableDate => 
              availableDate.toDateString() === date.toDateString()
            );
            return isBeforeToday || !hasSlots;
          }}
          modifiers={{
            available: availableDates
          }}
          modifiersStyles={{
            available: {
              backgroundColor: 'hsl(var(--primary))',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
          className="rounded-md border-0 pointer-events-auto"
        />
        <div className={cn(
          "mt-4 p-3 rounded-lg",
          isDark ? "bg-white/5" : "bg-muted/50"
        )}>
          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2" />
            Dates with available lessons
          </p>
        </div>
      </div>

      {/* Glass Time Slots Panel */}
      <div className={glassPanel}>
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Clock className="w-5 h-5 text-primary" />
          Available Times
          {selectedDate && (
            <Badge variant="outline" className="ml-2 text-xs">
              {selectedDate.toLocaleDateString()}
            </Badge>
          )}
        </h3>

        {!selectedDate ? (
          <div className="text-center py-8 text-muted-foreground space-y-2">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Select a date to see available times</p>
            <p className="text-sm">Dates with available slots are highlighted</p>
          </div>
        ) : selectedDateSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground space-y-3">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <div>
              <p className="font-medium">No available lessons for this date</p>
              <p className="text-sm mt-2">Try selecting another highlighted date</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
              View All Dates
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time Pills */}
            <div className="flex flex-wrap gap-2">
              {selectedDateSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => slot.isAvailable && setSelectedSlot(isSelected ? null : slot)}
                    disabled={!slot.isAvailable || isLoading}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-sm font-medium border transition-all duration-200 cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      !slot.isAvailable && "opacity-40 cursor-not-allowed",
                      slot.isAvailable && !isSelected && (
                        isDark
                          ? "bg-slate-700/40 text-slate-300 border-slate-600 hover:bg-slate-600/50 hover:border-slate-500"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300"
                      ),
                      isSelected && "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    )}
                  >
                    <span className="block">{formatTime(slot.startTime)}</span>
                    <span className={cn(
                      "block text-[10px] mt-0.5",
                      isSelected ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {slot.teacherName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Slot Detail Panel */}
            {selectedSlot && (
              <div className={cn(
                "rounded-xl border p-4 mt-2 transition-all duration-200",
                isDark
                  ? "bg-white/5 border-indigo-500/30"
                  : "bg-indigo-50/50 border-indigo-200/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedSlot.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                      </span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {selectedSlot.duration}min
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => onBookLesson(selectedSlot)}
                    disabled={isLoading || !selectedSlot.isAvailable}
                    className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]"
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
          </div>
        )}
      </div>
    </div>
  );
};
