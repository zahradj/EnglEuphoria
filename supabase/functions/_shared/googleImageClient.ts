// Shared client for AI image generation.
// Calls Google's Generative Language API directly using GEMINI_API_KEY.
// This bypasses the Lovable AI Gateway entirely so it does not consume
// Lovable AI credits. The legacy `imagen-3.0-generate-001:predict`
// endpoint has been retired by Google — do not reintroduce it.

// Nano Banana family on Google AI Studio.
// Primary: Nano Banana Pro (gemini-3-pro-image-preview) — flagship image model.
// Fallback: Nano Banana 1 (gemini-2.5-flash-image) if Pro is unavailable on the key.
const PRIMARY_MODEL = "gemini-3-pro-image-preview";
const FALLBACK_MODEL = "gemini-2.5-flash-image";
const endpointFor = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const QUALITY_DIRECTIVE = [
  "[IMAGE QUALITY BAR — STRICT]",
  "Create a polished, premium educational illustration with crisp clean edges, confident linework, smooth anti-aliased shapes, balanced composition, strong silhouette, and clear focal subject.",
  "Use rich but controlled colors, clean lighting, and professional children's-book / classroom-ready finish.",
  "Avoid weak draft output: no blurry details, no muddy colors, no pixelation, no sketchy unfinished marks, no distorted anatomy, no warped faces, no clutter, no low-resolution look, no text, no watermark.",
].join("\n");

export class GoogleImageError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export interface GoogleImageResult {
  bytes: Uint8Array;
  contentType: string;
  /** data:<mime>;base64,<...> — convenient for callers that need a data URL */
  dataUrl: string;
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * Generate a single image via Google Generative Language API (Gemini).
 * Throws GoogleImageError with an appropriate HTTP status on failure.
 * Name preserved for backwards compatibility with existing callers.
 */
export async function generateGoogleImage(prompt: string): Promise<GoogleImageResult> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new GoogleImageError("GEMINI_API_KEY is not configured", 500);
  }
  if (!prompt || !prompt.trim()) {
    throw new GoogleImageError("Prompt is required", 400);
  }

  const qualityPrompt = ensureQualityDirective(prompt);

  // Try the full prompt; if Gemini returns NO_IMAGE (refusal / safety / no-output),
  // retry with a progressively simpler prompt instead of failing the whole call.
  const attempts: string[] = [qualityPrompt];
  const simplified = simplifyPrompt(qualityPrompt);
  if (simplified && simplified !== qualityPrompt) attempts.push(simplified);
  attempts.push(buildQualityFallbackPrompt(qualityPrompt));

  // Nano Banana (Gemini) is the SOLE provider for image generation.
  // No Lovable Gateway fallback — if Gemini fails, surface the error.
  let lastReason = "no image";
  let lastStatus = 502;
  for (const p of attempts) {
    try {
      return await callGemini(p, apiKey);
    } catch (e) {
      const err = e as GoogleImageError;
      lastReason = err.message;
      lastStatus = err.status;
      // Hard-fail on auth/rate errors — retrying simpler prompts won't help.
      if (err.status === 429 || err.status === 401 || err.status === 403 || err.status === 400) {
        throw err;
      }
      console.warn(`Nano Banana NO_IMAGE — retrying with simpler prompt. Reason: ${lastReason.slice(0, 120)}`);
    }
  }
  throw new GoogleImageError(`Nano Banana failed after ${attempts.length} attempts: ${lastReason}`, lastStatus);
}

function ensureQualityDirective(prompt: string): string {
  const trimmed = prompt.trim();
  if (trimmed.includes("[IMAGE QUALITY BAR")) return trimmed;
  return `${trimmed}\n\n${QUALITY_DIRECTIVE}`;
}

function simplifyPrompt(p: string): string {
  // Keep subject/style/quality anchors while removing long lower-priority context.
  const stripped = p.replace(/\s+/g, " ").trim();
  const subject = extractSubject(stripped);
  const style = extractStyleHint(stripped);
  return [
    `Create one premium, kid-safe educational image of ${subject}.`,
    style,
    "Crisp clean linework, polished finished illustration, balanced centered composition, clear silhouette, vibrant controlled colors, white or simple background, no text, no watermark.",
  ].filter(Boolean).join(" ").slice(0, 900);
}

function extractSubject(p: string): string {
  const primary = p.match(/PRIMARY SUBJECT[^:]*:\s*"?([^".\n]{2,120})"?/i)?.[1];
  const vocab = p.match(/focal word:\s*"([^"]{2,80})"/i)?.[1];
  const concept = p.match(/Concept to teach:\s*"([^"]{2,80})"/i)?.[1];
  const generic = p.match(/(?:of|showing|depicting|:)\s+([^.\n]{3,100})/i)?.[1];
  return (primary || vocab || concept || generic || p.slice(0, 90)).trim();
}

function extractStyleHint(p: string): string {
  const m = p.match(/STRICT ART STYLE\s*[—-]\s*([^.]*(?:\.[^.]*){0,2})/i);
  if (m?.[1]) return `Style: ${m[1].trim()}`;
  if (/kawaii|chibi/i.test(p)) return "Style: polished kawaii chibi 2D illustration, rounded shapes, clean outlines, soft pastel palette.";
  if (/comic|cartoon/i.test(p)) return "Style: polished modern 2D cartoon/comic illustration, bold clean outlines, expressive friendly character design.";
  if (/anime|manga/i.test(p)) return "Style: polished age-appropriate 2D anime/manga illustration with clean linework and controlled shading.";
  if (/cut-paper|collage/i.test(p)) return "Style: polished cut-paper collage illustration with clean layered paper texture.";
  if (/sticker/i.test(p)) return "Style: polished die-cut sticker illustration with clean outline and crisp edges.";
  return "Style: polished child-friendly 2D educational illustration.";
}

function buildQualityFallbackPrompt(prompt: string): string {
  const subject = extractSubject(prompt);
  const style = extractStyleHint(prompt);
  return [
    "Create ONE finished, high-quality educational image for children.",
    `Primary subject: ${subject}. The subject must be large, centered, clear, and easy to recognize.`,
    style,
    "Professional classroom-ready finish: crisp anti-aliased edges, clean confident lines, smooth color fills, neat shading, strong silhouette, uncluttered white or simple background.",
    "No text, no watermark, no extra subjects, no blur, no muddy colors, no distorted faces or limbs, no unfinished sketch look.",
  ].join(" ");
}

async function callGemini(prompt: string, apiKey: string): Promise<GoogleImageResult> {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let res: Response | null = null;
  let lastErrorText = "";
  for (const model of models) {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      res = await fetch(`${endpointFor(model)}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      });

      if (res.ok || !RETRYABLE_STATUSES.has(res.status) || attempt === 4) break;
      lastErrorText = await res.text();
      console.warn(`Nano Banana (${model}) ${res.status} (attempt ${attempt}/4) — ${lastErrorText.slice(0, 180)}`);
      await delay(400 * attempt * attempt);
    }
    // If Pro returns 404 (not enabled) or 400 (model unknown for key), drop to fallback model.
    if (res && (res.status === 404 || res.status === 400) && model === PRIMARY_MODEL) {
      lastErrorText = await res.text().catch(() => "");
      console.warn(`Nano Banana Pro unavailable (${res.status}) — falling back to ${FALLBACK_MODEL}. ${lastErrorText.slice(0, 160)}`);
      continue;
    }
    break;
  }

  if (!res || !res.ok) {
    const txt = lastErrorText || (res ? await res.text() : "No response");
    console.error("Google Gemini image error", res?.status, txt.slice(0, 500));
    if (res?.status === 429) throw new GoogleImageError("Rate limited by Google. Please retry shortly.", 429);
    if (res?.status === 401 || res?.status === 403) throw new GoogleImageError("GEMINI_API_KEY rejected by Google.", 401);
    if (res?.status === 400) throw new GoogleImageError(`Bad request: ${txt.slice(0, 200)}`, 400);
    throw new GoogleImageError(`Image generation failed: ${txt.slice(0, 200)}`, 502);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  let inline: { mimeType?: string; data?: string } | undefined;
  for (const p of parts) {
    const cand = p?.inlineData ?? p?.inline_data;
    if (cand?.data) {
      inline = { mimeType: cand.mimeType ?? cand.mime_type, data: cand.data };
      break;
    }
  }

  if (!inline?.data) {
    const finishReason = data?.candidates?.[0]?.finishReason ?? "UNKNOWN";
    console.error(`Gemini: no inline image (finishReason=${finishReason})`, JSON.stringify(data).slice(0, 300));
    throw new GoogleImageError(`Invalid response from Gemini (no image, finishReason=${finishReason})`, 502);
  }

  const contentType = inline.mimeType || "image/png";
  const bytes = b64ToBytes(inline.data);
  const dataUrl = `data:${contentType};base64,${inline.data}`;
  return { bytes, contentType, dataUrl };
}

