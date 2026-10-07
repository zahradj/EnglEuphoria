-- Tell a student to buy more lessons the moment their last credit is gone.
--
-- A student's balance is total_credits - used_credits - expired_credits (student_credits). Whatever
-- spends a credit - booking, an admin edit, expiry - updates that row, so one trigger covers every
-- path. It fires only when the balance goes from above zero to zero (or below), so a student is told
-- once per time they run out; a refund and a new run-out tells them again.
--
-- The notice goes to the student's bell (type 'credits_depleted'; the link opens "Buy Lessons").
-- A child in a family account never signs in, so the approved parent(s) are told for them.
--
-- A failure to write the notice must never stop the credit update itself (that would block a
-- booking), so it is caught and only logged.

CREATE OR REPLACE FUNCTION public.notify_credits_run_out()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_before integer := OLD.total_credits - OLD.used_credits - OLD.expired_credits;
  v_after  integer := NEW.total_credits - NEW.used_credits - NEW.expired_credits;
  v_name   text;
BEGIN
  IF v_before > 0 AND v_after <= 0 THEN
    BEGIN
      INSERT INTO public.notifications (user_id, title, content, type, action_url)
      VALUES (
        NEW.student_id,
        'You have no lesson credits left',
        'You''ve used your last lesson credit. Buy more lessons to keep booking classes.',
        'credits_depleted',
        '/dashboard?tab=billing'
      );

      -- A managed child's parent(s): the child's own login is never opened.
      SELECT COALESCE(NULLIF(split_part(full_name, ' ', 1), ''), 'Your child')
        INTO v_name FROM public.users WHERE id = NEW.student_id;

      INSERT INTO public.notifications (user_id, title, content, type, action_url)
      SELECT spr.parent_id,
             v_name || ' has no lesson credits left',
             v_name || ' has used the last lesson credit. Buy more lessons so ' || v_name || ' can keep booking classes.',
             'credits_depleted',
             '/parent'
      FROM public.student_parent_relationships spr
      WHERE spr.student_id = NEW.student_id
        AND spr.approved_at IS NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'notify_credits_run_out failed for student %: %', NEW.student_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_credits_run_out ON public.student_credits;
CREATE TRIGGER trg_notify_credits_run_out
  AFTER UPDATE OF total_credits, used_credits, expired_credits ON public.student_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_credits_run_out();
