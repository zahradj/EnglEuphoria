import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  slotId?: string;
  lessonTitle?: string;
}

interface TimeSlotGridProps {
  date: Date;
  slots: TimeSlot[];
  onSlotToggle: (time: string, date: Date) => void;
  onSlotDelete: (slotId: string) => void;
  isLoading?: boolean;
}

export const TimeSlotGrid = ({ 
  date, 
  slots, 
  onSlotToggle, 
  onSlotDelete, 
  isLoading = false 
}: TimeSlotGridProps) => {
  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const getSlotStatus = (time: string) => {
    return slots.find(slot => slot.time === time);
  };

  const isToday = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date() && !isToday;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          {date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </h3>
        {isPast && (
          <Badge variant="secondary">Past Date</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {timeSlots.map((time) => {
          const slotStatus = getSlotStatus(time);
          const isDisabled = isPast || isLoading;
          
          return (
            <div key={time} className="relative">
              <Button
                variant={slotStatus?.isAvailable ? "default" : "outline"}
                size="sm"
                disabled={isDisabled}
                onClick={() => !slotStatus?.isBooked && onSlotToggle(time, date)}
                className={`
                  w-full h-12 text-xs font-medium transition-all
                  ${slotStatus?.isBooked 
                    ? 'bg-red-100 text-red-700 border-red-200 cursor-not-allowed' 
                    : slotStatus?.isAvailable 
                      ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                      : 'hover:bg-blue-50'
                  }
                  ${isDisabled ? 'opacity-50' : ''}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{time}</span>
                  {slotStatus?.isBooked && (
                    <Users className="h-3 w-3" />
                  )}
                </div>
              </Button>
              
              {slotStatus?.isAvailable && !slotStatus?.isBooked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (slotStatus.slotId) {
                      onSlotDelete(slotStatus.slotId);
                    }
                  }}
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-red-500 hover:text-red-700 bg-white rounded-full shadow-sm"
                >
                  ×
                </Button>
              )}

              {slotStatus?.isBooked && slotStatus?.lessonTitle && (
                <div className="absolute top-full left-0 right-0 mt-1 p-1 bg-red-50 rounded text-xs text-red-600 text-center truncate">
                  {slotStatus.lessonTitle}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>Closed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 rounded"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};