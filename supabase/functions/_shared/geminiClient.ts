// Shared AI Client for Edge Functions
// PRIMARY: Google AI Studio (Gemini direct via GEMINI_API_KEY)
// BACKUP: Lovable AI Gateway (LOVABLE_API_KEY)
// Automatic failover when primary returns 429/402/5xx or throws.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const LOVABLE_GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GeminiOptions {
  model?: 'gemini-2.5-flash' | 'gemini-2.5-pro';
  systemInstruction?: string;
  messages: GeminiMessage[];
  maxTokens?: number;
  temperature?: number;
  responseType?: 'text' | 'json';
}

export interface GeminiResponse {
  text: string;
  provider?: 'gemini-direct' | 'lovable-gateway';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Map our internal Gemini model names to Lovable Gateway model identifiers
function mapToGatewayModel(geminiModel: string): string {
  switch (geminiModel) {
    case 'gemini-2.5-pro':
    case 'gemini-1.5-pro':
      return 'google/gemini-2.5-pro';
    case 'gemini-2.5-flash':
    case 'gemini-1.5-flash':
    default:
      return 'google/gemini-2.5-flash';
  }
}

async function callGeminiDirect(options: GeminiOptions): Promise<GeminiResponse> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const {
    model: rawModel = 'gemini-2.5-flash',
    systemInstruction,
    messages,
    maxTokens = 2048,
    temperature = 0.7,
    responseType = 'text',
  } = options;
  // Map retired ids to current equivalents.
  const model =
    rawModel === ('gemini-1.5-flash' as string) ? 'gemini-2.5-flash'
    : rawModel === ('gemini-1.5-pro' as string) ? 'gemini-2.5-pro'
    : rawModel;

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const requestBody: any = {
    contents: messages,
    generationConfig: { maxOutputTokens: maxTokens, temperature },
  };
  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (responseType === 'json') {
    requestBody.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }
  const candidate = data.candidates[0];
  if (candidate.finishReason === 'SAFETY') {
    throw new Error('Response blocked by safety filters');
  }
  const text = candidate.content?.parts?.[0]?.text || '';
  const usage = data.usageMetadata
    ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      }
    : undefined;
  return { text, usage, provider: 'gemini-direct' };
}

async function callLovableGateway(options: GeminiOptions): Promise<GeminiResponse> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

  const {
    model = 'gemini-2.5-flash',
    systemInstruction,
    messages,
    maxTokens = 2048,
    temperature = 0.7,
    responseType = 'text',
  } = options;

  // Convert Gemini messages -> OpenAI-style messages
  const openAIMessages: Array<{ role: string; content: string }> = [];
  if (systemInstruction) {
    openAIMessages.push({ role: 'system', content: systemInstruction });
  }
  for (const m of messages) {
    openAIMessages.push({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.parts.map((p) => p.text).join('\n'),
    });
  }

  const body: any = {
    model: mapToGatewayModel(model),
    messages: openAIMessages,
    max_tokens: maxTokens,
    temperature,
  };
  if (responseType === 'json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(LOVABLE_GATEWAY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable Gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const usage = data.usage
    ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      }
    : undefined;
  return { text, usage, provider: 'lovable-gateway' };
}

export async function callGemini(options: GeminiOptions): Promise<GeminiResponse> {
  const hasGemini = !!Deno.env.get('GEMINI_API_KEY');
  const hasLovable = !!Deno.env.get('LOVABLE_API_KEY');

  if (!hasGemini && !hasLovable) {
    throw new Error('No AI provider configured (GEMINI_API_KEY required)');
  }

  // ─── HARD GATEWAY-BYPASS (PERMANENT) ───
  // Lovable AI Gateway is forbidden at runtime when GEMINI_API_KEY is set.
  if (hasGemini) {
    const result = await callGeminiDirect(options);
    console.log(`✅ AI via gemini-direct (tokens: ${result.usage?.totalTokens ?? 'n/a'})`);
    return result;
  }

  // Dev sandbox without Gemini configured.
  const result = await callLovableGateway(options);
  console.log(`✅ AI via lovable-gateway (no GEMINI_API_KEY) (tokens: ${result.usage?.totalTokens ?? 'n/a'})`);
  return result;
}

// Helper to convert OpenAI-style messages to Gemini format
export function convertToGeminiMessages(
  messages: Array<{ role: string; content: string }>
): GeminiMessage[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
}

// Extract system message from OpenAI-style messages
export function extractSystemMessage(
  messages: Array<{ role: string; content: string }>
): string | undefined {
  const systemMessage = messages.find((m) => m.role === 'system');
  return systemMessage?.content;
}

// Parse JSON from Gemini response (handles markdown code blocks)
export function parseGeminiJson<T>(text: string): T {
  let jsonStr = text.trim();
  if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
  else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
  if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
  return JSON.parse(jsonStr.trim());
}
