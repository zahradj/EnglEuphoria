-- Add canva_url and slide_order columns to lessons_content
ALTER TABLE public.lessons_content
  ADD COLUMN IF NOT EXISTS canva_url text,
  ADD COLUMN IF NOT EXISTS slide_order integer[];