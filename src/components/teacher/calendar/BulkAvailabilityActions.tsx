import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, X, Clock } from "lucide-react";

interface BulkAvailabilityActionsProps {
  selectedDate: Date;
  selectedSlots: string[];
  selectedDuration: 30 | 60;
  onBulkOpen: (hours: string[]) => void;
  onBulkClose: () => void;
  onCopyFromPrevious: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const BulkAvailabilityActions = ({
  selectedDate,
  selectedSlots,
  selectedDuration,
  onBulkOpen,
  onBulkClose,
  onCopyFromPrevious,
  onClearSelection,
  isLoading = false
}: BulkAvailabilityActionsProps) => {
  const timePresets = {
    "Morning (6-12)": ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    "Afternoon (12-17)": ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    "Evening (17-23)": ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"],
    "Business Hours": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
    "Full Day": ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"]
  };

  const handlePresetOpen = (preset: string) => {
    const hours = timePresets[preset as keyof typeof timePresets];
    if (hours) {
      onBulkOpen(hours);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Bulk Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected slots actions */}
        {selectedSlots.length > 0 && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="text-sm font-medium text-primary mb-2">
              Selected Slots ({selectedSlots.length})
            </h4>
            <div className="flex gap-2 mb-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => onBulkOpen(selectedSlots)}
                disabled={isLoading}
                className="w-full"
              >
                Open {selectedDuration}min Slots
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
              className="w-full"
            >
              Clear Selection
            </Button>
          </div>
        )}

        {/* Copy from previous day */}
        <Button
          variant="outline"
          onClick={onCopyFromPrevious}
          disabled={isLoading}
          className="w-full"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Previous Day
        </Button>

        {/* Close all slots */}
        <Button
          variant="outline"
          onClick={onBulkClose}
          disabled={isLoading}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Close All Slots
        </Button>

        {/* Time period presets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Quick Open Time Periods</h4>
          
          {Object.keys(timePresets).map(preset => (
            <div key={preset} className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetOpen(preset)}
                disabled={isLoading}
                className="w-full"
              >
                {preset} ({selectedDuration}min slots)
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};