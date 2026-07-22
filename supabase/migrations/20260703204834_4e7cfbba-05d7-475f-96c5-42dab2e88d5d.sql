
CREATE OR REPLACE FUNCTION public.raise_rusher_alert_on_left_early()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_teacher_id uuid;
  v_hub text;
  v_left_early_count int;
  v_recent_alert_exists boolean;
BEGIN
  IF NEW.action NOT IN ('class_ended', 'trial_ended') THEN
    RETURN NEW;
  END IF;
  IF (NEW.new_values->>'left_early') IS DISTINCT FROM 'true' THEN
    RETURN NEW;
  END IF;

  SELECT teacher_id, COALESCE(hub_type, 'academy')
    INTO v_teacher_id, v_hub
  FROM public.class_bookings
  WHERE id = NEW.resource_id;

  IF v_teacher_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count left-early actions by this teacher in past 30 days
  SELECT COUNT(*) INTO v_left_early_count
  FROM public.audit_logs al
  JOIN public.class_bookings cb ON cb.id = al.resource_id
  WHERE al.action IN ('class_ended', 'trial_ended')
    AND (al.new_values->>'left_early')::boolean IS TRUE
    AND cb.teacher_id = v_teacher_id
    AND al.created_at > now() - interval '30 days';

  IF v_left_early_count < 3 THEN
    RETURN NEW;
  END IF;

  -- Dedupe: skip if we alerted about this teacher in past 24 hours
  SELECT EXISTS (
    SELECT 1 FROM public.admin_notifications
    WHERE notification_type = 'teacher_rusher_alert'
      AND metadata->>'teacher_id' = v_teacher_id::text
      AND created_at > now() - interval '24 hours'
  ) INTO v_recent_alert_exists;

  IF v_recent_alert_exists THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.admin_notifications (
    notification_type, title, message, metadata
  ) VALUES (
    'teacher_rusher_alert',
    'Teacher rusher pattern detected',
    'Teacher has ended ' || v_left_early_count || ' classes early in the past 30 days.',
    jsonb_build_object(
      'teacher_id', v_teacher_id,
      'hub_type', v_hub,
      'left_early_count_30d', v_left_early_count,
      'triggering_booking_id', NEW.resource_id,
      'source_action', NEW.action
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rusher_alert_on_left_early ON public.audit_logs;
CREATE TRIGGER trg_rusher_alert_on_left_early
AFTER INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.raise_rusher_alert_on_left_early();
