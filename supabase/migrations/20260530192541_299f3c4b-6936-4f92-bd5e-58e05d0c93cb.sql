
-- Create storybook-images bucket if missing
INSERT INTO storage.buckets (id, name, public)
VALUES ('storybook-images', 'storybook-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for storybook images
DO $$ BEGIN
  CREATE POLICY "Storybook images public read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'storybook-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated + service can upload/manage
DO $$ BEGIN
  CREATE POLICY "Storybook images authed write"
    ON storage.objects FOR INSERT TO authenticated, service_role
    WITH CHECK (bucket_id = 'storybook-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Storybook images authed update"
    ON storage.objects FOR UPDATE TO authenticated, service_role
    USING (bucket_id = 'storybook-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
