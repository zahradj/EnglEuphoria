import { aiFetch } from "../_shared/aiFetch.ts";
import { resolveStorybookImages } from "./imageResolver.ts";
// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type Hub = 'playground' | 'academy' | 'success';

const DEFAULT_LAYOUT: Record<Hub, string> = {
  playground: 'classic',
  academy: 'comic',
  success: 'case_study',
};

const HUB_RULES: Record<Hub, {
  sentenceRule: string;
  pageRule: string;
  toneRule: string;
  vocabRule: string;
  comprehension: string;
  quizSchemaTypes: string[];
}> = {
  playground: {
    sentenceRule: 'Each sentence MUST be 5-7 words maximum. Use simple A1 words. Concrete imagery, no idioms.',
    pageRule: '4 pages. Exactly 1 sentence per page.',
    toneRule: 'Playful, age 5-9. Use a clear narrative arc (setup, problem, fix, smile).',
    vocabRule: 'You MUST use 4-6 of the target vocab words verbatim across the story.',
    comprehension: [
      'Generate EXACTLY 3 comprehension slides scaled for Pre-A1/A1:',
      '  1) type "clickimage" — visual literal question, e.g. "Where is the [target word]?". Provide a "prompt" and an array of "hotspots" with at least one item {label, correct: true} that names the target object.',
      '  2) type "multiple" — literal "What happened?" with 3 short options.',
      '  3) type "truefalse" — simple literal statement from the story.',
      'Tag each item with comprehension_kind in {visual, literal, literal}.',
    ].join('\n'),
    quizSchemaTypes: ['multiple', 'truefalse', 'clickimage'],
  },
  academy: {
    sentenceRule: '1-3 sentences per page. A2-B1 register. Relatable teen scenarios.',
    pageRule: '4-5 pages with a clear arc and an emotional turn.',
    toneRule: 'Teen voice, contemporary, slightly humorous.',
    vocabRule: 'You MUST use the target vocab words verbatim. You MUST use the target grammar pattern at least TWICE.',
    comprehension: [
      'Generate EXACTLY 4 comprehension slides scaled for A2-B1:',
      '  1) type "multiple" — LITERAL ("What did Sarah do after class?")',
      '  2) type "multiple" — INFERENCE ("Why was Sarah upset?")',
      '  3) type "fill" — VOCAB IN CONTEXT — sentence from the story with one target vocab word blanked.',
      '  4) type "truefalse" — INFERENCE statement.',
      'Tag each item with comprehension_kind in {literal, inference, vocab_in_context, inference}.',
    ].join('\n'),
    quizSchemaTypes: ['multiple', 'truefalse', 'fill'],
  },
  success: {
    sentenceRule: 'Multi-clause complex sentences. B2-C2 corporate register. Embed at least one quoted line of dialogue and one decision point.',
    pageRule: '4-5 pages, case-study arc (situation → tension → action → outcome).',
    toneRule: 'Professional, analytical, real-world workplace scenario.',
    vocabRule: 'You MUST use the target vocab words verbatim and naturally weave the target grammar/functional pattern at least twice.',
    comprehension: [
      'Generate EXACTLY 5 comprehension slides scaled for B2-C2:',
      '  1) type "multiple" — LITERAL detail check.',
      '  2) type "multiple" — INFERENCE about motivation or risk.',
      '  3) type "multiple" — VOCAB IN CONTEXT (which option captures the meaning of the target word in this sentence).',
      '  4) type "discussion" — STRATEGIC ("How could the manager have handled this negotiation better?"). answer="" required.',
      '  5) type "discussion" — DEBATE prompt referencing two stakeholders. answer="" required.',
      'Tag each item with comprehension_kind in {literal, inference, vocab_in_context, strategic, strategic}.',
    ].join('\n'),
    quizSchemaTypes: ['multiple', 'truefalse', 'fill', 'discussion', 'clickimage'],
  },
};

const logStage = (stage: string, payload: Record<string, unknown> = {}) => {
  try {
    console.log(JSON.stringify({ fn: 'generate-storybook', stage, ts: Date.now(), ...payload }));
  } catch {
    console.log(`[generate-storybook] ${stage}`);
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      target_vocab = [],
      grammar_focus = '',
      theme = 'custom',
      layout_mode,
      cefr_level = 'A1',
      hub_type = 'playground',
      starring_character = null,
      character_visual_blueprint = '',
    } = body || {};
    logStage('input', {
      has_prompt: !!prompt,
      hub_type,
      cefr_level,
      vocab_count: Array.isArray(target_vocab) ? target_vocab.length : 0,
      has_character: !!starring_character,
    });
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required', stage: 'input' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hub = (HUB_RULES[hub_type as Hub] ? hub_type : 'playground') as Hub;
    const rules = HUB_RULES[hub];
    const resolvedLayout = layout_mode || DEFAULT_LAYOUT[hub];
    const vocabList = Array.isArray(target_vocab) ? target_vocab.filter(Boolean).slice(0, 12) : [];

    // Casting Director: force the AI to feature the chosen character on every
    // page and to restate their visual blueprint verbatim in every image_prompt.
    let castingBlock = '';
    if (starring_character && typeof starring_character === 'object') {
      const cName = String((starring_character as any).name || '').trim();
      const cPersona = String((starring_character as any).personality_traits || '').trim();
      const cVisual = String(
        (starring_character as any).visual_blueprint || character_visual_blueprint || ''
      ).trim();
      if (cName) {
        castingBlock = [
          '',
          '[CASTING INSTRUCTIONS]',
          `The protagonist of this story MUST be ${cName}.`,
          `Personality & Role: ${cPersona || '(consistent recurring voice)'}`,
          `Write their dialogue and actions to perfectly match this personality. ${cName} must be the subject interacting with the target vocabulary on every page. Do not invent a different main character.`,
          '',
          '[ART DIRECTION RULE]',
          `Every image_prompt MUST feature ${cName}. You must use this exact visual description for them verbatim: "${cVisual}". Do not invent new visual traits for them. Keep ${cName}'s appearance identical across all pages.`,
        ].join('\n');
      }
    }

    const systemPrompt = [
      `You are an English curriculum author. Generate a contextual story for the ${hub.toUpperCase()} hub at CEFR ${cefr_level}.`,
      `ALWAYS return a short, vivid story title (3-7 words, Title Case) in the "title" field. Never leave it blank or generic like "Story".`,
      `Story theme: ${theme}. Layout: ${resolvedLayout}.`,
      `Tone: ${rules.toneRule}`,
      `Page rule: ${rules.pageRule}`,
      `Sentence rule: ${rules.sentenceRule}`,
      vocabList.length ? `Target vocabulary: ${vocabList.join(', ')}. ${rules.vocabRule} Return the actually-used words in highlight_words (verbatim, in the case they appear).` : '',
      grammar_focus ? `Target grammar / functional focus: ${grammar_focus}. Use it naturally.` : '',
      castingBlock,
      '',
      'COMPREHENSION LOOP:',
      rules.comprehension,
      'For every quiz item, the answer MUST be derivable directly from the story. Do NOT invent facts.',
      'For "discussion" items, set answer="" and put the question in "prompt".',
      'For "fill" items, place the target vocab word as the missing word; put the full sentence in "text" with "____" where the blank goes; put the answer in "answer".',
      'For "clickimage" items, set "prompt" plus "hotspots" array of {label, correct} with one correct.',
    ].filter(Boolean).join('\n');

    const aiStart = Date.now();
    const aiRes = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Story topic / prompt: ${prompt}` },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'emit_storybook',
            description: 'Return the storybook pages and scaled comprehension quiz slides',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                layout_mode: { type: 'string', enum: ['classic', 'comic', 'case_study'] },
                theme: { type: 'string' },
                highlight_words: { type: 'array', items: { type: 'string' } },
                pages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      page_number: { type: 'integer' },
                      text: { type: 'string' },
                      image_prompt: { type: 'string', description: 'Concise illustration brief, 8-15 words' },
                    },
                    required: ['page_number', 'text', 'image_prompt'],
                  },
                },
                quiz_slides: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: rules.quizSchemaTypes },
                      comprehension_kind: { type: 'string', enum: ['literal', 'inference', 'vocab_in_context', 'visual', 'strategic'] },
                      question: { type: 'string' },
                      statement: { type: 'string' },
                      text: { type: 'string' },
                      prompt: { type: 'string' },
                      options: { type: 'array', items: { type: 'string' } },
                      hotspots: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            label: { type: 'string' },
                            correct: { type: 'boolean' },
                          },
                          required: ['label', 'correct'],
                        },
                      },
                      answer: { type: 'string' },
                      answer_bool: { type: 'boolean' },
                    },
                    required: ['type', 'comprehension_kind'],
                  },
                },
              },
              required: ['title', 'pages', 'quiz_slides', 'highlight_words'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'emit_storybook' } },
      }),
    });
    logStage('ai_response', { ms: Date.now() - aiStart, status: aiRes.status, ok: aiRes.ok });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('[generate-storybook] AI gateway error', aiRes.status, t.slice(0, 600));
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited, please retry shortly.', stage: 'ai' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'Add credits in Settings > Workspace > Usage.', stage: 'ai' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI generation failed', stage: 'ai', status: aiRes.status, detail: t.slice(0, 400) }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json().catch((e) => { logStage('parse', { error: (e as Error).message }); return null; });
    const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) {
      logStage('parse', { error: 'no_tool_call', has_data: !!data });
      return new Response(JSON.stringify({ error: 'AI returned no structured payload', stage: 'parse' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let args: any;
    try {
      args = JSON.parse(tc.function.arguments);
    } catch (e) {
      logStage('parse', { error: 'json_parse_failed', detail: (e as Error).message });
      return new Response(JSON.stringify({ error: 'AI returned invalid JSON', stage: 'parse', detail: (e as Error).message }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Validation: storybook schema ────────────────────────
    const validationErrors: string[] = [];
    if (!args.title || typeof args.title !== 'string' || !args.title.trim()) validationErrors.push('title missing');
    if (!Array.isArray(args.pages) || args.pages.length < 1) validationErrors.push('pages array empty');
    (args.pages || []).forEach((p: any, i: number) => {
      if (!p || typeof p !== 'object') { validationErrors.push(`pages[${i}] not an object`); return; }
      if (!p.text || typeof p.text !== 'string' || !p.text.trim()) validationErrors.push(`pages[${i}].text missing`);
      if (!p.image_prompt || typeof p.image_prompt !== 'string' || !p.image_prompt.trim()) validationErrors.push(`pages[${i}].image_prompt missing`);
    });
    if (!Array.isArray(args.quiz_slides)) validationErrors.push('quiz_slides not an array');
    if (validationErrors.length) {
      logStage('validate', { ok: false, errors: validationErrors });
      return new Response(JSON.stringify({ error: 'Storybook failed schema validation', stage: 'validate', detail: validationErrors.join('; ') }), {
        status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    logStage('validate', { ok: true, pages: args.pages.length, quiz: (args.quiz_slides || []).length });

    const pages = args.pages.map((p: any, i: number) => ({
      page_number: p.page_number ?? i + 1,
      text: String(p.text || ''),
      image_prompt: p.image_prompt || '',
      image_url: '',
      audio_url: '',
    }));

    // ── Image resolver hook ─────────────────────────────────
    // Scan pages and replace any unresolved image_url with a generated, hosted PNG.
    const bookKey = `${(args.title || 'story').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${Date.now()}`;
    try {
      await resolveStorybookImages(pages, bookKey, 3);
      const resolved = pages.filter((p: any) => /^https?:\/\//i.test(p.image_url || '')).length;
      logStage('images', { resolved, total: pages.length });
    } catch (e) {
      console.warn('[generate-storybook] image resolver crashed', (e as Error).message);
    }

    logStage('done', { ms: Date.now() - t0, pages: pages.length });
    return new Response(JSON.stringify({
      title: args.title || 'Story',
      layout_mode: args.layout_mode || resolvedLayout,
      theme: args.theme || theme,
      highlight_words: Array.isArray(args.highlight_words) && args.highlight_words.length
        ? args.highlight_words
        : vocabList,
      pages,
      quiz_slides: args.quiz_slides || [],
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('[generate-storybook] unhandled error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error', stage: 'unhandled' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
