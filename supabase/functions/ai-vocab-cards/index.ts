// Generate vocab cards (definition + example) for a list of words.
// Used by AcademyCreator / SuccessCreator to backfill missing vocab cards
// so definition + example are produced together with the headword.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { requireAuth } from '../_shared/authGuard.ts';

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
    const { words, hub, cefr, topic } = await req.json();
    if (!Array.isArray(words) || words.length === 0) {
      return new Response(JSON.stringify({ error: 'words (array) is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

    const level = cefr || (hub === 'success' ? 'B1' : 'A2');
    const register =
      hub === 'success'
        ? 'professional / workplace English (neutral business register). Examples MUST be realistic workplace scenarios (meetings, emails, clients, projects).'
        : 'teen-friendly, contemporary English (school, friends, hobbies, everyday life).';

    const sys = `You are a CELTA-trained ESL lexicographer writing vocab cards for a ${level} ${hub || 'academy'} lesson${topic ? ` about "${topic}"` : ''}.

For EACH input headword, produce:
- "definition": a clear, learner-friendly definition (≤ 18 words) at or slightly below ${level}. No circular definitions ("to X" for headword "X"). Use ${register}
- "example": ONE natural sentence (10–20 words) that CONTAINS the exact headword (or its inflected form) and demonstrates its meaning in context. ${register}

Return STRICT JSON: { "cards": [{ "word": string, "definition": string, "example": string }] } in the SAME order and length as the input array.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify({ words }) }] }],
        generationConfig: {
          temperature: 0.5,
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
    const incoming: Array<{ word?: string; definition?: string; example?: string }> = Array.isArray(parsed.cards)
      ? parsed.cards
      : [];

    const cards = words.map((w: string, i: number) => {
      const c = incoming[i] || {};
      return {
        word: w,
        definition: typeof c.definition === 'string' ? c.definition.trim() : '',
        example: typeof c.example === 'string' ? c.example.trim() : '',
      };
    });

    return new Response(
      JSON.stringify({ cards, level, hub: hub || null }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('ai-vocab-cards error:', err);
    return new Response(
      JSON.stringify({ error: true, message: (err as Error).message, cards: [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
