-- Connects the referral link to the referrals table.
--
-- The student shares /student-signup?ref=<code> (users.referral_code). The code is kept in the
-- browser and in the sign-up metadata (user_metadata.ref_code), and the new student's dashboard
-- calls claim_referral() once signed in. Doing it here, not at sign-up, because a new account has no
-- session until the email is confirmed, so a client-side insert into referrals is refused.
--
-- The reward is unchanged: when the friend buys their first pack, complete_referral() (called from
-- add_credits_on_purchase) gives +1 credit to both. Guards: no self-referral, one referrer per
-- friend, only accounts created in the last 14 days, code must belong to a real user.

CREATE OR REPLACE FUNCTION public.claim_referral(p_code text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_me       uuid := auth.uid();
  v_code     text;
  v_referrer uuid;
  v_created  timestamptz;
BEGIN
  IF v_me IS NULL THEN
    RETURN 'not_signed_in';
  END IF;

  v_code := lower(btrim(coalesce(
    nullif(p_code, ''),
    auth.jwt() -> 'user_metadata' ->> 'ref_code'
  )));
  IF v_code IS NULL OR v_code = '' OR v_code !~ '^[a-z0-9]{4,16}$' THEN
    RETURN 'no_code';
  END IF;

  IF EXISTS (SELECT 1 FROM public.referrals WHERE friend_id = v_me) THEN
    RETURN 'already_linked';
  END IF;

  SELECT created_at INTO v_created FROM auth.users WHERE id = v_me;
  IF v_created IS NULL OR v_created < now() - interval '14 days' THEN
    RETURN 'account_too_old';
  END IF;

  SELECT id INTO v_referrer FROM public.users WHERE referral_code = v_code;
  IF v_referrer IS NULL THEN
    RETURN 'unknown_code';
  END IF;
  IF v_referrer = v_me THEN
    RETURN 'self_referral';
  END IF;

  INSERT INTO public.referrals (referrer_id, friend_id, status)
  VALUES (v_referrer, v_me, 'pending');

  UPDATE public.users SET referred_by = v_referrer WHERE id = v_me AND referred_by IS NULL;

  RETURN 'linked';
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_referral(text) FROM public;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
