// Generates N additional practice items for an activity slide
// (error_detection / correction / fill_blank), aligned with the lesson blueprint.
// Calls Google Gemini directly (Google AI Studio).
import { buildStudioSystemPrompt } from "../_shared/studioPersona.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-2.5-flash';

type SlideType = 'error_detection' | 'correction' | 'fill_blank' | 'multiple' | 'truefalse' | 'sentence_builder';

interface Body {
  slide_type: SlideType;
  count?: number;
  existing_items?: any[];
  blueprint?: { vocabulary?: string[]; grammar?: string; title?: string };
  hub?: 'playground' | 'academy' | 'success';
  cefr_level?: string;
  age_group?: string;
  target_grammar?: string;
  previous_topics?: string[];
}

const SCHEMA_BY_TYPE: Record<SlideType, Record<string, unknown>> = {
  error_detection: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sentence: { type: 'string' },
            wrongIndex: { type: 'integer' },
          },
          required: ['sentence', 'wrongIndex'],
        },
      },
    },
    required: ['items'],
  },
  correction: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: { wrong: { type: 'string' }, answer: { type: 'string' } },
          required: ['wrong', 'answer'],
        },
      },
    },
    required: ['items'],
  },
  fill_blank: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            before: { type: 'string' },
            answer: { type: 'string' },
            after: { type: 'string' },
          },
          required: ['before', 'answer', 'after'],
        },
      },
    },
    required: ['items'],
  },
  multiple: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 4 },
            answer: { type: 'string' },
          },
          required: ['question', 'options', 'answer'],
        },
      },
    },
    required: ['items'],
  },
  truefalse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            statement: { type: 'string' },
            answer: { type: 'boolean' },
          },
          required: ['statement', 'answer'],
        },
      },
    },
    required: ['items'],
  },
  sentence_builder: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            words: { type: 'array', items: { type: 'string' } },
            answer: { type: 'array', items: { type: 'string' } },
          },
          required: ['words', 'answer'],
        },
      },
    },
    required: ['items'],
  },
};

function tolerantJsonParse(raw: string): any | null {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  try { return JSON.parse(cleaned); } catch { /* slice */ }
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { /* nope */ }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const {
      slide_type,
      count = 3,
      existing_items = [],
      blueprint = {},
      hub = 'academy',
      cefr_level = 'A2',
      age_group,
      target_grammar,
      previous_topics,
    } = body;

    if (!slide_type || !SCHEMA_BY_TYPE[slide_type]) {
      return new Response(JSON.stringify({ error: 'invalid slide_type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vocab = (blueprint.vocabulary || []).join(', ') || '—';
    const grammar = target_grammar || blueprint.grammar || '—';

    const persona = buildStudioSystemPrompt({
      role: 'pedagogue',
      cefr: cefr_level,
      ageGroup: age_group,
      hub,
      targetGrammar: grammar,
      previousTopics: previous_topics,
      outputContract: `Return ONLY JSON: { "items": [...] } with exactly ${count} items matching the requested schema. No markdown, no prose.`,
    });

    const system = `${persona}

Lesson title: ${blueprint.title || '—'}
Target vocabulary: ${vocab}
Target grammar rule: ${grammar}

Rules:
- Generate exactly ${count} NEW practice items.
- Reuse the target vocabulary and target grammar.
- Vary the subjects (he/she/they/we/the kids/etc.) to keep it fresh.
- Do NOT repeat any of the existing items.
- Match the CEFR level — short, clean, natural English.

Slide-type specifics:
- error_detection: one wrong word per sentence; wrongIndex is 0-based.
- correction: 'wrong' has one mistake; 'answer' is the fully corrected sentence.
- fill_blank: 'before' + '___' + 'after'; 'answer' fills the blank.
- multiple: 3–4 plausible options; 'answer' MUST be one of the options verbatim.
- truefalse: clear factual statement; 'answer' is boolean true/false.
- sentence_builder: 'words' is a shuffled bank; 'answer' is the correct word order. Both arrays must contain the same words (same length, same items).`;

    const user = `Slide type: ${slide_type}
Existing items (do not duplicate):
${JSON.stringify(existing_items, null, 2)}

Return ${count} new items as JSON: { "items": [...] }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          responseSchema: SCHEMA_BY_TYPE[slide_type],
        },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('[generate-practice-items] Gemini error', resp.status, t);
      return new Response(JSON.stringify({ error: 'Gemini API error', detail: t }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
    const parsed = tolerantJsonParse(text);
    const items: any[] = Array.isArray(parsed?.items) ? parsed.items : [];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[generate-practice-items] error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
