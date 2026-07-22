
-- Guard trigger for student_profiles: revert academic/placement fields
-- to their previous value unless the caller is an admin.
CREATE OR REPLACE FUNCTION public.guard_student_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.cefr_level            := OLD.cefr_level;
    NEW.final_cefr_level      := OLD.final_cefr_level;
    NEW.placement_test_score  := OLD.placement_test_score;
    NEW.placement_test_2_score := OLD.placement_test_2_score;
    NEW.fluency_score         := OLD.fluency_score;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_student_profile_privileged_columns ON public.student_profiles;
CREATE TRIGGER trg_guard_student_profile_privileged_columns
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_student_profile_privileged_columns();

-- Guard trigger for teacher_profiles: revert approval + pay-rate fields
-- to their previous value unless the caller is an admin.
CREATE OR REPLACE FUNCTION public.guard_teacher_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.can_teach                 := OLD.can_teach;
    NEW.profile_approved_by_admin := OLD.profile_approved_by_admin;
    NEW.hourly_rate_eur           := OLD.hourly_rate_eur;
    NEW.hourly_rate_dzd           := OLD.hourly_rate_dzd;
    NEW.per_class_rate            := OLD.per_class_rate;
    NEW.payout_rate_override      := OLD.payout_rate_override;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_teacher_profile_privileged_columns ON public.teacher_profiles;
CREATE TRIGGER trg_guard_teacher_profile_privileged_columns
BEFORE UPDATE ON public.teacher_profiles
FOR EACH ROW
EXECUTE FUNCTION public.guard_teacher_profile_privileged_columns();
