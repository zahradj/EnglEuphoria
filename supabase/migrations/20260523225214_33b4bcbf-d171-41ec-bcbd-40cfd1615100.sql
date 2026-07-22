
-- 1. student_profiles
DROP POLICY IF EXISTS "Teachers can view assigned students profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Teachers can view recently assigned students profiles" ON public.student_profiles;
CREATE POLICY "Teachers can view recently assigned students profiles"
  ON public.student_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.teacher_id = auth.uid()
        AND l.student_id = student_profiles.user_id
        AND COALESCE(l.status, '') <> 'cancelled'
        AND COALESCE(l.scheduled_at, l.created_at, now()) >= (now() - interval '90 days')
    )
  );

-- 2. student_cefr_progress
DROP POLICY IF EXISTS "cefr_update_staff_only" ON public.student_cefr_progress;
DROP POLICY IF EXISTS "cefr_update_scoped" ON public.student_cefr_progress;
CREATE POLICY "cefr_update_scoped"
  ON public.student_cefr_progress
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = student_cefr_progress.student_id
        AND cb.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = student_cefr_progress.student_id
        AND cb.teacher_id = auth.uid()
    )
  );

-- 3. student_credits
DROP POLICY IF EXISTS "Students can update own credits" ON public.student_credits;

-- 4. credit_purchases
DROP POLICY IF EXISTS "Students can insert own purchases" ON public.credit_purchases;

-- 5. teacher_applications
DROP POLICY IF EXISTS "Users can update own applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Applicants update own applications" ON public.teacher_applications;
CREATE POLICY "Applicants update own applications"
  ON public.teacher_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_teacher_application_admin_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.interview_passed IS DISTINCT FROM OLD.interview_passed
     OR NEW.documents_approved IS DISTINCT FROM OLD.documents_approved
     OR NEW.intro_video_approved IS DISTINCT FROM OLD.intro_video_approved
     OR NEW.current_stage IS DISTINCT FROM OLD.current_stage
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
     OR NEW.interviewed_by IS DISTINCT FROM OLD.interviewed_by
  THEN
    RAISE EXCEPTION 'Only admins can modify application status / approval fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_teacher_application_admin_cols_trg ON public.teacher_applications;
CREATE TRIGGER guard_teacher_application_admin_cols_trg
BEFORE UPDATE ON public.teacher_applications
FOR EACH ROW
EXECUTE FUNCTION public.guard_teacher_application_admin_cols();

-- 6. user_subscriptions
DROP POLICY IF EXISTS "user_subscriptions_own_write" ON public.user_subscriptions;
-- (read-only policy "user_subscriptions_own_read" already exists)

-- 7. XP / coins / streaks → read-only for students
DROP POLICY IF EXISTS "secure_student_xp_all" ON public.student_xp;
DROP POLICY IF EXISTS "students_read_own_xp" ON public.student_xp;
CREATE POLICY "students_read_own_xp"
  ON public.student_xp
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "System can manage learning currency" ON public.learning_currency;
DROP POLICY IF EXISTS "students_read_own_currency" ON public.learning_currency;
CREATE POLICY "students_read_own_currency"
  ON public.learning_currency
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "System can manage streaks" ON public.student_learning_streaks;
DROP POLICY IF EXISTS "students_read_own_streaks" ON public.student_learning_streaks;
CREATE POLICY "students_read_own_streaks"
  ON public.student_learning_streaks
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- 8. user_credits
DROP POLICY IF EXISTS "users_update_own_credits" ON public.user_credits;

-- 9. iron / early learner progress
DROP POLICY IF EXISTS "Teachers can view all student progress" ON public.iron_student_progress;
DROP POLICY IF EXISTS "Teachers view assigned iron student progress" ON public.iron_student_progress;
CREATE POLICY "Teachers view assigned iron student progress"
  ON public.iron_student_progress
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = iron_student_progress.student_id
        AND cb.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers and admins can view all progress" ON public.early_learners_progress;
DROP POLICY IF EXISTS "Teachers view assigned early learners progress" ON public.early_learners_progress;
CREATE POLICY "Teachers view assigned early learners progress"
  ON public.early_learners_progress
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.class_bookings cb
      WHERE cb.student_id = early_learners_progress.student_id
        AND cb.teacher_id = auth.uid()
    )
  );

-- 10. lesson_materials
DROP POLICY IF EXISTS "Everyone can view lesson materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Authenticated users can view lesson materials" ON public.lesson_materials;
CREATE POLICY "Authenticated users can view lesson materials"
  ON public.lesson_materials
  FOR SELECT
  TO authenticated
  USING (true);
