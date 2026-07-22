/**
 * The "AI Art Director" — a single source of truth for the visual style
 * applied to every image generated for a lesson, keyed by hub.
 *
 * Used by:
 *   • generate-ppp-slides   → asks the AI to write detailed, on-style prompts
 *   • generate-all-media    → appends the suffix to every prompt before sending
 *                             it to the image-generation model
 *   • fetch-youtube-video   → drives SafeSearch + duration filters
 */

export type ArtHub = "Playground" | "Academy" | "Success";

export interface HubArtProfile {
  /** Short tag used in UI badges. */
  label: string;
  /** Style suffix appended to EVERY image prompt for this hub. */
  style_suffix: string;
  /** Proprietary brand-color signature appended after style_suffix. */
  brand_signature: string;
  /** Negative prompt fragment to keep the look consistent. */
  negative: string;
  /** YouTube safe-search level — strict for Playground. */
  safe_search: "strict" | "moderate" | "none";
  /** Preferred clip length (seconds) when filtering YouTube results. */
  max_video_seconds: number;
}

export const HUB_ART_PROFILES: Record<ArtHub, HubArtProfile> = {
  Playground: {
    label: "Playground Cartoon",
    style_suffix:
      ", flat 2D animation style, cute and child-friendly" +
      ", predominantly natural realistic colors with just a hint of the Playground brand palette (warm orange and sunny yellow) used as small accents only — never let these colors dominate the image" +
      ", clean white background or light natural environment, centered composition, no text, no watermarks, kid-safe.",
    brand_signature:
      " Apply the EnglEuphoria Playground signature: bright, welcoming colors, but ensure subtle hints of sunny yellow and vibrant orange are present in playful objects (like a toy block, a button, a backpack detail, or a hat). Keep the scene natural, not heavily saturated, never cartoony-overwhelming, and limit the brand accents to small props only.",
    negative:
      "no scary content, no realistic photography, no weapons, no horror, no dark themes, no text overlay, no monochrome orange or yellow wash.",
    safe_search: "strict",
    max_video_seconds: 240,
  },
  Academy: {
    label: "Academy Slice-of-Life",
    style_suffix:
      ", clean slice-of-life webcomic style, realistic everyday lifestyle situations" +
      ", predominantly natural realistic colors with just a hint of the Academy brand palette (purple, blue, and bluish-purple) used as small accents only — never let these colors dominate the image" +
      ", do not use sci-fi, superhero, or fantasy styles" +
      ", clean white background or light natural environment, no text, no watermarks, teen-focused.",
    brand_signature:
      " Apply the EnglEuphoria Academy signature: natural, realistic base lighting and colors, but ensure subtle hints of vibrant electric purplish-blue are present in a single small object (like a phone case, a pen, a coffee cup, an architectural detail, or a clothing accent). Do not allow the entire scene to turn purple — the accent must be small and must not dominate the scene.",
    negative:
      "no superhero, no sci-fi, no fantasy, no neon purple wash, no monochrome purple or blue overlay, no dark moody lighting, no clutter, no text overlay.",
    safe_search: "moderate",
    max_video_seconds: 480,
  },
  Success: {
    label: "Success Editorial",
    style_suffix:
      ", modern professional editorial photography, sleek and highly realistic" +
      ", predominantly natural realistic colors with just a hint of the Success brand palette (mint and emerald green) used as small accents only — never let these colors dominate the image" +
      ", clean white background or light natural environment, natural soft lighting, shallow depth of field, no text, no watermarks.",
    brand_signature:
      " Apply the EnglEuphoria Success signature: professional and sleek lighting in a sophisticated setting with natural and corporate colors, but ensure subtle hints of mint green are present in a clear detail (like a potted plant with mint leaves, a notebook corner, a tie pattern, or a subtle light reflection). Maintain high-end realism — the mint accent must not dominate the scene.",
    negative:
      "no cartoons, no childish illustration, no neon, no monochrome green wash, no clutter, no text overlay.",
    safe_search: "moderate",
    max_video_seconds: 600,
  },
};

/**
 * Hub-aware Prompt Interceptor for image generation.
 * Concatenates the user's original target prompt with the Hub's required
 * Style Suffix and Color Palette Suffix. The user prompt remains the focal
 * point; suffixes are appended verbatim.
 */
export function enrichImagePrompt(basePrompt: string, hub?: string): string {
  const profile = HUB_ART_PROFILES[normalizeArtHub(hub)];
  const cleaned = (basePrompt || "").trim().replace(/\s+/g, " ");
  return `${cleaned}${profile.style_suffix}${profile.brand_signature}`;
}

export function normalizeArtHub(input?: string): ArtHub {
  const v = (input || "").toLowerCase().trim();
  if (v === "playground" || v === "kids" || v === "children") return "Playground";
  if (v === "success" || v === "professional" || v === "adults" || v === "adult") return "Success";
  return "Academy";
}

/** Append the hub's house-style + brand signature to any AI image prompt. */
export function applyHubStyle(prompt: string, hub: ArtHub): string {
  const profile = HUB_ART_PROFILES[hub];
  const cleaned = (prompt || "").trim().replace(/\s+/g, " ");
  return `${cleaned}${profile.style_suffix}${profile.brand_signature} NEGATIVE: ${profile.negative}`;
}
