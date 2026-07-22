
import React from "react";
import { Button } from "@/components/ui/button";

interface CalendarViewSwitcherProps {
  viewMode: 'month' | 'week';
  onViewModeChange: (mode: 'month' | 'week') => void;
}

export const CalendarViewSwitcher = ({ viewMode, onViewModeChange }: CalendarViewSwitcherProps) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('month')}
      >
        Month
      </Button>
      <Button
        variant={viewMode === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('week')}
      >
        Week
      </Button>
    </div>
  );
};
