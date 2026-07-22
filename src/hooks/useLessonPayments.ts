import { useState, useEffect } from 'react';
import { lessonService } from '@/services/lessonService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LessonStats {
  total_booked: number;
  completed_paid: number;
  cancelled_free: number;
  total_spent: number;
  total_refunded: number;
}

interface TeacherEarnings {
  total_earned: number;
  lessons_completed: number;
  pending_penalties: number;
  recent_absences: number;
  can_teach: boolean;
  net_earnings: number;
}

export function useLessonPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [studentStats, setStudentStats] = useState<LessonStats | null>(null);
  const [teacherEarnings, setTeacherEarnings] = useState<TeacherEarnings | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStudentStats = async (studentId?: string) => {
    if (!studentId && !user?.id) return;
    setLoading(true);
    
    try {
      const data = await lessonService.getStudentLessonStats(studentId || user!.id);
      setStudentStats(data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherEarnings = async (teacherId?: string) => {
    if (!teacherId && !user?.id) return;
    setLoading(true);
    
    try {
      const data = await lessonService.getTeacherEarningsSummary(teacherId || user!.id);
      setTeacherEarnings(data);
    } catch (error) {
      console.error('Error fetching teacher earnings:', error);
      toast({
        title: "Error",
        description: "Failed to load earnings summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processLessonCompletion = async (
    lessonId: string, 
    status: 'completed' | 'cancelled', 
    failureReason?: string
  ) => {
    setLoading(true);
    try {
      const result = await lessonService.processLessonCompletion(lessonId, status, failureReason);
      
      toast({
        title: "Lesson Status Updated",
        description: status === 'completed' 
          ? `Payment processed: Student charged €${result.student_charged}, teacher paid €${result.teacher_paid}` 
          : `No charges applied. ${failureReason ? `Reason: ${failureReason}` : ''}`,
        variant: status === 'completed' ? "default" : "destructive",
      });

      // Refresh data based on user role
      if (user?.role === 'student') {
        await fetchStudentStats();
      } else if (user?.role === 'teacher') {
        await fetchTeacherEarnings();
      }

      return result;
    } catch (error) {
      console.error('Error processing lesson completion:', error);
      toast({
        title: "Error",
        description: "Failed to process lesson completion",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user?.role === 'student') {
      fetchStudentStats();
    } else if (user?.role === 'teacher') {
      fetchTeacherEarnings();
    }
  }, [user]);

  return {
    studentStats,
    teacherEarnings,
    loading,
    fetchStudentStats,
    fetchTeacherEarnings,
    processLessonCompletion,
    refreshData: () => {
      if (user?.role === 'student') {
        fetchStudentStats();
      } else if (user?.role === 'teacher') {
        fetchTeacherEarnings();
      }
    }
  };
}