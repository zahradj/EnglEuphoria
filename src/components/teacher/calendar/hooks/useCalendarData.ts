import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScheduleSlot {
  id?: string;
  time: string;
  duration: 30 | 60;
  lessonType: 'free_slot' | 'direct_booking';
  isAvailable: boolean;
  studentId?: string;
  studentShortId?: string;
  lessonTitle?: string;
  studentName?: string;
  lessonCode?: string;
  hub?: 'playground' | 'academy' | 'success' | null;
}

export const useCalendarData = (teacherId: string, weekDays: Date[]) => {
  const [weeklySlots, setWeeklySlots] = useState<{ [key: string]: ScheduleSlot[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadWeeklySlots = async () => {
    if (!teacherId || weekDays.length === 0) return;
    
    setIsLoading(true);
    try {
      const startDate = weekDays[0].toISOString();
      const endDate = new Date(weekDays[6]);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString();
      
      const { data, error } = await supabase
        .from('teacher_availability')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('start_time', startDate)
        .lt('start_time', endDateStr);

      if (error) throw error;

      // Resolve student names in one round-trip so booked tiles can show
      // "Name + #shortID + hub badge" (workspace-unified slot label).
      const studentIds = Array.from(
        new Set((data ?? []).map((s: any) => s.student_id).filter(Boolean)),
      ) as string[];

      const studentMap = new Map<string, string>();
      if (studentIds.length > 0) {
        const { data: students } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', studentIds);
        students?.forEach((u: any) => studentMap.set(u.id, u.full_name));
      }

      const inferHub = (raw: any): 'playground' | 'academy' | 'success' | null => {
        const v = String(raw?.hub_specialty ?? '').toLowerCase();
        if (v === 'playground' || v === 'academy' || v === 'success') return v;
        // Fallback: derive from duration (Playground = 30m, Academy/Success = 60m)
        if (Number(raw?.duration) === 30) return 'playground';
        if (Number(raw?.duration) === 60) return 'academy';
        return null;
      };

      const slotsMap: { [key: string]: ScheduleSlot[] } = {};

      weekDays.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        slotsMap[dateStr] = [];
      });

      data?.forEach(slot => {
        const slotDate = new Date(slot.start_time);
        const dateStr = slotDate.toISOString().split('T')[0];
        if (!slotsMap[dateStr]) slotsMap[dateStr] = [];

        const timeStr = slotDate.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });

        const fullName = slot.student_id ? studentMap.get(slot.student_id) : undefined;
        const shortId = slot.student_id
          ? `#${slot.student_id.slice(0, 4).toUpperCase()}`
          : undefined;

        slotsMap[dateStr].push({
          id: slot.id,
          time: timeStr,
          duration: slot.duration,
          lessonType: slot.lesson_type,
          isAvailable: slot.is_available,
          studentId: slot.student_id,
          studentShortId: shortId,
          studentName: fullName,
          lessonTitle: slot.lesson_title,
          lessonCode: slot.lesson_id ? `#${slot.lesson_id.slice(-6).toUpperCase()}` : undefined,
          hub: inferHub(slot),
        });
      });

      setWeeklySlots(slotsMap);
    } catch (error) {
      console.error('Error loading weekly slots:', error);
      toast({
        title: "Error",
        description: "Failed to load weekly schedule",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeeklySlots();
  }, [teacherId, weekDays]);

  return {
    weeklySlots,
    isLoading,
    reloadSlots: loadWeeklySlots
  };
};