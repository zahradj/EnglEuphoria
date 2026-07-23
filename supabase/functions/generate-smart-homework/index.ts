// generate-smart-homework: AI-drafts a personalized, interactive homework
// block from a live-class struggle list and dispatches it to the student.
// Output is shaped for the existing <HomeworkPlayer /> 3-activity contract.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { aiFetch } from "../_shared/aiFetch.ts";

type Hub = "playground" | "academy" | "success";

interface Struggle {
  skill_tag: string;        // e.g. "grammar:present_perfect" or "vocab:although"
  vocab_word?: string;
  count?: number;
}

interface Body {
  session_id: string;
  lesson_id?: string | null;
  student_id: string;
  hub: Hub;
  struggles: Struggle[];
}

const homeworkTool = {
  type: "function" as const,
  function: {
    name: "build_smart_homework",
    description: "Build a personalized 3-stage interactive homework block targeting only the struggle points.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Friendly short title, max 60 chars." },
        activity_1_recognition: {
          type: "object",
          description: "Listen & Match — 3 items, each with one correct answer and 3 wrong options.",
          properties: {
            instructions: { type: "string" },
            items: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  audio_text: { type: "string", description: "Short sentence (≤14 words) the student will hear." },
                  correct_answer: { type: "string" },
                  wrong_options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
                },
                required: ["audio_text", "correct_answer", "wrong_options"],
              },
            },
          },
          required: ["instructions", "items"],
        },
        activity_2_syntax: {
          type: "object",
          description: "Sentence Scramble — 3 sentences targeting the grammar struggle.",
          properties: {
            instructions: { type: "string" },
            items: {
              type: "array",
              minItems: 3,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  scrambled_words: { type: "array", items: { type: "string" }, minItems: 4 },
                  correct_order: { type: "string", description: "The full correctly ordered sentence." },
                },
                required: ["scrambled_words", "correct_order"],
              },
            },
          },
          required: ["instructions", "items"],
        },
        activity_3_production: {
          type: "object",
          description: "Voice Challenge — single spoken prompt the student records.",
          properties: {
            instructions: { type: "string" },
            prompt: { type: "string", description: "The speaking prompt shown to the student." },
            target_words_to_detect: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
            example_response: { type: "string" },
          },
          required: ["instructions", "prompt", "target_words_to_detect"],
        },
      },
      required: ["title", "activity_1_recognition", "activity_2_syntax", "activity_3_production"],
    },
  },
};

function hubRegister(hub: Hub): string {
  if (hub === "playground") return "Use very simple, concrete language for ages 6-10. Short sentences (≤8 words). Cheerful tone. No abstract concepts.";
  if (hub === "academy") return "Teen-friendly tone for ages 11-17. Real-world contexts (school, friends, sports, tech). Avoid childish copy.";
  return "Adult-professional tone. Workplace/life contexts. Concise, respectful, never childish.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Auth: must be a logged-in teacher (or admin)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: claims } = await supabaseUser.auth.getClaims(authHeader.replace("Bearer ", ""));
  const userId = claims?.claims?.sub;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Service-role client for writes
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Verify role
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (roleRows ?? []).map((r: any) => r.role);
  if (!roles.includes("teacher") && !roles.includes("admin")) {
    return new Response(JSON.stringify({ error: "Forbidden — teacher role required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body?.session_id || !body?.student_id || !body?.hub || !Array.isArray(body?.struggles)) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const struggles = body.struggles.slice(0, 12);
  if (struggles.length === 0) {
    return new Response(JSON.stringify({ error: "No struggles to target" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pull lesson title for context (best-effort)
  let lessonTitle = "today's class";
  if (body.lesson_id) {
    const { data: lesson } = await supabase
      .from("curriculum_lessons")
      .select("title")
      .eq("id", body.lesson_id)
      .maybeSingle();
    if (lesson?.title) lessonTitle = lesson.title;
  }

  const grammarTargets = struggles.filter(s => s.skill_tag?.startsWith("grammar:")).map(s => s.skill_tag.replace("grammar:", ""));
  const vocabTargets = Array.from(new Set(
    struggles.flatMap(s => [s.vocab_word, s.skill_tag?.startsWith("vocab:") ? s.skill_tag.replace("vocab:", "") : null].filter(Boolean) as string[])
  )).slice(0, 8);

  const systemPrompt = `You are a master ESL teacher building a tiny, friendly, personalized homework block for ONE student.
Lesson: "${lessonTitle}". Hub: ${body.hub}.
${hubRegister(body.hub)}

Target ONLY these weak points the student struggled with in class:
- Grammar focuses: ${grammarTargets.length ? grammarTargets.join(", ") : "(none — focus on vocabulary)"}
- Vocabulary focuses: ${vocabTargets.length ? vocabTargets.join(", ") : "(none — focus on grammar)"}

Rules:
- Reuse the target vocab words AT LEAST twice across the 3 activities.
- Activity 1 (Listen & Match): the correct_answer must be the meaning/translation/synonym of the audio sentence's key word; wrong_options must be plausible distractors.
- Activity 2 (Sentence Scramble): each scrambled_words array must be exactly the tokens of correct_order in shuffled order. No extra/missing tokens.
- Activity 3 (Voice Challenge): single open-ended prompt that forces the student to USE the grammar + at least 2 target words.
- Never include placeholder text, examples like "TODO", or untargeted filler. Output ONLY through the tool call.`;

  const userPrompt = `Struggles JSON: ${JSON.stringify(struggles)}\nGenerate the homework now.`;

  let aiPayload: any = null;
  try {
    const r = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [homeworkTool],
        tool_choice: { type: "function", function: { name: "build_smart_homework" } },
      }),
    });
    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please retry shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error", r.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await r.json();
    const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc) throw new Error("No tool call in AI response");
    aiPayload = JSON.parse(tc.function.arguments);
  } catch (e) {
    console.error("AI exception", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Minimal validation: ensure required activities exist
  if (!aiPayload?.activity_1_recognition?.items?.length
    || !aiPayload?.activity_2_syntax?.items?.length
    || !aiPayload?.activity_3_production?.prompt) {
    return new Response(JSON.stringify({ error: "AI output missing required activities" }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const dueDate = new Date(Date.now() + 3 * 24 * 3600_000).toISOString();
  const title = aiPayload.title?.slice(0, 60) || `Custom Practice — ${lessonTitle}`;

  const content = {
    activity_1_recognition: aiPayload.activity_1_recognition,
    activity_2_syntax: aiPayload.activity_2_syntax,
    activity_3_production: aiPayload.activity_3_production,
    meta: {
      hub: body.hub,
      title,
      vocabulary: vocabTargets,
      lesson_id: body.lesson_id ?? null,
      source: "smart_homework",
      source_struggles: struggles,
      session_id: body.session_id,
    },
  };

  // Create assignment row
  const { data: assignment, error: insErr } = await supabase
    .from("homework_assignments")
    .insert({
      teacher_id: userId,
      lesson_id: body.lesson_id ?? null,
      title,
      description: "Auto-generated from your in-class performance.",
      instructions: "Complete all 3 quick activities. About 5 minutes.",
      content,
      source: "smart_homework",
      status: "pending",
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

  // Link to student
  const { error: linkErr } = await supabase
    .from("homework_assignment_students")
    .insert({ assignment_id: assignment.id, student_id: body.student_id });
  if (linkErr) {
    console.error("homework_assignment_students insert failed", linkErr);
    return new Response(JSON.stringify({ error: linkErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    assignment_id: assignment.id,
    title,
    preview: {
      activities: 3,
      vocabulary: vocabTargets,
      grammar: grammarTargets,
    },
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
