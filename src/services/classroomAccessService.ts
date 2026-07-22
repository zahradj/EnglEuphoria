
import { supabase } from "@/lib/supabase";

export interface ClassroomAccessValidation {
  isValid: boolean;
  lesson?: {
    id: string;
    title: string;
    scheduled_at: string;
    duration: number;
    teacher_id: string;
    student_id: string;
    status: string;
  };
  message?: string;
}

export class ClassroomAccessService {
  /**
   * Validates if a user can access a specific classroom/room
   */
  async validateClassroomAccess(
    roomId: string, 
    userId: string, 
    userRole: 'teacher' | 'student'
  ): Promise<ClassroomAccessValidation> {
    try {
      // Use the existing Supabase function to check access
      const { data: canAccess, error } = await supabase
        .rpc('can_access_lesson', {
          room_uuid: roomId,
          user_uuid: userId
        });

      if (error) {
        console.error('Error validating classroom access:', error);
        return {
          isValid: false,
          message: 'Unable to validate access. Please try again.'
        };
      }

      if (!canAccess) {
        return {
          isValid: false,
          message: 'You do not have permission to access this classroom or the lesson time window has not opened yet.'
        };
      }

      // Get lesson details if access is valid
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (lessonError) {
        console.error('Error fetching lesson details:', lessonError);
        return {
          isValid: false,
          message: 'Lesson not found.'
        };
      }

      // Validate user role matches lesson assignment
      const isValidUser = userRole === 'teacher' 
        ? lesson.teacher_id === userId
        : lesson.student_id === userId;

      if (!isValidUser) {
        return {
          isValid: false,
          message: 'You are not assigned to this lesson.'
        };
      }

      return {
        isValid: true,
        lesson,
        message: 'Access granted'
      };
    } catch (error) {
      console.error('Classroom access validation error:', error);
      return {
        isValid: false,
        message: 'System error. Please contact support.'
      };
    }
  }

  /**
   * Tracks when a user joins a classroom session
   */
  async trackSessionJoin(lessonId: string, userId: string, role: 'teacher' | 'student'): Promise<void> {
    try {
      const { error } = await supabase
        .from('lesson_participants')
        .upsert({
          lesson_id: lessonId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking session join:', error);
      }
    } catch (error) {
      console.error('Session tracking error:', error);
    }
  }

  /**
   * Tracks when a user leaves a classroom session
   */
  async trackSessionLeave(lessonId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lesson_participants')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('lesson_id', lessonId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error tracking session leave:', error);
      }
    } catch (error) {
      console.error('Session leave tracking error:', error);
    }
  }

  /**
   * Updates lesson status (e.g., 'in_progress', 'completed')
   */
  async updateLessonStatus(lessonId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status })
        .eq('id', lessonId);

      if (error) {
        console.error('Error updating lesson status:', error);
      }
    } catch (error) {
      console.error('Lesson status update error:', error);
    }
  }

  /**
   * Gets current lesson participants
   */
  async getLessonParticipants(lessonId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('lesson_participants')
        .select(`
          *,
          users:user_id(full_name, email)
        `)
        .eq('lesson_id', lessonId)
        .is('left_at', null);

      if (error) {
        console.error('Error fetching lesson participants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }
}

export const classroomAccessService = new ClassroomAccessService();
