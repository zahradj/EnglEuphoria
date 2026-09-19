import { useState } from "react";
import { List, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "@/hooks/useThemeMode";
import { cn } from "@/lib/utils";
import { StudentBookingCalendarList } from "./StudentBookingCalendarList";
import { StudentBookingCalendarGrid } from "./StudentBookingCalendarGrid";

interface TimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isAvailable: boolean;
}

interface StudentBookingCalendarProps {
  availableSlots: TimeSlot[];
  onBookLesson: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

type ViewMode = "list" | "calendar";

/** Lets a student (or a parent booking on their behalf) switch between the
 *  original quick-pick date+time list and a full month-grid overview of a
 *  teacher's open slots — same underlying data and booking flow either way. */
export const StudentBookingCalendar = (props: StudentBookingCalendarProps) => {
  const [view, setView] = useState<ViewMode>("list");
  const { resolvedTheme } = useThemeMode();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div
          className={cn(
            "inline-flex items-center rounded-lg border p-0.5",
            isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-muted/40"
          )}
        >
          <Button
            type="button"
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView("list")}
          >
            <List className="w-3.5 h-3.5 mr-1.5" />
            List
          </Button>
          <Button
            type="button"
            variant={view === "calendar" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setView("calendar")}
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Whole Calendar
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <StudentBookingCalendarList {...props} />
      ) : (
        <StudentBookingCalendarGrid {...props} />
      )}
    </div>
  );
};
