-- Clean any partial table from a previous failed migration
DROP TABLE IF EXISTS public.student_mastery CASCADE;
DROP FUNCTION IF EXISTS public.get_due_review_items(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS public.touch_student_mastery_updated_at();

-- =========================================================
-- SRS Long-Term Memory: student_mastery
-- =========================================================
CREATE TABLE public.student_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_key TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'vocabulary',
  hub TEXT NOT NULL DEFAULT 'Academy',
  mastery_score INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  times_incorrect INTEGER NOT NULL DEFAULT 0,
  last_tested TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT student_mastery_unique UNIQUE (user_id, item_key, item_type),
  CONSTRAINT student_mastery_score_range CHECK (mastery_score BETWEEN 0 AND 100),
  CONSTRAINT student_mastery_item_type_check CHECK (item_type IN ('vocabulary', 'grammar', 'phonics', 'phrase')),
  CONSTRAINT student_mastery_hub_check CHECK (hub IN ('Playground', 'Academy', 'Success'))
);

CREATE INDEX idx_student_mastery_due
  ON public.student_mastery (user_id, next_review_at);

CREATE INDEX idx_student_mastery_user_hub
  ON public.student_mastery (user_id, hub);

CREATE FUNCTION public.touch_student_mastery_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_student_mastery_touch
  BEFORE UPDATE ON public.student_mastery
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_student_mastery_updated_at();

ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_mastery"
  ON public.student_mastery FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "staff_view_all_mastery"
  ON public.student_mastery FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'content_creator')
  );

CREATE POLICY "students_insert_own_mastery"
  ON public.student_mastery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "students_update_own_mastery"
  ON public.student_mastery FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_delete_mastery"
  ON public.student_mastery FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.get_due_review_items(
  p_user_id UUID,
  p_hub TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  item_key TEXT,
  item_type TEXT,
  hub TEXT,
  mastery_score INTEGER,
  next_review_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sm.item_key, sm.item_type, sm.hub, sm.mastery_score, sm.next_review_at
  FROM public.student_mastery sm
  WHERE sm.user_id = p_user_id
    AND sm.next_review_at <= now()
    AND sm.mastery_score < 100
    AND (p_hub IS NULL OR sm.hub = p_hub)
  ORDER BY sm.mastery_score ASC, sm.next_review_at ASC
  LIMIT p_limit;
$$;