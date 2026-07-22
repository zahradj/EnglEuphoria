import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT =
  "You are a Senior React/Supabase Developer. Analyze this stack trace. Provide a brief explanation of why it crashed, and write the exact code snippet to fix it.";

async function analyzeWithGemini(errorMessage: string, stackTrace: string | null, route: string | null) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const userContent = [
    `Route: ${route ?? "unknown"}`,
    `Error: ${errorMessage}`,
    `Stack trace:\n${stackTrace ?? "(none)"}`,
  ].join("\n\n");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
      }),
    },
  );

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Gemini API ${res.status}: ${txt.slice(0, 500)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join("\n") ??
    "No analysis returned.";
  return text as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let targetId: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body?.id && typeof body.id === "string") targetId = body.id;
      } catch {
        /* no body ok */
      }
    }

    const query = supabase
      .from("system_errors")
      .select("id, error_message, stack_trace, route")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .limit(10);

    const { data: bugs, error: fetchErr } = targetId
      ? await supabase
          .from("system_errors")
          .select("id, error_message, stack_trace, route")
          .eq("id", targetId)
      : await query;

    if (fetchErr) throw fetchErr;

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const bug of bugs ?? []) {
      // claim
      const { error: claimErr } = await supabase
        .from("system_errors")
        .update({ status: "analyzing" })
        .eq("id", bug.id)
        .in("status", ["open", "analyzed"]);
      if (claimErr) {
        results.push({ id: bug.id, ok: false, error: claimErr.message });
        continue;
      }

      try {
        const analysis = await analyzeWithGemini(bug.error_message, bug.stack_trace, bug.route);
        await supabase
          .from("system_errors")
          .update({
            ai_analysis: analysis,
            ai_model: GEMINI_MODEL,
            analyzed_at: new Date().toISOString(),
            status: "analyzed",
          })
          .eq("id", bug.id);
        results.push({ id: bug.id, ok: true });
      } catch (e) {
        await supabase
          .from("system_errors")
          .update({
            ai_analysis: `Analysis failed: ${(e as Error).message}`,
            status: "open",
          })
          .eq("id", bug.id);
        results.push({ id: bug.id, ok: false, error: (e as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ analyzed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
