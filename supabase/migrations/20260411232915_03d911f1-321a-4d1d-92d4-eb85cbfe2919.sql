
-- Create scaffold level enum
CREATE TYPE public.scaffold_level AS ENUM ('heavy', 'medium', 'light', 'independent');

-- Create student_mastery table
CREATE TABLE public.student_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
  
  -- Core layer scores (0-100)
  phonics_score NUMERIC(5,2) DEFAULT 0 CHECK (phonics_score >= 0 AND phonics_score <= 100),
  vocab_score NUMERIC(5,2) DEFAULT 0 CHECK (vocab_score >= 0 AND vocab_score <= 100),
  grammar_score NUMERIC(5,2) DEFAULT 0 CHECK (grammar_score >= 0 AND grammar_score <= 100),
  
  -- Four-skill scores (0-100)
  listening_score NUMERIC(5,2) DEFAULT 0 CHECK (listening_score >= 0 AND listening_score <= 100),
  speaking_score NUMERIC(5,2) DEFAULT 0 CHECK (speaking_score >= 0 AND speaking_score <= 100),
  reading_score NUMERIC(5,2) DEFAULT 0 CHECK (reading_score >= 0 AND reading_score <= 100),
  writing_score NUMERIC(5,2) DEFAULT 0 CHECK (writing_score >= 0 AND writing_score <= 100),
  
  -- Scaffold management
  scaffold_level scaffold_level DEFAULT 'heavy',
  teacher_override_scaffold scaffold_level,
  teacher_override_notes TEXT,
  
  -- Metadata
  last_assessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One entry per student per unit
  UNIQUE(student_id, unit_id)
);

-- Indexes for performance
CREATE INDEX idx_student_mastery_student ON public.student_mastery(student_id);
CREATE INDEX idx_student_mastery_unit ON public.student_mastery(unit_id);
CREATE INDEX idx_student_mastery_scaffold ON public.student_mastery(scaffold_level);

-- Enable RLS
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;

-- Students can view their own mastery
CREATE POLICY "students_view_own_mastery"
  ON public.student_mastery FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Teachers can view mastery for students they teach
CREATE POLICY "teachers_view_student_mastery"
  ON public.student_mastery FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin')
  );

-- Teachers and admins can insert mastery records
CREATE POLICY "teachers_insert_mastery"
  ON public.student_mastery FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() 
    OR public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Teachers and admins can update mastery records
CREATE POLICY "teachers_update_mastery"
  ON public.student_mastery FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid() 
    OR public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- Auto-update timestamp trigger
CREATE TRIGGER update_student_mastery_updated_at
  BEFORE UPDATE ON public.student_mastery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_iron_updated_at();

-- Function to auto-calculate scaffold level based on scores
CREATE OR REPLACE FUNCTION public.auto_calculate_scaffold_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_score NUMERIC;
BEGIN
  -- Only auto-calculate if no teacher override
  IF NEW.teacher_override_scaffold IS NOT NULL THEN
    NEW.scaffold_level := NEW.teacher_override_scaffold;
    RETURN NEW;
  END IF;

  -- Calculate weighted average (core layers weighted higher)
  avg_score := (
    NEW.phonics_score * 0.2 +
    NEW.vocab_score * 0.2 +
    NEW.grammar_score * 0.2 +
    NEW.listening_score * 0.1 +
    NEW.speaking_score * 0.1 +
    NEW.reading_score * 0.1 +
    NEW.writing_score * 0.1
  );

  -- Set scaffold level based on average
  IF avg_score >= 90 THEN
    NEW.scaffold_level := 'independent';
  ELSIF avg_score >= 75 THEN
    NEW.scaffold_level := 'light';
  ELSIF avg_score >= 50 THEN
    NEW.scaffold_level := 'medium';
  ELSE
    NEW.scaffold_level := 'heavy';
  END IF;

  NEW.last_assessed_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_scaffold_level
  BEFORE INSERT OR UPDATE ON public.student_mastery
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_calculate_scaffold_level();
