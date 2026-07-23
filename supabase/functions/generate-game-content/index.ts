// generate-game-content — Gemini-direct content generator for all 22 arcade catalog games.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { aiFetch } from "../_shared/aiFetch.ts";
import { parseAIJson, RAW_JSON_INSTRUCTION } from "../_shared/aiJson.ts";

import { requireAuth } from "../_shared/authGuard.ts";

type Hub = "playground" | "academy" | "success";

// Shape hints mirror src/components/games/gameContentSchemas.ts
const SHAPES: Record<string, string> = {
  matching_pairs: '{"pairs":[{"left":"...","right":"..."}, ...]} 4-8 pairs',
  drag_drop_sort: '{"buckets":["A","B"],"items":[{"word":"...","bucket":"A"}, ...]} 2-3 buckets, 6-12 items; each item.bucket MUST appear in buckets[]',
  sentence_builder: '{"sentences":[{"words":["..."],"answer":["..."]}, ...]} 5-8 sentences; answer = correct order of the SAME words',
  spelling_race: '{"words":[{"word":"...","hint":"..."}, ...]} 6-12 words',
  phonics_challenge: '{"items":[{"sound":"/æ/","word":"cat","options":["cat","cup","cot"],"correct":0}, ...]} 5-8 items; correct is 0-based index',
  listening_hunt: '{"items":[{"transcript":"...","prompt":"...","options":["a","b","c"],"correct":0}, ...]} 4-8 items',
  song_chant: '{"title":"...","lines":["..."],"target_words":["..."]} 4-8 short rhythmic lines',
  timeline_race: '{"events":[{"text":"...","time":"yesterday|now|tomorrow"}, ...]} 5-10 events; time MUST be one of those three buckets',
  roleplay_mission: '{"scenario":"...","roles":["A","B"],"turns":[{"role":"A","line":"..."}, ...]} 4-10 turns alternating roles',
  pronunciation_quest: '{"items":[{"target":"...","ipa":"...","hint":"..."}, ...]} 4-8 items',
  fluency_round: '{"prompts":[{"topic":"...","seconds":60,"starter":"..."}, ...]} 3-6 prompts',
  story_continuation: '{"opening":"...","characters":["..."],"continuation_hints":["..."]} 2-4 chars, 3-5 hints',
  debate_battle: '{"motion":"...","pro_points":["..."],"con_points":["..."]} 3-5 points each',
  business_sim: '{"scenario":"...","role":"...","tasks":[{"prompt":"...","sample_response":"..."}, ...]} 3-5 tasks',
  memory_quest: '{"items":[{"prompt":"...","answer":"..."}, ...]} 6-12 items',
  grammar_boss: '{"boss_name":"...","rounds":[{"question":"...","options":["a","b","c"],"correct":0,"explanation":"..."}, ...]} 5-10 rounds',
  vocab_tournament: '{"bracket":[{"word":"...","definition":"...","distractors":["a","b","c"]}, ...]} 8-16 words',
  fluency_streak: '{"prompts":[{"text":"...","answer":"..."}, ...]} 8-15 quick prompts',
  team_mission: '{"mission":"...","stages":[{"goal":"...","prompt":"..."}, ...]} 3-5 stages',
  classroom_battle: '{"questions":[{"q":"...","options":["a","b","c","d"],"correct":0,"time_seconds":15}, ...]} 8-15 questions',
  leaderboard_event: '{"theme":"...","questions":[{"q":"...","options":["a","b","c"],"correct":0,"points":10}, ...]} 10-20 questions',
  coop_challenge: '{"challenge":"...","steps":[{"role":"A|B","prompt":"..."}, ...]} 4-8 steps',
  // Legacy aliases
  verb_trio: '{"verbs":[{"present":"go","past":"went","participle":"gone"}, ...]} 6-10 IRREGULAR verbs only',
  interview: '{"avatar":"🧑‍💼","turns":[{"question":"...","options":["a","b","c"],"correct":0}, ...]} 5-8 turns',
  sorting: '{"buckets":["A","B"],"items":[{"word":"...","bucket":"A"}, ...]} same as drag_drop_sort',
};

const HUB_TONE: Record<Hub, string> = {
  playground: "ages 4-9: very simple, concrete, playful vocabulary. NO sarcasm, NO office/work topics, NO long sentences.",
  academy: "teens 10-17: age-appropriate, school/teen-life themes, no childish baby-talk and no corporate jargon.",
  success: "adult professionals 18+: business / workplace / real-world adult topics. NEVER childish.",
};

function lightValidate(game_type: string, content: any): string[] {
  const issues: string[] = [];
  const arrKey =
    game_type === 'matching_pairs' ? 'pairs' :
    game_type === 'sentence_builder' ? 'sentences' :
    game_type === 'verb_trio' ? 'verbs' :
    game_type === 'interview' ? 'turns' :
    (game_type === 'sorting' || game_type === 'drag_drop_sort') ? 'items' :
    game_type === 'phonics_challenge' || game_type === 'listening_hunt' || game_type === 'pronunciation_quest' || game_type === 'memory_quest' ? 'items' :
    game_type === 'spelling_race' ? 'words' :
    game_type === 'song_chant' ? 'lines' :
    game_type === 'timeline_race' ? 'events' :
    game_type === 'roleplay_mission' ? 'turns' :
    game_type === 'fluency_round' || game_type === 'fluency_streak' ? 'prompts' :
    game_type === 'story_continuation' ? 'continuation_hints' :
    game_type === 'debate_battle' ? 'pro_points' :
    game_type === 'business_sim' || game_type === 'team_mission' ? (game_type === 'business_sim' ? 'tasks' : 'stages') :
    game_type === 'grammar_boss' ? 'rounds' :
    game_type === 'vocab_tournament' ? 'bracket' :
    game_type === 'classroom_battle' || game_type === 'leaderboard_event' ? 'questions' :
    game_type === 'coop_challenge' ? 'steps' :
    '';
  if (arrKey && (!Array.isArray(content?.[arrKey]) || content[arrKey].length < 2)) {
    issues.push(`expected ${arrKey}[] with ≥2 entries`);
  }
  return issues;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });


  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json().catch(() => ({}));
    const game_type = String(body.game_type || "");
    const level = String(body.level || "A1");
    const hub = (body.hub as Hub) || "academy";
    const topic = String(body.topic || "").trim();
    const target_vocabulary: string[] = Array.isArray(body.target_vocabulary) ? body.target_vocabulary : [];
    const grammar_focus = String(body.grammar_focus || "").trim();

    if (!SHAPES[game_type]) {
      return new Response(JSON.stringify({ error: `Unsupported game_type: ${game_type}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!topic) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = [
      "You generate JSON content for a CEFR-aligned ESL mini-game.",
      `Hub: ${hub} (${HUB_TONE[hub]})`,
      `CEFR level: ${level}.`,
      `Game type: ${game_type}.`,
      `REQUIRED OUTPUT SHAPE: ${SHAPES[game_type]}`,
      target_vocabulary.length ? `MUST naturally use these target words when possible: ${target_vocabulary.join(", ")}.` : "",
      grammar_focus ? `Grammar focus: ${grammar_focus}.` : "",
      "All text MUST be at-or-below CEFR level and appropriate for the hub.",
      "Return ONE JSON object only; do NOT wrap in markdown or commentary.",
      RAW_JSON_INSTRUCTION,
    ].filter(Boolean).join("\n");

    const user = `Topic: ${topic}. Produce ONE JSON object matching the shape exactly.`;

    const aiResp = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      return new Response(JSON.stringify({ error: `AI error ${aiResp.status}`, detail: txt.slice(0, 500) }), {
        status: aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await aiResp.json();
    const raw = payload?.choices?.[0]?.message?.content ?? "";
    let content: any;
    try {
      content = parseAIJson(typeof raw === "string" ? raw : JSON.stringify(raw), "generate-game-content");
    } catch (e: any) {
      return new Response(JSON.stringify({ error: "AI returned invalid JSON", detail: e?.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const issues = lightValidate(game_type, content);
    if (issues.length) {
      return new Response(JSON.stringify({ error: "AI output failed shape validation", detail: issues.join("; "), content }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
