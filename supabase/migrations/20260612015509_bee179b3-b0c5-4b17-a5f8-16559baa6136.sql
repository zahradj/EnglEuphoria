CREATE OR REPLACE FUNCTION public.award_classroom_star(
  p_student uuid,
  p_session uuid,
  p_amount int DEFAULT 1
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher uuid;
  v_caller uuid := auth.uid();
  v_xp_per_star int := 10;
  v_total_xp int;
  v_new_balance int;
  v_last_award timestamptz;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_amount IS NULL OR p_amount < 1 OR p_amount > 10 THEN
    RAISE EXCEPTION 'Invalid star amount';
  END IF;

  -- Verify caller is the teacher of this session
  SELECT teacher_user_id INTO v_teacher
  FROM public.classroom_sessions
  WHERE id = p_session;

  IF v_teacher IS NULL OR v_teacher <> v_caller THEN
    RAISE EXCEPTION 'Only the session teacher can award stars';
  END IF;

  -- Rate-limit: max 1 award per student per second
  SELECT MAX(created_at) INTO v_last_award
  FROM public.xp_events
  WHERE user_id = p_student
    AND source = 'classroom_star';

  IF v_last_award IS NOT NULL AND v_last_award > (now() - interval '1 second') THEN
    RAISE EXCEPTION 'Rate limit: please wait before awarding another star';
  END IF;

  v_total_xp := p_amount * v_xp_per_star;

  -- Log XP event
  INSERT INTO public.xp_events (user_id, amount, source, metadata)
  VALUES (
    p_student,
    v_total_xp,
    'classroom_star',
    jsonb_build_object('session_id', p_session, 'star_amount', p_amount, 'awarded_by', v_caller)
  );

  -- Upsert into learning_currency (coins as star count, xp as xp)
  INSERT INTO public.learning_currency (user_id, coins, xp, stars)
  VALUES (p_student, 0, v_total_xp, p_amount)
  ON CONFLICT (user_id) DO UPDATE
  SET xp = public.learning_currency.xp + v_total_xp,
      stars = COALESCE(public.learning_currency.stars, 0) + p_amount,
      updated_at = now()
  RETURNING xp INTO v_new_balance;

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_total_xp,
    'star_amount', p_amount,
    'new_xp_balance', v_new_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_classroom_star(uuid, uuid, int) TO authenticated;