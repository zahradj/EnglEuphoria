// Scheduled cleanup for orphaned playground videos.
// Deletes rows + storage objects for clips older than 30 days that are NOT
// attached to a lesson (lesson_id IS NULL) and NOT published to YouTube.
// Safe to invoke manually or via pg_cron / external scheduler.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RETENTION_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await admin
      .from("playground_videos")
      .select("id, storage_path")
      .is("lesson_id", null)
      .is("youtube_url", null)
      .lt("created_at", cutoff)
      .limit(500);
    if (error) throw error;

    const paths = (rows ?? []).map((r) => r.storage_path).filter((p): p is string => Boolean(p));
    if (paths.length) {
      await admin.storage.from("playground-videos").remove(paths).catch(() => {});
    }

    const ids = (rows ?? []).map((r) => r.id);
    if (ids.length) {
      await admin.from("playground_videos").delete().in("id", ids);
    }

    return new Response(JSON.stringify({ deleted: ids.length, retention_days: RETENTION_DAYS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
