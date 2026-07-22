import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { AvailabilityControls } from "./AvailabilityControls";

interface TimeSlot {
  id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  lesson_id?: string;
  price_per_hour: number;
  recurring_pattern?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface IntegratedAvailabilityCalendarProps {
  teacherId: string;
}

export const IntegratedAvailabilityCalendar = ({ teacherId }: IntegratedAvailabilityCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSlotsForDate(selectedDate);
  }, [selectedDate, teacherId]);

  const loadSlotsForDate = async (date: Date) => {
    try {
      setIsLoading(true);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Error",
        description: "Failed to load availability slots.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTimeSlot = async (time: string, date: Date) => {
    try {
      const startDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + 30); // 30-minute slots

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, [{
        teacher_id: teacherId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        is_available: true,
        is_booked: false,
        price_per_hour: 350
      }] as any);
      
      toast({
        title: "Slot Opened",
        description: `Available slot created for ${time}`,
      });
      
      loadSlotsForDate(date);
    } catch (error) {
      console.error('Error creating slot:', error);
      toast({
        title: "Error",
        description: "Failed to create time slot.",
        variant: "destructive"
      });
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      
      toast({
        title: "Slot Closed",
        description: "Time slot has been removed.",
      });
      
      loadSlotsForDate(selectedDate);
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete time slot.",
        variant: "destructive"
      });
    }
  };

  const handleSlotToggle = async (time: string, date: Date) => {
    const existingSlot = slots.find(slot => {
      const slotTime = new Date(slot.start_time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      return slotTime === time;
    });

    if (existingSlot) {
      // Slot exists, delete it
      await deleteTimeSlot(existingSlot.id);
    } else {
      // Slot doesn't exist, create it
      await createTimeSlot(time, date);
    }
  };

  const handleBulkOpen = async (hours: string[]) => {
    try {
      setIsLoading(true);
      const promises = hours.map(time => {
        const existingSlot = slots.find(slot => {
          const slotTime = new Date(slot.start_time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          });
          return slotTime === time;
        });
        
        if (!existingSlot) {
          return createTimeSlot(time, selectedDate);
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      
      toast({
        title: "Bulk Slots Opened",
        description: `Opened multiple time slots for ${selectedDate.toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Error in bulk open:', error);
      toast({
        title: "Error",
        description: "Failed to open some time slots.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkClose = async () => {
    try {
      setIsLoading(true);
      const availableSlots = slots.filter(slot => slot.is_available && !slot.is_booked);
      
      if (availableSlots.length === 0) {
        toast({
          title: "No Slots to Close",
          description: "No available slots found for this date.",
        });
        return;
      }

      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .in('id', availableSlots.map(slot => slot.id));

      if (error) throw error;
      
      toast({
        title: "All Slots Closed",
        description: `Removed ${availableSlots.length} available slots.`,
      });
      
      loadSlotsForDate(selectedDate);
    } catch (error) {
      console.error('Error in bulk close:', error);
      toast({
        title: "Error",
        description: "Failed to close all slots.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyFromPrevious = async () => {
    try {
      setIsLoading(true);
      const previousDay = new Date(selectedDate);
      previousDay.setDate(previousDay.getDate() - 1);
      
      // Load previous day's slots
      const startOfDay = new Date(previousDay);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(previousDay);
      endOfDay.setHours(23, 59, 59, 999);

      const { data: previousSlots, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_available', true)
        .eq('is_booked', false)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (error) throw error;

      if (!previousSlots || previousSlots.length === 0) {
        toast({
          title: "No Slots to Copy",
          description: "No available slots found on the previous day.",
        });
        return;
      }

      // Create slots for current date based on previous day's pattern
      const newSlots = previousSlots.map(slot => {
        const previousStart = new Date(slot.start_time);
        const previousEnd = new Date(slot.end_time);
        
        const newStart = new Date(selectedDate);
        newStart.setHours(previousStart.getHours(), previousStart.getMinutes(), 0, 0);
        
        const newEnd = new Date(selectedDate);
        newEnd.setHours(previousEnd.getHours(), previousEnd.getMinutes(), 0, 0);

        return {
          teacher_id: teacherId,
          start_time: newStart.toISOString(),
          end_time: newEnd.toISOString(),
          is_available: true,
          is_booked: false,
          price_per_hour: slot.price_per_hour
        };
      });

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, newSlots as any);
      
      toast({
        title: "Slots Copied",
        description: `Copied ${newSlots.length} slots from previous day.`,
      });
      
      loadSlotsForDate(selectedDate);
    } catch (error) {
      console.error('Error copying slots:', error);
      toast({
        title: "Error",
        description: "Failed to copy slots from previous day.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Transform slots for TimeSlotGrid
  const transformedSlots = slots.map(slot => ({
    time: new Date(slot.start_time).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }),
    isAvailable: slot.is_available,
    isBooked: slot.is_booked,
    slotId: slot.id,
    lessonTitle: slot.lesson_id ? 'Lesson Booked' : undefined
  }));

  const totalSlots = slots.length;
  const availableSlots = slots.filter(slot => slot.is_available && !slot.is_booked).length;
  const bookedSlots = slots.filter(slot => slot.is_booked).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Selection */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <AvailabilityControls
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onBulkOpen={handleBulkOpen}
          onBulkClose={handleBulkClose}
          onCopyFromPrevious={handleCopyFromPrevious}
          totalSlots={totalSlots}
          availableSlots={availableSlots}
          bookedSlots={bookedSlots}
        />
      </div>

      {/* Time Slot Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
            <p className="text-sm text-gray-600">
              Click on time slots to open/close availability. Available slots are green, booked slots are red.
            </p>
          </CardHeader>
          <CardContent>
            <TimeSlotGrid
              date={selectedDate}
              slots={transformedSlots}
              onSlotToggle={handleSlotToggle}
              onSlotDelete={deleteTimeSlot}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};