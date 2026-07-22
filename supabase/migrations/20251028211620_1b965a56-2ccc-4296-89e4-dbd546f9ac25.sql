-- Create student_curriculum_assignments table
CREATE TABLE IF NOT EXISTS public.student_curriculum_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  stage_id INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  current_lesson_number INTEGER DEFAULT 1,
  lessons_completed TEXT[] DEFAULT '{}',
  total_lessons_in_unit INTEGER NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on student_curriculum_assignments
ALTER TABLE public.student_curriculum_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for student_curriculum_assignments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_curriculum_assignments' 
    AND policyname = 'Students can manage own curriculum assignments'
  ) THEN
    CREATE POLICY "Students can manage own curriculum assignments"
    ON public.student_curriculum_assignments
    FOR ALL
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'student_curriculum_assignments' 
    AND policyname = 'Teachers can view student curriculum'
  ) THEN
    CREATE POLICY "Teachers can view student curriculum"
    ON public.student_curriculum_assignments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.lessons
        WHERE lessons.student_id = student_curriculum_assignments.student_id
        AND lessons.teacher_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_curriculum_assignments_student ON public.student_curriculum_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_assignments_status ON public.student_curriculum_assignments(status);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_student_curriculum_assignments_updated_at ON public.student_curriculum_assignments;
CREATE TRIGGER update_student_curriculum_assignments_updated_at
BEFORE UPDATE ON public.student_curriculum_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();