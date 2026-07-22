-- 1) learning_games: allow any catalog game type + link to catalog
ALTER TABLE public.learning_games
  DROP CONSTRAINT IF EXISTS learning_games_game_type_check;

ALTER TABLE public.learning_games
  ADD COLUMN IF NOT EXISTS catalog_game_id text
    REFERENCES public.arcade_games_catalog(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_learning_games_catalog_id
  ON public.learning_games(catalog_game_id);

UPDATE public.learning_games
SET catalog_game_id = game_type
WHERE catalog_game_id IS NULL
  AND game_type IN (SELECT id FROM public.arcade_games_catalog);

-- 2) student_mastery: remove content_creator broad SELECT.
DROP POLICY IF EXISTS "staff_view_all_mastery" ON public.student_mastery;
CREATE POLICY "admins_view_all_mastery"
ON public.student_mastery FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) student_lesson_progress: scope to teacher's own students (column is user_id).
DROP POLICY IF EXISTS "Teachers can view all progress" ON public.student_lesson_progress;
CREATE POLICY "Teachers view own students progress"
ON public.student_lesson_progress FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = student_lesson_progress.user_id
  )
);

-- 4) student_vocabulary_progress: scope to teacher's own students.
DROP POLICY IF EXISTS "Teachers can view student vocabulary" ON public.student_vocabulary_progress;
CREATE POLICY "Teachers view own students vocabulary"
ON public.student_vocabulary_progress FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = student_vocabulary_progress.student_id
  )
);

-- 5) student_skills: scope to teacher's own students.
DROP POLICY IF EXISTS "Teachers can view student skills" ON public.student_skills;
CREATE POLICY "Teachers view own students skills"
ON public.student_skills FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = student_skills.student_id
  )
);

-- 6) speech_attempts: scope to teacher's own students (column is user_id).
DROP POLICY IF EXISTS "Teachers and admins view all speech attempts" ON public.speech_attempts;
CREATE POLICY "Teachers view own students speech"
ON public.speech_attempts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.class_bookings cb
    WHERE cb.teacher_id = auth.uid()
      AND cb.student_id = speech_attempts.user_id
  )
);
