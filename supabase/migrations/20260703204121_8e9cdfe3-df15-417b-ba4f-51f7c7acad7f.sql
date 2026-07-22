-- Trigger: on left-early class/trial end, refund one credit to the student.
-- Idempotent per booking. Attributes cause to the teacher (audit_logs.user_id
-- on the source row) and effect to the student (class_bookings.student_id).

CREATE OR REPLACE FUNCTION public.refund_credit_on_left_early()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking_id uuid;
  v_student_id uuid;
  v_teacher_id uuid;
  v_hub text;
  v_already_refunded boolean;
BEGIN
  -- Only react to teacher-initiated left-early class/trial ends.
  IF NEW.action NOT IN ('class_ended', 'trial_ended') THEN
    RETURN NEW;
  END IF;
  IF COALESCE((NEW.new_values ->> 'left_early')::boolean, false) IS DISTINCT FROM true THEN
    RETURN NEW;
  END IF;

  v_booking_id := NEW.resource_id;
  IF v_booking_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Idempotency: skip if this booking already has a refund audit row.
  SELECT EXISTS (
    SELECT 1 FROM public.audit_logs
    WHERE action = 'class_credit_refunded'
      AND resource_id = v_booking_id
  ) INTO v_already_refunded;
  IF v_already_refunded THEN
    RETURN NEW;
  END IF;

  SELECT student_id, teacher_id, hub_type
    INTO v_student_id, v_teacher_id, v_hub
  FROM public.class_bookings
  WHERE id = v_booking_id;

  IF v_student_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Refund one credit: decrement used_credits, clamped at 0. If the student
  -- has no credits row we skip silently (nothing to refund).
  UPDATE public.student_credits
     SET used_credits = GREATEST(used_credits - 1, 0),
         updated_at = now()
   WHERE student_id = v_student_id;

  -- Audit trail — attributes cause to the teacher and effect to the student.
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, new_values)
  VALUES (
    NEW.user_id, -- teacher who ended the class
    'class_credit_refunded',
    'class_booking',
    v_booking_id,
    jsonb_build_object(
      'student_id', v_student_id,
      'teacher_id', v_teacher_id,
      'hub_type', COALESCE(v_hub, NEW.new_values ->> 'hub_type'),
      'reason', 'left_early',
      'source_action', NEW.action,
      'ended_at_minutes',
        COALESCE(
          NEW.new_values ->> 'ended_at_minutes',
          NEW.new_values ->> 'trial_ended_at_minutes'
        )
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_credit_on_left_early ON public.audit_logs;
CREATE TRIGGER trg_refund_credit_on_left_early
AFTER INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.refund_credit_on_left_early();