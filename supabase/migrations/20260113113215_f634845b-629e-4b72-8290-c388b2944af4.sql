-- Create table for AI-generated PPP lesson plans (separate from class bookings)
CREATE TABLE public.ai_lessons_ppp (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Core metadata
  topic text NOT NULL,
  system_type text CHECK (system_type IN ('kids', 'teens', 'adults')) NOT NULL,
  level text DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  
  -- The AI Lesson Plan (JSONB for flexible structure per system type)
  ppp_content jsonb NOT NULL,
  
  -- Content management
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Link to curriculum (optional)
  level_id uuid REFERENCES public.curriculum_levels(id) ON DELETE SET NULL,
  
  -- Creator tracking
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ai_lessons_ppp ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Enable read access for all users" ON public.ai_lessons_ppp
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.ai_lessons_ppp
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.ai_lessons_ppp
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.ai_lessons_ppp
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for common queries
CREATE INDEX idx_ai_lessons_ppp_system_type ON public.ai_lessons_ppp(system_type);
CREATE INDEX idx_ai_lessons_ppp_status ON public.ai_lessons_ppp(status);
CREATE INDEX idx_ai_lessons_ppp_level_id ON public.ai_lessons_ppp(level_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_lessons_ppp_updated_at
  BEFORE UPDATE ON public.ai_lessons_ppp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();