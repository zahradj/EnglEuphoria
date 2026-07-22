
-- ═══ 1. user_stats table ═══
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ═══ 2. upsert_streak function ═══
CREATE OR REPLACE FUNCTION public.upsert_streak(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last DATE;
  v_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_active_date, current_streak
    INTO v_last, v_streak
    FROM public.user_stats
    WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_stats (user_id, current_streak, last_active_date)
    VALUES (p_user_id, 1, v_today);
    RETURN json_build_object('streak', 1);
  END IF;

  IF v_last = v_today THEN
    -- Already active today, no change
    RETURN json_build_object('streak', v_streak);
  ELSIF v_last = v_today - 1 THEN
    v_streak := v_streak + 1;
  ELSE
    v_streak := 1;
  END IF;

  UPDATE public.user_stats
    SET current_streak = v_streak,
        last_active_date = v_today,
        updated_at = now()
    WHERE user_id = p_user_id;

  RETURN json_build_object('streak', v_streak);
END;
$$;

-- ═══ 3. upsert_mastery function ═══
CREATE OR REPLACE FUNCTION public.upsert_mastery(
  p_user_id UUID,
  p_item_key TEXT,
  p_item_type TEXT DEFAULT 'vocabulary',
  p_hub TEXT DEFAULT 'academy',
  p_passed BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_delta INTEGER;
  v_review_interval INTERVAL;
BEGIN
  IF p_passed THEN
    v_delta := 20;
    v_review_interval := INTERVAL '4 days';
  ELSE
    v_delta := -10;
    v_review_interval := INTERVAL '0';
  END IF;

  INSERT INTO public.student_mastery (user_id, item_key, item_type, hub, mastery_score, times_correct, times_incorrect, last_tested, next_review_at)
  VALUES (
    p_user_id,
    p_item_key,
    p_item_type,
    p_hub,
    GREATEST(0, LEAST(100, 50 + v_delta)),
    CASE WHEN p_passed THEN 1 ELSE 0 END,
    CASE WHEN p_passed THEN 0 ELSE 1 END,
    now(),
    now() + v_review_interval
  )
  ON CONFLICT (user_id, item_key)
  DO UPDATE SET
    mastery_score = GREATEST(0, LEAST(100, student_mastery.mastery_score + v_delta)),
    times_correct = student_mastery.times_correct + CASE WHEN p_passed THEN 1 ELSE 0 END,
    times_incorrect = student_mastery.times_incorrect + CASE WHEN p_passed THEN 0 ELSE 1 END,
    last_tested = now(),
    next_review_at = now() + v_review_interval,
    updated_at = now();
END;
$$;
