// Universal AI client (OpenAI-style messages interface) — Google AI Studio
// (Gemini direct) only, via GEMINI_API_KEY.
//
// Returns a normalized response shape that mirrors OpenAI chat completions.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

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
}

export interface AICallResult {
  text: string;
  provider: "gemini-direct";
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

/** Call AI via Google AI Studio (Gemini direct). */
export async function aiCallWithFailover(opts: AICallOptions): Promise<AICallResult> {
  if (!Deno.env.get("GEMINI_API_KEY")) {
    throw new Error("No AI provider configured (need GEMINI_API_KEY)");
  }
  const result = await callGeminiDirect(opts);
  console.log(`✅ AI ok via gemini-direct (tokens: ${result.usage?.totalTokens ?? "n/a"})`);
  return result;
}
