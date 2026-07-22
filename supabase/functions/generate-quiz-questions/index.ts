const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { aiFetch } from "../_shared/aiFetch.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });


  const _auth = await requireAuth(req, { allowedRoles: ["admin","content_creator","teacher"] });
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const activityType = String(body.activityType || 'multiple_choice'); // multiple_choice | true_false | options
    const prompt = String(body.prompt || '').trim();
    const count = Math.max(1, Math.min(5, Number(body.count || 1)));
    const existing = Array.isArray(body.existing) ? body.existing : [];
    const lessonContext = String(body.lessonContext || '').slice(0, 1000);

    const schemaHint =
      activityType === 'true_false'
        ? '{"items":[{"statement":"...","isTrue":true|false,"explanation":"..."}]}'
        : '{"items":[{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}';

    const aiRes = await aiFetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': LOVABLE_API_KEY },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: `You generate ESL quiz items. Reply ONLY with compact JSON in this shape: ${schemaHint}. Generate exactly ${count} new item(s). Avoid duplicates of existing items. Ensure correctness and pedagogical clarity.` },
          { role: 'user', content: `Activity type: ${activityType}\nLesson context: ${lessonContext || '(none)'}\nUser prompt: ${prompt || '(none)'}\nExisting items (avoid duplicates): ${JSON.stringify(existing).slice(0, 1500)}` },
        ],
      }),
    });

    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: 'payment_required' }),
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
    const parsed = match ? JSON.parse(match[0]) : { items: [] };

    return new Response(JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('generate-quiz-questions error', e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
