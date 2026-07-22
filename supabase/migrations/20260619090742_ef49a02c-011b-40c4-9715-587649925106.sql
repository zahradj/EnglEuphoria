
-- Helper predicate: admin OR marketing
CREATE OR REPLACE FUNCTION public.is_admin_or_marketing(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::public.app_role, 'marketing'::public.app_role)
  );
$$;

-- Updated_at trigger (idempotent)
CREATE OR REPLACE FUNCTION public.tg_marketing_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- 1) Campaigns
-- =========================================================
CREATE TABLE public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  campaign_type text NOT NULL CHECK (campaign_type IN ('referral','promo','paid_ad','organic','partnership')),
  code text UNIQUE,
  discount_pct numeric(5,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','ended')),
  starts_at timestamptz,
  ends_at timestamptz,
  signups_count integer NOT NULL DEFAULT 0,
  conversions_count integer NOT NULL DEFAULT 0,
  revenue_cents bigint NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing & admins read campaigns"
  ON public.marketing_campaigns FOR SELECT TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins write campaigns"
  ON public.marketing_campaigns FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins update campaigns"
  ON public.marketing_campaigns FOR UPDATE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()))
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins delete campaigns"
  ON public.marketing_campaigns FOR DELETE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE TRIGGER trg_marketing_campaigns_updated
  BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_marketing_set_updated_at();

-- =========================================================
-- 2) Broadcasts (email/in-app announcements)
-- =========================================================
CREATE TABLE public.marketing_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body_html text NOT NULL,
  audience_filter jsonb NOT NULL DEFAULT '{}'::jsonb,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','in_app','push')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','failed','cancelled')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipients_count integer NOT NULL DEFAULT 0,
  opens_count integer NOT NULL DEFAULT 0,
  clicks_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_broadcasts TO authenticated;
GRANT ALL ON public.marketing_broadcasts TO service_role;

ALTER TABLE public.marketing_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing & admins read broadcasts"
  ON public.marketing_broadcasts FOR SELECT TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins insert broadcasts"
  ON public.marketing_broadcasts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins update broadcasts"
  ON public.marketing_broadcasts FOR UPDATE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()))
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins delete broadcasts"
  ON public.marketing_broadcasts FOR DELETE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE TRIGGER trg_marketing_broadcasts_updated
  BEFORE UPDATE ON public.marketing_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.tg_marketing_set_updated_at();

-- =========================================================
-- 3) Social accounts (connected handles)
-- =========================================================
CREATE TABLE public.marketing_social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('instagram','tiktok','x','facebook','linkedin','youtube','threads','pinterest')),
  handle text NOT NULL,
  profile_url text,
  follower_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, handle)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_social_accounts TO authenticated;
GRANT ALL ON public.marketing_social_accounts TO service_role;

ALTER TABLE public.marketing_social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing & admins read social accounts"
  ON public.marketing_social_accounts FOR SELECT TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins insert social accounts"
  ON public.marketing_social_accounts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins update social accounts"
  ON public.marketing_social_accounts FOR UPDATE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()))
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins delete social accounts"
  ON public.marketing_social_accounts FOR DELETE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE TRIGGER trg_marketing_social_accounts_updated
  BEFORE UPDATE ON public.marketing_social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_marketing_set_updated_at();

-- =========================================================
-- 4) Social posts (scheduled + published)
-- =========================================================
CREATE TABLE public.marketing_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.marketing_social_accounts(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('instagram','tiktok','x','facebook','linkedin','youtube','threads','pinterest')),
  content text NOT NULL,
  media_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','posted','failed','archived')),
  scheduled_for timestamptz,
  posted_at timestamptz,
  external_url text,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  shares_count integer NOT NULL DEFAULT 0,
  impressions_count integer NOT NULL DEFAULT 0,
  campaign_id uuid REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_social_posts TO authenticated;
GRANT ALL ON public.marketing_social_posts TO service_role;

ALTER TABLE public.marketing_social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marketing & admins read social posts"
  ON public.marketing_social_posts FOR SELECT TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins insert social posts"
  ON public.marketing_social_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins update social posts"
  ON public.marketing_social_posts FOR UPDATE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()))
  WITH CHECK (public.is_admin_or_marketing(auth.uid()));

CREATE POLICY "Marketing & admins delete social posts"
  ON public.marketing_social_posts FOR DELETE TO authenticated
  USING (public.is_admin_or_marketing(auth.uid()));

CREATE TRIGGER trg_marketing_social_posts_updated
  BEFORE UPDATE ON public.marketing_social_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_marketing_set_updated_at();

CREATE INDEX idx_marketing_social_posts_account ON public.marketing_social_posts(account_id);
CREATE INDEX idx_marketing_social_posts_status ON public.marketing_social_posts(status);
CREATE INDEX idx_marketing_campaigns_status ON public.marketing_campaigns(status);
CREATE INDEX idx_marketing_broadcasts_status ON public.marketing_broadcasts(status);
