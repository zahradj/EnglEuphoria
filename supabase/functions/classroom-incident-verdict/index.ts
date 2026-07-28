// AI Senior Engineer: reviews both incident reports for a classroom room
// and stamps a verdict (status + fault_party + summary) into
// public.classroom_incident_verdicts.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

// ---- Inlined from ../_shared/aiFetch.ts (deploy bundler can't resolve
// relative imports outside this function's own directory) ----
const GEMINI_HOST = "generativelanguage.googleapis.com";

function gatewayModelToGemini(model?: string): string {
  if (!model) return "gemini-2.5-flash";
  const bare = model.replace(/^google\//, "").replace(/^openai\//, "");
  if (bare.startsWith("gpt-5")) {
    if (bare.includes("nano") || bare.includes("mini")) return "gemini-2.5-flash";
    return "gemini-2.5-pro";
  }
  if (bare.includes("flash")) return "gemini-2.5-flash";
  if (bare.includes("pro")) return "gemini-2.5-pro";
  return "gemini-2.5-flash";
}

function sanitizeForGemini(node: any): any {
  if (Array.isArray(node)) return node.map(sanitizeForGemini);
  if (node && typeof node === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "additionalProperties" || k === "$schema" || k === "definitions" || k === "$ref") continue;
      out[k] = sanitizeForGemini(v);
    }
    return out;
  }
  return node;
}

function dataUrlToInlineData(url: string): { mimeType: string; data: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(url);
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

function messageContentToGeminiParts(content: unknown): any[] {
  if (typeof content === "string") return [{ text: content }];
  if (!Array.isArray(content)) return [{ text: JSON.stringify(content) }];

  const parts: any[] = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    if (part.type === "text" && typeof part.text === "string") {
      parts.push({ text: part.text });
    } else if (part.type === "image_url" && part.image_url?.url) {
      const inline = dataUrlToInlineData(part.image_url.url);
      if (inline) parts.push({ inlineData: inline });
    } else if (part.type === "input_audio" && part.input_audio?.data) {
      const format = part.input_audio.format || "webm";
      parts.push({ inlineData: { mimeType: `audio/${format}`, data: part.input_audio.data } });
    }
  }
  return parts.length ? parts : [{ text: JSON.stringify(content) }];
}

async function callGeminiForOpenAiStyleRequest(originalBody: any): Promise<Response> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const messages: Array<{ role: string; content: string }> = originalBody.messages || [];
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");

  const geminiModel = gatewayModelToGemini(originalBody.model);
  const geminiBody: any = {
    contents: conversation.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: messageContentToGeminiParts(m.content),
    })),
    generationConfig: {
      temperature: originalBody.temperature ?? 0.7,
      maxOutputTokens: originalBody.max_tokens ?? originalBody.maxTokens ?? 4096,
    },
  };
  if (systemMessages.length > 0) {
    geminiBody.systemInstruction = {
      parts: [{ text: systemMessages.map((s) => s.content).join("\n\n") }],
    };
  }
  if (originalBody.response_format?.type === "json_object") {
    geminiBody.generationConfig.responseMimeType = "application/json";
  }
  if (originalBody.response_format?.type === "json_schema") {
    geminiBody.generationConfig.responseMimeType = "application/json";
    const schema = originalBody.response_format?.json_schema?.schema;
    if (schema && typeof schema === "object") {
      geminiBody.generationConfig.responseSchema = sanitizeForGemini(schema);
    }
  }

  if (Array.isArray(originalBody.tools) && originalBody.tools.length > 0) {
    geminiBody.tools = [{
      functionDeclarations: originalBody.tools
        .filter((t: any) => t?.type === "function" && t.function)
        .map((t: any) => ({
          name: t.function.name,
          description: t.function.description || "",
          parameters: sanitizeForGemini(t.function.parameters || { type: "object", properties: {} }),
        })),
    }];
    if (originalBody.tool_choice?.type === "function" && originalBody.tool_choice.function?.name) {
      geminiBody.toolConfig = {
        functionCallingConfig: { mode: "ANY", allowedFunctionNames: [originalBody.tool_choice.function.name] },
      };
    }
    if (geminiBody.generationConfig.responseMimeType) {
      delete geminiBody.generationConfig.responseMimeType;
    }
  }

  const modelChain = [
    geminiModel,
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-3-flash-preview",
  ].filter((m, i, a) => a.indexOf(m) === i);

  let resp!: Response;
  let lastErrText = "";
  let lastStatus = 0;
  outer: for (const tryModel of modelChain) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:generateContent?key=${apiKey}`;
      try {
        resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
        });
      } catch (e) {
        lastErrText = String((e as Error)?.message || e);
        lastStatus = 0;
        console.warn(`⚠️ Gemini ${tryModel} network error (attempt ${attempt + 1}/5) — ${lastErrText.slice(0, 140)}`);
        if (attempt < 4) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1) + Math.random() * 500));
        continue;
      }
      if (resp.ok) break outer;
      lastErrText = await resp.text();
      lastStatus = resp.status;
      if (resp.status === 404) {
        console.warn(`⚠️ Gemini ${tryModel} 404 — skipping to next model`);
        break;
      }
      const retryable = resp.status === 429 || resp.status >= 500;
      console.warn(`⚠️ Gemini ${tryModel} ${resp.status} (attempt ${attempt + 1}/5) — ${lastErrText.slice(0, 140)}`);
      if (!retryable) break outer;
      if (attempt < 4) {
        const base = resp.status === 503 ? 2500 : 1200;
        await new Promise((r) => setTimeout(r, base * (attempt + 1) + Math.random() * 800));
      }
    }
  }

  if (!resp.ok) {
    const overloaded = lastStatus === 503 || lastStatus === 429;
    const message = overloaded
      ? "AI engine is overloaded right now. Please wait ~15 seconds and try again."
      : `AI request failed (${lastStatus}). ${lastErrText.slice(0, 200)}`;
    return new Response(
      JSON.stringify({
        error: true,
        overloaded,
        message,
        _provider: "gemini-direct",
        _status: lastStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = await resp.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p.text || "").filter(Boolean).join("") || "";

  const functionCallPart = parts.find((p: any) => p.functionCall);
  const tool_calls = functionCallPart
    ? [{
        id: `call_${Date.now()}`,
        type: "function" as const,
        function: {
          name: functionCallPart.functionCall.name,
          arguments: typeof functionCallPart.functionCall.args === "string"
            ? functionCallPart.functionCall.args
            : JSON.stringify(functionCallPart.functionCall.args ?? {}),
        },
      }]
    : undefined;

  const openaiShape = {
    id: `gemini-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: geminiModel,
    choices: [
      {
        index: 0,
        message: tool_calls
          ? { role: "assistant", content: text, tool_calls }
          : { role: "assistant", content: text },
        finish_reason: tool_calls ? "tool_calls" : "stop",
      },
    ],
    usage: data.usageMetadata
      ? {
          prompt_tokens: data.usageMetadata.promptTokenCount || 0,
          completion_tokens: data.usageMetadata.candidatesTokenCount || 0,
          total_tokens: data.usageMetadata.totalTokenCount || 0,
        }
      : undefined,
    _provider: "gemini-direct",
  };
  return new Response(JSON.stringify(openaiShape), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function aiFetch(url: string, init?: RequestInit): Promise<Response> {
  if (url.includes(GEMINI_HOST)) {
    return await fetch(url, init);
  }

  let parsedBody: any = null;
  if (init?.body && typeof init.body === "string") {
    try { parsedBody = JSON.parse(init.body); } catch { /* non-JSON body */ }
  }
  if (!parsedBody) throw new Error("aiFetch: cannot build a Gemini request without a JSON body");
  return await callGeminiForOpenAiStyleRequest(parsedBody);
}
// ---- end inlined aiFetch ----

type Report = {
  reporter_role: "teacher" | "student";
  outcome: "completed" | "not_completed";
  flags: string[];
  notes: string | null;
};

const STATUS_VALUES = [
  "completed_clean",
  "completed_with_issues",
  "incomplete_student_tech",
  "incomplete_teacher_tech",
  "incomplete_both_tech",
  "incomplete_student_noshow",
  "incomplete_teacher_noshow",
  "incomplete_behavioral",
  "incomplete_other",
  "inconclusive",
] as const;
const FAULT_VALUES = ["none", "student", "teacher", "both", "platform", "unknown"] as const;

function heuristic(reports: Report[]) {
  const t = reports.find((r) => r.reporter_role === "teacher");
  const s = reports.find((r) => r.reporter_role === "student");
  const allCompleted = reports.length > 0 && reports.every((r) => r.outcome === "completed");
  const anyIncomplete = reports.some((r) => r.outcome === "not_completed");
  const hasFlag = (r: Report | undefined, key: string) =>
    !!r && r.flags.some((f) => f.toLowerCase().includes(key));

  const tStudentTech = hasFlag(t, "student_tech") || hasFlag(t, "student-tech");
  const sStudentTech = hasFlag(s, "tech") || hasFlag(s, "audio") || hasFlag(s, "video");
  const tTeacherTech = hasFlag(t, "teacher_tech") || hasFlag(t, "self_tech");
  const sTeacherTech = hasFlag(s, "teacher_tech") || hasFlag(s, "teacher-tech");
  const tNoShow = hasFlag(t, "no_show") || hasFlag(t, "absent");
  const sNoShow = hasFlag(s, "no_show") || hasFlag(s, "absent");

  if (allCompleted && reports.every((r) => r.flags.length === 0))
    return { status: "completed_clean", fault_party: "none", confidence: 0.95 };
  if (allCompleted) return { status: "completed_with_issues", fault_party: "none", confidence: 0.75 };

  if (anyIncomplete) {
    if ((tStudentTech || sStudentTech) && (tTeacherTech || sTeacherTech))
      return { status: "incomplete_both_tech", fault_party: "both", confidence: 0.7 };
    if (tStudentTech || sStudentTech)
      return { status: "incomplete_student_tech", fault_party: "student", confidence: 0.75 };
    if (tTeacherTech || sTeacherTech)
      return { status: "incomplete_teacher_tech", fault_party: "teacher", confidence: 0.75 };
    if (sNoShow) return { status: "incomplete_student_noshow", fault_party: "student", confidence: 0.8 };
    if (tNoShow) return { status: "incomplete_teacher_noshow", fault_party: "teacher", confidence: 0.8 };
    return { status: "incomplete_other", fault_party: "unknown", confidence: 0.4 };
  }
  return { status: "inconclusive", fault_party: "unknown", confidence: 0.3 };
}

async function aiVerdict(reports: Report[]) {
  if (!Deno.env.get("GEMINI_API_KEY")) return null;

  const system = `You are a senior classroom operations engineer reviewing post-lesson incident reports.
Decide what happened in the classroom. Choose ONE status and ONE fault_party from the allowed lists.
Be conservative: only blame a party when their own report or strong corroboration supports it.
Allowed status: ${STATUS_VALUES.join(", ")}
Allowed fault_party: ${FAULT_VALUES.join(", ")}
Return strict JSON: {"status","fault_party","confidence" (0-1),"summary" (<=240 chars),"recommended_action" (<=160 chars)}.`;

  const user = `Reports:\n${JSON.stringify(reports, null, 2)}`;

  try {
    const res = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("ai verdict failed", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const txt = data?.choices?.[0]?.message?.content;
    if (!txt) return null;
    const parsed = JSON.parse(txt);
    if (!STATUS_VALUES.includes(parsed.status)) return null;
    if (!FAULT_VALUES.includes(parsed.fault_party)) return null;
    return {
      status: parsed.status,
      fault_party: parsed.fault_party,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      summary: String(parsed.summary || "").slice(0, 240),
      recommended_action: String(parsed.recommended_action || "").slice(0, 160),
      model: "gemini-2.5-flash",
    };
  } catch (e) {
    console.error("ai verdict error", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { room_id } = await req.json().catch(() => ({}));
    if (!room_id || typeof room_id !== "string") {
      return new Response(JSON.stringify({ error: "room_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: reports, error } = await supabase
      .from("lesson_incident_reports")
      .select("reporter_role,outcome,flags,notes")
      .eq("room_id", room_id);

    if (error) throw error;
    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ skipped: "no_reports" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await aiVerdict(reports as Report[]);
    const base = heuristic(reports as Report[]);
    const verdict = ai ?? {
      ...base,
      summary: ai ? "" : "Auto-classified from incident flags (no AI).",
      recommended_action:
        base.fault_party === "none"
          ? "No action required."
          : "Review reports and follow up with the at-fault party.",
      model: null,
    };

    const { error: upErr } = await supabase
      .from("classroom_incident_verdicts")
      .upsert(
        {
          room_id,
          status: verdict.status,
          fault_party: verdict.fault_party,
          confidence: (verdict as any).confidence ?? null,
          summary: verdict.summary || null,
          recommended_action: verdict.recommended_action || null,
          reports_considered: reports,
          model: (verdict as any).model ?? null,
        },
        { onConflict: "room_id" },
      );
    if (upErr) throw upErr;

    // Give the verdict a real consequence: a confirmed teacher no-show (or
    // teacher-side tech failure) cancels the lesson and refunds the
    // student's credit, instead of just being stored as a display-only
    // badge. room_id here is class_bookings.id (see the RLS policy on
    // lesson_incident_reports) — interview rooms simply won't match and
    // are skipped.
    let refunded = false;
    if (verdict.fault_party === "teacher") {
      const { data: booking } = await supabase
        .from("class_bookings")
        .select("lesson_id")
        .eq("id", room_id)
        .maybeSingle();
      if (booking?.lesson_id) {
        const { data: refundResult, error: refundErr } = await supabase.rpc(
          "refund_lesson_credit_for_noshow",
          { p_lesson_id: booking.lesson_id, p_fault_party: verdict.fault_party },
        );
        if (refundErr) console.error("refund_lesson_credit_for_noshow failed", refundErr);
        refunded = !!refundResult;
      }
    }

    return new Response(JSON.stringify({ ok: true, verdict, refunded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classroom-incident-verdict error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
