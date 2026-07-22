// placement-audio-warm
// Idempotent ElevenLabs TTS cache warmer for `cat_items`.
// Supports hub-specific voices:
//   - playground -> expressive cartoon-style kids voice -> writes audio_url_kids
//   - academy/success -> warm adult ESL teacher voice -> writes audio_url
// Request body: { hub?: "playground" | "adult" }  (default "adult")
// Skips rows already populated. NEVER called by student client — admin-only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "placement-audio";

// Voices — overridable via secrets, sensible defaults otherwise
const KIDS_VOICE_ID =
  Deno.env.get("ELEVENLABS_VOICE_ID_KIDS") ?? "kPtEHAvRnjUJFv7SK9WI"; // Glitch — playful character
const ADULT_VOICE_ID =
  Deno.env.get("ELEVENLABS_VOICE_ID_ADULT") ?? "Xb7hH8MSUJpSbSDYk0k2"; // Alice — warm, articulate

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");

type HubMode = "playground" | "adult";

interface VoiceProfile {
  voiceId: string;
  settings: Record<string, unknown>;
  column: "audio_url" | "audio_url_kids";
  folder: string;
}

function profileForHub(hub: HubMode): VoiceProfile {
  if (hub === "playground") {
    return {
      voiceId: KIDS_VOICE_ID,
      column: "audio_url_kids",
      folder: "kids",
      // Maximize expressiveness for a cartoon/character feel
      settings: {
        stability: 0.25,
        similarity_boost: 0.85,
        style: 0.85,
        use_speaker_boost: true,
        speed: 1.0,
      },
    };
  }
  return {
    voiceId: ADULT_VOICE_ID,
    column: "audio_url",
    folder: "adult",
    settings: {
      stability: 0.7,
      similarity_boost: 0.75,
      style: 0.35,
      use_speaker_boost: true,
      speed: 0.95,
    },
  };
}

async function ensureBucket(admin: ReturnType<typeof createClient>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  await admin.storage.createBucket(BUCKET, { public: true });
}

async function synthesizeMp3(text: string, profile: VoiceProfile): Promise<ArrayBuffer> {
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${profile.voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: profile.settings,
      }),
    },
  );
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  return await r.arrayBuffer();
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

    // Admin gate
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id);
    const allowed = (roles ?? []).some(
      (r: any) => r.role === "admin" || r.role === "super_admin" || r.role === "content_creator",
    );
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or content_creator role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { hub?: HubMode } = {};
    try { body = await req.json(); } catch { /* no body */ }
    const hub: HubMode = body.hub === "playground" ? "playground" : "adult";
    const profile = profileForHub(hub);

    await ensureBucket(admin);

    const { data: items, error } = await admin
      .from("cat_items")
      .select(`id, prompt, ${profile.column}`)
      .is(profile.column, null);
    if (error) throw error;

    const results: Array<{ id: string; url?: string; error?: string }> = [];

    for (const item of items ?? []) {
      try {
        const mp3 = await synthesizeMp3((item as any).prompt, profile);
        const path = `${profile.folder}/${(item as any).id}/prompt.mp3`;
        const { error: upErr } = await admin.storage
          .from(BUCKET)
          .upload(path, new Uint8Array(mp3), {
            contentType: "audio/mpeg",
            upsert: true,
          });
        if (upErr) throw upErr;
        const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
        const updatePayload: Record<string, unknown> = {
          [profile.column]: pub.publicUrl,
          updated_at: new Date().toISOString(),
        };
        const { error: updErr } = await admin
          .from("cat_items")
          .update(updatePayload)
          .eq("id", (item as any).id);
        if (updErr) throw updErr;
        results.push({ id: (item as any).id, url: pub.publicUrl });
      } catch (e) {
        results.push({
          id: (item as any).id,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    return new Response(
      JSON.stringify({
        hub,
        voice_id: profile.voiceId,
        warmed: results.filter((r) => r.url).length,
        total: items?.length ?? 0,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
