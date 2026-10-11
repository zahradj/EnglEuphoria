// Sends a push notification (phone / browser) to every device a person turned notifications on for.
// Called by the database trigger on public.notifications and by other edge functions, always with the shared
// x-internal-secret (never by a browser). Needs the secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import webpush from "npm:web-push@3.6.7";
import { requireInternalSecret } from "../_shared/internalAuth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

// Only links inside the app are allowed (a path, or a full engleuphoria.com link turned into a path).
const sitePath = (value: unknown): string => {
  if (typeof value !== "string") return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const u = new URL(value);
    if (u.hostname === "engleuphoria.com" || u.hostname.endsWith(".engleuphoria.com")) return u.pathname + u.search;
  } catch { /* not a URL */ }
  return "/";
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authError = requireInternalSecret(req, corsHeaders);
  if (authError) return authError;

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!publicKey || !privateKey) {
    // Not set up yet: nothing to send, and not an error for the caller.
    return json({ sent: 0, skipped: "VAPID keys are not configured" });
  }

  try {
    const { user_id, title, body, url, tag, type } = await req.json();
    if (typeof user_id !== "string" || !/^[0-9a-f-]{36}$/i.test(user_id) || typeof title !== "string" || !title) {
      return json({ error: "user_id and title are required" }, 400);
    }

    webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@engleuphoria.com", publicKey, privateKey);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", user_id);
    if (error) throw error;
    if (!subs?.length) return json({ sent: 0 });

    const payload = JSON.stringify({
      title: title.slice(0, 120),
      body: typeof body === "string" ? body.slice(0, 300) : "",
      url: sitePath(url),
      tag: typeof tag === "string" ? tag.slice(0, 80) : undefined,
      // A lesson about to start must reach a sleeping phone or tablet at once and stay on screen until seen.
      urgent: type === "lesson_reminder",
    });
    const urgent = type === "lesson_reminder";

    let sent = 0;
    const gone: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, urgent ? { TTL: 60 * 20, urgency: "high" } : { TTL: 60 * 60 * 24 });
          sent++;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) gone.push(s.id); // the device unsubscribed or was reset
          else console.error("push failed", status, (e as Error).message);
        }
      }),
    );
    if (gone.length) await supabase.from("push_subscriptions").delete().in("id", gone);

    return json({ sent, removed: gone.length });
  } catch (e) {
    console.error("send-push error", e);
    return json({ error: e instanceof Error ? e.message : "Internal server error" }, 500);
  }
});
