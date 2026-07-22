// Generate a voiceover MP3 with ElevenLabs and upload it to lesson-assets.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "lesson-assets";
// Friendly, expressive default voice (Aria).
const DEFAULT_VOICE_ID = "9BWtsMINqrJLrRacOk9x";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, voiceId, lessonId, slideId, mode } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
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

    const vid = (voiceId && typeof voiceId === "string" ? voiceId : DEFAULT_VOICE_ID);
    const isPhonetic = mode === "phonetic";

    // Phonetic mode: speak the SOUND of the letter, not its alphabet name.
    // ElevenLabs supports SSML <phoneme> tags only on eleven_multilingual_v2.
    // Auto-wrap a single bare letter in <phoneme> with a small heuristic IPA map
    // so teachers don't have to hand-author SSML; pass-through if already SSML.
    let spoken = text.trim();
    if (isPhonetic && !/<phoneme/i.test(spoken)) {
      const ipaMap: Record<string, string> = {
        a: "æ", e: "ɛ", i: "ɪ", o: "ɒ", u: "ʌ",
        b: "b", c: "k", d: "d", f: "f", g: "ɡ", h: "h",
        j: "dʒ", k: "k", l: "l", m: "m", n: "n", p: "p",
        q: "kw", r: "ɹ", s: "s", t: "t", v: "v", w: "w",
        x: "ks", y: "j", z: "z",
      };
      const single = spoken.length === 1 ? spoken.toLowerCase() : null;
      if (single && ipaMap[single]) {
        spoken = `<phoneme alphabet="ipa" ph="${ipaMap[single]}">${spoken}</phoneme>`;
      }
    }

    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${vid}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: spoken,
          // Multilingual v2 is required for SSML <phoneme>; turbo for normal speech.
          model_id: isPhonetic ? "eleven_multilingual_v2" : "eleven_turbo_v2_5",
          voice_settings: {
            stability: isPhonetic ? 0.7 : 0.5,
            similarity_boost: 0.8,
            style: isPhonetic ? 0.1 : 0.55,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!ttsRes.ok) {
      const t = await ttsRes.text();
      console.error("ElevenLabs TTS error:", ttsRes.status, t);
      return new Response(JSON.stringify({ error: "TTS failed", details: t }), {
        status: ttsRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const audio = new Uint8Array(await ttsRes.arrayBuffer());

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const safeLesson = (lessonId || "draft").toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSlide = (slideId || crypto.randomUUID()).toString().replace(/[^a-zA-Z0-9_-]/g, "_");
    const path = `studio/${safeLesson}/voiceover-${safeSlide}-${Date.now()}.mp3`;

    const { error: upErr } = await admin.storage.from(BUCKET).upload(path, audio, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      console.error("Voiceover upload error:", upErr);
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
    console.error("generate-slide-voiceover error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
