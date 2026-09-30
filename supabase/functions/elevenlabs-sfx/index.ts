import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * ElevenLabs Sound Effects generator for classroom reward stingers.
 * Returns raw MP3 bytes (audio/mpeg) so the client can play with `new Audio()`.
 *
 * Body: { prompt: string, durationSeconds?: number, promptInfluence?: number }
 *
 * Server-side cache: each (prompt, duration, influence) is generated ONCE
 * and stored in the public `sfx-cache` bucket; every later request returns
 * that same file. Before this, each browser generated its own clip, so the
 * teacher and student heard different random versions of the same sound
 * (and every new device spent ElevenLabs credits again).
 *
 * Auth: none, matching the previously deployed version (verify_jwt off) —
 * the repo copy had gained a requireAuth guard that was never deployed.
 */
const BUCKET = "sfx-cache";

async function cacheKey(prompt: string, dur: number, influence: number): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify([prompt.trim(), dur, influence]));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("") + ".mp3";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, durationSeconds, promptInfluence } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dur = Math.min(
      Math.max(typeof durationSeconds === "number" ? durationSeconds : 1.2, 0.5),
      4
    );
    const influence = Math.min(
      Math.max(
        typeof promptInfluence === "number" ? promptInfluence : 0.5,
        0
      ),
      1
    );

    const audioHeaders = {
      ...corsHeaders,
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;
    const key = await cacheKey(prompt, dur, influence);

    if (admin) {
      const { data: cached } = await admin.storage.from(BUCKET).download(key);
      if (cached) {
        return new Response(await cached.arrayBuffer(), { headers: audioHeaders });
      }
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/sound-generation",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          duration_seconds: dur,
          prompt_influence: influence,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs SFX error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "SFX generation failed", details: errorText }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    if (admin) {
      // upsert:false — if two requests race, the first stored clip wins and
      // stays the one everybody hears.
      const { error: upErr } = await admin.storage
        .from(BUCKET)
        .upload(key, new Blob([audioBuffer], { type: "audio/mpeg" }), { contentType: "audio/mpeg", upsert: false });
      if (upErr) {
        if (/exists|duplicate/i.test(upErr.message)) {
          // Lost the race: serve the stored clip so everyone hears the same one.
          const { data: winner } = await admin.storage.from(BUCKET).download(key);
          if (winner) return new Response(await winner.arrayBuffer(), { headers: audioHeaders });
        } else {
          console.warn("sfx cache upload failed:", upErr.message);
        }
      }
    }
    return new Response(audioBuffer, { headers: audioHeaders });
  } catch (error) {
    console.error("SFX route error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
