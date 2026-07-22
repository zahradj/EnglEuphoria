import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScheduleSlot {
  id?: string;
  time: string;
  duration: 30 | 60;
  lessonType: 'free_slot' | 'direct_booking';
  isAvailable: boolean;
  studentId?: string;
  lessonTitle?: string;
  studentName?: string;
  lessonCode?: string;
}

export const useSlotActions = (
  teacherId: string, 
  onSlotChange: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const createSlot = async (
    date: Date, 
    time: string, 
    duration: 30 | 60
  ) => {
    setIsLoading(true);
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, [{
        teacher_id: teacherId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        duration: duration,
        lesson_type: 'free_slot',
        is_available: true
      }]);
      
      toast({
        title: "✅ Slot Created",
        description: `${duration}-minute slot opened at ${time}`,
      });

      onSlotChange();
    } catch (error) {
      console.error('Error creating slot:', error);
      toast({
        title: "Error",
        description: "Failed to create time slot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSlot = async (slot: ScheduleSlot) => {
    if (!slot.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('teacher_availability')
        .delete()
        .eq('id', slot.id);

      if (error) throw error;

      toast({
        title: "🗑️ Slot Deleted",
        description: "Time slot closed",
      });

      // Notify any open student views in this tab to refetch immediately
      // (defensive — realtime should also deliver, but covers same-tab cases).
      window.dispatchEvent(new CustomEvent('availability-changed'));
      onSlotChange();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete time slot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBulkSlots = async (
    dates: Date[], 
    times: string[], 
    duration: 30 | 60
  ) => {
    setIsLoading(true);
    try {
      const slots = [];
      
      for (const date of dates) {
        for (const time of times) {
          const [h, m] = time.split(':').map(Number);
          const startDateTime = new Date(date);
          startDateTime.setHours(h, m, 0, 0);
          
          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + duration);

          slots.push({
            teacher_id: teacherId,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            duration,
            lesson_type: 'free_slot',
            is_available: true
          });
        }
      }

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, slots);

      toast({
        title: "✅ Bulk Slots Created",
        description: `Created ${slots.length} slots of ${duration} minutes`,
      });

      onSlotChange();
    } catch (error) {
      console.error('Error creating bulk slots:', error);
      toast({
        title: "Error",
        description: "Failed to create bulk slots",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyWeekSlots = async (sourceWeek: Date[], targetWeekStart: Date) => {
    setIsLoading(true);
    try {
      // Get all available (not booked) slots from source week
      const slotsPromises = sourceWeek.map(async (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('teacher_availability')
          .select('*')
          .eq('teacher_id', teacherId)
          .gte('start_time', `${dateStr}T00:00:00`)
          .lt('start_time', `${dateStr}T23:59:59`)
          .eq('is_available', true)
          .eq('is_booked', false);
        
        if (error) throw error;
        return data || [];
      });

      const allSlots = (await Promise.all(slotsPromises)).flat();
      
      if (allSlots.length === 0) {
        toast({
          title: "No Slots Available",
          description: "No available slots found in source week",
        });
        return;
      }

      // Create corresponding slots in target week
      const targetSlots = allSlots.map(slot => {
        const sourceDate = new Date(slot.start_time);
        const dayOfWeek = sourceDate.getDay();
        const hours = sourceDate.getHours();
        const minutes = sourceDate.getMinutes();
        
        // Calculate target date (same day of week in target week)
        const targetDate = new Date(targetWeekStart);
        const targetDayOfWeek = targetDate.getDay();
        const daysToAdd = dayOfWeek - targetDayOfWeek + (dayOfWeek < targetDayOfWeek ? 7 : 0);
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        targetDate.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(targetDate);
        endTime.setMinutes(endTime.getMinutes() + slot.duration);
        
        return {
          teacher_id: teacherId,
          start_time: targetDate.toISOString(),
          end_time: endTime.toISOString(),
          duration: slot.duration,
          lesson_type: 'free_slot',
          is_available: true,
          is_booked: false
        };
      });

      const { insertAvailabilitySlotsWithFallback } = await import("@/services/availabilityInsert");
      await insertAvailabilitySlotsWithFallback(supabase as any, targetSlots);

      toast({
        title: "✅ Week Copied",
        description: `Copied ${targetSlots.length} slots to next week`,
      });
      onSlotChange();
    } catch (error) {
      console.error('Error copying week slots:', error);
      toast({
        title: "Error",
        description: "Failed to copy week slots",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createSlot,
    deleteSlot,
    createBulkSlots,
    copyWeekSlots
  };
};