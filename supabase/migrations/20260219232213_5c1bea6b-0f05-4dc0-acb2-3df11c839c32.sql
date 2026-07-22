CREATE OR REPLACE FUNCTION public.cleanup_stale_classroom_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned_count integer;
BEGIN
  UPDATE public.classroom_sessions
  SET session_status = 'ended',
      ended_at = now(),
      updated_at = now()
  WHERE session_status = 'active'
    AND updated_at < now() - interval '24 hours';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$;