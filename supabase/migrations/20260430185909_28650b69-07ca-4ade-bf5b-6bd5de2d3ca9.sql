
-- Create student_assignments table for teacher-to-student lesson assignments
CREATE TABLE public.student_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.ai_lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_student_assignments_student ON public.student_assignments(student_id, status);
CREATE INDEX idx_student_assignments_lesson ON public.student_assignments(lesson_id);
CREATE INDEX idx_student_assignments_teacher ON public.student_assignments(teacher_id);

-- Enable RLS
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can view and create assignments they authored
CREATE POLICY "Teachers can view their assignments"
  ON public.student_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create assignments"
  ON public.student_assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their assignments"
  ON public.student_assignments FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Students can view assignments assigned to them
CREATE POLICY "Students can view their assignments"
  ON public.student_assignments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Students can update their own assignments (mark completed)
CREATE POLICY "Students can update their assignments"
  ON public.student_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Admins can see everything
CREATE POLICY "Admins can manage all assignments"
  ON public.student_assignments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
