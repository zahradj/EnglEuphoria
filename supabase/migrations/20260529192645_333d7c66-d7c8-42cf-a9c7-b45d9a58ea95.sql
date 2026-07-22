ALTER TABLE public.scheduled_lessons
  ADD COLUMN IF NOT EXISTS auto_assigned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_remedial_id uuid REFERENCES public.remedial_lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS badge text;

CREATE INDEX IF NOT EXISTS idx_scheduled_lessons_student_status_created
  ON public.scheduled_lessons (student_id, status, created_at DESC);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='scheduled_lessons'
      AND policyname='Students can view their own scheduled lessons'
  ) THEN
    CREATE POLICY "Students can view their own scheduled lessons"
      ON public.scheduled_lessons
      FOR SELECT
      TO authenticated
      USING (student_id = auth.uid());
  END IF;
END $$;