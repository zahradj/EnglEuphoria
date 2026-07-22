-- Create interactive_lesson_progress table for slide-by-slide tracking
CREATE TABLE IF NOT EXISTS public.interactive_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.interactive_lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_slide_index INTEGER NOT NULL DEFAULT 0,
  total_slides INTEGER NOT NULL DEFAULT 20,
  completed_slides INTEGER NOT NULL DEFAULT 0,
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  stars_earned INTEGER NOT NULL DEFAULT 0,
  lesson_status TEXT NOT NULL DEFAULT 'not_started' CHECK (lesson_status IN ('not_started', 'in_progress', 'completed', 'redo_required')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_slide_completed INTEGER,
  session_data JSONB DEFAULT '{}',
  UNIQUE(lesson_id, student_id)
);

-- Create interactive_lesson_assignments table for lesson sequencing
CREATE TABLE IF NOT EXISTS public.interactive_lesson_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.interactive_lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'locked', 'unlocked', 'in_progress', 'completed')),
  is_unlocked BOOLEAN NOT NULL DEFAULT true,
  unlock_condition JSONB,
  order_in_sequence INTEGER,
  notes TEXT,
  UNIQUE(lesson_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_interactive_lesson_progress_student ON public.interactive_lesson_progress(student_id);
CREATE INDEX idx_interactive_lesson_progress_status ON public.interactive_lesson_progress(lesson_status);
CREATE INDEX idx_interactive_lesson_progress_lesson ON public.interactive_lesson_progress(lesson_id);
CREATE INDEX idx_assignments_student ON public.interactive_lesson_assignments(student_id);
CREATE INDEX idx_assignments_status ON public.interactive_lesson_assignments(status);

-- Enable RLS
ALTER TABLE public.interactive_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactive_lesson_assignments ENABLE ROW LEVEL SECURITY;

-- Students can view and update their own progress
CREATE POLICY students_own_progress ON public.interactive_lesson_progress
  FOR ALL USING (auth.uid() = student_id);

-- Teachers can view student progress for their students
CREATE POLICY teachers_view_student_progress ON public.interactive_lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.teacher_id = auth.uid() 
      AND lessons.student_id = interactive_lesson_progress.student_id
    )
  );

-- Teachers can update student progress for their students
CREATE POLICY teachers_update_student_progress ON public.interactive_lesson_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE lessons.teacher_id = auth.uid() 
      AND lessons.student_id = interactive_lesson_progress.student_id
    )
  );

-- Students can view their own assignments
CREATE POLICY students_view_own_assignments ON public.interactive_lesson_assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Teachers can manage assignments they created
CREATE POLICY teachers_manage_assignments ON public.interactive_lesson_assignments
  FOR ALL USING (auth.uid() = assigned_by);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lesson_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
CREATE TRIGGER update_interactive_lesson_progress_timestamp
  BEFORE UPDATE ON public.interactive_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_progress_timestamp();