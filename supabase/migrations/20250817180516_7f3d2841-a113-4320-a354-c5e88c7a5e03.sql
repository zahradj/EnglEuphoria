
-- 1) Master lessons table
CREATE TABLE IF NOT EXISTS public.ai_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  topic TEXT NOT NULL,
  level TEXT NOT NULL,
  age_range TEXT,
  duration_minutes INTEGER,
  objectives TEXT[] DEFAULT '{}',
  script JSONB, -- the master lesson script / normalized data used to fan-out generation
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Artifacts table (slides / worksheet / quiz / etc.)
CREATE TABLE IF NOT EXISTS public.ai_lesson_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.ai_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- denormalized for simpler RLS
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('slides','worksheet','quiz','extra')),
  format TEXT NOT NULL CHECK (format IN ('html','md','pdf','json','h5p','image')),
  storage_path TEXT,       -- e.g. lessons/{user_id}/{lesson_id}/slides.html
  public_url TEXT,         -- optional: direct public URL (if bucket is public)
  metadata JSONB,          -- e.g. slide count, worksheet pages, quiz stats
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Updated-at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_lessons_updated_at ON public.ai_lessons;
CREATE TRIGGER trg_ai_lessons_updated_at
  BEFORE UPDATE ON public.ai_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS trg_ai_lesson_artifacts_updated_at ON public.ai_lesson_artifacts;
CREATE TRIGGER trg_ai_lesson_artifacts_updated_at
  BEFORE UPDATE ON public.ai_lesson_artifacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 4) RLS
ALTER TABLE public.ai_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_lesson_artifacts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own lessons
DROP POLICY IF EXISTS "ai_lessons_select_own" ON public.ai_lessons;
CREATE POLICY "ai_lessons_select_own"
  ON public.ai_lessons
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_lessons_insert_own" ON public.ai_lessons;
CREATE POLICY "ai_lessons_insert_own"
  ON public.ai_lessons
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_lessons_update_own" ON public.ai_lessons;
CREATE POLICY "ai_lessons_update_own"
  ON public.ai_lessons
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_lessons_delete_own" ON public.ai_lessons;
CREATE POLICY "ai_lessons_delete_own"
  ON public.ai_lessons
  FOR DELETE
  USING (user_id = auth.uid());

-- Users can only see their own artifacts
DROP POLICY IF EXISTS "ai_artifacts_select_own" ON public.ai_lesson_artifacts;
CREATE POLICY "ai_artifacts_select_own"
  ON public.ai_lesson_artifacts
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_artifacts_insert_own" ON public.ai_lesson_artifacts;
CREATE POLICY "ai_artifacts_insert_own"
  ON public.ai_lesson_artifacts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_artifacts_update_own" ON public.ai_lesson_artifacts;
CREATE POLICY "ai_artifacts_update_own"
  ON public.ai_lesson_artifacts
  FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_artifacts_delete_own" ON public.ai_lesson_artifacts;
CREATE POLICY "ai_artifacts_delete_own"
  ON public.ai_lesson_artifacts
  FOR DELETE
  USING (user_id = auth.uid());

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_ai_lessons_user_created ON public.ai_lessons(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_artifacts_lesson_type ON public.ai_lesson_artifacts(lesson_id, artifact_type);
CREATE INDEX IF NOT EXISTS idx_ai_artifacts_user_created ON public.ai_lesson_artifacts(user_id, created_at DESC);
