// placement-voiceover
// Generates a short ElevenLabs voiceover (e.g. Pip the Fox welcome greeting)
// and caches it in the `placement-audio` bucket. Subsequent calls return the
// cached public URL. Available to authenticated users.
//
// POST body: { text: string, voiceId?: string }
// Response : { url: string, cached: boolean }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BUCKET = "placement-audio";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");

// Default voice = Glitch (cartoony, kid-safe) — perfect fit for Pip the Fox.
const DEFAULT_VOICE_ID = "kPtEHAvRnjUJFv7SK9WI";

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function ensureBucket(admin: ReturnType<typeof createClient>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  await admin.storage.createBucket(BUCKET, { public: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!ELEVENLABS_KEY) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, voiceId } = (await req.json()) as { text?: string; voiceId?: string };
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voice = (voiceId || DEFAULT_VOICE_ID).trim();
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    await ensureBucket(admin);

    const hash = await sha1Hex(`${voice}|${text}`);
    const path = `voiceover/${hash}.mp3`;

    // Cache check
    const { data: existing } = admin.storage.from(BUCKET).getPublicUrl(path);
    if (existing?.publicUrl) {
      const head = await fetch(existing.publicUrl, { method: "HEAD" });
      if (head.ok) {
        return new Response(JSON.stringify({ url: existing.publicUrl, cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate via ElevenLabs
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.3,
            similarity_boost: 0.85,
            style: 0.8,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      },
    );

    if (!ttsRes.ok) {
      const errTxt = await ttsRes.text();
      console.error("ElevenLabs TTS failed", ttsRes.status, errTxt.slice(0, 300));
      return new Response(JSON.stringify({ error: `TTS failed: ${ttsRes.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audioBytes = new Uint8Array(await ttsRes.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, audioBytes, { contentType: "audio/mpeg", upsert: true });
    if (upErr) throw upErr;

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
    return new Response(JSON.stringify({ url: pub.publicUrl, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("placement-voiceover error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
