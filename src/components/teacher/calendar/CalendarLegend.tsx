import React from "react";
import { Keyboard, MousePointer } from "lucide-react";

export const CalendarLegend = () => {
  return (
    <div className="p-4 border-t bg-muted/30">
      <div className="space-y-3">
        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-background border border-border rounded"></div>
            <span>Available to open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success/10 border border-success/20 rounded"></div>
            <span>Open for booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning/10 border border-warning/20 rounded"></div>
            <span>Direct booking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-destructive/10 border border-destructive/20 rounded"></div>
            <span>Booked by student</span>
          </div>
        </div>

        {/* Controls Legend */}
        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MousePointer className="h-3 w-3" />
            <span>Click to toggle slots</span>
          </div>
          <div className="flex items-center gap-2">
            <Keyboard className="h-3 w-3" />
            <span>Ctrl+Click for direct booking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">H</span>
            <span>Toggle taskbar visibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};