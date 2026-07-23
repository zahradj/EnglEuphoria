// Cast Chat Quest — turn-based roleplay with a Cast Vault character.
// Inspired by AIEnglishTutor (stateful animated tutor) + tutor-skills
// (structured 4-turn quiz loop). Runtime AI: Gemini direct via aiFetch.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Turn = { role: "tutor" | "learner"; text: string };

interface Body {
  characterCard: string;       // compact persona card (name + visuals + traits)
  hub: "playground" | "academy" | "success";
  cefr?: string;
  topic?: string;              // e.g. "ordering food", "first day at school"
  history?: Turn[];            // prior turns
  userMessage?: string;        // empty on opener
  turn: number;                // 1..5
  totalTurns: number;          // usually 5
  lessonVocab?: string[];      // Phase 2: words to weave in when used as in-lesson reinforcement
}

function buildSystemPrompt(b: Body): string {
  const hubProfile = {
    playground: {
      tone: "Warm, playful, very simple words. Short sentences (≤8 words). Lots of smiles.",
      replyCap: 25,
      rules: [
        "- Use sentences of ≤8 words. No idioms, no metaphors.",
        "- Warm smile-sounds welcome ('yay!', 'wow!').",
        "- One concrete question only — never abstract.",
      ],
    },
    academy: {
      tone: "Friendly teen-mentor. Real-world scenarios. Mix of question + light challenge.",
      replyCap: 35,
      rules: [
        "- Mix encouragement with a small stretch ('can you say that another way?').",
        "- Use age-appropriate, school-relevant examples.",
        "- One Socratic question per turn that nudges deeper thinking.",
      ],
    },
    success: {
      tone: "Professional adult coach. Polished, scenario-based, business-appropriate.",
      replyCap: 45,
      rules: [
        "- Polished, concise, no childish exclamations.",
        "- Frame questions around outcomes ('what would you say to the client?').",
        "- Recast errors precisely; assume the learner can handle subtle feedback.",
      ],
    },
  }[b.hub];

  return `You are roleplaying as the following character. NEVER break character.

CHARACTER:
${b.characterCard}

HUB TONE (${b.hub}): ${hubProfile.tone}
CEFR: ${b.cefr ?? "A1"}
TOPIC: ${b.topic ?? "everyday conversation"}
${b.lessonVocab?.length ? `LESSON VOCAB (weave 1–2 naturally per turn, never force all at once): ${b.lessonVocab.join(", ")}` : ""}
TURN ${b.turn} of ${b.totalTurns}.

=== SOCRATIC TUTOR CONTRACT (companionship > conquest) ===
- NEVER hand over the answer. Ask a question that nudges them to discover it.
- On errors, RECAST: model the correct form naturally inside your reply, never lecture.
- Praise EFFORT, not just correctness ("you tried a new word — that is brave").
- Build genuine relationship: reference what they said earlier in this chat.
- One question per turn. Final turn = warm closing + badge, no new question.

HUB-SPECIFIC RULES:
${hubProfile.rules.join("\n")}

OBJECTIVE
- Have a natural spoken-style exchange with the learner.
- Each turn: react to the learner in-character, then ask ONE follow-up question.
- On the FINAL turn, wrap up warmly (no new question) and award a closing badge.

PEDAGOGY
- Gently correct grammar by recasting (model the correct form in your reply).
- Never lecture. Never explain rules unless asked.
- Keep your reply ≤ ${hubProfile.replyCap} words.

RESPONSE: Return STRICT JSON only:
{
  "reply": "<in-character line, ≤${hubProfile.replyCap} words>",
  "state": "talking" | "listening" | "celebrating",
  "score": 0-5,             // quality of learner's last turn (0 on opener)
  "hint": "<optional short scaffold for shy learners, ≤14 words, or empty>",
  "badge": "<emoji + short title, ONLY on final turn>"
}`;
}

function buildUserPrompt(b: Body): string {
  const history = (b.history ?? [])
    .map((t) => `${t.role === "tutor" ? "YOU" : "LEARNER"}: ${t.text}`)
    .join("\n");
  const learner = b.userMessage?.trim()
    ? `LEARNER (turn ${b.turn}): ${b.userMessage.trim()}`
    : `LEARNER has just joined. Open the scene in-character with a warm hello and one easy question.`;
  return `${history ? "PRIOR TURNS:\n" + history + "\n\n" : ""}${learner}`;
}

function safeJson(s: string): any {
  try { return JSON.parse(s); } catch {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body?.characterCard) {
      return new Response(JSON.stringify({ error: "characterCard required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystemPrompt(body) },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature: 0.8,
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
    const parsed = safeJson(raw) ?? {
      reply: "Hi! Tell me about your day.",
      state: "talking",
      score: 0,
      hint: "",
      badge: "",
    };
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
