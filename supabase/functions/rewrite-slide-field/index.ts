// Rewrite a single slide field to align with the lesson blueprint.
// Uses Lovable AI Gateway (Gemini Flash) — cheap & fast.
import { slideTypeInstruction } from "../_shared/slideContextRules.ts";
import { aiFetch } from "../_shared/aiFetch.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Body {
  field: string;
  current_value?: string;
  slide_type?: string;
  hub?: 'playground' | 'academy' | 'success';
  cefr_level?: string;
  blueprint?: { vocabulary?: string[]; grammar?: string; interests?: string; specific_needs?: string };
  instruction?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const { field, current_value = '', slide_type = '', hub = 'academy', cefr_level = 'A2', blueprint = {}, instruction } = body;
    if (!field) {
      return new Response(JSON.stringify({ error: 'field is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const vocab = (blueprint.vocabulary || []).join(', ') || '—';
    const grammar = blueprint.grammar || '—';
    const interests = blueprint.interests?.trim();
    const needs = blueprint.specific_needs?.trim();

    const slideRule = slideTypeInstruction(slide_type);
    const prompt = `You are a senior ESL curriculum designer.
Rewrite ONLY the "${field}" of a ${hub} slide (type: ${slide_type}) at CEFR ${cefr_level}.
${slideRule ? `Slide-type rule: ${slideRule}\n` : ''}Keep alignment with this lesson blueprint:
- Target vocabulary: ${vocab}
- Target grammar: ${grammar}
${interests ? `- 🎯 Creative anchor (student interests): ${interests}` : ''}
${needs ? `- 🛠 Specific needs / goals: ${needs}` : ''}

Current value:
"""${current_value}"""

${instruction ? `Extra instruction: ${instruction}` : ''}

Constraints:
- Match the original length within ±25%.
- Keep the same field type (a question stays a question, a single word stays a single word).
- Use natural, age-appropriate language for the ${hub} hub.
- When natural, weave in the student interests above so the example feels personal.
- Return strict JSON: {"value": "<new text>"}`;

    const res = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You return strict JSON only. No prose, no markdown.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(JSON.stringify({ error: 'AI gateway error', detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content || '{}';
    let value = '';
    try {
      value = (JSON.parse(raw)?.value || '').toString().trim();
    } catch {
      value = raw.replace(/^["']|["']$/g, '').trim();
    }
    if (!value) value = current_value;

    return new Response(JSON.stringify({ value }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
