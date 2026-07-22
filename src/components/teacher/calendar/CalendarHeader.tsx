import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";

interface CalendarHeaderProps {
  weekDays: Date[];
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  onTodayClick: () => void;
}

export const CalendarHeader = ({ 
  weekDays, 
  onNavigateWeek,
  onTodayClick 
}: CalendarHeaderProps) => {
  const formatWeekRange = () => {
    const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDays[6].toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];
    return today >= startOfWeek && today <= endOfWeek;
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Weekly Schedule</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>30-minute slots</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium min-w-[200px] text-center">
              {formatWeekRange()}
            </span>
            {!isCurrentWeek() && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTodayClick}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Today
              </Button>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={() => onNavigateWeek('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};