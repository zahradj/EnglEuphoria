import { supabase } from "@/lib/supabase";

export interface AvailableTimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  isAvailable: boolean;
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  is_available: boolean;
  is_booked: boolean;
  lesson_id?: string;
}

export const teacherAvailabilityService = {
  /**
   * Get all available slots from all teachers
   */
  async getAvailableSlots(): Promise<AvailableTimeSlot[]> {
    const { data, error } = await supabase
      .from('teacher_availability')
      .select('id, teacher_id, start_time, end_time, duration, is_available, is_booked')
      .eq('is_available', true)
      .eq('is_booked', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    console.log('[teacherAvailabilityService.getAvailableSlots] Fetched slots:', data, 'Fetch error:', error);

    if (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    const teacherIds = [...new Set(data.map(slot => slot.teacher_id))];
    const { data: teachers } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', teacherIds);

    const teacherMap = new Map(teachers?.map(t => [t.id, t.full_name]) || []);

    return data.map(slot => ({
      id: slot.id,
      teacherId: slot.teacher_id,
      teacherName: teacherMap.get(slot.teacher_id) || 'Teacher',
      startTime: new Date(slot.start_time),
      endTime: new Date(slot.end_time),
      duration: Number(slot.duration),
      isAvailable: slot.is_available && !slot.is_booked
    }));
  },

  /**
   * Get available slots for a specific teacher
   */
  async getTeacherAvailableSlots(teacherId: string): Promise<AvailableTimeSlot[]> {
    const { data, error } = await supabase
      .from('teacher_availability')
      .select('id, teacher_id, start_time, end_time, duration, is_available, is_booked')
      .eq('teacher_id', teacherId)
      .eq('is_available', true)
      .eq('is_booked', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    console.log('[teacherAvailabilityService.getTeacherAvailableSlots] teacher:', teacherId, 'Fetched slots:', data, 'Fetch error:', error);

    if (error) {
      console.error('Error fetching teacher available slots:', error);
      throw error;
    }

    if (!data || data.length === 0) return [];

    const { data: teacher } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', teacherId)
      .single();

    const teacherName = teacher?.full_name || 'Teacher';

    return data.map(slot => ({
      id: slot.id,
      teacherId: slot.teacher_id,
      teacherName,
      startTime: new Date(slot.start_time),
      endTime: new Date(slot.end_time),
      duration: Number(slot.duration),
      isAvailable: slot.is_available && !slot.is_booked
    }));
  },

  /**
   * Get teachers with their next available slot
   */
  async getTeachersWithAvailability() {
    // First get all approved teachers
    const { data: teachers, error: teachersError } = await supabase
      .rpc('get_approved_teachers');

    if (teachersError) {
      console.error('Error fetching teachers:', teachersError);
      throw teachersError;
    }

    // Get next available slot for each teacher
    const teachersWithAvailability = await Promise.all(
      (teachers || []).map(async (teacher) => {
        const { data: nextSlot } = await supabase
          .from('teacher_availability')
          .select('start_time')
          .eq('teacher_id', teacher.user_id)
          .eq('is_available', true)
          .eq('is_booked', false)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single();

        return {
          ...teacher,
          nextAvailable: nextSlot ? new Date(nextSlot.start_time) : null
        };
      })
    );

    // Filter teachers that have availability
    return teachersWithAvailability.filter(teacher => teacher.nextAvailable);
  }
};