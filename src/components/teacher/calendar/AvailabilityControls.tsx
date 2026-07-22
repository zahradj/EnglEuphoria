import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Copy, 
  Trash2, 
  CheckCircle, 
  Settings 
} from "lucide-react";

interface AvailabilityControlsProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onBulkOpen: (hours: string[]) => void;
  onBulkClose: () => void;
  onCopyFromPrevious: () => void;
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

export const AvailabilityControls = ({
  selectedDate,
  onDateChange,
  onBulkOpen,
  onBulkClose,
  onCopyFromPrevious,
  totalSlots,
  availableSlots,
  bookedSlots
}: AvailabilityControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const commonHours = {
    "Morning (8-12)": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    "Afternoon (12-17)": ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    "Evening (17-20)": ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
    "Full Day": ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"]
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    onDateChange(previousDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Quick Controls
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
          >
            ←
          </Button>
          <div className="flex-1 text-center font-medium">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
          >
            →
          </Button>
        </div>

        {/* Statistics */}
        <div className="flex gap-2 justify-center">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {availableSlots} Available
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-red-500" />
            {bookedSlots} Booked
          </Badge>
          <Badge variant="outline">
            Total: {totalSlots}
          </Badge>
        </div>

        {isExpanded && (
          <>
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyFromPrevious}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkClose}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Close All Slots
                </Button>
              </div>
            </div>

            {/* Bulk Time Periods */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Open Time Periods</h4>
              <div className="grid gap-2">
                {Object.entries(commonHours).map(([period, hours]) => (
                  <Button
                    key={period}
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkOpen(hours)}
                    className="justify-start text-xs"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};