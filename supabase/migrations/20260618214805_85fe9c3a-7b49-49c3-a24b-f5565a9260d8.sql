
-- 1. Harden update_student_xp with caps
CREATE OR REPLACE FUNCTION public.update_student_xp(student_uuid uuid, xp_to_add integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_total_xp INTEGER;
  new_level INTEGER;
  new_xp_in_level INTEGER;
  level_up BOOLEAN := FALSE;
  xp_per_level CONSTANT INTEGER := 500;
  xp_clamped INTEGER;
BEGIN
  IF xp_to_add IS NULL OR xp_to_add <= 0 THEN
    RAISE EXCEPTION 'xp_to_add must be a positive integer';
  END IF;
  xp_clamped := LEAST(xp_to_add, 200);

  SELECT * INTO current_record FROM public.student_xp WHERE student_id = student_uuid;

  IF current_record IS NULL THEN
    INSERT INTO public.student_xp (student_id, total_xp, current_level, xp_in_current_level)
    VALUES (student_uuid, xp_clamped, 1, xp_clamped)
    RETURNING * INTO current_record;
    new_total_xp := xp_clamped;
    new_level := 1;
    new_xp_in_level := xp_clamped;
  ELSE
    new_total_xp := current_record.total_xp + xp_clamped;
    new_xp_in_level := current_record.xp_in_current_level + xp_clamped;
    new_level := current_record.current_level;
    WHILE new_xp_in_level >= xp_per_level LOOP
      new_xp_in_level := new_xp_in_level - xp_per_level;
      new_level := new_level + 1;
      level_up := TRUE;
    END LOOP;
    UPDATE public.student_xp
    SET total_xp = new_total_xp,
        current_level = new_level,
        xp_in_current_level = new_xp_in_level,
        last_activity_date = CURRENT_DATE,
        updated_at = now()
    WHERE student_id = student_uuid;
  END IF;

  RETURN jsonb_build_object(
    'total_xp', new_total_xp,
    'current_level', new_level,
    'xp_in_current_level', new_xp_in_level,
    'level_up', level_up,
    'xp_added', xp_clamped
  );
END;
$function$;

-- 2. Harden update_learning_currency with caps
CREATE OR REPLACE FUNCTION public.update_learning_currency(student_uuid uuid, coins_to_add integer, currency_source text DEFAULT 'general'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  new_total INTEGER;
  coins_clamped INTEGER;
BEGIN
  IF coins_to_add IS NULL OR coins_to_add <= 0 THEN
    RAISE EXCEPTION 'coins_to_add must be a positive integer';
  END IF;
  coins_clamped := LEAST(coins_to_add, 50);

  SELECT * INTO current_record FROM public.learning_currency WHERE student_id = student_uuid;

  IF current_record IS NULL THEN
    INSERT INTO public.learning_currency (student_id, total_coins)
    VALUES (student_uuid, coins_clamped)
    RETURNING * INTO current_record;
    new_total := coins_clamped;
  ELSE
    new_total := current_record.total_coins + coins_clamped;
    UPDATE public.learning_currency
    SET total_coins = new_total,
        streak_bonus_coins = CASE WHEN currency_source = 'streak' THEN streak_bonus_coins + coins_clamped ELSE streak_bonus_coins END,
        achievement_bonus_coins = CASE WHEN currency_source = 'achievement' THEN achievement_bonus_coins + coins_clamped ELSE achievement_bonus_coins END,
        updated_at = now()
    WHERE student_id = student_uuid;
  END IF;

  RETURN jsonb_build_object(
    'total_coins', new_total,
    'coins_added', coins_clamped,
    'source', currency_source
  );
END;
$function$;

-- 3. New SECURITY DEFINER for academy coin ledger inserts
CREATE OR REPLACE FUNCTION public.award_academy_coins(
  p_amount integer,
  p_reason text,
  p_lesson_id uuid DEFAULT NULL,
  p_block_id text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_amount integer;
  v_daily_total integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50 THEN
    RAISE EXCEPTION 'p_amount must be between 1 and 50';
  END IF;
  IF p_reason NOT IN ('lesson_block_complete','lesson_complete','admin_adjust') THEN
    RAISE EXCEPTION 'invalid reason';
  END IF;

  v_amount := p_amount;

  -- Daily cap: 500 coins per student per UTC day
  SELECT COALESCE(SUM(delta),0) INTO v_daily_total
  FROM public.academy_coin_ledger
  WHERE student_id = v_uid
    AND created_at >= date_trunc('day', now());
  IF v_daily_total + v_amount > 500 THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'daily_cap_reached');
  END IF;

  BEGIN
    INSERT INTO public.academy_coin_ledger (student_id, delta, reason, lesson_id, block_id)
    VALUES (v_uid, v_amount, p_reason, p_lesson_id, p_block_id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('awarded', false, 'reason', 'duplicate');
  END;

  RETURN jsonb_build_object('awarded', true, 'delta', v_amount);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.award_academy_coins(integer, text, uuid, text) TO authenticated;

-- 4. Remove client write policies on academy_coin_ledger (keep self SELECT)
DROP POLICY IF EXISTS "students insert own coins" ON public.academy_coin_ledger;

-- 5. Remove client write policies on xp_events (edge function uses service role)
DROP POLICY IF EXISTS "xp_events_insert_self" ON public.xp_events;

-- 6. Remove client write policies on student_xp (keep self SELECT)
DROP POLICY IF EXISTS "System can insert XP records" ON public.student_xp;
DROP POLICY IF EXISTS "System can modify XP" ON public.student_xp;
DROP POLICY IF EXISTS "System can update XP" ON public.student_xp;
DROP POLICY IF EXISTS "System can update student XP" ON public.student_xp;
DROP POLICY IF EXISTS "Users can update their own XP" ON public.student_xp;

-- 7. Remove client write policies on learning_currency (keep self SELECT)
DROP POLICY IF EXISTS "System can insert learning currency" ON public.learning_currency;
DROP POLICY IF EXISTS "System can manage currency" ON public.learning_currency;
DROP POLICY IF EXISTS "Users can update their own learning currency" ON public.learning_currency;
DROP POLICY IF EXISTS "secure_learning_currency_all" ON public.learning_currency;
