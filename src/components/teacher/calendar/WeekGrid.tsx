import React from "react";
import { TimeSlot } from "./TimeSlot";

interface ScheduleSlot {
  id?: string;
  time: string;
  duration: 30 | 60;
  lessonType: 'free_slot' | 'direct_booking';
  isAvailable: boolean;
  studentId?: string;
  lessonTitle?: string;
  studentName?: string;
  lessonCode?: string;
}

interface WeekGridProps {
  weekDays: Date[];
  timeSlots: string[];
  weeklySlots: { [key: string]: ScheduleSlot[] };
  selectedDuration: 30 | 60;
  onTimeSlotClick: (time: string, date: Date, event: React.MouseEvent) => void;
}

export const WeekGrid = ({ 
  weekDays, 
  timeSlots, 
  weeklySlots, 
  selectedDuration, 
  onTimeSlotClick 
}: WeekGridProps) => {
  const formatTime12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getSlotForTimeAndDate = (time: string, dateStr: string): ScheduleSlot | undefined => {
    return weeklySlots[dateStr]?.find(slot => slot.time === time);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b sticky top-0 bg-background z-10">
          <div className="p-3 bg-muted font-medium text-sm border-r">Time</div>
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-3 bg-muted text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-primary/10 font-semibold' : ''
              } ${isPastDate(day) ? 'opacity-60' : ''}`}
            >
              <div className="font-medium text-sm">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
              </div>
              {isToday(day) && (
                <div className="text-xs text-primary font-medium mt-1">Today</div>
              )}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="divide-y divide-border">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-8 hover:bg-muted/30 transition-colors">
              <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/50 border-r flex items-center">
                <span className="font-mono">{formatTime12Hour(time)}</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const slot = getSlotForTimeAndDate(time, dateStr);
                
                return (
                  <div
                    key={`${time}-${dayIndex}`}
                    className={`p-1 border-r last:border-r-0 ${
                      isPastDate(day) ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <TimeSlot
                      time={time}
                      date={day}
                      slot={slot}
                      selectedDuration={selectedDuration}
                      onSlotClick={onTimeSlotClick}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};