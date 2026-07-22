// placement-content-asset
// On-demand asset generator for the Content Creator Placement Studio.
// - kind:'image' -> generates a flat-vector child-safe image via Gemini direct,
//                   uploads to `placement-images` storage bucket, returns URL
// - kind:'voice' -> generates ElevenLabs MP3 (defaults to Glitch / Pip),
//                   uploads to `placement-audio` bucket, returns URL
// Admin or content_creator only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_API_KEY");

const IMAGE_BUCKET = "placement-images";
const AUDIO_BUCKET = "placement-audio";

// Hub-aligned image style suffixes — mirrors the Content Creator's
// IMAGE_STYLES_BY_HUB defaults (Cheerful Cartoon / Modern Vector / Pro Photo)
// so placement assets share the same visual language as generated lessons.
const HUB_IMAGE_STYLE: Record<"playground" | "academy" | "success", string> = {
  playground:
    "rendered in an ultra-cute kawaii chibi cartoon mascot style — a single adorable subject " +
    "centred in frame, oversized sparkly anime eyes with shiny highlights, tiny rounded body, " +
    "soft pastel colours, gentle blushed cheeks, smooth clean digital illustration, soft thin " +
    "outlines (no harsh black ink), subtle cel shading, friendly happy expression, sticker-like " +
    "finish, pure flat white background, no shadows on the ground, no text, no logos, no borders.",
  academy:
    "rendered in an authentic, flawless modern flat vector illustration style — clean geometric " +
    "shapes, confident colour blocking, subtle gradients, sleek editorial composition, white " +
    "background, no text, no logos.",
  success:
    "captured as authentic, flawless professional editorial photography — shot on a 35mm full-frame " +
    "camera, natural soft lighting, neutral corporate tones, shallow depth of field, premium " +
    "business aesthetic, no text, no logos.",
};
function styleFor(hub?: string): string {
  const k = (hub || "playground").toLowerCase();
  return HUB_IMAGE_STYLE[k as keyof typeof HUB_IMAGE_STYLE] ?? HUB_IMAGE_STYLE.playground;
}

async function ensureBucket(admin: ReturnType<typeof createClient>, name: string) {
  const { data } = await admin.storage.getBucket(name);
  if (data) return;
  await admin.storage.createBucket(name, { public: true });
}

async function sha1Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth gate
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id);
    const allowed = (roles ?? []).some(
      (r: any) => r.role === "admin" || r.role === "content_creator",
    );
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as {
      kind?: "image" | "voice";
      prompt?: string;
      text?: string;
      voiceId?: string;
      key?: string;
      hub?: "playground" | "academy" | "success";
    };

    if (body.kind === "image") {
      if (!Deno.env.get("GEMINI_API_KEY")) {
        return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const subject = (body.prompt || "").trim();
      if (!subject) {
        return new Response(JSON.stringify({ error: "prompt required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await ensureBucket(admin, IMAGE_BUCKET);
      const stylePrefix = styleFor(body.hub);
      // Retry on transient Gemini errors (503/429) with backoff.
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const { bytes, contentType } = await generateGoogleImage(
            `${stylePrefix}\n\nSubject: ${subject}`,
          );
          const hash = await sha1Hex(`${body.key ?? ""}|${subject}|${Date.now()}`);
          const path = `studio/${hash}.png`;
          const { error: upErr } = await admin.storage
            .from(IMAGE_BUCKET)
            .upload(path, bytes, { contentType: contentType || "image/png", upsert: true });
          if (upErr) throw upErr;
          const { data: pub } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
          return new Response(JSON.stringify({ url: pub.publicUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          lastErr = e;
          const status = e instanceof GoogleImageError ? e.status : 0;
          const transient = status === 503 || status === 429 || status === 502;
          if (!transient || attempt === 3) break;
          await new Promise((r) => setTimeout(r, 1200 * Math.pow(2, attempt)));
        }
      }
      const msg = lastErr instanceof GoogleImageError
        ? `Gemini image (${lastErr.status}): ${lastErr.message}`
        : lastErr instanceof Error ? lastErr.message : String(lastErr);
      return new Response(JSON.stringify({ error: msg }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.kind === "voice") {
      if (!ELEVENLABS_KEY) {
        return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = (body.text || "").trim();
      if (!text) {
        return new Response(JSON.stringify({ error: "text required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const voiceId = (body.voiceId || "kPtEHAvRnjUJFv7SK9WI").trim();
      await ensureBucket(admin, AUDIO_BUCKET);
      const r = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: { "xi-api-key": ELEVENLABS_KEY, "Content-Type": "application/json" },
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
      if (!r.ok) {
        const errTxt = await r.text();
        return new Response(JSON.stringify({ error: `ElevenLabs ${r.status}: ${errTxt.slice(0, 200)}` }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const audio = new Uint8Array(await r.arrayBuffer());
      const hash = await sha1Hex(`${voiceId}|${body.key ?? ""}|${text}|${Date.now()}`);
      const path = `studio/${hash}.mp3`;
      const { error: upErr } = await admin.storage
        .from(AUDIO_BUCKET)
        .upload(path, audio, { contentType: "audio/mpeg", upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = admin.storage.from(AUDIO_BUCKET).getPublicUrl(path);
      return new Response(JSON.stringify({ url: pub.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "kind must be 'image' or 'voice'" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("placement-content-asset error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
