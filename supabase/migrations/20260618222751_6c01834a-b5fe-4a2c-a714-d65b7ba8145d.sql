CREATE OR REPLACE FUNCTION public.submit_teacher_application(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Strip any caller-controlled admin fields defensively
  p_payload := p_payload
    - 'admin_notes'
    - 'user_id'
    - 'status'
    - 'current_stage'
    - 'intro_video_approved'
    - 'documents_approved'
    - 'equipment_test_passed'
    - 'interview_passed'
    - 'interview_invite_token'
    - 'reviewer_id'
    - 'reviewed_at';

  INSERT INTO public.teacher_applications
  SELECT * FROM jsonb_populate_record(NULL::public.teacher_applications, p_payload)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_teacher_application(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_teacher_application(jsonb) TO anon, authenticated;