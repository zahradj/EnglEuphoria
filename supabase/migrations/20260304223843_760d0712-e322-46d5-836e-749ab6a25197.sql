
-- Update get_user_role to handle content_creator priority
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'content_creator' THEN 2
      WHEN 'teacher' THEN 3
      WHEN 'student' THEN 4
      ELSE 5
    END
  LIMIT 1
$$;

-- RLS policies for content_creator on curriculum tables
CREATE POLICY "Content creators can read curriculum_lessons"
  ON public.curriculum_lessons
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can insert curriculum_lessons"
  ON public.curriculum_lessons
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can update curriculum_lessons"
  ON public.curriculum_lessons
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can read curriculum_levels"
  ON public.curriculum_levels
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can read curriculum_units"
  ON public.curriculum_units
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can insert curriculum_units"
  ON public.curriculum_units
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can update curriculum_units"
  ON public.curriculum_units
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Content creators can read tracks"
  ON public.tracks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'content_creator') OR public.has_role(auth.uid(), 'admin'));
