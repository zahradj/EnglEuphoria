-- Push notifications (phone / browser) for teachers and students.
--
-- 1. push_subscriptions: one row per browser/phone a signed-in person turned notifications on for.
-- 2. save_push_subscription / remove_push_subscription: the only way the app writes it (SECURITY DEFINER so a
--    shared device that switches accounts moves the subscription to the new person instead of failing on RLS).
-- 3. A trigger on public.notifications: every in-app notification (lesson cancelled / moved, credits running out,
--    reminders, ...) is also sent as a push through the send-push edge function. A failed push never blocks the insert.
--
-- Needs, once: edge-function secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:support@engleuphoria.com)
-- and the Vercel variable VITE_VAPID_PUBLIC_KEY (the same public key). Without them nothing is sent and the app
-- hides the "turn on notifications" button.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;
CREATE POLICY "push_subscriptions_select_own" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- No client INSERT/UPDATE/DELETE policies: writes go through the two functions below.

CREATE OR REPLACE FUNCTION public.save_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_user_agent text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  IF p_endpoint IS NULL OR p_p256dh IS NULL OR p_auth IS NULL OR length(p_endpoint) > 2000 THEN
    RAISE EXCEPTION 'Invalid subscription';
  END IF;
  INSERT INTO public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  VALUES (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  ON CONFLICT (endpoint) DO UPDATE
    SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth,
        user_agent = EXCLUDED.user_agent, last_seen_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_push_subscription(p_endpoint text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;
  DELETE FROM public.push_subscriptions WHERE endpoint = p_endpoint AND user_id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.save_push_subscription(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_push_subscription(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_push_subscription(text) TO authenticated;

-- Every notification row becomes a push (when the person has turned push on).
CREATE OR REPLACE FUNCTION public.push_on_notification() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_row jsonb := to_jsonb(NEW);
BEGIN
  BEGIN
    -- A notification scheduled for later is pushed when it is created for "now" only.
    IF (v_row->>'scheduled_for') IS NOT NULL AND (v_row->>'scheduled_for')::timestamptz > now() THEN
      RETURN NEW;
    END IF;
    PERFORM net.http_post(
      url := 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/send-push',
      -- Same shared secret as the cron jobs (see 20260721211711_reschedule_cron_jobs_with_internal_secret.sql).
      headers := '{"Content-Type": "application/json", "x-internal-secret": "e96e5eb54cb3734fdc50c31ff60b9b9cb9168b879df80cfc2270fe4f6389e509"}'::jsonb,
      body := jsonb_build_object(
        'user_id', v_row->>'user_id',
        'title', v_row->>'title',
        'body', coalesce(v_row->>'content', v_row->>'message', ''),
        'url', v_row->>'action_url'
      )
    );
  EXCEPTION WHEN OTHERS THEN
    NULL; -- never let a push problem block the notification itself
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS push_on_notification ON public.notifications;
CREATE TRIGGER push_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.push_on_notification();
