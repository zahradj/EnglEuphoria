
-- 1. assessment_submissions
DROP POLICY IF EXISTS "Students can manage their own submissions" ON public.assessment_submissions;
CREATE POLICY "Students can create their own submissions"
  ON public.assessment_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can read their own submissions"
  ON public.assessment_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Teachers and admins can grade submissions"
  ON public.assessment_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 2. homework_submissions
DROP POLICY IF EXISTS "Students can manage their own submissions" ON public.homework_submissions;
CREATE POLICY "Students can create their own homework submissions"
  ON public.homework_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can read their own homework submissions"
  ON public.homework_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "Teachers and admins can grade homework submissions"
  ON public.homework_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 3. homework
DROP POLICY IF EXISTS "Students can update homework status" ON public.homework;
CREATE OR REPLACE FUNCTION public.protect_homework_grade_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.grade IS DISTINCT FROM OLD.grade THEN
    RAISE EXCEPTION 'Students cannot modify grade' USING ERRCODE = '42501';
  END IF;
  IF NEW.feedback IS DISTINCT FROM OLD.feedback THEN
    RAISE EXCEPTION 'Students cannot modify feedback' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_protect_homework_grade_fields ON public.homework;
CREATE TRIGGER trg_protect_homework_grade_fields
BEFORE UPDATE ON public.homework FOR EACH ROW
EXECUTE FUNCTION public.protect_homework_grade_fields();
CREATE POLICY "Students can update their own homework status only"
  ON public.homework FOR UPDATE TO authenticated
  USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Teachers and admins can update any homework"
  ON public.homework FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 4. cat_items — id is TEXT
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT polname FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    WHERE c.relname = 'cat_items' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.cat_items', p.polname);
  END LOOP;
END $$;

REVOKE SELECT ON public.cat_items FROM anon;
REVOKE SELECT ON public.cat_items FROM authenticated;
GRANT SELECT ON public.cat_items TO service_role;

CREATE POLICY "Only service role reads cat_items"
  ON public.cat_items FOR SELECT TO service_role USING (true);

DROP VIEW IF EXISTS public.cat_items_public;
CREATE VIEW public.cat_items_public WITH (security_invoker = true) AS
SELECT id, cefr, skill, prompt, options, audio_url, option_image_urls, option_audio_urls, audio_url_kids
FROM public.cat_items;
GRANT SELECT ON public.cat_items_public TO authenticated;

CREATE OR REPLACE FUNCTION public.score_cat_answer(_item_id text, _answer_index int)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT correct_index = _answer_index FROM public.cat_items WHERE id = _item_id;
$$;
REVOKE ALL ON FUNCTION public.score_cat_answer(text, int) FROM public;
GRANT EXECUTE ON FUNCTION public.score_cat_answer(text, int) TO authenticated, service_role;

-- 5. assessment_questions safe view
DROP VIEW IF EXISTS public.assessment_questions_student;
CREATE VIEW public.assessment_questions_student WITH (security_invoker = true) AS
SELECT id, assessment_id, question_order, question_type, question_text, points, options, audio_url, metadata
FROM public.assessment_questions;
GRANT SELECT ON public.assessment_questions_student TO authenticated;

-- 6. bonus_policy
DROP POLICY IF EXISTS "Any authenticated user can read bonus policy" ON public.bonus_policy;
CREATE POLICY "Only admins and teachers can read bonus policy"
  ON public.bonus_policy FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
