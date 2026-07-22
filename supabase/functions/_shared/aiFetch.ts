// Drop-in fetch() replacement that adds automatic AI provider failover.
//
// USAGE: Replace `fetch(url, init)` with `aiFetch(url, init)` for any call
// targeting the Lovable AI Gateway or Google Generative Language API.
//
// Behaviour:
//  - If the call targets ai.gateway.lovable.dev and fails with 429/402/5xx
//    (or throws), automatically retries via Gemini direct using the same
//    OpenAI-style request body (translated).
//  - If the call targets generativelanguage.googleapis.com and fails with
//    429/5xx (or throws), automatically retries via the Lovable AI Gateway.
//  - The returned Response always mirrors the SHAPE the caller expected
//    (OpenAI-style if they called the gateway, Gemini-style if they called
//    Gemini direct), so existing parsing code does not need to change.

const LOVABLE_HOST = "ai.gateway.lovable.dev";
const GEMINI_HOST = "generativelanguage.googleapis.com";
const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

function isRetryable(status: number): boolean {
  return status === 429 || status === 402 || status >= 500;
}

function gatewayModelToGemini(model?: string): string {
  if (!model) return "gemini-2.5-flash";
  const bare = model.replace(/^google\//, "").replace(/^openai\//, "");
  if (bare.startsWith("gpt-5")) {
    if (bare.includes("nano") || bare.includes("mini")) return "gemini-2.5-flash";
    return "gemini-2.5-pro";
  }
  // gemini-3-flash-preview / gemini-3-pro-preview etc → fall back to a stable Gemini-direct model
  if (bare.includes("flash")) return "gemini-2.5-flash";
  if (bare.includes("pro")) return "gemini-2.5-pro";
  return "gemini-2.5-flash";
}

function geminiModelToGateway(geminiModel: string): string {
  if (geminiModel.includes("pro")) return "google/gemini-2.5-pro";
  return "google/gemini-2.5-flash";
}

// Recursively strip JSON-Schema fields Gemini's REST API does not accept
// (`additionalProperties`, `$schema`, `definitions`, `$ref`). This lets us
// reuse the same OpenAI-style tool schemas across both providers.
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

// Convert an OpenAI-style request -> Gemini direct, call it, then translate
// the Gemini response back into an OpenAI-style Response so callers don't break.
async function fallbackGatewayToGemini(originalBody: any): Promise<Response> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Failover failed: GEMINI_API_KEY not configured");


  const messages: Array<{ role: string; content: string }> = originalBody.messages || [];
  const systemMessages = messages.filter((m) => m.role === "system");
  const conversation = messages.filter((m) => m.role !== "system");

  const geminiModel = gatewayModelToGemini(originalBody.model);
  const geminiBody: any = {
    contents: conversation.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
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

  // ─── Tool / function-calling translation (OpenAI → Gemini) ───
  // Many of our edge functions use `tools` + `tool_choice` to force
  // structured JSON output. Translate that into Gemini's functionDeclarations
  // so the failover path produces the same shape the caller expects.
  let forcedToolName: string | null = null;
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
      forcedToolName = originalBody.tool_choice.function.name;
      geminiBody.toolConfig = {
        functionCallingConfig: { mode: "ANY", allowedFunctionNames: [forcedToolName] },
      };
    }
    // Tool-mode + responseMimeType=json are mutually exclusive in Gemini.
    if (geminiBody.generationConfig.responseMimeType) {
      delete geminiBody.generationConfig.responseMimeType;
    }
  }

  // Retry with exponential backoff + model fallback on 404/429/5xx.
  // Order matters: try fastest stable models first, then larger ones, then preview.
  // `gemini-2.0-flash` removed (returns 404 NOT_FOUND — model retired).
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
      // 404 = model retired/unknown → skip immediately to next model.
      if (resp.status === 404) {
        console.warn(`⚠️ Gemini ${tryModel} 404 — skipping to next model`);
        break;
      }
      const retryable = resp.status === 429 || resp.status >= 500;
      console.warn(`⚠️ Gemini ${tryModel} ${resp.status} (attempt ${attempt + 1}/5) — ${lastErrText.slice(0, 140)}`);
      if (!retryable) break outer;
      // Longer backoff with jitter for 503 (model overload).
      if (attempt < 4) {
        const base = resp.status === 503 ? 2500 : 1200;
        await new Promise((r) => setTimeout(r, base * (attempt + 1) + Math.random() * 800));
      }
    }
    // try next model on persistent retryable error
  }

  if (!resp.ok) {
    // Return a graceful 200 with structured error payload so callers using
    // handleAIResponse() can surface a friendly overload toast instead of
    // throwing FunctionsHttpError → 500.
    const overloaded = lastStatus === 503 || lastStatus === 429;
    const message = overloaded
      ? "AI engine is overloaded right now. Please wait ~15 seconds and try again."
      : `AI request failed (${lastStatus}). ${lastErrText.slice(0, 200)}`;
    return new Response(
      JSON.stringify({
        error: true,
        overloaded,
        message,
        _provider: "gemini-direct-fallback",
        _status: lastStatus,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = await resp.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p.text || "").filter(Boolean).join("") || "";

  // Translate Gemini functionCall → OpenAI tool_calls so callers reading
  // `choices[0].message.tool_calls[0].function.arguments` keep working.
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
    id: `gemini-fallback-${Date.now()}`,
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
    _provider: "gemini-direct-fallback",
  };
  return new Response(JSON.stringify(openaiShape), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Convert a Gemini-direct request -> Lovable Gateway, call it, then translate
// the gateway response back into a Gemini-shaped Response.
async function fallbackGeminiToGateway(originalUrl: string, originalBody: any): Promise<Response> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("Failover failed: LOVABLE_API_KEY not configured");

  // Extract model from URL (.../models/{model}:generateContent)
  const m = originalUrl.match(/models\/([^:/?]+)/);
  const geminiModel = m?.[1] || "gemini-2.5-flash";
  const gatewayModel = geminiModelToGateway(geminiModel);

  const messages: Array<{ role: string; content: string }> = [];
  if (originalBody.systemInstruction?.parts) {
    const sysText = originalBody.systemInstruction.parts.map((p: any) => p.text).join("\n");
    if (sysText) messages.push({ role: "system", content: sysText });
  }
  for (const c of originalBody.contents || []) {
    const role = c.role === "model" ? "assistant" : "user";
    const text = (c.parts || []).map((p: any) => p.text || "").join("\n");
    messages.push({ role, content: text });
  }

  const gw: any = {
    model: gatewayModel,
    messages,
    temperature: originalBody.generationConfig?.temperature ?? 0.7,
    max_tokens: originalBody.generationConfig?.maxOutputTokens ?? 4096,
  };
  if (originalBody.generationConfig?.responseMimeType === "application/json") {
    gw.response_format = { type: "json_object" };
  }

  const resp = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(gw),
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Failover (lovable-gateway) failed: ${resp.status} ${errText}`);
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content || "";
  // Repackage as Gemini generateContent shape
  const geminiShape = {
    candidates: [
      {
        content: { parts: [{ text }], role: "model" },
        finishReason: "STOP",
        index: 0,
      },
    ],
    usageMetadata: data.usage
      ? {
          promptTokenCount: data.usage.prompt_tokens || 0,
          candidatesTokenCount: data.usage.completion_tokens || 0,
          totalTokenCount: data.usage.total_tokens || 0,
        }
      : undefined,
    _provider: "lovable-gateway-fallback",
  };
  return new Response(JSON.stringify(geminiShape), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function aiFetch(url: string, init?: RequestInit): Promise<Response> {
  const isLovable = url.includes(LOVABLE_HOST);
  const isGemini = url.includes(GEMINI_HOST);
  const hasGemini = !!Deno.env.get("GEMINI_API_KEY");
  const hasLovable = !!Deno.env.get("LOVABLE_API_KEY");

  let parsedBody: any = null;
  if (init?.body && typeof init.body === "string") {
    try { parsedBody = JSON.parse(init.body); } catch { /* non-JSON body */ }
  }

  // ─── HARD GATEWAY-BYPASS (PERMANENT) ───
  // Lovable AI Gateway must NEVER be used at runtime when GEMINI_API_KEY is
  // configured. All runtime generation routes to Gemini direct. No fallback
  // to the gateway — credit consumption is forbidden by project policy.
  if (isLovable) {
    if (!hasGemini) {
      // Dev sandbox without Gemini configured: allow gateway as a last resort.
      if (!hasLovable) throw new Error("No AI provider configured (GEMINI_API_KEY required)");
      return await fetch(url, init);
    }
    if (!parsedBody) throw new Error("aiFetch: cannot route Lovable Gateway request to Gemini without a JSON body");
    return await fallbackGatewayToGemini(parsedBody);
  }

  // Caller targeted Gemini directly — try it, optionally fall back to gateway
  // only if GEMINI is unavailable (key rejected) AND gateway is configured.
  let primaryError: unknown = null;
  try {
    const response = await fetch(url, init);
    if (response.ok || !isRetryable(response.status)) return response;
    const errBody = await response.text();
    primaryError = new Error(`Gemini ${response.status}: ${errBody}`);
    console.warn(`⚠️ Gemini direct returned ${response.status}`);
  } catch (err) {
    primaryError = err;
    console.warn(`⚠️ Gemini direct threw: ${err instanceof Error ? err.message : err}`);
  }

  // Only use the Lovable Gateway as a backup when Gemini is genuinely missing
  // (no key configured). Quota/5xx errors must surface to the caller, not
  // silently spend Lovable AI credits.
  if (isGemini && !hasGemini && hasLovable && parsedBody) {
    const fb = await fallbackGeminiToGateway(url, parsedBody);
    console.log("✅ Used Lovable Gateway (no GEMINI_API_KEY configured)");
    return fb;
  }
  throw primaryError;
}
