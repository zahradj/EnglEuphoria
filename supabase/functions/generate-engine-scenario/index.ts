// Language Engine scenario generator with (hub, cefr, vocab) cache.
// Runtime AI: Gemini direct via aiFetch. Cache hits skip the model call.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EngineType =
  | "story_engine_slot"
  | "escape_room_slot"
  | "detective_mystery_slot"
  | "hidden_object_slot";

interface Body {
  engine: EngineType;
  hub: "playground" | "academy" | "success";
  cefr?: string;
  topic?: string;
  targetWords: string[];
  cast?: { name: string; role?: string }[];
  studentId?: string;
  weakWords?: string[];
}

const HUB_TONE: Record<Body["hub"], string> = {
  playground: "Warm, playful, ≤8-word sentences, no idioms. Concrete visuals.",
  academy: "Friendly teen-mentor, real-world scenarios, light challenge.",
  success: "Polished adult coach, business/life scenarios, precise recasts.",
};

function schemaFor(engine: EngineType): string {
  switch (engine) {
    case "story_engine_slot":
      return `{ "kind":"story","title":string,"opening":string,"nodes":[{"id":string,"prompt":string,"choices":[{"text":string,"next":string,"usesWord":string}]}] }`;
    case "escape_room_slot":
      return `{ "kind":"escape","title":string,"intro":string,"puzzles":[{"id":string,"clue":string,"answer":string,"usesWord":string,"hint":string}] }`;
    case "detective_mystery_slot":
      return `{ "kind":"detective","title":string,"briefing":string,"suspects":[{"name":string,"alibi":string}],"clues":[{"text":string,"usesWord":string}],"solution":{"culprit":string,"reason":string} }`;
    case "hidden_object_slot":
      return `{ "kind":"hidden","title":string,"scene":string,"objects":[{"word":string,"clue":string}] }`;
  }
}

function buildPrompt(b: Body, weak: string[]): { system: string; user: string } {
  const weakLine = weak.length
    ? `\nWEAK WORDS (student has struggled with these — feature them prominently in villains, clues, or key choices, and give at least TWO exposures each): ${weak.join(", ")}`
    : "";
  const system = `You are a language-learning scenario generator.
Return STRICT JSON only — no prose, no code fences.
Hub tone: ${HUB_TONE[b.hub]}
CEFR ceiling: ${b.cefr ?? "A1"}. Never exceed this level.
Every scenario MUST weave in ALL target words at least once via the "usesWord" field.${weakLine}
Schema:
${schemaFor(b.engine)}`;
  const user = `TOPIC: ${b.topic ?? "everyday life"}
TARGET WORDS: ${b.targetWords.join(", ")}
CAST: ${(b.cast ?? []).map((c) => `${c.name}${c.role ? ` (${c.role})` : ""}`).join(", ") || "none"}
Generate one scenario now.`;
  return { system, user };
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s); } catch { /* fallthrough */ }
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* noop */ } }
  return null;
}

async function hashVocab(words: string[]): Promise<string> {
  const key = words.map((w) => w.toLowerCase().trim()).sort().join("|");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.engine || !Array.isArray(body?.targetWords) || body.targetWords.length === 0) {
      return new Response(JSON.stringify({ error: "engine and targetWords required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);
    const cefr = body.cefr ?? "A1";
    const vocab_hash = await hashVocab(body.targetWords);

    // Resolve weak words: prefer explicit list; else derive from mistake_repository.
    let weakWords: string[] = (body.weakWords ?? [])
      .map((w) => w.toLowerCase().trim())
      .filter(Boolean);
    if (weakWords.length === 0 && body.studentId) {
      const lowerTargets = new Set(body.targetWords.map((w) => w.toLowerCase().trim()));
      const { data: mistakes } = await admin
        .from("mistake_repository")
        .select("target_content, frequency_score, attempts_count")
        .eq("user_id", body.studentId)
        .eq("resolved", false)
        .order("frequency_score", { ascending: false })
        .limit(20);
      weakWords = (mistakes ?? [])
        .map((m: { target_content: string }) => (m.target_content ?? "").toLowerCase().trim())
        .filter((w: string) => w && lowerTargets.has(w))
        .slice(0, 3);
    }
    const personalized = weakWords.length > 0;

    // 0. Teacher-authored override wins over cache and AI generation.
    const { data: override } = await admin
      .from("teacher_scenario_overrides")
      .select("id, scenario")
      .eq("engine", body.engine)
      .eq("hub", body.hub)
      .eq("cefr", cefr)
      .eq("vocab_hash", vocab_hash)
      .eq("active", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (override?.scenario) {
      return new Response(
        JSON.stringify({ scenario: override.scenario, engine: body.engine, cached: false, override: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 1. Cache lookup (skip when personalized so weak-word emphasis reaches this student)
    const { data: cached } = personalized
      ? { data: null }
      : await admin
          .from("engine_scenario_cache")
          .select("id, scenario, hit_count")
          .eq("engine", body.engine)
          .eq("hub", body.hub)
          .eq("cefr", cefr)
          .eq("vocab_hash", vocab_hash)
          .maybeSingle();

    if (cached?.scenario) {
      admin
        .from("engine_scenario_cache")
        .update({ hit_count: (cached.hit_count ?? 0) + 1, last_hit_at: new Date().toISOString() })
        .eq("id", cached.id)
        .then(() => {});
      return new Response(
        JSON.stringify({ scenario: cached.scenario, engine: body.engine, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { system, user } = buildPrompt(body, weakWords);
    const res = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: "ai_failed", detail: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeJson(raw);
    if (!parsed) {
      return new Response(JSON.stringify({ error: "parse_failed", raw }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Cache write (skip for personalized runs — weak-word content is student-specific)
    if (!personalized) {
      admin
        .from("engine_scenario_cache")
        .upsert(
          {
            engine: body.engine,
            hub: body.hub,
            cefr,
            vocab_hash,
            topic: body.topic ?? null,
            scenario: parsed,
          },
          { onConflict: "engine,hub,cefr,vocab_hash" },
        )
        .then(() => {});
    }

    return new Response(
      JSON.stringify({
        scenario: parsed,
        engine: body.engine,
        cached: false,
        personalized,
        weakWords,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
