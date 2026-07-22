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
  v_coins_per_star int := 5;
  v_total_xp int;
  v_total_coins int;
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

  -- Rate-limit
  SELECT MAX(created_at) INTO v_last_award
  FROM public.xp_events
  WHERE student_id = p_student
    AND action = 'classroom_star';

  IF v_last_award IS NOT NULL AND v_last_award > (now() - interval '1 second') THEN
    RAISE EXCEPTION 'Rate limit: please wait before awarding another star';
  END IF;

  v_total_xp := p_amount * v_xp_per_star;
  v_total_coins := p_amount * v_coins_per_star;

  -- Log XP event
  INSERT INTO public.xp_events (student_id, action, xp, ref_id)
  VALUES (p_student, 'classroom_star', v_total_xp, p_session);

  -- Upsert student_xp
  INSERT INTO public.student_xp (student_id, total_xp, current_level, xp_in_current_level, last_activity_date)
  VALUES (p_student, v_total_xp, 1, v_total_xp, current_date)
  ON CONFLICT (student_id) DO UPDATE
  SET total_xp = public.student_xp.total_xp + v_total_xp,
      xp_in_current_level = public.student_xp.xp_in_current_level + v_total_xp,
      last_activity_date = current_date,
      updated_at = now();

  -- Upsert learning_currency (coins)
  INSERT INTO public.learning_currency (student_id, total_coins, coins_spent, streak_bonus_coins, achievement_bonus_coins)
  VALUES (p_student, v_total_coins, 0, 0, v_total_coins)
  ON CONFLICT (student_id) DO UPDATE
  SET total_coins = public.learning_currency.total_coins + v_total_coins,
      achievement_bonus_coins = public.learning_currency.achievement_bonus_coins + v_total_coins,
      updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'xp_awarded', v_total_xp,
    'coins_awarded', v_total_coins,
    'star_amount', p_amount
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.award_classroom_star(uuid, uuid, int) TO authenticated;