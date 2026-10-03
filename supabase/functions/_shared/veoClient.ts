// Gemini (Google AI Studio) Veo text/image-to-video client, using the same GEMINI_API_KEY secret as the
// image generator (see googleImageClient.ts). Veo runs as a long operation: `startVeo` returns an operation
// name straight away; `checkVeo` is polled until it is done and hands back the finished clip's download URI.

const BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Tried in order; the first one this key can use wins (availability differs per key / plan). */
const MODELS = ["veo-3.0-fast-generate-001", "veo-3.0-generate-001", "veo-2.0-generate-001"];

import { NEGATIVE_PROMPT } from "./videoPolicy.ts";

export class VeoError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function toBase64(url: string): Promise<{ bytesBase64Encoded: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new VeoError(`could not fetch the start image (${res.status})`, 400);
  const mimeType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];
  const bytes = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { bytesBase64Encoded: btoa(bin), mimeType };
}

/** Start a clip. Returns "<model>::<operation name>" so the poller knows what to ask. */
export async function startVeo(apiKey: string, prompt: string, imageUrl?: string): Promise<string> {
  // `prompt` must already be the policy-approved final prompt (finalVideoPrompt in videoPolicy.ts).
  const image = imageUrl ? await toBase64(imageUrl) : undefined;
  let lastError = "no Veo model available";
  let lastStatus = 502;
  for (const model of MODELS) {
    const send = (parameters: Record<string, unknown>) => fetch(`${BASE}/models/${model}:predictLongRunning`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ instances: [{ prompt, ...(image ? { image } : {}) }], parameters }),
    });
    let res = await send({ aspectRatio: "16:9", negativePrompt: NEGATIVE_PROMPT });
    let data = await res.json().catch(() => ({}));
    // A model that does not take a negative prompt: retry once without it (the safety suffix is still in the prompt).
    if (res.status === 400 && /negative/i.test(data?.error?.message ?? "")) {
      res = await send({ aspectRatio: "16:9" });
      data = await res.json().catch(() => ({}));
    }
    if (res.ok && data?.name) return `${model}::${data.name}`;
    lastError = data?.error?.message ?? `Veo ${model} failed (${res.status})`;
    lastStatus = res.status;
    // 404 / 400 "model not found or not supported" -> try the next model; anything else (quota, auth) -> stop.
    if (res.status !== 404 && !(res.status === 400 && /not (found|supported)/i.test(lastError))) break;
  }
  throw new VeoError(lastError, lastStatus);
}

export type VeoState =
  | { state: "rendering" }
  | { state: "failed"; error: string }
  | { state: "ready"; uri: string };

/** Check an operation started by startVeo (`operation` is the part after "<model>::"). */
export async function checkVeo(apiKey: string, operation: string): Promise<VeoState> {
  const res = await fetch(`${BASE}/${operation}`, { headers: { "x-goog-api-key": apiKey } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { state: "failed", error: data?.error?.message ?? `status check failed (${res.status})` };
  if (!data?.done) return { state: "rendering" };
  if (data?.error) return { state: "failed", error: data.error.message ?? "Veo failed" };
  const resp = data?.response?.generateVideoResponse;
  const uri: string | undefined = resp?.generatedSamples?.[0]?.video?.uri ?? data?.response?.videos?.[0]?.uri;
  if (!uri) {
    const why = resp?.raiMediaFilteredReasons?.[0] ?? JSON.stringify(data?.response ?? {}).slice(0, 300);
    return { state: "failed", error: `Veo returned no video (${why})` };
  }
  return { state: "ready", uri };
}

/** Download the finished clip (the URI needs the API key). */
export async function downloadVeo(apiKey: string, uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri, { headers: { "x-goog-api-key": apiKey }, redirect: "follow" });
  if (!res.ok) throw new VeoError(`could not download the clip (${res.status})`, 502);
  return await res.arrayBuffer();
}
