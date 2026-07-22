// Poll a FAL prediction for a playground video.
// When ready, downloads the mp4 and stores it in the `playground-videos`
// bucket under the user's folder. Returns the current row + signed URL.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const FAL_QUEUE = "https://queue.fal.run";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FAL_KEY = Deno.env.get("FAL_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { id } = await req.json();
    if (!id) return json({ error: "id required" }, 400);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: row, error } = await admin
      .from("playground_videos")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error || !row) return json({ error: error?.message ?? "not found" }, 404);

    if (row.status === "ready" && row.storage_path) {
      const signed = await admin.storage.from("playground-videos").createSignedUrl(row.storage_path, 60 * 60 * 6);
      return json({ ...row, signed_url: signed.data?.signedUrl ?? row.video_url });
    }
    if (row.status === "failed") return json(row);

    // prediction_id is stored as "model::request_id"
    const [model, requestId] = String(row.prediction_id ?? "").split("::");
    if (!model || !requestId) {
      await admin.from("playground_videos").update({ status: "failed", error: "invalid prediction id" }).eq("id", id);
      return json({ ...row, status: "failed", error: "invalid prediction id" });
    }

    const statusRes = await fetch(`${FAL_QUEUE}/${model}/requests/${requestId}/status`, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    const pr = await statusRes.json();
    const st = String(pr?.status ?? "").toUpperCase();

    if (st === "FAILED" || st === "CANCELLED") {
      await admin.from("playground_videos").update({ status: "failed", error: pr?.error ?? st }).eq("id", id);
      return json({ ...row, status: "failed", error: pr?.error ?? st });
    }

    if (st !== "COMPLETED") {
      return json({ ...row, status: "rendering" });
    }

    const resultRes = await fetch(`${FAL_QUEUE}/${model}/requests/${requestId}`, {
      headers: { Authorization: `Key ${FAL_KEY}` },
    });
    const result = await resultRes.json();
    console.log("[poll-playground-video] FAL result keys:", Object.keys(result ?? {}));
    const outUrl: string | undefined =
      result?.video?.url ??
      result?.output?.video?.url ??
      result?.output?.url ??
      result?.video_url ??
      (Array.isArray(result?.videos) ? result.videos[0]?.url : undefined) ??
      (Array.isArray(result?.output) ? result.output[0]?.url : undefined);
    if (!outUrl) {
      const detail = JSON.stringify(result).slice(0, 400);
      console.error("[poll-playground-video] no output url:", detail);
      await admin.from("playground_videos").update({ status: "failed", error: `no output: ${detail}` }).eq("id", id);
      return json({ ...row, status: "failed", error: `no output: ${detail}` });
    }


    // Download + upload to storage
    const mp4 = await fetch(outUrl).then((r) => r.arrayBuffer());
    const path = `${userId}/${id}.mp4`;
    const up = await admin.storage.from("playground-videos").upload(path, mp4, {
      contentType: "video/mp4",
      upsert: true,
    });
    if (up.error) {
      await admin.from("playground_videos").update({ status: "failed", error: up.error.message }).eq("id", id);
      return json({ ...row, status: "failed", error: up.error.message });
    }

    await admin
      .from("playground_videos")
      .update({ status: "ready", storage_path: path, video_url: outUrl })
      .eq("id", id);

    const signed = await admin.storage.from("playground-videos").createSignedUrl(path, 60 * 60 * 6);

    return json({ ...row, status: "ready", storage_path: path, video_url: outUrl, signed_url: signed.data?.signedUrl });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
