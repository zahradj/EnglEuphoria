-- Create student_vocabulary_progress table for the Vocabulary Vault
CREATE TABLE public.student_vocabulary_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE SET NULL,
  sticker_image_url TEXT,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 3),
  times_reviewed INTEGER DEFAULT 1,
  mastered BOOLEAN DEFAULT false,
  audio_url TEXT,
  phoneme_tag TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, word)
);

-- Enable RLS
ALTER TABLE public.student_vocabulary_progress ENABLE ROW LEVEL SECURITY;

-- Students can view their own vocabulary
CREATE POLICY "Students can view own vocabulary"
ON public.student_vocabulary_progress FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Students can insert their own vocabulary
CREATE POLICY "Students can insert own vocabulary"
ON public.student_vocabulary_progress FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- System/triggers can update vocabulary (via security definer functions)
CREATE POLICY "Students can update own vocabulary"
ON public.student_vocabulary_progress FOR UPDATE
TO authenticated
USING (student_id = auth.uid());

-- Admins can view all vocabulary
CREATE POLICY "Admins can view all vocabulary"
ON public.student_vocabulary_progress FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Teachers can view their students' vocabulary
CREATE POLICY "Teachers can view student vocabulary"
ON public.student_vocabulary_progress FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'));

-- Parents can view their children's vocabulary
CREATE POLICY "Parents can view child vocabulary"
ON public.student_vocabulary_progress FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.student_parent_relationships spr
    WHERE spr.parent_id = auth.uid()
      AND spr.student_id = student_vocabulary_progress.student_id
      AND spr.can_view_progress = true
  )
);

-- Index for performance
CREATE INDEX idx_svp_student_id ON public.student_vocabulary_progress(student_id);
CREATE INDEX idx_svp_unit_id ON public.student_vocabulary_progress(unit_id);
CREATE INDEX idx_svp_mastered ON public.student_vocabulary_progress(student_id, mastered);