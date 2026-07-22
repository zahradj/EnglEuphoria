
-- =============================================
-- FIX 1: organization_members broken admin policy
-- The self-referential condition always evaluates to true
-- =============================================
DROP POLICY IF EXISTS "Admins can manage organization members" ON public.organization_members;

CREATE POLICY "Admins can manage organization members"
ON public.organization_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om_check
    WHERE om_check.organization_id = organization_members.organization_id
      AND om_check.user_id = auth.uid()
      AND om_check.role IN ('admin', 'owner')
  )
);

-- =============================================
-- FIX 2: classroom_sessions unrestricted SELECT
-- Remove the always-true policy that overrides proper restrictions
-- =============================================
DROP POLICY IF EXISTS "Users can view sessions for their rooms" ON public.classroom_sessions;

-- =============================================
-- FIX 3: quiz_responses - restrict to own data + teacher access
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view quiz responses" ON public.quiz_responses;

CREATE POLICY "Students can view own quiz responses"
ON public.quiz_responses
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view quiz responses for their sessions"
ON public.quiz_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.classroom_sessions cs
    WHERE cs.id = quiz_responses.session_id
      AND cs.teacher_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- =============================================
-- FIX 4: poll_responses - restrict to own data + teacher access
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can view poll responses" ON public.poll_responses;

CREATE POLICY "Students can view own poll responses"
ON public.poll_responses
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Teachers can view poll responses for their sessions"
ON public.poll_responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.classroom_sessions cs
    WHERE cs.id = poll_responses.session_id
      AND cs.teacher_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);
