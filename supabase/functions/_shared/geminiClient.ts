// Shared AI Client for Edge Functions
// Google AI Studio (Gemini direct via GEMINI_API_KEY) only.

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

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
  provider?: 'gemini-direct';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
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

export async function callGemini(options: GeminiOptions): Promise<GeminiResponse> {
  if (!Deno.env.get('GEMINI_API_KEY')) {
    throw new Error('No AI provider configured (GEMINI_API_KEY required)');
  }
  const result = await callGeminiDirect(options);
  console.log(`✅ AI via gemini-direct (tokens: ${result.usage?.totalTokens ?? 'n/a'})`);
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
