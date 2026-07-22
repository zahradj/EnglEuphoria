
-- Interviews table for internal teacher interviews
CREATE TABLE public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.teacher_applications(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  teacher_email TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  room_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'passed', 'failed', 'cancelled')),
  admin_notes TEXT,
  checklist JSONB DEFAULT '{"energy_level": null, "subject_knowledge": null, "tech_stability": null, "demo_performance": null}'::jsonb,
  hub_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access to interviews"
ON public.interviews FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Teachers can view their own interviews (by email match)
CREATE POLICY "Teachers can view own interviews"
ON public.interviews FOR SELECT TO authenticated
USING (teacher_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
