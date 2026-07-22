// Supabase Edge Function: ai-slide-game-generator
// Generates the `interactive_data` payload for a single Slide Studio game slide
// in the EXACT shape the player components expect (MCQ, drag_and_match, fill_in_the_gaps,
// flashcard, drawing_prompt). The client patches the result straight into the slide.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiFetch } from "../_shared/aiFetch.ts";
import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type GameType =
  | 'multiple_choice'
  | 'drag_and_match'
  | 'fill_in_the_gaps'
  | 'flashcard'
  | 'drawing_prompt';

type Difficulty = 'easy' | 'medium' | 'hard';

function buildToolForType(gameType: GameType, difficulty: Difficulty): any {
  switch (gameType) {
    case 'multiple_choice': {
      const maxOptions = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
      return {
        name: 'build_multiple_choice',
        description: 'Build a single multiple-choice question with one correct answer.',
        parameters: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: {
              type: 'array',
              minItems: 3,
              maxItems: maxOptions,
              items: { type: 'string' },
            },
            correct_index: { type: 'integer', minimum: 0 },
            instruction: { type: 'string' },
          },
          required: ['question', 'options', 'correct_index'],
        },
      };
    }
    case 'drag_and_match':
      return {
        name: 'build_drag_and_match',
        description: 'Build a drag-and-match game with 3-8 pairs.',
        parameters: {
          type: 'object',
          properties: {
            instruction: { type: 'string' },
            pairs: {
              type: 'array',
              minItems: 3,
              maxItems: 8,
              items: {
                type: 'object',
                properties: {
                  left_item: { type: 'string' },
                  right_item: { type: 'string' },
                  left_thumbnail_keyword: {
                    type: 'string',
                    description: 'REQUIRED single concrete noun for left card icon.',
                  },
                  right_thumbnail_keyword: {
                    type: 'string',
                    description: 'REQUIRED single concrete noun for right card icon.',
                  },
                },
                required: ['left_item', 'right_item', 'left_thumbnail_keyword', 'right_thumbnail_keyword'],
              },
            },
          },
          required: ['instruction', 'pairs'],
        },
      };
    case 'fill_in_the_gaps':
      return {
        name: 'build_fill_in_the_gaps',
        description: 'Build a fill-in-the-blank sentence.',
        parameters: {
          type: 'object',
          properties: {
            instruction: { type: 'string' },
            sentence_before: { type: 'string' },
            sentence_after: { type: 'string' },
            missing_word: { type: 'string' },
            distractors: { type: 'array', minItems: 2, maxItems: 3, items: { type: 'string' } },
          },
          required: ['instruction', 'sentence_before', 'sentence_after', 'missing_word', 'distractors'],
        },
      };
    case 'flashcard':
      return {
        name: 'build_flashcard',
        description: 'Build a single vocabulary flashcard.',
        parameters: {
          type: 'object',
          properties: { front: { type: 'string' }, back: { type: 'string' } },
          required: ['front', 'back'],
        },
      };
    case 'drawing_prompt':
      return {
        name: 'build_drawing_prompt',
        description: 'Build a creative drawing prompt.',
        parameters: {
          type: 'object',
          properties: { prompt: { type: 'string' } },
          required: ['prompt'],
        },
      };
  }
}

const TEMPLATE_GUIDANCE: Record<string, string> = {
  vocab_recall: 'Focus: vocabulary recall — concrete nouns and high-frequency words from the lesson.',
  past_simple_regular: 'Grammar focus: PAST SIMPLE with regular verbs (verb + -ed). Every sentence MUST be in past simple. Use signal words like yesterday, last week, ago.',
  present_continuous: 'Grammar focus: PRESENT CONTINUOUS (am/is/are + verb-ing). Every sentence MUST describe an action happening now.',
  comparatives_superlatives: 'Grammar focus: COMPARATIVES (-er / more) and SUPERLATIVES (-est / most). Each item should compare two or more things.',
  wh_questions: 'Grammar focus: WH-QUESTIONS (what, where, when, who, why, how). Every question MUST start with a Wh-word.',
  prepositions_of_place: 'Grammar focus: PREPOSITIONS OF PLACE (in, on, under, behind, next to, between).',
  modal_verbs: 'Grammar focus: MODAL VERBS (can, must, should, might). Every sentence MUST use one modal.',
};

function buildSystemPrompt(opts: {
  gameType: GameType;
  hub?: string;
  cefrLevel?: string;
  pairCount?: number;
  difficulty: Difficulty;
  templateId?: string;
  grammarFocus?: string;
}) {
  const audience =
    opts.hub === 'Playground'
      ? 'children aged 4-9 (Playground hub) — use very simple words, concrete nouns, vivid imagery, and a playful tone.'
      : opts.hub === 'Academy'
      ? 'teenagers aged 10-17 (Academy hub) — use age-appropriate, relevant contexts.'
      : 'adult learners (Professional hub) — use real-world / workplace contexts.';

  const sizeLine =
    opts.gameType === 'drag_and_match' && opts.pairCount
      ? `Generate EXACTLY ${opts.pairCount} pairs.`
      : '';

  const difficultyLine =
    opts.difficulty === 'easy'
      ? 'Difficulty = EASY: very short sentences (max 6 words), single-clause distractors, only the most concrete vocabulary.'
      : opts.difficulty === 'hard'
      ? 'Difficulty = HARD: multi-clause sentences, abstract or idiomatic items, distractors that require careful thinking.'
      : 'Difficulty = MEDIUM: standard one-clause sentences, plausible distractors.';

  const templateLine = opts.templateId && TEMPLATE_GUIDANCE[opts.templateId]
    ? TEMPLATE_GUIDANCE[opts.templateId]
    : '';

  const grammarLine = opts.grammarFocus
    ? `Custom grammar focus to enforce on every item: ${opts.grammarFocus}`
    : '';

  const dragMatchLine =
    opts.gameType === 'drag_and_match'
      ? 'For EVERY pair, output BOTH `left_thumbnail_keyword` AND `right_thumbnail_keyword` as a single concrete noun (e.g. "apple", "doctor", "bicycle") — these will be turned into icons. Never leave them blank.'
      : '';

  return `You are an expert ESL game designer.
Audience: ${audience}
CEFR level: ${opts.cefrLevel ?? 'A1'}.
${difficultyLine}

Design rules:
- Pedagogically sound, age-appropriate, culturally inclusive.
- Use real lesson vocabulary / grammar — NEVER placeholders like "Option A".
- Distractors must be plausible but clearly wrong.
- Keep wording short and student-friendly.
${sizeLine}
${templateLine}
${grammarLine}
${dragMatchLine}`.trim();
}

// Best-effort fallback: if AI omits a thumbnail keyword, derive a single noun
// from the card text (longest alphanumeric word, lowercased).
function deriveKeyword(text: string): string {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  if (!words.length) return text || 'icon';
  return words.sort((a, b) => b.length - a.length)[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const body = await req.json();
    const gameType = body.gameType as GameType;
    const lessonContext: string = body.lessonContext ?? '';
    const slideTitle: string = body.slideTitle ?? '';
    const visualKeyword: string = body.visualKeyword ?? '';
    const userPrompt: string = body.userPrompt ?? '';
    const hub: string | undefined = body.hub;
    const cefrLevel: string | undefined = body.cefrLevel;
    const pairCount: number | undefined = body.pairCount;
    const difficulty: Difficulty = (['easy', 'medium', 'hard'] as Difficulty[]).includes(body.difficulty)
      ? body.difficulty
      : 'medium';
    const templateId: string | undefined = body.templateId;
    const grammarFocus: string | undefined = body.grammarFocus;

    if (!gameType || !buildToolForType(gameType, difficulty)) {
      return new Response(JSON.stringify({ error: 'Unsupported gameType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tool = { type: 'function', function: buildToolForType(gameType, difficulty) };

    const userContent = `
Lesson context (vocab / grammar / topic):
${lessonContext || '(none provided)'}

Slide title: ${slideTitle || '(untitled)'}
Visual keyword: ${visualKeyword || '(none)'}
Teacher's instructions: ${userPrompt || '(none — generate the most useful game for this slide)'}

Now produce the game by calling the function "${tool.function.name}".
`.trim();

    const response = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt({
              gameType, hub, cefrLevel, pairCount, difficulty, templateId, grammarFocus,
            }),
          },
          { role: 'user', content: userContent },
        ],
        tools: [tool],
        tool_choice: { type: 'function', function: { name: tool.function.name } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error('AI gateway error:', status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again shortly.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Workspace > Usage.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error('No tool call in AI response');

    const args = JSON.parse(toolCall.function.arguments);

    let interactive_data: Record<string, unknown>;
    switch (gameType) {
      case 'multiple_choice': {
        const options = Array.isArray(args.options) ? args.options.map((o: any) => String(o)).filter(Boolean) : [];
        const correct = Math.max(0, Math.min(options.length - 1, Number(args.correct_index ?? 0)));
        interactive_data = {
          question: String(args.question ?? '').trim(),
          options,
          correct_index: correct,
          ...(args.instruction ? { instruction: String(args.instruction) } : {}),
        };
        break;
      }
      case 'drag_and_match': {
        const pairs = Array.isArray(args.pairs)
          ? args.pairs
              .map((p: any) => {
                const left_item = String(p.left_item ?? '').trim();
                const right_item = String(p.right_item ?? '').trim();
                const left_kw = String(p.left_thumbnail_keyword ?? '').trim() || deriveKeyword(left_item);
                const right_kw = String(p.right_thumbnail_keyword ?? '').trim() || deriveKeyword(right_item);
                return {
                  left_item,
                  right_item,
                  left_thumbnail_keyword: left_kw,
                  right_thumbnail_keyword: right_kw,
                };
              })
              .filter((p: any) => p.left_item && p.right_item)
          : [];
        interactive_data = {
          instruction: String(args.instruction ?? 'Match each word to its meaning.').trim(),
          pairs,
        };
        break;
      }
      case 'fill_in_the_gaps': {
        const distractors = Array.isArray(args.distractors)
          ? args.distractors.map((d: any) => String(d)).filter(Boolean).slice(0, 3)
          : [];
        interactive_data = {
          instruction: String(args.instruction ?? 'Fill in the gap!').trim(),
          sentence_parts: [String(args.sentence_before ?? ''), String(args.sentence_after ?? '')],
          missing_word: String(args.missing_word ?? '').trim(),
          distractors,
        };
        break;
      }
      case 'flashcard': {
        interactive_data = {
          front: String(args.front ?? '').trim(),
          back: String(args.back ?? '').trim(),
        };
        break;
      }
      case 'drawing_prompt': {
        interactive_data = { prompt: String(args.prompt ?? '').trim() };
        break;
      }
    }

    return new Response(JSON.stringify({ gameType, interactive_data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('ai-slide-game-generator error:', err);
    return new Response(JSON.stringify({ error: (err as Error).message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
