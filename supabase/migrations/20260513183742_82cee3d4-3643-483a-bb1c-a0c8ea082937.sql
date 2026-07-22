-- Assessment immutability: protect historical assessments and questions from
-- being overwritten by future generations. Only safe lifecycle fields on
-- assessments remain mutable; questions become fully immutable after insert.

-- 1. Lock assessment content fields after insert (allow only lifecycle fields)
CREATE OR REPLACE FUNCTION public.protect_assessment_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.assessment_type IS DISTINCT FROM OLD.assessment_type
     OR NEW.cefr_level IS DISTINCT FROM OLD.cefr_level
     OR NEW.duration_minutes IS DISTINCT FROM OLD.duration_minutes
     OR NEW.passing_score IS DISTINCT FROM OLD.passing_score
     OR NEW.total_points IS DISTINCT FROM OLD.total_points
     OR NEW.teacher_id IS DISTINCT FROM OLD.teacher_id
  THEN
    RAISE EXCEPTION 'Assessment content fields are immutable after creation. Allowed updates: is_published, published_at, due_date, metadata.'
      USING ERRCODE = 'check_violation';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_assessment_content ON public.assessments;
CREATE TRIGGER trg_protect_assessment_content
BEFORE UPDATE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.protect_assessment_content();

-- 2. Block destructive deletes on assessments that already have submissions
CREATE OR REPLACE FUNCTION public.protect_assessment_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.assessment_submissions WHERE assessment_id = OLD.id) THEN
    RAISE EXCEPTION 'Cannot delete an assessment that has student submissions. Unpublish it instead.'
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_assessment_delete ON public.assessments;
CREATE TRIGGER trg_protect_assessment_delete
BEFORE DELETE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.protect_assessment_delete();

-- 3. Make assessment_questions fully immutable after insert
CREATE OR REPLACE FUNCTION public.block_assessment_question_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Assessment questions are immutable. Create a new assessment instead of editing historical questions.'
    USING ERRCODE = 'check_violation';
END;
$$;

DROP TRIGGER IF EXISTS trg_block_assessment_question_update ON public.assessment_questions;
CREATE TRIGGER trg_block_assessment_question_update
BEFORE UPDATE ON public.assessment_questions
FOR EACH ROW EXECUTE FUNCTION public.block_assessment_question_update();

-- 4. Block deletion of questions whose assessment has any submissions
CREATE OR REPLACE FUNCTION public.protect_assessment_question_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.assessment_submissions WHERE assessment_id = OLD.assessment_id) THEN
    RAISE EXCEPTION 'Cannot delete questions from an assessment that already has submissions.'
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_assessment_question_delete ON public.assessment_questions;
CREATE TRIGGER trg_protect_assessment_question_delete
BEFORE DELETE ON public.assessment_questions
FOR EACH ROW EXECUTE FUNCTION public.protect_assessment_question_delete();