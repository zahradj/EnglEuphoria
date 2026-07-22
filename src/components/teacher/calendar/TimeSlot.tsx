import React from "react";
import { Plus } from "lucide-react";

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

interface TimeSlotProps {
  time: string;
  date: Date;
  slot?: ScheduleSlot;
  selectedDuration: 30 | 60;
  onSlotClick: (time: string, date: Date, event: React.MouseEvent) => void;
}

export const TimeSlot = ({ time, date, slot, selectedDuration, onSlotClick }: TimeSlotProps) => {
  const getSlotClassName = () => {
    const baseClasses = "h-7 border-2 hover:scale-105 cursor-pointer transition-all duration-300 rounded-xl relative overflow-hidden shadow-sm";
    
    if (!slot || !slot.isAvailable) {
      return `${baseClasses} bg-gradient-to-br from-background to-muted/20 border-border/30 hover:from-muted/30 hover:to-muted/40`;
    }
    
    if (slot.studentId) {
      return `${baseClasses} bg-gradient-to-br from-destructive/15 to-red-600/25 border-destructive/40 text-destructive shadow-lg shadow-destructive/20 hover:shadow-xl`;
    }
    
    if (slot.lessonType === 'direct_booking') {
      return `${baseClasses} bg-gradient-to-br from-warning/15 to-orange-600/25 border-warning/40 text-warning shadow-lg shadow-warning/20 hover:shadow-xl`;
    }
    
    return `${baseClasses} bg-gradient-to-br from-success/15 to-emerald-600/25 border-success/40 text-success shadow-lg shadow-success/20 hover:shadow-xl`;
  };

  const renderSlotContent = () => {
    if (!slot || !slot.isAvailable) {
      return (
        <div className="flex items-center justify-center h-full opacity-30 group-hover:opacity-60 transition-opacity">
          <Plus className="h-3 w-3" />
        </div>
      );
    }

    if (slot.studentId && slot.studentName) {
      return (
        <div className="px-2 py-1 text-xs h-full flex flex-col justify-center">
          <div className="font-bold truncate drop-shadow-sm">
            {slot.lessonCode || `#${slot.id?.slice(-6).toUpperCase()}`}
          </div>
          <div className="text-xs opacity-90 truncate">{slot.studentName}</div>
          <div className="absolute top-1 right-1 text-xs opacity-70 font-semibold">
            {slot.duration}m
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full relative">
        <Plus className="h-3 w-3 opacity-50 drop-shadow-sm" />
        <div className="absolute top-1 right-1 text-xs opacity-70 font-semibold">
          {slot.duration}m
        </div>
      </div>
    );
  };

  const formatTime12Hour = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div
      className={`${getSlotClassName()} group`}
      onClick={(e) => onSlotClick(time, date, e)}
      title={
        slot?.isAvailable 
          ? `${formatTime12Hour(time)} - ${slot.duration}min slot` 
          : `Click to open ${selectedDuration}min slot at ${formatTime12Hour(time)}`
      }
    >
      {renderSlotContent()}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};