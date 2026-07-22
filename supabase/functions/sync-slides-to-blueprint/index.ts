// Rewrites an existing slide deck so its text and quiz questions exclusively
// use the supplied vocabulary words and grammar structure. Calls Google Gemini
// directly (Google AI Studio).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-1.5-flash';

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
    const { slides, vocabulary, grammar, hub = 'academy', cefr_level = 'A1', interests, specific_needs } =
      await req.json().catch(() => ({}));

    if (!Array.isArray(slides) || slides.length === 0) {
      return new Response(JSON.stringify({ error: 'slides[] is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!Array.isArray(vocabulary) || !grammar) {
      return new Response(JSON.stringify({ error: 'vocabulary[] and grammar are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

    const anchor = [
      interests ? `🎯 CREATIVE ANCHOR — weave the student's interests into examples and stories: ${interests}.` : '',
      specific_needs ? `🛠 SPECIFIC NEEDS — adapt tone/scaffolding for: ${specific_needs}.` : '',
    ].filter(Boolean).join('\n');

    const system = `You are a Senior ESL Editor for the Engleuphoria platform (${hub} hub, CEFR ${cefr_level}).
You will receive an array of lesson slides as JSON. Rewrite their text-bearing fields so that:
  • Every slide uses ONLY these target vocabulary words: ${vocabulary.join(', ')}
  • Every grammatically structured sentence uses this grammar: "${grammar}"
${anchor}
HARD RULES:
  • Preserve each slide's "type" exactly.
  • Preserve array lengths (e.g. options/pairs arity stays the same).
  • Preserve all media URL / image / audio / video / asset fields verbatim.
  • Preserve the "answer" being a member of "options" when applicable.
  • Keep voice.text in sync with the new on-screen text.
  • Do NOT add or remove slides.
Return ONLY a single JSON object: { "slides": [...] } with the FULL rewritten slides array (same length, same order). No markdown.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: `SLIDES:\n${JSON.stringify(slides)}` }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('[sync-slides-to-blueprint] Gemini error', resp.status, t);
      return new Response(JSON.stringify({ error: 'Gemini API error', detail: t }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
    const parsed = tolerantJsonParse(text);
    if (!parsed?.slides || !Array.isArray(parsed.slides)) {
      throw new Error('AI did not return slides');
    }
    if (parsed.slides.length !== slides.length) {
      console.warn('[sync] length mismatch', parsed.slides.length, 'vs', slides.length);
    }

    return new Response(JSON.stringify({ slides: parsed.slides }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[sync-slides-to-blueprint]', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
