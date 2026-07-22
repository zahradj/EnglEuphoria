import { aiFetch } from "../_shared/aiFetch.ts";
// deno-lint-ignore-file no-explicit-any
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const HUB_RULES: Record<string, { quizMin: number; quizMax: number; types: string[] }> = {
  playground: { quizMin: 2, quizMax: 2, types: ['multiple', 'truefalse'] },
  academy:    { quizMin: 3, quizMax: 4, types: ['truefalse', 'fill', 'multiple'] },
  success:    { quizMin: 4, quizMax: 5, types: ['multiple', 'discussion'] },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const transcript = body.transcript;
    const cefr_level = body.cefr_level || 'A2';
    const hub_type = body.hub_type || body.hub || 'academy';
    const media_url = body.media_url || '';
    const media_kind = body.media_kind || 'youtube';

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 30) {
      return new Response(JSON.stringify({ error: 'A transcript (at least ~30 chars) is required for analysis.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const rules = HUB_RULES[hub_type] || HUB_RULES.academy;

    const systemPrompt = [
      `You are a Listening Comprehension instructor for the ${hub_type.toUpperCase()} hub at CEFR ${cefr_level}.`,
      `Generate ${rules.quizMin}-${rules.quizMax} comprehension quiz slides ONLY from these types: ${rules.types.join(', ')}.`,
      `Test main ideas, specific details, and vocabulary heard in the audio.`,
      `Every answer MUST be derivable from the transcript. Do NOT hallucinate facts.`,
    ].join('\n');

    const aiRes = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Media URL: ${media_url}\n\nTRANSCRIPT:\n${transcript}` },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'emit_comprehension',
            description: 'Return scaled comprehension quiz slides',
            parameters: {
              type: 'object',
              properties: {
                quiz_slides: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['multiple', 'truefalse', 'fill', 'discussion'] },
                      question: { type: 'string' },
                      statement: { type: 'string' },
                      text: { type: 'string' },
                      prompt: { type: 'string' },
                      options: { type: 'array', items: { type: 'string' } },
                      answer: { type: 'string' },
                      answer_bool: { type: 'boolean' },
                    },
                    required: ['type'],
                  },
                },
              },
              required: ['quiz_slides'],
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'emit_comprehension' } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('AI gateway error', aiRes.status, t);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited, retry shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'Add credits in Settings > Workspace > Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      throw new Error('AI gateway error');
    }

    const data = await aiRes.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error('AI returned no structured payload');
    const args = JSON.parse(tc.function.arguments);
    const quiz_slides = args.quiz_slides || [];

    // Also expose as scaffolded-media segments (evenly-spaced 30s checkpoints)
    const segments = quiz_slides.map((q: any, i: number) => ({
      start_time: i * 30,
      end_time: (i + 1) * 30,
      question: {
        prompt: q.question || q.statement || q.text || q.prompt || `Checkpoint ${i + 1}`,
        options: Array.isArray(q.options) && q.options.length
          ? q.options
          : (typeof q.answer_bool === 'boolean' ? ['True', 'False'] : ['A', 'B', 'C']),
        answer: q.answer ?? (q.answer_bool === true ? 'True' : q.answer_bool === false ? 'False' : 'A'),
      },
    }));

    return new Response(JSON.stringify({ quiz_slides, segments }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('analyze-media error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
