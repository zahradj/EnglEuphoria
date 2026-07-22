// Edge function: generate-lesson-video
// Phase 6 — real Storage upload wiring.
//
// Flow:
//   1. Verify caller JWT.
//   2. Validate body (Zod).
//   3. Hash cache_key = sha256(prompt|cefr|hub|duration).
//   4. On cache HIT → increment hit_count, reuse video_url + starting_frame_url.
//   5. On cache MISS:
//        - If `swapVideoUrl` provided, download that clip and upload it into
//          the private `lesson-videos` bucket. This is the honest MVP path:
//          real text-to-video providers plug in here later (Runway/Replicate)
//          returning a source URL that goes through the same download+upload.
//        - Return a signed URL (1-year TTL) so authenticated players can stream.
//        - Persist cache row.
//   6. Insert `lesson_videos` row, update `curriculum_lessons`, respond.
//
// Videogen provider wiring stays intentionally minimal — the swap URL is the
// production seam. When the user picks a provider, add a fetch() call before
// the download step and drop the resulting URL into `sourceUrl` below.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const BUCKET = "lesson-videos";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

const BodySchema = z.object({
  lessonId: z.string().uuid(),
  prompt: z.string().min(3).max(4096),
  cefr: z.enum(["Pre-A1", "A1", "A2", "B1", "B2", "C1"]),
  hub: z.enum(["playground", "academy", "success"]),
  durationSeconds: z.union([z.literal(5), z.literal(10)]).default(5),
  startingFrameUrl: z.string().url().optional(),
  swapVideoUrl: z.string().url().optional(),
  questions: z
    .array(
      z.object({
        kind: z.enum(["tap_picture", "yes_no"]),
        prompt_audio: z.string().optional(),
        prompt_text: z.string(),
        options: z.array(z.any()).min(2).max(3),
        correct_index: z.number().int().min(0).max(2),
      }),
    )
    .max(3)
    .optional(),
});

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Missing Authorization" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authed = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await authed.auth.getUser();
  if (userErr || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);
  const userId = userData.user.id;

  let body: z.infer<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    body = parsed.data;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const cacheKey = await sha256(
    `${body.prompt}|${body.cefr}|${body.hub}|${body.durationSeconds}`,
  );

  // 1. Cache lookup
  const { data: cached } = await admin
    .from("video_generation_cache")
    .select("*")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  let videoUrl: string | null = cached?.video_url ?? null;
  let startingFrameUrl: string | null =
    cached?.starting_frame_url ?? body.startingFrameUrl ?? null;
  const cacheHit = Boolean(cached && videoUrl);

  if (cached) {
    await admin
      .from("video_generation_cache")
      .update({ hit_count: (cached.hit_count ?? 0) + 1 })
      .eq("id", cached.id);
  }

  // 2. On miss: download source clip → upload to storage → sign
  if (!videoUrl) {
    const sourceUrl = body.swapVideoUrl;
    if (!sourceUrl) {
      return jsonResponse(
        {
          error:
            "No video source available. Provide `swapVideoUrl` (custom clip) until a text-to-video provider is wired up.",
        },
        422,
      );
    }
    try {
      const clip = await fetch(sourceUrl);
      if (!clip.ok) throw new Error(`fetch ${clip.status}`);
      const bytes = new Uint8Array(await clip.arrayBuffer());
      const contentType = clip.headers.get("content-type") || "video/mp4";
      const ext = contentType.includes("webm") ? "webm" : "mp4";
      const path = `${body.lessonId}/${cacheKey}.${ext}`;

      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(path, bytes, { contentType, upsert: true });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (signErr || !signed?.signedUrl) throw signErr ?? new Error("sign failed");

      videoUrl = signed.signedUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "upload failed";
      console.error(`video upload failed: ${msg}`);
      return jsonResponse({ error: "Video upload failed", details: msg }, 502);
    }

    // Persist cache row (best-effort)
    await admin.from("video_generation_cache").upsert(
      {
        cache_key: cacheKey,
        prompt: body.prompt,
        cefr: body.cefr,
        hub: body.hub,
        duration_seconds: body.durationSeconds,
        video_url: videoUrl,
        starting_frame_url: startingFrameUrl,
        hit_count: 0,
      },
      { onConflict: "cache_key" },
    );
  }

  // 3. Persist lesson video + flip lesson flag
  const { data: inserted, error: insErr } = await admin
    .from("lesson_videos")
    .insert({
      lesson_id: body.lessonId,
      prompt_used: body.prompt,
      video_url: videoUrl,
      starting_frame_url: startingFrameUrl,
      duration_seconds: body.durationSeconds,
      source: body.swapVideoUrl ? "swap_upload" : "ai_generated",
      questions: body.questions ?? [],
      cefr: body.cefr,
      hub: body.hub,
      created_by: userId,
    })
    .select()
    .single();

  if (insErr) {
    console.error(`lesson_videos insert failed: ${insErr.message}`);
    return jsonResponse({ error: "Insert failed", details: insErr.message }, 500);
  }

  await admin
    .from("curriculum_lessons")
    .update({ video_lesson_id: inserted.id, video_lesson_enabled: true })
    .eq("id", body.lessonId);

  return jsonResponse({
    ok: true,
    cached: cacheHit,
    lesson_video: inserted,
  });
});
