-- Family accounts, step 2: let a parent read the student_profiles row (hub, age, buddy) of each
-- approved child, for the dashboard cards and the "Who's learning today?" picker.
--
-- A SECURITY DEFINER helper is used instead of a sub-select in the policy so the policy never
-- recurses through student_parent_relationships' own RLS (which calls is_user_admin()).

CREATE OR REPLACE FUNCTION public.is_approved_parent_of(p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.student_parent_relationships spr
    WHERE spr.parent_id = auth.uid()
      AND spr.student_id = p_student_id
      AND spr.approved_at IS NOT NULL
  );
$$;

REVOKE ALL ON FUNCTION public.is_approved_parent_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_approved_parent_of(uuid) TO authenticated;

-- (public.users already has "Parents can view their child's user row", approval-gated, from
-- 20260927204150, so no users policy is added here.)

-- The child's student_profiles row (hub, age, companion) - needed by the dashboard
-- cards and, in step 3, the "Who's learning today?" picker.
DROP POLICY IF EXISTS "Parents can view their approved children's student profile" ON public.student_profiles;
CREATE POLICY "Parents can view their approved children's student profile"
  ON public.student_profiles FOR SELECT
  TO authenticated
  USING (public.is_approved_parent_of(user_id));
