// ESL Game Studio — multi-agent game generator.
// Adapts the open-source gamestudio-subagents framework into browser ESL mini-games
// bound to a ReinforcementTarget. Gemini direct via aiFetch (never Lovable Gateway).
//
// Body: {
//   hub: 'playground'|'academy'|'success',
//   cefr: 'Pre-A1'|'A1'|'A2'|'B1'|'B2'|'C1',
//   target: { skill_kind, skill_key, label },
//   archetype?: 'WordRush'|'SoundMatch'|'MeaningMaze'|'DialogueDash'|'MemoryGrid'|'GrammarSprint'|'FluencyArcade'|'BossRound',
//   minutes_cap?: number,
//   rounds?: number
// }
// Returns: { spec, verdict, issues, repairs }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HUB_CAPS = {
  playground: { max_games: 3, max_minutes: 8, allow_typing: false, allow_leaderboard: false },
  academy: { max_games: 4, max_minutes: 12, allow_typing: true, allow_leaderboard: true },
  success: { max_games: 3, max_minutes: 10, allow_typing: true, allow_leaderboard: false },
} as const;

const ORCHESTRATOR_PROMPT = `You are the ESL Game Studio Master Orchestrator.
You coordinate 7 specialists (Sr Designer, Mid Designer, Mechanics, Game-Feel, UI/UX, Artist, QA)
to produce ONE browser ESL mini-game bound to a ReinforcementTarget.

Non-negotiable:
- Output STRICT JSON matching the schema. No prose, no markdown fences.
- Bind every round to target.skill_key. No off-topic content.
- Respect hub caps (playground: no typing, no leaderboards, ≤8min).
- Image prompts: single panel, no text/bubbles/UI, hub style tag, image_url ALWAYS null.
- Matching-style rounds: every image_prompt visually distinct.
- CEFR ceiling absolute.

Return JSON:
{
  "spec_id": string,
  "archetype": string,
  "title": string,
  "objective": string,
  "hub": string,
  "cefr": string,
  "target": { "skill_kind": string, "skill_key": string, "label": string },
  "estimated_minutes": number,
  "rounds": [
    {
      "id": string,
      "prompt": string,
      "kind": "mcq"|"match"|"listen_pick"|"drag_pair"|"fill_blank"|"speak_repeat"|"tap_correct",
      "items": [ { "id": string, "text"?: string, "image_prompt"?: string, "image_url": null, "audio_text"?: string } ],
      "answer_ids": string[],
      "distractor_ids": string[],
      "difficulty_tier": 1|2|3|4|5,
      "xp": number
    }
  ],
  "game_feel": { "sfx": string[], "animations": string[], "streak_copy": string },
  "ui": { "layout": "grid_2x2"|"stack"|"carousel"|"drag_lane", "max_width_px": 720 },
  "art_direction": { "hub_style": string, "asset_count": number },
  "qa": { "target_bound": true, "cefr_ok": true, "hub_caps_ok": true, "no_forbidden_vocab": true, "notes": string }
}`;

function buildUserPrompt(body: any) {
  const caps = HUB_CAPS[body.hub as keyof typeof HUB_CAPS] ?? HUB_CAPS.academy;
  return `Design one ESL mini-game.

Hub: ${body.hub}
CEFR: ${body.cefr}
ReinforcementTarget: ${JSON.stringify(body.target)}
Archetype hint: ${body.archetype ?? "auto-select from {WordRush, SoundMatch, MeaningMaze, DialogueDash, MemoryGrid, GrammarSprint, FluencyArcade, BossRound}"}
Rounds: ${body.rounds ?? 6}
Minutes cap: ${Math.min(body.minutes_cap ?? caps.max_minutes, caps.max_minutes)}
Typing allowed: ${caps.allow_typing}
Leaderboard allowed: ${caps.allow_leaderboard}

Follow the orchestrator protocol: Sr Designer picks archetype → Mid Designer fills rounds bound to skill_key "${body.target?.skill_key}" → Mechanics defines "kind" per round → Game-Feel adds sfx/animations → UI/UX picks layout → Artist writes image_prompts (single panel, no text, hub style) → QA validates.

Return JSON only.`;
}

function validate(spec: any, body: any): { verdict: "publish" | "repair" | "block"; issues: string[] } {
  const issues: string[] = [];
  const caps = HUB_CAPS[body.hub as keyof typeof HUB_CAPS] ?? HUB_CAPS.academy;
  if (!spec?.rounds?.length) issues.push("ROUNDS_EMPTY");
  if (!spec?.target?.skill_key || spec.target.skill_key !== body.target?.skill_key) issues.push("TARGET_UNBOUND");
  if ((spec?.estimated_minutes ?? 0) > caps.max_minutes) issues.push("HUB_MINUTES_EXCEEDED");
  if (!caps.allow_typing && spec?.rounds?.some((r: any) => r.kind === "fill_blank")) issues.push("PG_TYPING_FORBIDDEN");
  // Image leak / duplicate
  const imgs: string[] = [];
  for (const r of spec?.rounds ?? []) {
    for (const it of r.items ?? []) {
      if (it.image_url && it.image_url !== null) issues.push("IMAGE_URL_LEAK");
      if (it.image_prompt && /\b(text|caption|label|speech bubble)\b/i.test(it.image_prompt)) issues.push("IMAGE_PROMPT_TEXT_LEAK");
      if (it.image_prompt) imgs.push(it.image_prompt);
    }
    if (r.kind === "match") {
      const s = new Set(imgs);
      if (s.size !== imgs.length) issues.push("MATCHING_DUPLICATE_IMAGE");
    }
  }
  if (issues.some((i) => ["TARGET_UNBOUND", "IMAGE_URL_LEAK", "PG_TYPING_FORBIDDEN"].includes(i))) {
    return { verdict: "block", issues };
  }
  if (issues.length) return { verdict: "repair", issues };
  return { verdict: "publish", issues };
}

async function generate(body: any): Promise<any> {
  const res = await aiFetch({
    model: "google/gemini-2.5-pro",
    system: ORCHESTRATOR_PROMPT,
    user: buildUserPrompt(body),
    responseFormat: "json",
    temperature: 0.6,
  });
  const text = typeof res === "string" ? res : (res?.text ?? "");
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const body = await req.json();
    if (!body?.hub || !body?.cefr || !body?.target?.skill_key) {
      return new Response(JSON.stringify({ error: "hub, cefr, target.skill_key required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    let spec = await generate(body);
    let report = validate(spec, body);
    let repairs = 0;
    while (report.verdict === "repair" && repairs < 2) {
      spec = await generate({ ...body, __repair_hints: report.issues });
      report = validate(spec, body);
      repairs += 1;
    }

    return new Response(
      JSON.stringify({ spec, verdict: report.verdict, issues: report.issues, repairs }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
