import { supabase } from '@/lib/supabase';

export interface HomeworkAssignment {
  id: string;
  teacher_id: string;
  lesson_id?: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  due_date: string;
  status: 'active' | 'archived';
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  text_response?: string;
  attachment_urls?: string[];
  points_earned?: number;
  teacher_feedback?: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submitted_at?: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HomeworkAssignmentWithSubmission extends HomeworkAssignment {
  submission?: HomeworkSubmission;
}

class HomeworkService {
  async getStudentAssignments(studentId: string): Promise<HomeworkAssignmentWithSubmission[]> {
    try {
      // Get assignments for this student
      const { data: assignmentIds, error: assignmentError } = await supabase
        .from('homework_assignment_students')
        .select('assignment_id')
        .eq('student_id', studentId);

      if (assignmentError) throw assignmentError;

      if (!assignmentIds || assignmentIds.length === 0) return [];

      const ids = assignmentIds.map(a => a.assignment_id);

      // Get the assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('homework_assignments')
        .select('*')
        .in('id', ids)
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      // Get submissions for these assignments
      const { data: submissions, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select('*')
        .eq('student_id', studentId)
        .in('assignment_id', ids);

      if (submissionsError) throw submissionsError;

      // Combine assignments with submissions
      const assignmentsWithSubmissions = (assignments || []).map(assignment => ({
        ...assignment,
        submission: submissions?.find(s => s.assignment_id === assignment.id)
      }));

      return assignmentsWithSubmissions;
    } catch (error) {
      console.error('Failed to fetch student assignments:', error);
      return [];
    }
  }

  async submitHomework(
    assignmentId: string,
    studentId: string,
    textResponse?: string,
    attachmentUrls?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      
      // Check if assignment exists and get due date
      const { data: assignment, error: assignmentError } = await supabase
        .from('homework_assignments')
        .select('due_date')
        .eq('id', assignmentId)
        .single();

      if (assignmentError) throw assignmentError;

      const isLate = new Date(assignment.due_date) < new Date();
      
      const { error } = await supabase
        .from('homework_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: studentId,
          text_response: textResponse,
          attachment_urls: attachmentUrls || [],
          status: isLate ? 'late' : 'submitted',
          submitted_at: now,
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to submit homework:', error);
      return { success: false, error: error.message };
    }
  }

  async getTeacherAssignments(teacherId: string): Promise<HomeworkAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('homework_assignments')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch teacher assignments:', error);
      return [];
    }
  }

  async createAssignment(
    teacherId: string,
    title: string,
    description: string,
    dueDate: string,
    studentIds: string[],
    instructions?: string,
    points?: number,
    lessonId?: string,
    attachmentUrls?: string[]
  ): Promise<{ success: boolean; error?: string; assignmentId?: string }> {
    try {
      // Auto-fallback: default to now + 7 days when no due date is provided.
      const resolvedDueDate = (() => {
        if (dueDate && typeof dueDate === 'string' && dueDate.trim().length > 0) return dueDate;
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString();
      })();

      // Create the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('homework_assignments')
        .insert({
          teacher_id: teacherId,
          lesson_id: lessonId,
          title,
          description,
          instructions,
          points: points || 10,
          due_date: resolvedDueDate,
          attachment_urls: attachmentUrls || [],
          status: 'active'
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Assign to students
      const studentAssignments = studentIds.map(studentId => ({
        assignment_id: assignment.id,
        student_id: studentId
      }));

      const { error: studentsError } = await supabase
        .from('homework_assignment_students')
        .insert(studentAssignments);

      if (studentsError) throw studentsError;

      return { success: true, assignmentId: assignment.id };
    } catch (error: any) {
      console.error('Failed to create assignment:', error);
      return { success: false, error: error.message };
    }
  }

  async getAssignmentSubmissions(assignmentId: string): Promise<HomeworkSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          *,
          student:users!homework_submissions_student_id_fkey(id, full_name, email)
        `)
        .eq('assignment_id', assignmentId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch assignment submissions:', error);
      return [];
    }
  }

  async gradeSubmission(
    submissionId: string,
    pointsEarned: number,
    feedback?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({
          points_earned: pointsEarned,
          teacher_feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Failed to grade submission:', error);
      return { success: false, error: error.message };
    }
  }
}

export const homeworkService = new HomeworkService();
