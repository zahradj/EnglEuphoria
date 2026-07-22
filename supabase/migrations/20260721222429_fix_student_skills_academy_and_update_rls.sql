-- Two pre-existing bugs found while wiring real per-skill placement scoring:
--
-- 1. student_skills.skill_name has a CHECK constraint hard-coded to only the
--    Professional/Success Hub label set ('professional_vocabulary', 'fluency',
--    'grammar_accuracy', 'business_writing', 'listening'). Academy's skill
--    names ('vocabulary', 'speaking', 'grammar', 'writing', 'listening' — see
--    HUB_SKILL_PROFILE.academy in useStudentSkills.ts) violate it outright, so
--    every upsert for an Academy student has always failed silently (the
--    error is caught but not surfaced) and never persisted.
--
-- 2. There is an INSERT policy ("Students can insert own skills") but no
--    UPDATE policy for students on their own rows — only teachers/admins can
--    UPDATE. Since the skills sync logic uses upsert (INSERT ... ON CONFLICT
--    DO UPDATE), the very first sync for a student succeeds via INSERT, but
--    every subsequent re-sync (retaking the placement test, or the ordinary
--    useStudentSkills.ts re-sync path) hits the UPDATE branch and is silently
--    blocked by RLS.

ALTER TABLE public.student_skills DROP CONSTRAINT IF EXISTS student_skills_skill_name_check;
ALTER TABLE public.student_skills ADD CONSTRAINT student_skills_skill_name_check
  CHECK (skill_name IN (
    -- Professional / Success Hub
    'professional_vocabulary', 'fluency', 'grammar_accuracy', 'business_writing', 'listening',
    -- Academy
    'vocabulary', 'speaking', 'grammar', 'writing',
    -- Shared by both hubs (reading comprehension, added as a 6th radar category)
    'reading'
    -- ('listening' is shared by both hub profiles, not duplicated above)
  ));

CREATE POLICY "Students can update own skills"
  ON public.student_skills FOR UPDATE
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());
