-- Let a teacher see the join link of a lesson they invited a student to, again, from the schedule.
--
-- "Invite a Student" creates the booking and a class_booking_invites row with the secret token; the link
-- (.../join-classroom/<token>) was shown once and emailed once, then lost. The invites table has no
-- teacher-readable policy, so this SECURITY DEFINER function hands back ONLY the caller's own invite for
-- the lesson that covers the clicked calendar slot (nothing for anyone else's, nothing for lessons a
-- student booked themselves, which have no invite).

CREATE OR REPLACE FUNCTION public.teacher_get_invite_link(p_slot_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_teacher_id UUID := auth.uid();
  v_slot RECORD;
  v_booking_id UUID;
  v_inv RECORD;
BEGIN
  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT teacher_id, student_id, start_time INTO v_slot
  FROM public.teacher_availability WHERE id = p_slot_id;

  IF v_slot IS NULL OR v_slot.teacher_id <> v_teacher_id OR v_slot.student_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- The booking that covers this calendar row (a one-hour lesson may sit on two 30-minute rows).
  SELECT cb.id INTO v_booking_id
  FROM public.class_bookings cb
  WHERE cb.teacher_id = v_teacher_id
    AND cb.student_id = v_slot.student_id
    AND cb.scheduled_at <= v_slot.start_time
    AND v_slot.start_time < cb.scheduled_at + (COALESCE(cb.duration, 30) || ' minutes')::interval
  ORDER BY cb.scheduled_at DESC
  LIMIT 1;

  IF v_booking_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT token, expires_at, revoked_at, last_used_at, student_email INTO v_inv
  FROM public.class_booking_invites
  WHERE booking_id = v_booking_id
    AND created_by = v_teacher_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_inv IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'token', v_inv.token,
    'expires_at', v_inv.expires_at,
    'revoked_at', v_inv.revoked_at,
    'last_used_at', v_inv.last_used_at,
    'student_email', v_inv.student_email
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.teacher_get_invite_link(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_get_invite_link(uuid) TO authenticated;
