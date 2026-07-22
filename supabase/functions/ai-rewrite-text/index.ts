// Rewrite an array of texts at a target CEFR level, easier or harder.
// Calls Google Gemini directly (Google AI Studio).
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { requireAuth } from '../_shared/authGuard.ts';
import { buildStudioSystemPrompt } from '../_shared/studioPersona.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-2.5-flash';

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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const auth = await requireAuth(req, { allowedRoles: ['admin', 'content_creator', 'teacher'] });
  if (!auth.ok) {
    return new Response(JSON.stringify(auth.body), {
      status: auth.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { texts, direction, targetLevel, hub, age_group, target_grammar } = await req.json();
    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ error: 'texts (array) is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const dir = direction === 'harder' ? 'harder' : 'easier';
    const level = targetLevel || (hub === 'playground' ? 'A1' : 'B1');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

    const persona = buildStudioSystemPrompt({
      role: 'rewriter',
      cefr: level,
      ageGroup: age_group,
      hub,
      targetGrammar: target_grammar,
      outputContract: 'Return STRICT JSON: { "rewritten": string[] } with the SAME order and length as the input array.',
    });

    const sys = `${persona}

Rewrite each input string to be ${dir} for a ${level} learner. Preserve meaning, length range (±25%), and tone. ${
      dir === 'easier'
        ? 'Use shorter sentences, common words, simpler grammar.'
        : 'Use richer vocabulary, more complex grammar (subordinate clauses, varied tenses).'
    }`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ texts }) }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Gemini ${resp.status}: ${t.slice(0, 300)}`);
    }

    const data = await resp.json();
    const raw: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
    const parsed = tolerantJsonParse(raw) || {};
    const rewritten: string[] = Array.isArray(parsed.rewritten) ? parsed.rewritten : [];
    while (rewritten.length < texts.length) rewritten.push(texts[rewritten.length]);

    return new Response(
      JSON.stringify({ rewritten: rewritten.slice(0, texts.length), direction: dir, level }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('ai-rewrite-text error:', err);
    return new Response(
      JSON.stringify({ error: true, message: (err as Error).message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
