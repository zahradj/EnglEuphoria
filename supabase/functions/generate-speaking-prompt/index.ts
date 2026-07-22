import { aiFetch } from "../_shared/aiFetch.ts";

import { requireAuth } from "../_shared/authGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });


  const _auth = await requireAuth(req);
  if (!_auth.ok) return new Response(JSON.stringify(_auth.body), { status: _auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { theme, cefr_level = "A2", hub = "academy" } = await req.json();
    if (!theme) return json({ error: "theme required" }, 400);

    const sys = `You generate 1-minute speaking-homework prompts for English learners.
Theme: ${theme}. CEFR: ${cefr_level}. Hub: ${hub}.
Return ONE prompt (2-3 sentences) asking the student to record their voice. Keep vocabulary level-appropriate. No greetings, no preamble.`;

    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!apiKey) return json({ error: "Gemini key missing" }, 500);

    const r = await aiFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sys }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 200 },
        }),
      }
    );
    const data = await r.json();
    const prompt = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || `Record a 1-minute audio about "${theme}". Share your opinion and one example.`;

    return json({ prompt, theme, cefr_level });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
