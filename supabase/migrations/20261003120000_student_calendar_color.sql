-- Calendar colour: each child picks the colour their lessons show in on the
-- student / family calendar, from their own hub's palette (the app only offers
-- those; the list below is every key the app can send).
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS calendar_color text;

-- One write path for both the child and an approved parent. Parents can read a
-- child's profile but not update it (row-level rules), so a younger child's
-- colour is set through this function instead.
CREATE OR REPLACE FUNCTION public.set_calendar_color(p_student uuid, p_color text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_rows integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  IF auth.uid() <> p_student AND NOT public.is_approved_parent_of(p_student) THEN
    RAISE EXCEPTION 'Not allowed to change this child''s colour' USING ERRCODE = '42501';
  END IF;

  IF p_color IS NOT NULL AND p_color NOT IN (
    'orange', 'amber', 'rose', 'pink', 'coral',
    'violet', 'indigo', 'blue', 'purple', 'sky',
    'emerald', 'teal', 'cyan', 'green', 'forest'
  ) THEN
    RAISE EXCEPTION 'Unknown colour %', p_color USING ERRCODE = '22023';
  END IF;

  UPDATE public.student_profiles
  SET calendar_color = p_color
  WHERE user_id = p_student;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    RAISE EXCEPTION 'No student profile found' USING ERRCODE = 'P0002';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.set_calendar_color(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_calendar_color(uuid, text) TO authenticated;
