// DEPRECATED — Cycle 5: replaced by the 3-Brain architecture.
// Route requests to one of:
//   - generate-playground (Brain 1, Pre-A1 → mid-A2)
//   - generate-academy    (Brain 2, A1 → B1)
//   - generate-success    (Brain 3, Upper B2 → C1)
//
// The Admin Lesson Creator chooses the brain automatically from the
// hub_id of the lesson being built. See src/lib/lessonGenerator/generateLessonByHub.ts.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function hubHintFromBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const obj = body as Record<string, unknown>;
  const raw = (obj.hub_id ?? obj.hub ?? obj.ageGroup ?? "") as string;
  const v = String(raw).toLowerCase().trim();
  if (v === "playground" || v === "kids" || v === "children") return "generate-playground";
  if (v === "academy" || v === "teens") return "generate-academy";
  if (v === "success" || v === "professional" || v === "adults") return "generate-success";
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  let body: unknown = null;
  try {
    body = await req.json();
  } catch { /* ignore */ }
  const hint = hubHintFromBody(body);
  return new Response(
    JSON.stringify({
      error: "DEPRECATED",
      message:
        "generate-lesson-content has been replaced by the 3-Brain architecture. " +
        "Call generate-playground, generate-academy, or generate-success based on the lesson hub.",
      router_hint: hint,
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
