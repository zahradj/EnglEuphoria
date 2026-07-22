// Universal Gemini text generation endpoint.
// Decouples the app from Lovable AI Cloud — all Creator Studio AI runs
// through this Supabase Edge Function, which in turn calls Google AI Studio.
//
// POST body:
//   { prompt: string, system?: string, model?: string, temperature?: number,
//     responseMimeType?: 'application/json' | 'text/plain' }
//
// Response:
//   { ok: true, text: string, json?: any, model: string }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const DEFAULT_MODEL = 'gemini-2.5-flash';

// Map retired model ids to current equivalents so older callers don't 404.
function normalizeModel(m?: string): string {
  if (!m) return DEFAULT_MODEL;
  if (m === 'gemini-1.5-flash') return 'gemini-2.5-flash';
  if (m === 'gemini-1.5-pro') return 'gemini-2.5-pro';
  return m;
}

interface RequestBody {
  prompt?: string;
  system?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'application/json' | 'text/plain';
}

function tolerantJsonParse(raw: string): unknown | null {
  if (!raw) return null;
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  try { return JSON.parse(cleaned); } catch { /* try slice */ }
  const firstObj = cleaned.indexOf('{');
  const firstArr = cleaned.indexOf('[');
  const start = firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
  const lastObj = cleaned.lastIndexOf('}');
  const lastArr = cleaned.lastIndexOf(']');
  const end = Math.max(lastObj, lastArr);
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* give up */ }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const prompt = (body.prompt || '').trim();
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const model = normalizeModel(body.model);
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.85;
  const maxOutputTokens = typeof body.maxOutputTokens === 'number' ? body.maxOutputTokens : 4096;

  const generationConfig: Record<string, unknown> = { temperature, maxOutputTokens };
  if (body.responseMimeType === 'application/json') {
    generationConfig.responseMimeType = 'application/json';
  }

  const requestBody: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  };
  if (body.system) {
    requestBody.systemInstruction = { role: 'system', parts: [{ text: body.system }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GEMINI_API_KEY}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (e) {
    console.error('[generate-gemini] network error:', e);
    return new Response(
      JSON.stringify({ error: 'Failed to reach Gemini API', detail: String(e) }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error('[generate-gemini] Gemini error', geminiRes.status, errText);
    return new Response(
      JSON.stringify({ error: 'Gemini API request failed', status: geminiRes.status, detail: errText }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const data = await geminiRes.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';

  const json = body.responseMimeType === 'application/json' ? tolerantJsonParse(text) : null;

  return new Response(
    JSON.stringify({ ok: true, text, json, model }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
