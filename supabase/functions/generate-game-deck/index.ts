// Generates a balanced deck of Iron LMS mini-games for a given topic.
// Calls `generate-iron-game` N times in parallel with a mix of modes.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type TargetGroup = "playground" | "academy" | "hub";
type GameMode = "mechanic" | "context" | "application";

interface DeckRequest {
  targetGroup: TargetGroup;
  topic: string;
  cefrLevel?: string;
  deckSize?: number; // default 20
  // optional per-mode weights (must sum to deckSize if provided)
  mix?: { mechanic?: number; context?: number; application?: number };
}

function buildMix(deckSize: number, mix?: DeckRequest["mix"]): GameMode[] {
  // Default: 60% mechanic, 20% context, 20% application — strong drill bias
  const m =
    mix?.mechanic ?? Math.round(deckSize * 0.6);
  const c =
    mix?.context ?? Math.round(deckSize * 0.2);
  const a = deckSize - m - c;
  const out: GameMode[] = [
    ...Array(Math.max(0, m)).fill("mechanic"),
    ...Array(Math.max(0, c)).fill("context"),
    ...Array(Math.max(0, a)).fill("application"),
  ];
  // Shuffle so the deck interleaves modes (better pacing)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as DeckRequest;
    if (!body?.topic || !body?.targetGroup) {
      return new Response(
        JSON.stringify({ error: "topic and targetGroup are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const deckSize = Math.min(Math.max(body.deckSize ?? 20, 1), 30);
    const cefrLevel = body.cefrLevel ?? "A2";
    const modes = buildMix(deckSize, body.mix);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callOne = async (mode: GameMode, idx: number) => {
      const r = await fetch(`${supabaseUrl}/functions/v1/generate-iron-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          targetGroup: body.targetGroup,
          topic: body.topic,
          gameMode: mode,
          cefrLevel,
          questionCount: mode === "mechanic" ? 5 : undefined,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error(`[deck] game ${idx} (${mode}) failed:`, r.status, t);
        return null;
      }
      const j = await r.json();
      return j?.game ?? null;
    };

    // Run in parallel batches of 5 to avoid rate limits
    const results: any[] = [];
    for (let i = 0; i < modes.length; i += 5) {
      const batch = modes.slice(i, i + 5);
      const settled = await Promise.all(
        batch.map((m, k) => callOne(m, i + k)),
      );
      results.push(...settled);
    }

    const games = results.filter(Boolean);

    return new Response(
      JSON.stringify({
        deck: {
          topic: body.topic,
          targetGroup: body.targetGroup,
          cefrLevel,
          requested: deckSize,
          delivered: games.length,
          games,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[generate-game-deck] error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
