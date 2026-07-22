import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, User } from "lucide-react";

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

interface SimpleTimeGridProps {
  weekDays: Date[];
  timeSlots: string[];
  weeklySlots: { [key: string]: ScheduleSlot[] };
  onSlotClick: (time: string, date: Date) => void;
  isLoading?: boolean;
}

export const SimpleTimeGrid = ({ 
  weekDays, 
  timeSlots, 
  weeklySlots, 
  onSlotClick,
  isLoading = false
}: SimpleTimeGridProps) => {
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

  const getSlotStyle = (slot?: ScheduleSlot, isPast?: boolean) => {
    if (isPast) return "opacity-50 pointer-events-none bg-muted/30";
    
    if (!slot || !slot.isAvailable) {
      return "bg-background hover:bg-primary/5 border border-border hover:border-primary/30 transition-all duration-200";
    }
    
    if (slot.studentId) {
      return "bg-destructive/10 border-destructive/20 text-destructive";
    }
    
    return "bg-success/10 border-success/20 text-success hover:bg-success/20 transition-all duration-200";
  };

  const renderSlotContent = (slot?: ScheduleSlot) => {
    if (!slot || !slot.isAvailable) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Plus className="h-3 w-3 mb-1" />
          <span className="text-xs">Add</span>
        </div>
      );
    }

    if (slot.studentId) {
      return (
        <div className="px-2 py-1 text-xs h-full flex flex-col justify-center">
          <div className="font-semibold truncate flex items-center gap-1">
            <User className="h-3 w-3" />
            Booked
          </div>
        <Badge 
          variant={slot.duration === 60 ? "default" : "secondary"} 
          className="text-xs mt-1"
        >
          {slot.duration}m
        </Badge>
        </div>
      );
    }

    return (
      <div className="px-2 py-1 text-xs h-full flex flex-col justify-center">
        <div className="font-semibold truncate flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Available
        </div>
        <Badge 
          variant={slot.duration === 60 ? "default" : "secondary"} 
          className="text-xs mt-1"
        >
          {slot.duration}m
        </Badge>
      </div>
    );
  };

  return (
    <div className="overflow-auto rounded-lg border border-border bg-background">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-8 border-b bg-muted/30">
          <div className="p-3 bg-muted font-medium text-sm border-r">Time</div>
          {weekDays.map((day, index) => (
            <div 
              key={index} 
              className={`p-3 text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-primary/10 font-semibold' : 'bg-muted/30'
              } ${isPastDate(day) ? 'opacity-60' : ''}`}
            >
              <div className="font-medium text-sm">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {day.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
              </div>
              {isToday(day) && (
                <Badge variant="secondary" className="text-xs mt-1">Today</Badge>
              )}
            </div>
          ))}
        </div>

        {/* Time slots grid */}
        <div className="divide-y divide-border">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-8 hover:bg-muted/20 transition-colors">
              <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/20 border-r flex items-center">
                <span className="font-mono">{time}</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const dateStr = day.toISOString().split('T')[0];
                const slot = getSlotForTimeAndDate(time, dateStr);
                const isPast = isPastDate(day);
                
                return (
                  <div
                    key={`${time}-${dayIndex}`}
                    className="p-1 border-r last:border-r-0"
                  >
                    <Button
                      variant="ghost"
                      className={`h-12 w-full p-2 ${getSlotStyle(slot, isPast)}`}
                      onClick={() => !isPast && onSlotClick(time, day)}
                      disabled={isLoading || isPast}
                    >
                      {renderSlotContent(slot)}
                    </Button>
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