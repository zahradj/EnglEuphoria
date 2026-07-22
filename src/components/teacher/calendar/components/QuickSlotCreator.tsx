import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, Calendar, Plus } from "lucide-react";

interface QuickSlotCreatorProps {
  selectedDate: Date;
  selectedDuration: 30 | 60;
  onCreateSlots: (times: string[]) => void;
  isLoading?: boolean;
}

const timePresets = {
  "Morning (6AM-12PM)": ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  "Afternoon (12PM-5PM)": ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  "Evening (5PM-10PM)": ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
  "Business Hours (9AM-5PM)": ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"],
  "Peak Hours": ["10:00", "11:00", "15:00", "16:00", "18:00", "19:00"]
};

export const QuickSlotCreator = ({ selectedDate, selectedDuration, onCreateSlots, isLoading = false }: QuickSlotCreatorProps) => {
  const handlePresetClick = (preset: string) => {
    const times = timePresets[preset as keyof typeof timePresets];
    if (times) {
      onCreateSlots(times);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Slot Creator
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration Info */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Slot Duration</label>
          <div className="text-sm text-muted-foreground p-2 border rounded bg-primary/5 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span><strong>{selectedDuration} minutes</strong> per slot</span>
          </div>
        </div>

        {/* Time Presets */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Quick Time Periods</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(timePresets).map(([preset, times]) => (
              <Button
                key={preset}
                variant="outline"
                onClick={() => handlePresetClick(preset)}
                disabled={isLoading}
                className="justify-between hover:bg-primary/10 hover:border-primary/30"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {preset}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {times.length} slots
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Creating {selectedDuration}-minute slots for selected time periods</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};