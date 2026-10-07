-- Family accounts: a parent buys lessons for a child and can move unused credits between children.
--
-- * Parents can read their approved children's credit balance (student_credits had student/admin only).
-- * transfer_family_credits(): moves UNUSED credits between two learners of the same parent. Both must be
--   approved members of the caller's family; every move is logged in credit_transfers.
-- Buying for a child goes through create-pack-checkout (studentId), which checks the same relationship.
-- (Credits are a plain counter; per-credit expiry is not tracked, so a move has no validity date to carry.)

CREATE TABLE IF NOT EXISTS public.credit_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  from_student uuid NOT NULL,
  to_student uuid NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_transfers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.credit_transfers TO authenticated;
DO $$ BEGIN
  CREATE POLICY "Parents read their own transfers" ON public.credit_transfers
    FOR SELECT TO authenticated USING (parent_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins read all transfers" ON public.credit_transfers
    FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Parents can view their children's credits" ON public.student_credits
    FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.student_parent_relationships r
              WHERE r.student_id = student_credits.student_id
                AND r.parent_id = auth.uid() AND r.approved_at IS NOT NULL));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.transfer_family_credits(p_from uuid, p_to uuid, p_credits integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent uuid := auth.uid();
  v_avail  integer;
  v_to_total integer;
BEGIN
  IF v_parent IS NULL THEN
    RAISE EXCEPTION 'Please sign in.' USING ERRCODE = '28000';
  END IF;
  IF p_from IS NULL OR p_to IS NULL OR p_from = p_to THEN
    RAISE EXCEPTION 'Pick two different learners.' USING ERRCODE = '22023';
  END IF;
  IF p_credits IS NULL OR p_credits < 1 OR p_credits > 100 THEN
    RAISE EXCEPTION 'Choose between 1 and 100 credits.' USING ERRCODE = '22023';
  END IF;

  IF (SELECT count(DISTINCT student_id) FROM public.student_parent_relationships
      WHERE parent_id = v_parent AND approved_at IS NOT NULL AND student_id IN (p_from, p_to)) <> 2 THEN
    RAISE EXCEPTION 'Both learners must be in your family account.' USING ERRCODE = '42501';
  END IF;

  SELECT total_credits - used_credits - expired_credits INTO v_avail
  FROM public.student_credits WHERE student_id = p_from FOR UPDATE;
  IF v_avail IS NULL OR v_avail < p_credits THEN
    RAISE EXCEPTION 'Only % unused credit(s) can be moved from this learner.', coalesce(v_avail, 0) USING ERRCODE = '22023';
  END IF;

  UPDATE public.student_credits
     SET total_credits = total_credits - p_credits, updated_at = now()
   WHERE student_id = p_from;

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (p_to, p_credits)
  ON CONFLICT (student_id) DO UPDATE
    SET total_credits = public.student_credits.total_credits + p_credits, updated_at = now()
  RETURNING total_credits INTO v_to_total;

  INSERT INTO public.credit_transfers (parent_id, from_student, to_student, credits)
  VALUES (v_parent, p_from, p_to, p_credits);

  RETURN jsonb_build_object('from_left', v_avail - p_credits, 'to_total', v_to_total);
END;
$function$;
REVOKE ALL ON FUNCTION public.transfer_family_credits(uuid, uuid, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.transfer_family_credits(uuid, uuid, integer) TO authenticated;
