// ElevenLabs TTS — returns raw MP3 (audio/mpeg) for `new Audio()` playback.
// Public (no JWT required) so warm-up/audio blocks work for unauthenticated
// preview sessions. Explicit CORS so supabase-js can preflight the `apikey`
// + `authorization` headers it always sends.
//
// Server-side cache: each (text, voice, speed) is generated ONCE and stored
// in the public `sfx-cache` bucket under tts/; every later request — from
// any device — gets that same file back. Without it, a line with no
// pre-baked clip was generated fresh on the teacher's AND the student's
// device (double cost, a seconds-long wait on the second screen, and two
// slightly different takes of the same line).
import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "sfx-cache";
const MODEL_ID = "eleven_multilingual_v2";

async function cacheKey(text: string, voiceId: string, speed: number | null): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify([text, voiceId, speed, MODEL_ID]));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return "tts/" + Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("") + ".mp3";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const text = typeof body.text === "string" ? body.text.slice(0, 2000) : "";
    const voiceId = typeof body.voiceId === "string" && body.voiceId
      ? body.voiceId
      : "EXAVITQu4vr4xnSDxMaL"; // Sarah
    // Only forwarded when the caller asks for it (matches the deployed
    // behaviour: no speed in voice_settings by default).
    const speed = typeof body.speed === "number" ? body.speed : null;
    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioHeaders = {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;
    const key = await cacheKey(text, voiceId, speed);
    if (admin) {
      const { data: cached } = await admin.storage.from(BUCKET).download(key);
      if (cached) return new Response(await cached.arrayBuffer(), { headers: audioHeaders });
    }

    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ElevenLabs not connected" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            ...(speed !== null ? { speed } : {}),
          },
        }),
      },
    );

    if (!r.ok) {
      const err = await r.text();
      console.error("ElevenLabs TTS error:", r.status, err);
      return new Response(JSON.stringify({ error: err || `TTS failed: ${r.status}` }), {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = await r.arrayBuffer();
    if (admin) {
      // upsert:false — if two devices race, the first stored take wins and
      // stays the one everybody hears.
      const { error: upErr } = await admin.storage.from(BUCKET)
        .upload(key, new Blob([audio], { type: "audio/mpeg" }), { contentType: "audio/mpeg", upsert: false });
      if (upErr) {
        if (/exists|duplicate/i.test(upErr.message)) {
          const { data: winner } = await admin.storage.from(BUCKET).download(key);
          if (winner) return new Response(await winner.arrayBuffer(), { headers: audioHeaders });
        } else {
          console.warn("tts cache upload failed:", upErr.message);
        }
      }
    }
    return new Response(audio, { headers: audioHeaders });
  } catch (e) {
    console.error("TTS route error:", e);
    return new Response(JSON.stringify({ error: String((e as Error)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
