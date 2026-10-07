-- 1. Credit packs start at 5 credits in EVERY hub (owner, 2026-10-07).
--    Playground already is 5 / 10 / 20. Academy and Success were doubled to 10 / 20 / 40 by the
--    "credit = 30 minutes" migration; bring them to 5 / 10 / 20 and halve the three money
--    columns, so the price PER CREDIT is unchanged (Academy EUR 7.50, Success EUR 10).
--    Runs once (marker row), only if the packs still have the doubled counts.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.schema_data_migrations WHERE name = 'packs_start_at_five') THEN
    RAISE NOTICE 'packs_start_at_five already applied - skipping';
    RETURN;
  END IF;

  UPDATE public.credit_packs
  SET session_count = session_count / 2,
      price_eur = round(price_eur / 2, 2),
      original_price_eur = round(original_price_eur / 2, 2),
      savings_eur = round(savings_eur / 2, 2),
      updated_at = now()
  WHERE student_level IN ('academy', 'professional')
    AND session_count IN (10, 20, 40);

  INSERT INTO public.schema_data_migrations (name) VALUES ('packs_start_at_five');
END $$;

-- 2. A student's dashboard must see the balance change the moment it changes (admin edits it by hand
--    today; the Stripe webhook will later). student_credits was not in the realtime publication, so
--    the dashboard only updated on reload. Row-level security still applies: a student receives only
--    their own row.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'student_credits'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_credits;
  END IF;
END $$;

-- 3. Admin sets / adds / removes a student's credits atomically (no read-then-write race), never
--    below what the student already used, and leaves an audit row. Called from Admin > Students.
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(p_student_id uuid, p_amount integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_used integer;
  v_expired integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only an admin can change credits' USING ERRCODE = '42501';
  END IF;
  IF p_student_id IS NULL OR p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Student and a non-zero amount are required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (p_student_id, GREATEST(p_amount, 0))
  ON CONFLICT (student_id) DO UPDATE
    SET total_credits = GREATEST(student_credits.total_credits + p_amount,
                                 student_credits.used_credits + student_credits.expired_credits),
        updated_at = now()
  RETURNING total_credits, used_credits, expired_credits INTO v_total, v_used, v_expired;

  BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, new_values)
    VALUES (auth.uid(), 'admin_adjust_credits', 'student_credits', p_student_id::text,
            jsonb_build_object('amount', p_amount, 'available', v_total - v_used - v_expired));
  EXCEPTION WHEN OTHERS THEN
    NULL; -- the audit trail must never block a credit change
  END;

  RETURN jsonb_build_object('available', v_total - v_used - v_expired);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_credits(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer) TO authenticated;
