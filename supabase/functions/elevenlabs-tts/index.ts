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
import { approvedVoiceId, languageLock, normalizeForSpeech, safeVoiceSettings, SHORT_LINE_TTS_MODEL, ttsModelFor } from "../_shared/speechPolicy.ts";
import { withPhonemes } from "../_shared/pronunciations.ts";
import { elevenLabsKeys, fetchElevenLabs } from "../_shared/elevenKeys.ts";
import { requireAuth } from "../_shared/authGuard.ts";

// Owner's rule: NO live clips. Students, teachers and visitors only ever get lines that were already
// generated and stored (the bake script, or an admin in the editors). Making a NEW clip needs an admin /
// content-creator login or the service key (the bake script), so a student can never trigger - or pay
// for - a live generation, and a quota or key problem can't break a lesson.
async function mayGenerate(req: Request): Promise<boolean> {
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
    if (!token) return false;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (serviceKey && token === serviceKey) return true;
    // The service key can be presented in a different form than our env copy (key rotation): ask Auth itself.
    // Only the service role may list users, so a 200 here proves the caller holds it.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (supabaseUrl && token.split(".").length === 3) {
      const probe = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=1`, {
        headers: { apikey: token, Authorization: `Bearer ${token}` },
      });
      if (probe.ok) return true;
    }
    const auth = await requireAuth(req, { allowedRoles: ["admin", "content_creator"] });
    return auth.ok;
  } catch {
    return false;
  }
}

const BUCKET = "sfx-cache";
async function cacheKey(text: string, voiceId: string, speed: number | null, model: string): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify([text, voiceId, speed, model]));
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
    const text = normalizeForSpeech(typeof body.text === "string" ? body.text.slice(0, 2000) : "");
    const voiceId = approvedVoiceId(typeof body.voiceId === "string" && body.voiceId
      ? body.voiceId
      : "EXAVITQu4vr4xnSDxMaL"); // Sarah (accented voices are swapped for an approved one)
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
    // One or two words: English-locked model (the default one guesses the language).
    const model = ttsModelFor(text);
    const key = await cacheKey(text, voiceId, speed, model);
    if (admin) {
      const { data: cached } = await admin.storage.from(BUCKET).download(key);
      if (cached) return new Response(await cached.arrayBuffer(), { headers: audioHeaders });
    }

    // Student-facing paths that must never spend credits or wait on the provider ask for
    // cacheOnly: a line that was never stored simply isn't available (the caller stays silent).
    if (body.cacheOnly === true || !(await mayGenerate(req))) {
      if (body.cacheOnly !== true) console.warn("tts: not stored, live generation refused:", text.slice(0, 120));
      return new Response(JSON.stringify({ error: "audio_not_cached" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (elevenLabsKeys().length === 0) {
      return new Response(JSON.stringify({ error: "audio_unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tries each configured key in turn (a used-up monthly quota moves on to the next).
    const r = await fetchElevenLabs(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Short lines: English-only model + the dictionary pronunciation of each word.
          text: model === SHORT_LINE_TTS_MODEL ? withPhonemes(text) : text,
          model_id: model,
          ...languageLock(model),
          voice_settings: safeVoiceSettings({
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            ...(speed !== null ? { speed } : {}),
          }),
        }),
      },
    );

    if (!r.ok) {
      const err = await r.text();
      // The provider's own message (e.g. "Invalid API key", quota or billing details) is for our
      // logs only - it must never reach a student's screen. Callers get a neutral code and stay silent.
      console.error("ElevenLabs TTS error:", r.status, err);
      return new Response(JSON.stringify({ error: "audio_unavailable" }), {
        // Our provider account failing (bad key, quota, billing) is not the caller's fault.
        status: r.status === 401 || r.status === 402 || r.status === 403 || r.status === 429 ? 503 : r.status,
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
    return new Response(JSON.stringify({ error: "audio_unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
