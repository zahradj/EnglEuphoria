-- ============== USER CREDITS ==============
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_credits INTEGER NOT NULL DEFAULT 10 CHECK (lesson_credits >= 0),
  voice_energy INTEGER NOT NULL DEFAULT 30 CHECK (voice_energy >= 0),
  lesson_credits_monthly_refill INTEGER NOT NULL DEFAULT 10,
  voice_energy_monthly_refill INTEGER NOT NULL DEFAULT 30,
  last_refill_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users_update_own_credits"
  ON public.user_credits FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users_insert_own_credits"
  ON public.user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create credits row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Atomic deductors
CREATE OR REPLACE FUNCTION public.consume_lesson_credit(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.user_credits
     SET lesson_credits = lesson_credits - 1
   WHERE user_id = p_user_id AND lesson_credits >= 1
   RETURNING lesson_credits INTO new_balance;
  IF new_balance IS NULL THEN
    SELECT lesson_credits INTO new_balance FROM public.user_credits WHERE user_id = p_user_id;
    RETURN QUERY SELECT false, COALESCE(new_balance, 0);
  ELSE
    RETURN QUERY SELECT true, new_balance;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_voice_energy(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  INSERT INTO public.user_credits (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.user_credits
     SET voice_energy = voice_energy - 1
   WHERE user_id = p_user_id AND voice_energy >= 1
   RETURNING voice_energy INTO new_balance;
  IF new_balance IS NULL THEN
    SELECT voice_energy INTO new_balance FROM public.user_credits WHERE user_id = p_user_id;
    RETURN QUERY SELECT false, COALESCE(new_balance, 0);
  ELSE
    RETURN QUERY SELECT true, new_balance;
  END IF;
END;
$$;

-- ============== STUDENT SESSIONS (resume bookmarks) ==============
CREATE TABLE IF NOT EXISTS public.student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  slide_index INTEGER NOT NULL DEFAULT 0,
  stars_remaining INTEGER NOT NULL DEFAULT 3,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_student_sessions_user ON public.student_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_student_sessions_lesson ON public.student_sessions(lesson_id);

ALTER TABLE public.student_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_select_own_sessions"
  ON public.student_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "students_insert_own_sessions"
  ON public.student_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "students_update_own_sessions"
  ON public.student_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_student_sessions_updated_at
  BEFORE UPDATE ON public.student_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();