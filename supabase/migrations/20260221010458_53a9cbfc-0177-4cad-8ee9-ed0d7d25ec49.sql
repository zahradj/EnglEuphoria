
-- 1. Add referral columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);

-- 2. Auto-generate referral codes for new users
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := lower(substring(md5(random()::text || NEW.id::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_generate_referral_code
BEFORE INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_referral_code();

-- 3. Backfill existing users with referral codes
UPDATE public.users 
SET referral_code = lower(substring(md5(random()::text || id::text), 1, 8)) 
WHERE referral_code IS NULL;

-- 4. Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id),
  friend_id UUID NOT NULL REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  reward_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, friend_id)
);

-- 5. Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can read their own referrals
CREATE POLICY "Users can read own referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (referrer_id = auth.uid() OR friend_id = auth.uid());

-- Authenticated users can insert referrals
CREATE POLICY "Authenticated users can insert referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can read all referrals
CREATE POLICY "Admins can read all referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create complete_referral function
CREATE OR REPLACE FUNCTION public.complete_referral(friend_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_record RECORD;
BEGIN
  -- Find pending referral for this friend
  SELECT * INTO ref_record
  FROM public.referrals
  WHERE friend_id = friend_uuid AND status = 'pending' AND reward_given = false
  LIMIT 1;

  IF ref_record IS NULL THEN
    RETURN;
  END IF;

  -- Mark referral as completed
  UPDATE public.referrals
  SET status = 'completed', reward_given = true, completed_at = now()
  WHERE id = ref_record.id;

  -- Add +1 credit to referrer
  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (ref_record.referrer_id, 1)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + 1, updated_at = now();

  -- Add +1 credit to friend
  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (friend_uuid, 1)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + 1, updated_at = now();
END;
$$;

-- 7. Update add_credits_on_purchase to auto-complete referrals
CREATE OR REPLACE FUNCTION public.add_credits_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (NEW.student_id, NEW.credits_purchased)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + NEW.credits_purchased,
      updated_at = now();

  -- Auto-complete referral on first purchase
  IF NOT EXISTS (
    SELECT 1 FROM public.credit_purchases 
    WHERE student_id = NEW.student_id AND id != NEW.id
  ) THEN
    PERFORM public.complete_referral(NEW.student_id);
  END IF;

  RETURN NEW;
END;
$$;
