DROP FUNCTION IF EXISTS public.get_teacher_upcoming_lessons(uuid);

CREATE OR REPLACE FUNCTION public.get_teacher_upcoming_lessons(teacher_uuid uuid)
RETURNS TABLE (
  id uuid,
  class_booking_id uuid,
  title text,
  scheduled_at timestamptz,
  duration integer,
  status text,
  student_id uuid,
  student_name text,
  room_id text,
  room_link text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cb.id AS id,
    cb.id AS class_booking_id,
    COALESCE(l.title, 'Lesson') AS title,
    cb.scheduled_at,
    cb.duration,
    cb.status::text,
    cb.student_id,
    COALESCE(u.full_name, u.email, 'Student') AS student_name,
    COALESCE(l.room_id, cb.classroom_id::text, cb.id::text) AS room_id,
    NULL::text AS room_link
  FROM public.class_bookings cb
  LEFT JOIN public.lessons l ON l.id = cb.lesson_id
  LEFT JOIN public.users u ON u.id = cb.student_id
  WHERE cb.teacher_id = teacher_uuid
    AND cb.status IN ('confirmed', 'scheduled', 'in_progress')
    AND cb.scheduled_at >= (now() - interval '30 minutes')
  ORDER BY cb.scheduled_at ASC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.get_teacher_upcoming_lessons(uuid) TO authenticated;

DROP FUNCTION IF EXISTS public.get_student_upcoming_lessons(uuid);

CREATE OR REPLACE FUNCTION public.get_student_upcoming_lessons(student_uuid uuid)
RETURNS TABLE (
  id uuid,
  class_booking_id uuid,
  title text,
  scheduled_at timestamptz,
  duration integer,
  status text,
  teacher_id uuid,
  teacher_name text,
  room_id text,
  room_link text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cb.id AS id,
    cb.id AS class_booking_id,
    COALESCE(l.title, 'Lesson') AS title,
    cb.scheduled_at,
    cb.duration,
    cb.status::text,
    cb.teacher_id,
    COALESCE(u.full_name, u.email, 'Teacher') AS teacher_name,
    COALESCE(l.room_id, cb.classroom_id::text, cb.id::text) AS room_id,
    NULL::text AS room_link
  FROM public.class_bookings cb
  LEFT JOIN public.lessons l ON l.id = cb.lesson_id
  LEFT JOIN public.users u ON u.id = cb.teacher_id
  WHERE cb.student_id = student_uuid
    AND cb.status IN ('confirmed', 'scheduled', 'in_progress')
    AND cb.scheduled_at >= (now() - interval '30 minutes')
  ORDER BY cb.scheduled_at ASC
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_upcoming_lessons(uuid) TO authenticated;