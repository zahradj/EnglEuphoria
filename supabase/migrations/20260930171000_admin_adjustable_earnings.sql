-- Admin-adjustable teacher earnings.
--
-- Before: teachers could INSERT/UPDATE their own teacher_earnings rows (i.e.
-- edit their own pay) while admins could only read them, and the admin
-- "owed this month" figure was just completed-classes x current rate, so a
-- per-lesson correction could never show up in it.
-- After: only admins change earnings (end_lesson and the completion trigger
-- are SECURITY DEFINER, so they don't need the teacher policies); each row
-- carries who adjusted it and why; "owed" is the real sum of this month's
-- unpaid earnings rows.

ALTER TABLE public.teacher_earnings
  ADD COLUMN IF NOT EXISTS adjustment_note text,
  ADD COLUMN IF NOT EXISTS adjusted_by uuid,
  ADD COLUMN IF NOT EXISTS adjusted_at timestamptz;

DROP POLICY IF EXISTS secure_teacher_earnings_insert ON public.teacher_earnings;
DROP POLICY IF EXISTS secure_teacher_earnings_update ON public.teacher_earnings;

DROP POLICY IF EXISTS "Admins manage teacher earnings" ON public.teacher_earnings;
CREATE POLICY "Admins manage teacher earnings" ON public.teacher_earnings
  FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'::app_role))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_teacher_monthly_owed(p_teacher_user_id uuid)
 RETURNS TABLE(classes_count integer, rate_applied numeric, amount numeric, period_start date, period_end date)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_teacher_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH cfg AS (
    SELECT COALESCE(per_class_rate, 0)::numeric AS rate
    FROM public.teacher_profiles
    WHERE user_id = p_teacher_user_id
    LIMIT 1
  ),
  bounds AS (
    SELECT
      date_trunc('month', now())::date AS p_start,
      (date_trunc('month', now()) + interval '1 month - 1 day')::date AS p_end
  ),
  owed AS (
    SELECT count(*)::integer AS n, COALESCE(sum(e.teacher_amount), 0)::numeric AS total
    FROM public.teacher_earnings e, bounds b
    WHERE e.teacher_id = p_teacher_user_id
      AND e.status IS DISTINCT FROM 'paid'
      AND e.earned_at >= b.p_start
      AND e.earned_at < (b.p_end + interval '1 day')
  )
  SELECT owed.n, COALESCE((SELECT rate FROM cfg), 0), owed.total, bounds.p_start, bounds.p_end
  FROM owed, bounds;
END;
$function$;
