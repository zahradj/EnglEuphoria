// Storybook image resolver — turns raw image_prompt strings into hosted PNG URLs.
// Runs at the tail of generate-storybook before the payload is returned.
// Uses the shared Gemini direct client (project rule: never Lovable Gateway at runtime).

import { generateGoogleImage, GoogleImageError } from "../_shared/googleImageClient.ts";

const BUCKET = "storybook-images";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export interface RawPage {
  page_number: number;
  text: string;
  image_prompt: string;
  image_url: string;
  audio_url: string;
  [k: string]: unknown;
}

/** True when the existing image_url is already a usable hosted URL. */
function isResolvedUrl(v: unknown): boolean {
  return typeof v === "string" && /^https?:\/\//i.test(v.trim());
}

/** Detect prompt-leak / unresolved placeholder strings. */
function looksLikePromptLeak(v: unknown): boolean {
  if (typeof v !== "string") return true;
  const s = v.trim();
  if (!s) return true;
  if (/^https?:\/\//i.test(s)) return false;
  return true; // anything else is treated as unresolved
}

async function uploadPng(path: string, bytes: Uint8Array): Promise<string | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.warn("[imageResolver] SUPABASE_URL/SERVICE_ROLE not configured — skipping upload");
    return null;
  }
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "image/png",
      "x-upsert": "true",
      "cache-control": "public, max-age=31536000, immutable",
    },
    body: bytes,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[imageResolver] upload failed", res.status, t.slice(0, 200));
    return null;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function resolveOne(page: RawPage, bookKey: string): Promise<void> {
  if (isResolvedUrl(page.image_url)) return; // idempotent
  if (!page.image_prompt || !page.image_prompt.trim()) return;
  if (!looksLikePromptLeak(page.image_url) && page.image_url) return;

  try {
    const img = await generateGoogleImage(page.image_prompt);
    const path = `${bookKey}/page-${page.page_number}.png`;
    const url = await uploadPng(path, img.bytes);
    if (url) {
      page.image_url = url;
    } else {
      // Fallback: inline data URL — guarantees a visible image even if storage upload failed.
      page.image_url = img.dataUrl;
    }
  } catch (e) {
    const status = e instanceof GoogleImageError ? e.status : 0;
    console.error("[imageResolver] generation failed page", page.page_number, status, (e as Error).message);
    // leave image_url empty; frontend will render placeholder
    page.image_url = "";
  }
}

/** Resolve pages strictly from first page to last page to protect rate limits and page order. */
export async function resolveStorybookImages(pages: RawPage[], bookKey: string, _concurrency = 1): Promise<void> {
  for (const page of pages) {
    await resolveOne(page, bookKey);
  }
}
