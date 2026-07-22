import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StudentData {
  id: string;
  name: string;
  email: string;
  total_lessons: number;
  last_lesson_date: string;
  next_lesson_date?: string;
  level?: string;
  attendance_rate: number;
  progress: number;
}

export const useTeacherStudents = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStudents = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get all unique students who have booked lessons with this teacher
      const { data: studentLessons, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          student_id,
          scheduled_at,
          status,
          completed_at,
          users!inner (
            id,
            full_name,
            email
          )
        `)
        .eq('teacher_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (lessonsError) throw lessonsError;

      // Group lessons by student and calculate stats
      const studentMap = new Map<string, StudentData>();

      studentLessons?.forEach((lesson) => {
        const studentId = lesson.student_id;
        const student = Array.isArray(lesson.users) ? lesson.users[0] : lesson.users;
        
        if (!student) return; // Skip if no user data
        
        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            id: studentId,
            name: student.full_name || student.email,
            email: student.email,
            total_lessons: 0,
            last_lesson_date: '',
            level: 'Intermediate', // Default level, could be fetched from student profile
            attendance_rate: 0,
            progress: 65, // Default progress, could be calculated from actual data
          });
        }

        const studentData = studentMap.get(studentId)!;
        studentData.total_lessons++;

        // Update last lesson date
        if (lesson.completed_at && lesson.completed_at > studentData.last_lesson_date) {
          studentData.last_lesson_date = lesson.completed_at;
        }

        // Find next scheduled lesson
        if (lesson.status === 'scheduled' && lesson.scheduled_at > new Date().toISOString()) {
          if (!studentData.next_lesson_date || lesson.scheduled_at < studentData.next_lesson_date) {
            studentData.next_lesson_date = lesson.scheduled_at;
          }
        }
      });

      // Calculate attendance rate for each student
      for (const [studentId, studentData] of studentMap) {
        const studentLessonsList = studentLessons?.filter(l => l.student_id === studentId) || [];
        const completedLessons = studentLessonsList.filter(l => l.status === 'completed').length;
        const totalScheduledLessons = studentLessonsList.filter(l => 
          l.status === 'completed' || l.status === 'cancelled'
        ).length;
        
        studentData.attendance_rate = totalScheduledLessons > 0 
          ? Math.round((completedLessons / totalScheduledLessons) * 100)
          : 100;
      }

      setStudents(Array.from(studentMap.values()));
    } catch (err) {
      console.error('Error fetching teacher students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user?.id]);

  return { students, loading, error, refetch: fetchStudents };
};