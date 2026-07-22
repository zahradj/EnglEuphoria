
-- ============================================================
-- Credit Pack System: catalog, purchases, student balances
-- ============================================================

-- 1. Credit pack catalog (product definitions)
CREATE TABLE public.credit_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                          -- e.g. "Starter", "Value Pack", "Mastery Pack"
  student_level TEXT NOT NULL,                 -- 'academy' or 'professional'
  session_count INTEGER NOT NULL,              -- 5, 10, or 20
  price_eur NUMERIC(10,2) NOT NULL,            -- total pack price
  original_price_eur NUMERIC(10,2) NOT NULL,   -- price without discount (for strikethrough)
  savings_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active credit packs"
  ON public.credit_packs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage credit packs"
  ON public.credit_packs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Credit purchases (sales log)
CREATE TABLE public.credit_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id),
  pack_id UUID NOT NULL REFERENCES public.credit_packs(id),
  credits_purchased INTEGER NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  payment_method TEXT DEFAULT 'manual',
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '6 months'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own purchases"
  ON public.credit_purchases FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can view all purchases"
  ON public.credit_purchases FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can insert own purchases"
  ON public.credit_purchases FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- 3. Student credit balance
CREATE TABLE public.student_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.users(id) UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  expired_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own credits"
  ON public.student_credits FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own credits"
  ON public.student_credits FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all credits"
  ON public.student_credits FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert credits"
  ON public.student_credits FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- 4. Trigger to auto-update student_credits on purchase
CREATE OR REPLACE FUNCTION public.add_credits_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.student_credits (student_id, total_credits)
  VALUES (NEW.student_id, NEW.credits_purchased)
  ON CONFLICT (student_id) DO UPDATE
  SET total_credits = student_credits.total_credits + NEW.credits_purchased,
      updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_credit_purchase
  AFTER INSERT ON public.credit_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.add_credits_on_purchase();

-- 5. Function to consume a credit on booking
CREATE OR REPLACE FUNCTION public.consume_credit(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  available INTEGER;
BEGIN
  SELECT (total_credits - used_credits - expired_credits)
  INTO available
  FROM public.student_credits
  WHERE student_id = p_student_id;

  IF available IS NULL OR available <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.student_credits
  SET used_credits = used_credits + 1, updated_at = now()
  WHERE student_id = p_student_id;

  RETURN TRUE;
END;
$$;

-- 6. Function to refund a credit on cancellation (24h+ before class)
CREATE OR REPLACE FUNCTION public.refund_credit(p_student_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.student_credits
  SET used_credits = GREATEST(used_credits - 1, 0), updated_at = now()
  WHERE student_id = p_student_id;
END;
$$;

-- 7. Seed the 6 credit packs
INSERT INTO public.credit_packs (name, student_level, session_count, price_eur, original_price_eur, savings_eur, sort_order) VALUES
  ('Starter',      'academy',      5,  75.00,  75.00,  0.00, 1),
  ('Value Pack',   'academy',     10, 145.00, 150.00,  5.00, 2),
  ('Mastery Pack', 'academy',     20, 290.00, 300.00, 10.00, 3),
  ('Starter',      'professional', 5, 100.00, 100.00,  0.00, 4),
  ('Value Pack',   'professional',10, 195.00, 200.00,  5.00, 5),
  ('Mastery Pack', 'professional',20, 390.00, 400.00, 10.00, 6);
