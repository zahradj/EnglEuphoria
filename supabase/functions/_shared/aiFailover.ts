// Universal AI Failover Client (OpenAI-style messages interface)
// PRIMARY: Google AI Studio (Gemini direct) — uses GEMINI_API_KEY
// BACKUP: Lovable AI Gateway — uses LOVABLE_API_KEY
//
// Drop-in replacement for fetch('https://ai.gateway.lovable.dev/...') calls.
// Returns a normalized response shape that mirrors OpenAI chat completions.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICallOptions {
  model?: string; // accepts 'google/gemini-2.5-flash', 'google/gemini-2.5-pro', or bare 'gemini-2.5-flash' etc.
  messages: AIChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  // Optional tool calling (only honored on Lovable Gateway path)
  tools?: any[];
  toolChoice?: any;
}

export interface AICallResult {
  text: string;
  provider: "gemini-direct" | "lovable-gateway";
  toolCalls?: any[];
  raw?: any;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

function normalizeGeminiModel(model?: string): string {
  if (!model) return "gemini-2.5-flash";
  // Strip provider prefix
  const bare = model.replace(/^google\//, "").replace(/^openai\//, "");
  if (bare.startsWith("gpt-5")) {
    // Map OpenAI requests to Gemini equivalents
    if (bare.includes("nano")) return "gemini-2.5-flash";
    if (bare.includes("mini")) return "gemini-2.5-flash";
    return "gemini-2.5-pro";
  }
  return bare;
}

function normalizeGatewayModel(model?: string): string {
  if (!model) return "google/gemini-2.5-flash";
  if (model.startsWith("google/") || model.startsWith("openai/")) return model;
  return `google/${model}`;
}

async function callGeminiDirect(opts: AICallOptions): Promise<AICallResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const model = normalizeGeminiModel(opts.model);
  const systemMessages = opts.messages.filter((m) => m.role === "system");
  const conversation = opts.messages.filter((m) => m.role !== "system");

  const body: any = {
    contents: conversation.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
    },
  };
  if (systemMessages.length > 0) {
    body.systemInstruction = { parts: [{ text: systemMessages.map((s) => s.content).join("\n\n") }] };
  }
  if (opts.responseFormat === "json") {
    body.generationConfig.responseMimeType = "application/json";
  }

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`gemini-direct ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error("gemini-direct: no candidates returned");
  if (candidate.finishReason === "SAFETY") throw new Error("gemini-direct: blocked by safety filters");
  const text = candidate.content?.parts?.[0]?.text || "";
  const usage = data.usageMetadata
    ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      }
    : undefined;
  return { text, provider: "gemini-direct", raw: data, usage };
}

async function callLovableGateway(opts: AICallOptions): Promise<AICallResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const body: any = {
    model: normalizeGatewayModel(opts.model),
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  };
  if (opts.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }
  if (opts.tools) body.tools = opts.tools;
  if (opts.toolChoice) body.tool_choice = opts.toolChoice;

  const resp = await fetch(LOVABLE_GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    // Surface 429 / 402 distinctly so callers can render proper toasts
    throw new Error(`lovable-gateway ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  const choice = data.choices?.[0];
  const text = choice?.message?.content || "";
  const toolCalls = choice?.message?.tool_calls;
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      }
    : undefined;
  return { text, provider: "lovable-gateway", toolCalls, raw: data, usage };
}

/**
 * Call AI with automatic failover.
 * Order: Gemini direct (primary) → Lovable Gateway (backup).
 * If GEMINI_API_KEY is missing, goes straight to gateway.
 */
export async function aiCallWithFailover(opts: AICallOptions): Promise<AICallResult> {
  const hasGemini = !!Deno.env.get("GEMINI_API_KEY");
  const hasLovable = !!Deno.env.get("LOVABLE_API_KEY");

  if (!hasGemini && !hasLovable) {
    throw new Error("No AI provider configured (need GEMINI_API_KEY)");
  }

  // ─── HARD GATEWAY-BYPASS (PERMANENT) ───
  // If GEMINI_API_KEY is present, the Lovable Gateway is forbidden at runtime
  // — even for tool-calling. Errors must propagate so callers surface them
  // instead of silently spending Lovable AI credits.
  if (hasGemini) {
    const result = await callGeminiDirect(opts);
    console.log(`✅ AI ok via gemini-direct (tokens: ${result.usage?.totalTokens ?? "n/a"})`);
    return result;
  }

  // No Gemini key configured → dev sandbox fallback to gateway.
  const result = await callLovableGateway(opts);
  console.log(`✅ AI ok via lovable-gateway (no GEMINI_API_KEY) (tokens: ${result.usage?.totalTokens ?? "n/a"})`);
  return result;
}
