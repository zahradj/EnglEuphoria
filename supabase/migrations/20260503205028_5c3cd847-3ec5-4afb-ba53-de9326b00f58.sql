-- Create public storage bucket for AI-generated playground assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('playground_assets', 'playground_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Playground assets are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'playground_assets');

-- Allow authenticated users (and service role bypasses anyway) to insert
CREATE POLICY "Authenticated can upload playground assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'playground_assets');

CREATE POLICY "Service can update playground assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'playground_assets');