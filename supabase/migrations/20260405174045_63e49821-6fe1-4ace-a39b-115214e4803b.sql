
-- Accessories / Rewards table linked to existing curriculum_levels
CREATE TABLE IF NOT EXISTS public.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID REFERENCES public.curriculum_levels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('hat', 'badge', 'tool', 'avatar_skin')),
  hub_requirement TEXT NOT NULL CHECK (hub_requirement IN ('playground', 'academy', 'professional')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.accessories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read accessories
CREATE POLICY "Authenticated users can view accessories"
  ON public.accessories FOR SELECT
  TO authenticated
  USING (true);

-- Only admins/content_creators can manage
CREATE POLICY "Admins can manage accessories"
  ON public.accessories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'content_creator'));

-- Student unlocked accessories junction table
CREATE TABLE IF NOT EXISTS public.student_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  accessory_id UUID REFERENCES public.accessories(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(student_id, accessory_id)
);

ALTER TABLE public.student_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own accessories"
  ON public.student_accessories FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "System can grant accessories"
  ON public.student_accessories FOR INSERT
  TO authenticated
  WITH CHECK (true);
