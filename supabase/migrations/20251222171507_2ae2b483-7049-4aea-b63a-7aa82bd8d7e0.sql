-- Add unit_id to curriculum_lessons to link lessons to units (Islands on the map)
ALTER TABLE public.curriculum_lessons 
ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.curriculum_units(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_curriculum_lessons_unit_id ON public.curriculum_lessons(unit_id);