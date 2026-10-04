// Higgsfield (Seedance 2.5) image-to-video client for edge functions. Same REST calls as the official
// @higgsfield/client SDK (POST /{model}, GET /requests/{id}/status), without the SDK's blocking poll loop
// (edge functions have a time limit, so the poller function checks once per call).
// The API key lives in the Supabase secrets; the value is never logged or returned.

const BASE = "https://api.higgsfield.ai";
export const HIGGSFIELD_MODEL = "bytedance/seedance-2.5/image-to-video";

/** Secret names we accept (value format: "key-id:key-secret"). */
const SECRET_NAMES = ["HF_CREDENTIALS", "HIGGSFIELD_CREDENTIALS", "HIGGSFIELD_API_KEY", "HF_KEY", "HIGGSFIELD_KEY"];

export class HiggsfieldError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** The configured credentials ("id:secret"), or throws a helpful error that lists the secret names (never values). */
export function higgsfieldCredentials(): string {
  for (const name of SECRET_NAMES) {
    const v = Deno.env.get(name);
    if (v && v.includes(":")) return v.trim();
  }
  const id = Deno.env.get("HIGGSFIELD_API_KEY_ID") ?? Deno.env.get("HF_API_KEY");
  const secret = Deno.env.get("HIGGSFIELD_API_KEY_SECRET") ?? Deno.env.get("HF_API_SECRET");
  if (id && secret) return `${id}:${secret}`;
  throw new HiggsfieldError(`Higgsfield credentials not found in Supabase secrets. Expected one of: ${SECRET_NAMES.join(", ")} (format key-id:key-secret).`, 503);
}

const headers = (credentials: string) => ({ Authorization: `Key ${credentials}`, "Content-Type": "application/json" });

/** Start an image-to-video request. SILENT: generate_audio is always false (recorded voices only). */
export async function startHiggsfield(credentials: string, prompt: string, imageUrl: string, seconds: number): Promise<string> {
  const res = await fetch(`${BASE}/${HIGGSFIELD_MODEL}`, {
    method: "POST",
    headers: headers(credentials),
    body: JSON.stringify({ image_url: imageUrl, prompt, duration: Math.min(30, Math.max(4, Math.round(seconds))), resolution: "720p", generate_audio: false }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new HiggsfieldError("Higgsfield rejected the credentials.", 401);
  if (res.status === 403) throw new HiggsfieldError("Not enough Higgsfield credits.", 402);
  if (!res.ok || !data?.request_id) {
    const detail = typeof data?.detail === "string" ? data.detail : JSON.stringify(data?.detail ?? data).slice(0, 300);
    throw new HiggsfieldError(`Higgsfield submit failed (${res.status}): ${detail}`, res.status === 422 || res.status === 400 ? 422 : 502);
  }
  return String(data.request_id);
}

export type HiggsfieldState =
  | { state: "rendering" }
  | { state: "failed"; error: string }
  | { state: "ready"; url: string };

export async function checkHiggsfield(credentials: string, requestId: string): Promise<HiggsfieldState> {
  const res = await fetch(`${BASE}/requests/${requestId}/status`, { headers: headers(credentials) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return res.status >= 500 ? { state: "rendering" } : { state: "failed", error: `status check failed (${res.status})` };
  const status = String(data?.status ?? "");
  if (status === "completed") {
    const url: string | undefined = data?.video?.url;
    return url ? { state: "ready", url } : { state: "failed", error: "Higgsfield completed without a video URL" };
  }
  if (status === "nsfw") return { state: "failed", error: "Higgsfield moderated this request (no video produced)" };
  if (status === "failed" || status === "canceled" || status === "cancelled") return { state: "failed", error: `Higgsfield request ${status}` };
  return { state: "rendering" };
}
