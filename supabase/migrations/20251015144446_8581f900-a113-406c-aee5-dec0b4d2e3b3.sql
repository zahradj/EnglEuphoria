-- Create homework assignments table
CREATE TABLE public.homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  attachment_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create homework submissions table
CREATE TABLE public.homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text_response TEXT,
  attachment_urls TEXT[] DEFAULT '{}',
  points_earned INTEGER,
  teacher_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create assignment student mapping for targeted assignments
CREATE TABLE public.homework_assignment_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_assignment_students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homework_assignments
CREATE POLICY "Teachers can manage their own assignments"
  ON public.homework_assignments
  FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view assignments assigned to them"
  ON public.homework_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignment_students
      WHERE assignment_id = homework_assignments.id
      AND student_id = auth.uid()
    )
  );

-- RLS Policies for homework_submissions
CREATE POLICY "Students can manage their own submissions"
  ON public.homework_submissions
  FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their assignments"
  ON public.homework_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments
      WHERE id = homework_submissions.assignment_id
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON public.homework_submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments
      WHERE id = homework_submissions.assignment_id
      AND teacher_id = auth.uid()
    )
  );

-- RLS Policies for homework_assignment_students
CREATE POLICY "Teachers can manage assignment students"
  ON public.homework_assignment_students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.homework_assignments
      WHERE id = homework_assignment_students.assignment_id
      AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their assignments"
  ON public.homework_assignment_students
  FOR SELECT
  USING (student_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_homework_assignments_teacher ON public.homework_assignments(teacher_id);
CREATE INDEX idx_homework_assignments_lesson ON public.homework_assignments(lesson_id);
CREATE INDEX idx_homework_submissions_assignment ON public.homework_submissions(assignment_id);
CREATE INDEX idx_homework_submissions_student ON public.homework_submissions(student_id);
CREATE INDEX idx_homework_assignment_students_assignment ON public.homework_assignment_students(assignment_id);
CREATE INDEX idx_homework_assignment_students_student ON public.homework_assignment_students(student_id);

-- Trigger to update updated_at
CREATE TRIGGER update_homework_assignments_updated_at
  BEFORE UPDATE ON public.homework_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER update_homework_submissions_updated_at
  BEFORE UPDATE ON public.homework_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();