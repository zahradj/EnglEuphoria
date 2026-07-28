// create-lep1-homework: self-service homework creation for a student who
// just finished a self-paced Little Explorers Phonics scene lesson in the
// Playground dashboard. The activity content is built deterministically
// client-side from that lesson's own scene data (no AI call) and handed to
// this function only to perform the actual insert — students have no
// direct INSERT policy on homework_assignments (only teachers do), so this
// runs as the service role after verifying the caller's own identity from
// their JWT. Mirrors generate-smart-homework's insert shape but without its
// teacher-role gate or AI generation step.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecognitionItem {
  audio_text: string;
  correct_answer: string;
  wrong_options: string[];
}
interface SyntaxItem {
  scrambled_words: string[];
  correct_order: string;
}
interface HomeworkContent {
  activity_1_recognition: { instructions?: string; items: RecognitionItem[] };
  activity_2_syntax: { instructions?: string; items: SyntaxItem[] };
  activity_3_production: { instructions?: string; prompt: string; target_words_to_detect?: string[]; example_response?: string };
  meta?: Record<string, unknown>;
}

interface Body {
  lessonId: string | null;
  title: string;
  content: HomeworkContent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claims } = await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
  const userId = claims?.claims?.sub;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const content = body?.content;
  if (
    !content?.activity_1_recognition?.items?.length ||
    !content?.activity_2_syntax?.items?.length ||
    !content?.activity_3_production?.prompt ||
    !body?.title
  ) {
    return new Response(JSON.stringify({ error: "Missing or malformed homework content" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const dueDate = new Date(Date.now() + 7 * 24 * 3600_000).toISOString();

  const { data: assignment, error: insErr } = await supabase
    .from("homework_assignments")
    .insert({
      teacher_id: userId,
      lesson_id: body.lessonId ?? null,
      title: body.title.slice(0, 60),
      description: "Auto-generated practice from your Playground lesson.",
      instructions: "Complete all 3 quick activities. About 5 minutes.",
      content,
      source: "lep1-auto",
      status: "active",
      points: 10,
      due_date: dueDate,
    })
    .select("id")
    .single();

  if (insErr || !assignment) {
    console.error("homework_assignments insert failed", insErr);
    return new Response(JSON.stringify({ error: insErr?.message ?? "Failed to save assignment" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: linkErr } = await supabase
    .from("homework_assignment_students")
    .insert({ assignment_id: assignment.id, student_id: userId });

  if (linkErr) {
    console.error("homework_assignment_students insert failed", linkErr);
    return new Response(JSON.stringify({ error: linkErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ assignment_id: assignment.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
