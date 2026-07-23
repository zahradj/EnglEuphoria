const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { generateGoogleImage } from "../_shared/googleImageClient.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const langMap: Record<string, string> = {
  english: 'English', spanish: 'Spanish', arabic: 'Arabic',
  french: 'French', turkish: 'Turkish', italian: 'Italian',
};

const hubAccent: Record<string, string> = {
  playground: 'warm orange and yellow',
  academy: 'royal purple and lavender',
  professional: 'emerald green and mint',
};

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });


  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const word = String(body.word || '').trim().toLowerCase();
    const context = String(body.context || '').trim();
    const language = String(body.language || 'english').toLowerCase();
    const hub = String(body.hub || 'academy').toLowerCase();

    if (!word) {
      return new Response(JSON.stringify({ error: 'word is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const contextHash = await sha256(context.toLowerCase().slice(0, 500));

    // Cache check
    const { data: cached } = await supabase
      .from('dictionary_cache')
      .select('definition, translation, image_url')
      .eq('word', word).eq('context_hash', contextHash).eq('language', language)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ ...cached, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const targetLang = langMap[language] || 'English';

    // Generate definition + translation
    const aiRes = await aiFetch('https://ai-gateway.internal/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: `You are a multilingual ESL dictionary. Reply ONLY with compact JSON: {"definition":"...","translation":"..."}. Definition is in clear simple English (≤20 words). Translation is the word's meaning in the given context translated to ${targetLang}.` },
          { role: 'user', content: `Word: "${word}"\nSentence context: "${context || '(no context)'}"\nTarget language: ${targetLang}` },
        ],
      }),
    });

    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'payment_required', message: 'Out of AI credits' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: 'rate_limit' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!aiRes.ok) throw new Error(`AI gateway ${aiRes.status}`);

    const aiJson = await aiRes.json();
    const text = aiJson.choices?.[0]?.message?.content || '{}';
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { definition: '', translation: '' };
    const definition = String(parsed.definition || '').trim() || word;
    const translation = String(parsed.translation || '').trim() || word;

    // Generate flat-vector icon (best-effort, non-blocking on failure)
    let imageUrl: string | null = null;
    try {
      const result = await generateGoogleImage(
        `Flat 2D vector icon, single subject, clean minimal, white background, ${hubAccent[hub] || 'royal purple'} accent. Subject: ${word}. No text.`,
      );
      imageUrl = result.dataUrl;
    } catch (e) {
      console.warn('image gen failed', e);
    }

    // Persist
    await supabase.from('dictionary_cache').insert({
      word, context_hash: contextHash, language, definition, translation, image_url: imageUrl,
    });

    return new Response(JSON.stringify({ definition, translation, image_url: imageUrl, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('fetch-dictionary-definition error', e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
