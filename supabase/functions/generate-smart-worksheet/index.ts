// Generate a synced "Smart Worksheet" for a classroom topic.
// Returns one JSON payload containing data for FOUR native game types:
//   - flashcards
//   - memory_match
//   - sentence_builder
//   - fill_in_blanks
//
// Uses the Lovable AI Gateway with tool-calling for strict structured output.
import { aiFetch } from "../_shared/aiFetch.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const SYSTEM_PROMPT = `You design synchronous classroom games for English learners.
Given a topic and CEFR level, return data for 4 game types in a single tool call.
Rules:
- All content must be age-appropriate, culturally inclusive, and pedagogically sound.
- Use clear, natural English. No placeholders, no "lorem ipsum".
- Sentences should match the requested CEFR level.
- Make each game self-contained: a learner who only plays one game must still benefit from it.`;

const buildToolSpec = (count: number) => ({
  type: 'function',
  function: {
    name: 'build_worksheet',
    description:
      'Return data for four classroom games (flashcards, memory match, sentence builder, fill in the blanks).',
    parameters: {
      type: 'object',
      properties: {
        flashcards: {
          type: 'array',
          minItems: count,
          maxItems: count,
          description: `${count} vocabulary flashcards on the topic.`,
          items: {
            type: 'object',
            properties: {
              word: { type: 'string', description: 'Target word or phrase.' },
              definition: { type: 'string', description: 'Short, learner-friendly definition.' },
              example_sentence: { type: 'string', description: 'A natural example sentence using the word.' },
            },
            required: ['word', 'definition', 'example_sentence'],
            additionalProperties: false,
          },
        },
        memory_match: {
          type: 'array',
          minItems: count,
          maxItems: count,
          description: `${count} matching pairs (e.g. word ↔ synonym, infinitive ↔ past tense, word ↔ image emoji).`,
          items: {
            type: 'object',
            properties: {
              pair_1: { type: 'string', description: 'Left side of the match (e.g. "catch").' },
              pair_2: { type: 'string', description: 'Right side of the match (e.g. "caught").' },
            },
            required: ['pair_1', 'pair_2'],
            additionalProperties: false,
          },
        },
        sentence_builder: {
          type: 'array',
          minItems: count,
          maxItems: count,
          description: `${count} sentences for a drag-and-drop builder.`,
          items: {
            type: 'object',
            properties: {
              full_sentence: { type: 'string', description: 'The correct, fully-formed sentence.' },
              scrambled_words: {
                type: 'array',
                items: { type: 'string' },
                description: 'The same words but in a randomised order — must contain every word exactly once.',
              },
            },
            required: ['full_sentence', 'scrambled_words'],
            additionalProperties: false,
          },
        },
        fill_in_blanks: {
          type: 'array',
          minItems: count,
          maxItems: count,
          description: `${count} fill-in-the-blank items.`,
          items: {
            type: 'object',
            properties: {
              sentence_with_blank: {
                type: 'string',
                description: 'A sentence containing exactly one "___" marker where the answer goes.',
              },
              correct_answer: { type: 'string', description: 'The single correct answer.' },
              distractors: {
                type: 'array',
                minItems: 2,
                maxItems: 4,
                items: { type: 'string' },
                description: 'Plausible but incorrect alternatives.',
              },
            },
            required: ['sentence_with_blank', 'correct_answer', 'distractors'],
            additionalProperties: false,
          },
        },
      },
      required: ['flashcards', 'memory_match', 'sentence_builder', 'fill_in_blanks'],
      additionalProperties: false,
    },
  },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });


  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400);
    }

    const topic: string = (body?.topic ?? '').toString().trim();
    const level: string = (body?.level ?? 'A2').toString().trim();
    const countRaw = Number(body?.count ?? 6);
    const count = Number.isFinite(countRaw) ? Math.min(10, Math.max(3, Math.round(countRaw))) : 6;

    if (!topic || topic.length < 2) {
      return json({ error: 'Topic is required (at least 2 characters).' }, 400);
    }

    const userPrompt = `Topic: ${topic}
CEFR level: ${level}
Items per game: ${count}

Generate one worksheet JSON with all four game arrays. Make sure the
"scrambled_words" arrays contain every word from "full_sentence" exactly once
in a different order, and that every "sentence_with_blank" contains exactly
one "___" placeholder.`;

    const aiResponse = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        tools: [buildToolSpec(count)],
        tool_choice: { type: 'function', function: { name: 'build_worksheet' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return json({ error: 'Rate limit reached. Please wait a moment and try again.' }, 429);
      }
      if (aiResponse.status === 402) {
        return json(
          { error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' },
          402,
        );
      }
      const detail = await aiResponse.text();
      console.error('AI gateway error', aiResponse.status, detail);
      return json({ error: 'AI generation failed.', detail }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    const argsString: string | undefined = toolCall?.function?.arguments;
    if (!argsString) {
      console.error('No tool call in AI response', aiData);
      return json({ error: 'AI did not return a structured worksheet.' }, 500);
    }

    let worksheet: unknown;
    try {
      worksheet = JSON.parse(argsString);
    } catch (e) {
      console.error('Failed to parse tool arguments', argsString);
      return json({ error: 'AI returned malformed worksheet JSON.' }, 500);
    }

    return json({ worksheet, topic, level });
  } catch (err) {
    console.error('generate-smart-worksheet fatal error', err);
    return json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      500,
    );
  }
});
