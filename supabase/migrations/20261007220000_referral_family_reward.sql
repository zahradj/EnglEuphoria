-- Referral reward size. A successful referral gives the person who shared their link free lessons:
--   * 1 lesson for a student,
--   * 2 lessons when the referrer has a family account (a parent with approved children).
-- The friend still gets 1 lesson. Everything else is unchanged (once per friend, on the friend's first
-- purchase; a parent's reward goes to their first child, see _credit_recipient).

CREATE OR REPLACE FUNCTION public.complete_referral(friend_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ref_record RECORD;
  v_referrer_wallet uuid;
  v_friend_wallet uuid;
  v_referrer_lessons integer;
BEGIN
  SELECT * INTO ref_record
  FROM public.referrals
  WHERE friend_id = friend_uuid AND status = 'pending' AND reward_given = false
  LIMIT 1;

  IF ref_record IS NULL THEN
    RETURN;
  END IF;

  UPDATE public.referrals
  SET status = 'completed', reward_given = true, completed_at = now()
  WHERE id = ref_record.id;

  v_referrer_wallet := public._credit_recipient(ref_record.referrer_id);
  v_friend_wallet   := public._credit_recipient(friend_uuid);

  -- A family account (the referrer is the parent of at least one approved child) earns 2 lessons.
  v_referrer_lessons := CASE
    WHEN EXISTS (
      SELECT 1 FROM public.student_parent_relationships
      WHERE parent_id = ref_record.referrer_id AND approved_at IS NOT NULL
    ) THEN 2 ELSE 1 END;

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (v_referrer_wallet, v_referrer_lessons)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + v_referrer_lessons, updated_at = now();

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (v_friend_wallet, 1)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + 1, updated_at = now();
END;
$function$;
