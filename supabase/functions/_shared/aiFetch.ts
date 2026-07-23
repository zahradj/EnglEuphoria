// Drop-in fetch() replacement that always routes AI chat completions to
// Google AI Studio (Gemini) direct — no third-party AI gateway involved.
//
// USAGE: Replace `fetch(url, init)` with `aiFetch(url, init)` for any AI
// chat-completion call.
//
// Behaviour:
//  - If `url` targets generativelanguage.googleapis.com, the request is
//    passed straight through to Gemini as-is (the caller already built a
//    Gemini-native body).
//  - For any other `url` (existing call sites pass an OpenAI-style
//    "/v1/chat/completions" URL — the literal string is now just an inert
//    marker, never actually fetched), the OpenAI-style request body is
//    translated to Gemini's format, sent to Gemini direct, and the response
//    is translated back into an OpenAI-shaped Response so existing parsing
//    code doesn't need to change.
//  - Retries with exponential backoff and falls through a chain of stable
//    Gemini models on 429/5xx/404.

const GEMINI_HOST = "generativelanguage.googleapis.com";

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

// Parses a `data:<mime>;base64,<data>` URI into Gemini's inlineData shape.
// Returns null if `url` isn't a data: URI (e.g. a real http(s) image URL —
// not supported here, same as before this translation layer existed).
function dataUrlToInlineData(url: string): { mimeType: string; data: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(url);
  if (!m) return null;
  return { mimeType: m[1], data: m[2] };
}

// OpenAI-style message `content` can be a plain string, or an array of parts
// (`{type:"text",...}`, `{type:"image_url",image_url:{url}}`,
// `{type:"input_audio",input_audio:{data,format}}`) for multimodal messages.
// Translate whichever shape we're given into Gemini's `parts` array.
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

// Convert an OpenAI-style request -> Gemini direct, call it, then translate
// the Gemini response back into an OpenAI-style Response so callers don't break.
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

  // ─── Tool / function-calling translation (OpenAI → Gemini) ───
  // Many of our edge functions use `tools` + `tool_choice` to force
  // structured JSON output. Translate that into Gemini's functionDeclarations
  // so the response shape stays consistent for callers.
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
        _provider: "gemini-direct",
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

// Translate an OpenAI-style streaming request -> Gemini's SSE streaming
// endpoint, re-emitting each chunk as an OpenAI-shaped
// `data: {"choices":[{"delta":{"content":"..."}}]}\n\n` line so existing
// consumer code (written against OpenAI's streaming format) keeps working
// unchanged. Ends with `data: [DONE]\n\n`, matching what callers already
// check for.
async function streamGeminiForOpenAiStyleRequest(originalBody: any): Promise<Response> {
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
    geminiBody.systemInstruction = { parts: [{ text: systemMessages.map((s) => s.content).join("\n\n") }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const upstream = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(geminiBody),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: true, message: `Gemini stream failed (${upstream.status}): ${errText.slice(0, 200)}` }),
      { status: upstream.status || 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const translated = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const chunk = JSON.parse(line.slice(6));
              const text = chunk.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";
              if (text) {
                const openaiChunk = { choices: [{ delta: { content: text } }] };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
              }
            } catch { /* skip malformed chunk */ }
          }
        }
      } catch (e) {
        console.error("Gemini stream read error", e);
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(translated, { status: 200, headers: { "Content-Type": "text/event-stream" } });
}

export async function aiFetch(url: string, init?: RequestInit): Promise<Response> {
  // Caller built a Gemini-native request (their own URL + key) — pass it
  // straight through, no translation needed.
  if (url.includes(GEMINI_HOST)) {
    return await fetch(url, init);
  }

  // Anything else is an OpenAI-style "/v1/chat/completions" call (the URL
  // string itself is never fetched — it's only used by existing call sites
  // to build the request body shape). Translate and call Gemini direct.
  let parsedBody: any = null;
  if (init?.body && typeof init.body === "string") {
    try { parsedBody = JSON.parse(init.body); } catch { /* non-JSON body */ }
  }
  if (!parsedBody) throw new Error("aiFetch: cannot build a Gemini request without a JSON body");
  if (parsedBody.stream === true) return await streamGeminiForOpenAiStyleRequest(parsedBody);
  return await callGeminiForOpenAiStyleRequest(parsedBody);
}
