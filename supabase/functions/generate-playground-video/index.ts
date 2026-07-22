// Async playground video generator (FAL backend).
// Submits a fal.ai wan-2.2 prediction + creates a `playground_videos` row,
// then returns the row id immediately. Client polls via `poll-playground-video`.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FAL_QUEUE = "https://queue.fal.run";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FAL_KEY = Deno.env.get("FAL_KEY");
    if (!FAL_KEY) {
      return json({ error: "FAL_KEY is not configured. Add it in Project Secrets." }, 503);
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const prompt: string = (body?.prompt ?? "").toString().slice(0, 800);
    const imageUrl: string | undefined = body?.image_url;
    const lessonId: string | undefined = body?.lesson_id;
    if (!prompt && !imageUrl) return json({ error: "prompt or image_url required" }, 400);

    const model = imageUrl ? "fal-ai/wan/v2.2-a14b/image-to-video" : "fal-ai/wan/v2.2-a14b/text-to-video";
    const input: Record<string, unknown> = imageUrl
      ? { image_url: imageUrl, prompt: prompt || "gentle cinematic camera, playful kids storybook animation" }
      : { prompt };

    const createRes = await fetch(`${FAL_QUEUE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    const created = await createRes.json().catch(() => ({} as any));
    if (!createRes.ok || !created?.request_id) {
      console.error("[generate-playground-video] FAL submit failed", createRes.status, JSON.stringify(created).slice(0, 500));
      return json({ error: "FAL submit failed", status: createRes.status, details: created }, 502);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: row, error: insErr } = await admin
      .from("playground_videos")
      .insert({
        user_id: userId,
        lesson_id: lessonId ?? null,
        prompt,
        status: "rendering",
        provider: "fal",
        prediction_id: `${model}::${created.request_id}`,
        source_image_url: imageUrl ?? null,
      })
      .select("id")
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ id: row.id, prediction_id: created.request_id, status: "rendering" });
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
