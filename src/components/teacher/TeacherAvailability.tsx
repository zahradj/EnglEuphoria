import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek } from "date-fns";
import { useTeacherHubRole } from "@/hooks/useTeacherHubRole";

interface TeacherAvailabilityProps {
  teacherId: string;
}

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  duration: number;
  isBooked: boolean;
}

export const TeacherAvailability = ({ teacherId }: TeacherAvailabilityProps) => {
  const { allowedDurations, isPlayground } = useTeacherHubRole(teacherId);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  // Default to the first allowed duration for the teacher's hub
  const defaultDuration = (allowedDurations[0] ?? 30).toString() as "30" | "60";
  const [duration, setDuration] = useState<"30" | "60">(defaultDuration);
  const [existingSlots, setExistingSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Keep selected duration in sync with hub permissions
  React.useEffect(() => {
    if (!allowedDurations.includes(parseInt(duration) as 30 | 60)) {
      setDuration((allowedDurations[0] ?? 30).toString() as "30" | "60");
    }
  }, [allowedDurations, duration]);

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const loadExistingSlots = async () => {
    const { data, error } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_available', true)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error loading slots:', error);
      return;
    }

    const slots = (data || []).map(slot => ({
      id: slot.id,
      date: new Date(slot.start_time),
      startTime: format(new Date(slot.start_time), 'HH:mm'),
      duration: slot.duration,
      isBooked: slot.is_booked
    }));

    setExistingSlots(slots);
  };

  React.useEffect(() => {
    loadExistingSlots();
  }, [teacherId]);

  const handleAddTimeSlot = (time: string) => {
    if (!timeSlots.includes(time)) {
      setTimeSlots([...timeSlots, time].sort());
    }
  };

  const handleRemoveTimeSlot = (time: string) => {
    setTimeSlots(timeSlots.filter(t => t !== time));
  };

  const handleCreateSlots = async () => {
    if (selectedDates.length === 0 || timeSlots.length === 0) {
      toast.error("Please select dates and time slots");
      return;
    }

    setIsLoading(true);

    try {
      const slotsToCreate = [];

      for (const date of selectedDates) {
        for (const time of timeSlots) {
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(date);
          startTime.setHours(hours, minutes, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

          slotsToCreate.push({
            teacher_id: teacherId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: parseInt(duration),
            lesson_type: 'free_slot',
            is_available: true,
            is_booked: false
          });
        }
      }

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, slotsToCreate);

      toast.success(`Created ${slotsToCreate.length} availability slots`);
      setSelectedDates([]);
      setTimeSlots([]);
      loadExistingSlots();
    } catch (error) {
      console.error('Error creating slots:', error);
      toast.error("Failed to create availability slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickWeek = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 5 }, (_, i) => addDays(start, i));
    setSelectedDates(weekDays);
  };

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      toast.error("Cannot delete a booked slot");
      return;
    }

    try {
      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast.success("Slot deleted");
      loadExistingSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error("Failed to delete slot");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Availability Slots</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Dates</h3>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickWeek}
                className="mt-2"
              >
                Quick: This Week (Mon-Fri)
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Duration</h3>
                <Select value={duration} onValueChange={(v) => setDuration(v as "30" | "60")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedDurations.includes(30) && (
                      <SelectItem value="30">30 minutes</SelectItem>
                    )}
                    {allowedDurations.includes(60) && (
                      <SelectItem value="60">60 minutes</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {isPlayground && (
                  <p className="text-xs text-muted-foreground mt-1">
                    🎪 Playground lessons are 30 minutes only.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Time Slots</h3>
                <Select onValueChange={handleAddTimeSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="mt-3 space-y-2">
                  {timeSlots.map(time => (
                    <div key={time} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{time}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTimeSlot(time)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateSlots}
                disabled={isLoading || selectedDates.length === 0 || timeSlots.length === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create {selectedDates.length * timeSlots.length} Slots
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Availability Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {existingSlots.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No availability slots created yet</p>
            ) : (
              existingSlots.map(slot => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    slot.isBooked ? 'bg-muted' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4" />
                    <div>
                      <div className="font-medium">
                        {format(slot.date, 'EEE, MMM d, yyyy')} at {slot.startTime}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {slot.duration} minutes {slot.isBooked && '• Booked'}
                      </div>
                    </div>
                  </div>
                  {!slot.isBooked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id, slot.isBooked)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
