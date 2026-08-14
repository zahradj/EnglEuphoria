-- guard_teacher_application_admin_cols only recognized a real admin's own
-- session (auth.uid() + has_role(...)). Trusted server-side edge functions
-- (approve-teacher, reject-teacher-application) already verify the caller is
-- an admin before writing, but they write through the service-role client,
-- which carries no user JWT — auth.uid() is NULL there, so the guard blocked
-- every approval/rejection with "Only admins can modify application status /
-- approval fields", even from those already-verified admin actions.
-- The service role is never reachable from the browser, so letting it
-- through here doesn't weaken the guard against a self-serve applicant edit.
CREATE OR REPLACE FUNCTION public.guard_teacher_application_admin_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.interview_passed IS DISTINCT FROM OLD.interview_passed
     OR NEW.documents_approved IS DISTINCT FROM OLD.documents_approved
     OR NEW.intro_video_approved IS DISTINCT FROM OLD.intro_video_approved
     OR NEW.current_stage IS DISTINCT FROM OLD.current_stage
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.rejection_reason IS DISTINCT FROM OLD.rejection_reason
     OR NEW.interviewed_by IS DISTINCT FROM OLD.interviewed_by
  THEN
    RAISE EXCEPTION 'Only admins can modify application status / approval fields';
  END IF;

  RETURN NEW;
END;
$$;
