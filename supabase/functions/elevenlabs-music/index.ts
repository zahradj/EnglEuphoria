import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });


  try {
    const { prompt, duration, composition_plan, force_instrumental } = await req.json();

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ElevenLabs API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🎵 Generating music for:", prompt.substring(0, 80) + "...");

    // If a composition_plan is supplied (warm-up with exact lyrics), send it —
    // ElevenLabs will sing those lines verbatim instead of paraphrasing.
    const body: Record<string, unknown> = composition_plan
      ? { composition_plan, music_length_ms: (duration || 30) * 1000 }
      : { prompt, music_length_ms: (duration || 30) * 1000 };
    if (typeof force_instrumental === "boolean") body.force_instrumental = force_instrumental;

    const response = await fetch("https://api.elevenlabs.io/v1/music", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs Music API error:", response.status, errorText);
      let parsed: any = null;
      try { parsed = JSON.parse(errorText); } catch (_) {}
      const type = parsed?.detail?.type;
      const code = parsed?.detail?.code || parsed?.detail?.status;
      const isBilling =
        code === "quota_exceeded" ||
        code === "insufficient_credits" ||
        type === "payment_required" ||
        response.status === 402 ||
        /quota|insufficient|payment_required/i.test(errorText);
      if (isBilling) {
        return new Response(
          JSON.stringify({
            error: "ELEVENLABS_QUOTA_EXCEEDED",
            fallback: true,
            message:
              parsed?.detail?.message ||
              "ElevenLabs music quota exceeded. Please top up credits.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const isFallbackable = response.status >= 500;
      return new Response(
        JSON.stringify({ error: "Failed to generate music", details: errorText, fallback: isFallbackable }),
        { status: isFallbackable ? 200 : response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    const audioBuffer = await response.arrayBuffer();
    console.log("✅ Music generated successfully, size:", audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Music generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
