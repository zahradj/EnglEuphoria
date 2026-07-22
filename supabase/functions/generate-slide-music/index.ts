// Generate a background music track via ElevenLabs Music API and upload to lesson-assets.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "lesson-assets";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, durationSeconds, lessonId, slideId } = await req.json();
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const duration = Math.min(60, Math.max(10, Number(durationSeconds) || 30));

    const musicRes = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, duration_seconds: duration }),
    });

    if (!musicRes.ok) {
      const t = await musicRes.text();
      console.error("ElevenLabs Music error:", musicRes.status, t);
      return new Response(JSON.stringify({ error: "Music generation failed", details: t }), {
        status: musicRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = new Uint8Array(await musicRes.arrayBuffer());

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const safeLesson = (lessonId || "draft").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSlide = (slideId || crypto.randomUUID()).toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const path = `studio/${safeLesson}/music-${safeSlide}-${Date.now()}.mp3`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      console.error("Music upload error:", upErr);
      return new Response(JSON.stringify({ error: "Upload failed", details: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return new Response(JSON.stringify({ url: pub.publicUrl, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-slide-music error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
