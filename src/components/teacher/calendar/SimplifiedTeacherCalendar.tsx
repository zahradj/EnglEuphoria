import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Repeat2 } from "lucide-react";
import { InstructionPrompt } from "@/components/shared/InstructionPrompt";
import { useCalendarData } from "./hooks/useCalendarData";
import { useSlotActions } from "./hooks/useSlotActions";
import { SimpleTimeGrid } from "./components/SimpleTimeGrid";
import { QuickSlotCreator } from "./components/QuickSlotCreator";
import { OpenSlotsDialog } from "@/components/teacher/scheduler/OpenSlotsDialog";
import { BookedSlotManager } from "@/components/teacher/scheduler/BookedSlotManager";
import { useTeacherHub } from "@/hooks/useTeacherHub";
import { supabase } from "@/integrations/supabase/client";

interface SimplifiedTeacherCalendarProps {
  teacherId: string;
}

export const SimplifiedTeacherCalendar = ({ teacherId }: SimplifiedTeacherCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(30);
  const [showQuickCreator, setShowQuickCreator] = useState(false);
  const [showOpenSlots, setShowOpenSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlotInfo, setBookedSlotInfo] = useState<{
    slotId: string;
    studentName?: string;
    studentShortId?: string;
    hub: 'playground' | 'academy' | 'success' | null;
    startTime: Date;
    duration: number;
    isRecurring: boolean;
  } | null>(null);
  const hub = useTeacherHub(teacherId);

  // Generate time slots from 6 AM to 10 PM
  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const totalMinutes = 6 * 60 + i * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Get week days starting from Monday
  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeek);
  const { weeklySlots, isLoading, reloadSlots } = useCalendarData(teacherId, weekDays);
  const { createSlot, deleteSlot, createBulkSlots, copyWeekSlots, isLoading: isActionsLoading } = useSlotActions(teacherId, reloadSlots);

  // Calculate slot count summary
  const availableSlotCount = Object.values(weeklySlots).flat().filter(slot => slot.isAvailable && !slot.studentId).length;
  const bookedSlotCount = Object.values(weeklySlots).flat().filter(slot => slot.studentId).length;

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const formatWeekRange = () => {
    const start = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDays[6].toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${start} - ${end}`;
  };

  const handleSlotClick = async (time: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existingSlot = weeklySlots[dateStr]?.find(slot => slot.time === time);

    // Booked → open the cancel manager (single occurrence or whole series)
    if (existingSlot?.studentId && existingSlot.id) {
      const [h, m] = time.split(':').map(Number);
      const start = new Date(date);
      start.setHours(h, m, 0, 0);

      // Look up recurring_pattern to know whether to offer "Cancel series"
      const { data: row } = await supabase
        .from('teacher_availability')
        .select('recurring_pattern')
        .eq('id', existingSlot.id)
        .maybeSingle();

      setBookedSlotInfo({
        slotId: existingSlot.id,
        studentName: existingSlot.studentName,
        studentShortId: existingSlot.studentShortId,
        hub: existingSlot.hub ?? null,
        startTime: start,
        duration: existingSlot.duration,
        isRecurring: !!row?.recurring_pattern,
      });
      return;
    }

    if (existingSlot?.isAvailable) {
      // Delete existing slot
      deleteSlot(existingSlot);
    } else {
      // Create new slot
      setSelectedDate(date);
      setSelectedTime(time);
      setShowSlotModal(true);
    }
  };

  const handleQuickSlotCreation = (times: string[]) => {
    createBulkSlots([selectedDate], times, selectedDuration);
    setShowQuickCreator(false);
  };

  const handleCreateSingleSlot = () => {
    createSlot(selectedDate, selectedTime, selectedDuration);
    setShowSlotModal(false);
  };

  const handleCopyWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    copyWeekSlots(weekDays, nextWeek);
  };

  return (
    <div className="space-y-6">
      {/* Instruction */}
      <InstructionPrompt
        title="Easy Availability Management"
        description="Click empty slots to create availability, click existing slots to remove them. Use Quick Creator for bulk actions."
        icon="💡"
      />

      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Availability Calendar</h2>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {availableSlotCount} available
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  {bookedSlotCount} booked
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={selectedDuration === 30 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDuration(30)}
                  className="h-8 px-3"
                >
                  30 min
                </Button>
                <Button
                  variant={selectedDuration === 60 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDuration(60)}
                  className="h-8 px-3"
                >
                  60 min
                </Button>
              </div>

              <Button
                onClick={() => setShowOpenSlots(true)}
                className="flex items-center gap-2"
                title="Open a single slot today, or repeat slots every week"
              >
                <Repeat2 className="h-4 w-4" />
                Open slots
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowQuickCreator(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Creator
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyWeek}
                disabled={isActionsLoading || availableSlotCount === 0}
                className="flex items-center gap-2"
                title="Copy this week's available slots to next week"
              >
                <Calendar className="h-4 w-4" />
                Copy Week
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center min-w-[200px]">
                  <span className="text-sm font-medium">{formatWeekRange()}</span>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="ghost" size="sm" onClick={goToToday}>
                <Calendar className="h-3 w-3 mr-1" />
                Today
              </Button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <SimpleTimeGrid
            weekDays={weekDays}
            timeSlots={timeSlots}
            weeklySlots={weeklySlots}
            onSlotClick={handleSlotClick}
            isLoading={isLoading || isActionsLoading}
          />
        </CardContent>
      </Card>

      {/* Quick Creator Modal */}
      <Dialog open={showQuickCreator} onOpenChange={setShowQuickCreator}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Slot Creator</DialogTitle>
          </DialogHeader>
          <QuickSlotCreator
            selectedDate={selectedDate}
            selectedDuration={selectedDuration}
            onCreateSlots={handleQuickSlotCreation}
            isLoading={isActionsLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Single Slot Creation Modal */}
      <Dialog open={showSlotModal} onOpenChange={setShowSlotModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Availability Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Date:</strong> {selectedDate.toLocaleDateString()}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <strong>Duration:</strong> {selectedDuration} minutes
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateSingleSlot} disabled={isActionsLoading} className="flex-1">
                Create Slot
              </Button>
              <Button variant="outline" onClick={() => setShowSlotModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Open-Slots dialog (single + weekly recurring) */}
      <OpenSlotsDialog
        open={showOpenSlots}
        onOpenChange={setShowOpenSlots}
        teacherId={teacherId}
        hub={hub}
        onCreated={() => reloadSlots()}
      />

      {/* Cancel booked slot — single occurrence or whole weekly series */}
      <BookedSlotManager
        open={!!bookedSlotInfo}
        onOpenChange={(o) => { if (!o) setBookedSlotInfo(null); }}
        slot={bookedSlotInfo}
        onCancelled={() => { setBookedSlotInfo(null); reloadSlots(); }}
      />
    </div>
  );
};