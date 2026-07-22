
CREATE TABLE IF NOT EXISTS public.vocab_image_cache (
  cache_key TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  style TEXT NOT NULL,
  theme TEXT,
  hub TEXT,
  cefr TEXT,
  image_url TEXT,
  image_prompt TEXT,
  plan JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vocab_image_cache TO authenticated;
GRANT ALL ON public.vocab_image_cache TO service_role;
ALTER TABLE public.vocab_image_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read vocab image cache" ON public.vocab_image_cache FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_vocab_image_cache_word ON public.vocab_image_cache(word, style);
