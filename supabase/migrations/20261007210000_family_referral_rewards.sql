-- Referrals for family accounts.
--
-- A parent has no lesson wallet of their own (credits belong to the children), so a referral reward
-- for a parent goes to their first child (_credit_recipient). A referred parent's referral completes on
-- the family's first purchase (for any child), not only when the parent themselves is the buyer.
-- Unchanged: +1 credit to both people, once, on the friend's first purchase.

CREATE OR REPLACE FUNCTION public._credit_recipient(p_user uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT coalesce(
    (SELECT student_id FROM public.student_parent_relationships
      WHERE parent_id = p_user AND approved_at IS NOT NULL
      ORDER BY created_at LIMIT 1),
    p_user)
$$;
REVOKE ALL ON FUNCTION public._credit_recipient(uuid) FROM public;

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

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (v_referrer_wallet, 1)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + 1, updated_at = now();

  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (v_friend_wallet, 1)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + 1, updated_at = now();
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_credits_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_parent uuid;
BEGIN
  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (NEW.student_id, NEW.credits_purchased)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + NEW.credits_purchased,
      updated_at = now();

  -- Auto-complete the learner's referral on their first purchase
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_purchases
    WHERE student_id = NEW.student_id AND id != NEW.id
  ) THEN
    PERFORM public.complete_referral(NEW.student_id);
  END IF;

  -- ...and a referred parent's referral on the family's first purchase (for any of their children)
  FOR v_parent IN
    SELECT parent_id FROM public.student_parent_relationships
    WHERE student_id = NEW.student_id AND approved_at IS NOT NULL
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.credit_purchases cp
      JOIN public.student_parent_relationships r
        ON r.student_id = cp.student_id AND r.parent_id = v_parent AND r.approved_at IS NOT NULL
      WHERE cp.id <> NEW.id
    ) THEN
      PERFORM public.complete_referral(v_parent);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;
