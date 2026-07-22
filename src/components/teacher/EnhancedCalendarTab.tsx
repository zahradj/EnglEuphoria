import React, { useState, useMemo } from "react";
import { CalendarCore } from "./calendar/modern/CalendarCore";
import { SlotManager } from "./calendar/modern/SlotManager";
import { SyncStatusBadge } from "./calendar/SyncStatusBadge";
import { LiveNowToggle } from "./LiveNowToggle";
import { useTeacherAvailability } from "@/hooks/useTeacherAvailability";
import { useTeacherHubRole } from "@/hooks/useTeacherHubRole";
import { useTeacherHub } from "@/hooks/useTeacherHub";
import { getWeekDays } from "@/utils/timezoneUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat2 } from "lucide-react";
import { OpenSlotsDialog } from "@/components/teacher/scheduler/OpenSlotsDialog";
import { BookedSlotManager } from "@/components/teacher/scheduler/BookedSlotManager";
import type { AvailabilitySlot } from "./calendar/modern/types";

interface EnhancedCalendarTabProps {
  teacherId: string;
}

export const EnhancedCalendarTab = ({ teacherId }: EnhancedCalendarTabProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showSlotManager, setShowSlotManager] = useState(false);
  const [showOpenSlots, setShowOpenSlots] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<AvailabilitySlot | null>(null);

  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);
  const { slots, isLoading, createSlot, deleteSlot } = useTeacherAvailability(teacherId, weekDays);
  const { allowedDurations, isPlayground, hubKind } = useTeacherHubRole(teacherId);
  const hub = useTeacherHub(teacherId);

  const handleNavigateWeek = (direction: -1 | 1) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const handleGoToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowSlotManager(true);
  };

  const handleCreateSlot = async (duration: 30 | 60) => {
    if (!selectedDate || !selectedTime) return;
    await createSlot(selectedDate, selectedTime, duration);
  };

  const getExistingSlot = () => {
    if (!selectedDate || !selectedTime) return null;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const targetTime = new Date(selectedDate);
    targetTime.setHours(hours, minutes, 0, 0);

    return slots.find(slot => {
      const slotStart = new Date(slot.startTime);
      return slotStart.getTime() === targetTime.getTime();
    });
  };

  const handleDeleteSlot = async () => {
    const slot = getExistingSlot();
    if (slot && !slot.isBooked) {
      await deleteSlot(slot.id);
    }
  };

  const existingSlot = getExistingSlot();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold">My Availability</h2>
          <Badge variant="outline" className="capitalize">
            {isPlayground
              ? '🎪 Playground · 30-min slots only'
              : `${hubKind} · 60-min slots only`}
          </Badge>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            size="sm"
            onClick={() => setShowOpenSlots(true)}
            className="gap-1.5"
          >
            <Repeat2 className="h-4 w-4" />
            Open slots
          </Button>
          <LiveNowToggle teacherId={teacherId} />
          <SyncStatusBadge teacherId={teacherId} />
        </div>
      </div>

      <CalendarCore
        teacherId={teacherId}
        slots={slots}
        weekDays={weekDays}
        currentWeek={currentWeek}
        isLoading={isLoading}
        onNavigateWeek={handleNavigateWeek}
        onGoToToday={handleGoToToday}
        onSlotClick={handleSlotClick}
        onBookedSlotClick={(s) => setBookedSlot(s)}
      />

      <SlotManager
        open={showSlotManager}
        onClose={() => setShowSlotManager(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onCreateSlot={handleCreateSlot}
        onDeleteSlot={existingSlot && !existingSlot.isBooked ? handleDeleteSlot : undefined}
        existingSlot={!!existingSlot}
        allowedDurations={allowedDurations}
      />

      {/* Unified Open-Slots dialog (single + weekly recurring) */}
      <OpenSlotsDialog
        open={showOpenSlots}
        onOpenChange={setShowOpenSlots}
        teacherId={teacherId}
        hub={hub}
      />

      {/* Cancel booked slot — single occurrence or whole weekly series */}
      <BookedSlotManager
        open={!!bookedSlot}
        onOpenChange={(o) => { if (!o) setBookedSlot(null); }}
        slot={
          bookedSlot
            ? {
                slotId: bookedSlot.id,
                studentName: bookedSlot.studentName,
                studentShortId: bookedSlot.studentShortId,
                hub: bookedSlot.hub ?? null,
                startTime: bookedSlot.startTime,
                duration: bookedSlot.duration,
                isRecurring: !!bookedSlot.recurringPattern,
                isTrial: !!bookedSlot.isTrial,
              }
            : null
        }
        onCancelled={() => setBookedSlot(null)}
      />
    </div>
  );
};
