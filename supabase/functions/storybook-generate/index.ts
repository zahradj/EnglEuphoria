// storybook-generate — produces a real interactive book and persists it.
// Runtime AI: Gemini direct via aiFetch (auto-failover compliant).
// Persistence: service-role client — RLS is bypassed only after we have
// verified the caller's identity & content_creator/admin role.

import { aiFetch } from "../_shared/aiFetch.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

type Hub = "playground" | "academy" | "success";

// Valid storybook_page_type enum values in the DB.
const VALID_PAGE_TYPES = new Set([
  "narration",
  "dialogue",
  "illustration",
  "interaction",
  "reflection",
  "vocab_spotlight",
  "speaking_checkpoint",
  "comprehension",
]);

// Hard caps to keep the payload well under Gemini's token budget so we
// don't end up with truncated JSON that no repair can save.
const MAX_CHAPTERS = 3;
const MAX_PAGES_PER_CHAPTER = 5;
const DEFAULT_CHAPTERS = 2;
const DEFAULT_PAGES_PER_CHAPTER = 4;
const MAX_VOCAB_TARGETS = 10;
const MAX_GRAMMAR_TARGETS = 4;
const MAX_COMM_GOALS = 4;

interface CastMember {
  id: string;
  name: string;
  role: string;
  personality_traits?: Record<string, unknown>;
  visual_blueprint?: {
    appearance?: string;
    outfit?: string;
    species?: string;
    age_range?: string;
    signature_pose?: string;
    palette?: string[];
    style_notes?: string;
  };
  voice_id?: string | null;
  signature_traits?: string[];
}

interface Brief {
  title?: string;
  hub: Hub;
  cefr: string;
  unit_id?: string;
  theme?: string;
  setting?: string;
  vocabulary_targets?: string[];
  grammar_targets?: string[];
  communication_goals?: string[];
  story_type?: string;
  chapter_count?: number;
  pages_per_chapter?: number;
}

interface RequestBody {
  brief: Brief;
  cast: CastMember[];
  studentId?: string;
  createdBy: string;
  withIllustrations?: boolean;
  withAudio?: boolean;
}

const HUB_REGISTER: Record<Hub, { audio: string; voice_notes: string; reading: string; voice_id: string; art_style: string }> = {
  playground: {
    audio: "expressive_playful",
    voice_notes: "Expressive, playful, sing-song. Short concrete sentences with rhythm.",
    reading: "1-2 short sentences per page. Present simple. Concrete nouns. No idioms.",
    voice_id: "XrExE9yKIg1WjnnlVkGX",
    art_style: "rendered in an authentic, flawless 'Kiwi' children's book illustration style — soft rounded shapes, friendly cute mascot characters, gentle pastel and fresh fruity green-yellow palette, smooth thin outlines, warm storybook lighting, wholesome and joyful, age-appropriate for young children, pure flat white background, no text",
  },
  academy: {
    audio: "modern_emotional",
    voice_notes: "Modern, emotionally honest, contemporary teen voice. Contractions OK.",
    reading: "2-3 sentences per page. A2-C1 register. Realistic teen dialogue allowed.",
    voice_id: "Xb7hH8MSUJpSbSDYk0k2",
    art_style: "rendered in an authentic, flawless modern manga comic style — crisp black ink line art, dynamic panel composition, expressive teen character design, screentone and halftone shading, cel-shaded colour fills, contemporary shonen/shojo aesthetic, age-appropriate for teens, no text",
  },
  success: {
    audio: "natural_professional",
    voice_notes: "Natural, professional, realistic adult register. Workplace authenticity.",
    reading: "2-4 multi-clause sentences per page. B1-C1 register. Real workplace/life situations.",
    voice_id: "JBFqnCBsd6RMkjVDRZzb",
    art_style: "captured as authentic, flawless photo-realistic editorial photography — shot on a 35mm full-frame camera, true-to-life skin tones and materials, natural soft lighting, neutral corporate tones, shallow depth of field, premium business aesthetic, no illustration, no cartoon, no painting, no text",
  },
};

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : fallback;
  return Math.max(min, Math.min(max, n));
}

function characterCard(c: CastMember): string {
  const vb = c.visual_blueprint ?? {};
  const visual = [vb.appearance, vb.outfit, vb.species, vb.age_range].filter(Boolean).join(" • ");
  const palette = vb.palette?.length ? `palette: ${vb.palette.join(", ")}` : "";
  const traits = (c.signature_traits ?? []).join(", ");
  return [
    `• ${c.name} (${c.role}).`,
    visual ? `  visuals: ${visual}.` : "",
    palette ? `  ${palette}.` : "",
    traits ? `  signature traits: ${traits}.` : "",
  ].filter(Boolean).join("\n");
}

function buildSystemPrompt(body: RequestBody, chapters: number, pages: number): string {
  const { brief, cast } = body;
  const reg = HUB_REGISTER[brief.hub];
  const earlyLearner =
    brief.hub === "playground" ||
    (brief.hub === "academy" && (brief.cefr === "Pre-A1" || brief.cefr === "A1"));
  const earlyLearnerBlock = earlyLearner
    ? [
        ``,
        `🧒 EARLY LEARNER MODE (HARD RULES — pre-readers / early readers):`,
        `• ≤ 1 short sentence per page (≤ 8 words). Concrete nouns + verbs only.`,
        `• NO abstract questions ("why", "how come", "explain", "describe").`,
        `• Comprehension pages: every option MUST be a picture (no text-only options).`,
        `• Every page gets full-bleed illustration + spoken voice — voice is the teacher.`,
        `• No multi-line dialogues. ONE short line per character turn.`,
      ].join("\n")
    : "";
  return [
    `You are an award-winning English-learning storybook author for the ${brief.hub.toUpperCase()} hub.`,
    `You are writing a REAL INTERACTIVE BOOK that students will read like a digital picture book / novel.`,
    ``,
    `HARD CONSTRAINTS:`,
    `• CEFR: ${brief.cefr}. Vocabulary and grammar MUST stay within this level.`,
    `• Sentence/page register: ${reg.reading}`,
    `• Voice: ${reg.voice_notes}`,
    `• Educational goals must EMERGE from the narrative — never lecture, never explain grammar inline.`,
    `• Target vocabulary: ${(brief.vocabulary_targets ?? []).join(", ") || "(derive natural age-appropriate vocab)"}.`,
    `  Use each target word verbatim across the story, with at least 2 exposures total per word.`,
    `• Grammar focus: ${(brief.grammar_targets ?? []).join(", ") || "(none specified)"}.`,
    `• Communication goals: ${(brief.communication_goals ?? []).join("; ") || "(general)"}.`,
    `• Story type: ${brief.story_type ?? "narrative"}. Theme: ${brief.theme ?? "(author's choice)"}.`,
    `• Setting: ${brief.setting ?? "(author's choice)"}.`,
    ``,
    `MANDATORY CAST VAULT (use these characters; do NOT invent new named characters):`,
    cast.map(characterCard).join("\n"),
    ``,
    `STRUCTURE (HARD LIMIT — do not exceed):`,
    `• EXACTLY ${chapters} chapter(s). EXACTLY ${pages} page(s) per chapter.`,
    `• Keep every text field short. Story arc fields: ≤ 1 sentence each.`,
    `• Page content text: follow the register above. NEVER a multi-paragraph essay.`,
    `Page types must be a mix of:`,
    `  narration | dialogue | illustration | comprehension | speaking_checkpoint | vocab_spotlight | reflection`,
    `Roughly 60% narration/dialogue, with comprehension/speaking/vocab interleaved.`,
    `End each chapter with a reflection or speaking_checkpoint page.`,
    ``,
    `OUTPUT RULES (CRITICAL — failures break the app):`,
    `• Return RAW JSON only. No markdown fences. No commentary.`,
    `• Stay UNDER the token limit. Prefer short, vivid prose over long descriptions.`,
    `• If you feel you may run out of room, SHORTEN page text — never truncate a chapter.`,
    `• For EVERY page of type narration, dialogue, illustration, vocab_spotlight, or reflection,`,
    `  include a concise "illustration_prompt" (≤ 25 words) describing the scene visually.`,
    `  Mention the relevant Cast Vault character by NAME so the illustrator preserves identity.`,
    `  Avoid abstract metaphors — describe what is literally visible (who, where, action, mood).`,
    earlyLearnerBlock,
  ].join("\n");
}

const BOOK_JSON_SHAPE = `{
  "title": string,
  "story_arc": { "title": string, "hook": string, "rising_action": string, "climax": string, "resolution": string, "emotional_journey": string, "themes": string[] },
  "chapters": [
    {
      "title": string,
      "summary": string,
      "learning_objective": string,
      "pages": [
        {
          "page_type": "narration"|"dialogue"|"illustration"|"comprehension"|"speaking_checkpoint"|"vocab_spotlight"|"reflection",
          "content": object,
          "vocab_inline": [{ "word": string, "definition": string }],
          "illustration_alt": string?,
          "illustration_prompt": string?
        }
      ]
    }
  ]
}

content per page_type:
  narration         : { "text": string }
  dialogue          : { "lines": [{ "character_id": string, "text": string, "emotion"?: string }] }
  illustration      : { "caption"?: string, "alt": string }
  comprehension     : { "question": string, "options": string[], "correct_index": integer, "kind": "literal"|"inference"|"vocab_in_context" }
  speaking_checkpoint: { "prompt": string, "rung": "repetition"|"cued"|"guided"|"free"|"spontaneous", "target_phrase"?: string }
  vocab_spotlight   : { "word": string, "definition": string, "example": string }
  reflection        : { "prompt": string, "style": "emotional"|"metacognitive" }`;

async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await aiFetch("https://ai-gateway.internal/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 16000,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI generation failed (${res.status}): ${t.slice(0, 400)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI returned no content");
  return content;
}

// ─────────────────────────── JSON RECOVERY ───────────────────────────

/** Strip code fences and isolate the outermost JSON object. */
function extractJsonBlob(raw: string): string {
  let s = raw.trim();
  // Remove ```json or ``` fences anywhere.
  s = s.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  const start = s.indexOf("{");
  if (start < 0) return s;
  // Walk to the LAST `}` that balances. If unbalanced, return slice from start to end.
  const end = s.lastIndexOf("}");
  if (end > start) return s.slice(start, end + 1);
  return s.slice(start);
}

/**
 * Repair truncated JSON. Walks the string tracking string/escape/stack state.
 * If we end inside a string, we close it. If we end with a dangling trailing
 * partial token (e.g. `,"foo": "bar` or `,"foo":`), we trim back to the last
 * safe boundary, then close any open structures.
 */
function repairTruncatedJson(text: string): string {
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  let lastSafe = 0; // index AFTER a known-good boundary (`,` or `{` or `[` at depth)
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{" || ch === "[") { stack.push(ch); lastSafe = i + 1; }
    else if (ch === "}" || ch === "]") { stack.pop(); lastSafe = i + 1; }
    else if (ch === ",") { lastSafe = i; /* keep the comma index so we can trim including it */ }
  }

  let repaired = text;

  // If we ended mid-string, OR the last char is a trailing fragment that
  // can't be parsed (like a key with no value), roll back to last safe point.
  if (inString) {
    // Trim back to last safe boundary (drop the broken fragment entirely)
    if (lastSafe > 0 && lastSafe < repaired.length) {
      repaired = repaired.slice(0, lastSafe);
    } else {
      repaired += '"'; // best-effort close
    }
  }

  // Drop trailing whitespace then trailing commas (legal-ish JSON5)
  repaired = repaired.replace(/[\s,]+$/g, "");

  // If the last meaningful chunk looks like an unfinished key:value pair (e.g.
  // `..."foo":` or `..."foo": `), rewind one more comma-bound segment.
  const tailKeyMatch = /,\s*"[^"]*"\s*:\s*$/.exec(repaired);
  if (tailKeyMatch) {
    repaired = repaired.slice(0, tailKeyMatch.index);
  }
  // Or `..."foo": "bar"` followed by nothing-closing — that's fine, leave it.

  for (let i = stack.length - 1; i >= 0; i--) {
    repaired += stack[i] === "{" ? "}" : "]";
  }
  return repaired;
}

function safeJsonParse(text: string): unknown {
  const cleaned = extractJsonBlob(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const repaired = repairTruncatedJson(cleaned);
      const parsed = JSON.parse(repaired);
      console.warn("storybook-generate: parsed truncated JSON after repair");
      return parsed;
    } catch (e) {
      console.error("storybook-generate: repair-parse failed", (e as Error).message);
      return null;
    }
  }
}

// ─────────────────────────── NORMALIZATION ───────────────────────────

function normalizeStoryArc(input: any, fallbackTitle: string): Record<string, unknown> {
  const s = (input && typeof input === "object") ? input : {};
  return {
    title: typeof s.title === "string" && s.title.trim() ? s.title : fallbackTitle,
    hook: typeof s.hook === "string" ? s.hook : "",
    rising_action: typeof s.rising_action === "string" ? s.rising_action : "",
    climax: typeof s.climax === "string" ? s.climax : "",
    resolution: typeof s.resolution === "string" ? s.resolution : "",
    emotional_journey: typeof s.emotional_journey === "string" ? s.emotional_journey : "",
    themes: Array.isArray(s.themes) ? s.themes.filter((t: unknown) => typeof t === "string") : [],
  };
}

function normalizePageType(t: unknown): string {
  if (typeof t === "string" && VALID_PAGE_TYPES.has(t)) return t;
  return "narration";
}

function normalizePages(pages: any[]): any[] {
  if (!Array.isArray(pages)) return [];
  return pages
    .filter((p) => p && typeof p === "object")
    .map((p) => ({
      page_type: normalizePageType(p.page_type),
      content: (p.content && typeof p.content === "object") ? p.content : { text: "" },
      vocab_inline: Array.isArray(p.vocab_inline) ? p.vocab_inline : [],
      illustration_alt: typeof p.illustration_alt === "string" ? p.illustration_alt : undefined,
      illustration_prompt: typeof p.illustration_prompt === "string" ? p.illustration_prompt : undefined,
    }));
}

function buildFallbackBook(body: RequestBody, partial: any, chapters: number, pages: number): any {
  const title = (partial && typeof partial.title === "string" && partial.title.trim())
    ? partial.title
    : (body.brief.title || `${body.brief.story_type ?? "Story"} (${body.brief.cefr})`);
  const arc = normalizeStoryArc(partial?.story_arc, title);
  const fallbackChapters = Array.from({ length: chapters }).map((_, ci) => {
    const sourceCh = partial?.chapters?.[ci];
    const sourcePages = Array.isArray(sourceCh?.pages) ? normalizePages(sourceCh.pages).slice(0, pages) : [];
    while (sourcePages.length < pages) {
      sourcePages.push({
        page_type: sourcePages.length === pages - 1 ? "reflection" : "narration",
        content: sourcePages.length === pages - 1
          ? { prompt: "What did you learn from this chapter?", style: "metacognitive" }
          : { text: "" },
        vocab_inline: [],
      });
    }
    return {
      title: typeof sourceCh?.title === "string" && sourceCh.title.trim() ? sourceCh.title : `Chapter ${ci + 1}`,
      summary: typeof sourceCh?.summary === "string" ? sourceCh.summary : "",
      learning_objective: typeof sourceCh?.learning_objective === "string" ? sourceCh.learning_objective : "",
      pages: sourcePages,
    };
  });
  return { title, story_arc: arc, chapters: fallbackChapters };
}

interface ChapterRow { id: string; }

// ────────────────────── BACKGROUND MEDIA GENERATION ──────────────────────
// Called via EdgeRuntime.waitUntil after the storybook rows are persisted.
// Iterates pages, invokes ai-image-generation + generate-elevenlabs-audio,
// uploads media to the lesson-assets bucket, and updates the page rows.
// Failures on individual pages are logged but never thrown — the book is
// still readable as text-only while media trickles in.

interface MediaJob {
  bookId: string;
  hub: Hub;
  title: string;
  cast: CastMember[];
  wantImages: boolean;
  wantAudio: boolean;
}

function castVisualHint(cast: CastMember[]): string {
  if (!cast.length) return "";
  const lines = cast.slice(0, 3).map((c) => {
    const vb = c.visual_blueprint ?? {};
    const parts = [vb.appearance, vb.outfit, vb.species, vb.age_range].filter(Boolean).join(", ");
    return `${c.name}${parts ? ` (${parts})` : ""}`;
  });
  return lines.join("; ");
}

function spokenTextFromPage(page: any): string {
  const data = page?.content?.data ?? {};
  const type = page?.page_type;
  if (type === "narration" || type === "reflection") {
    return typeof data.text === "string" ? data.text : (typeof data.prompt === "string" ? data.prompt : "");
  }
  if (type === "dialogue") {
    const lines = Array.isArray(data.lines) ? data.lines : [];
    return lines.map((l: any) => (typeof l?.text === "string" ? l.text : "")).filter(Boolean).join(" ");
  }
  if (type === "vocab_spotlight") {
    const w = typeof data.word === "string" ? data.word : "";
    const d = typeof data.definition === "string" ? data.definition : "";
    const e = typeof data.example === "string" ? data.example : "";
    return [w, d, e].filter(Boolean).join(". ");
  }
  if (type === "speaking_checkpoint") {
    return typeof data.prompt === "string" ? data.prompt : "";
  }
  if (type === "illustration") {
    return typeof data.caption === "string" ? data.caption : "";
  }
  return "";
}

function illustrationPromptFromPage(page: any, job: MediaJob): string | null {
  const data = page?.content?.data ?? {};
  const type = page?.page_type;
  const NON_VISUAL = new Set(["comprehension", "speaking_checkpoint"]);
  if (NON_VISUAL.has(type)) return null;

  const explicit = typeof data.illustration_prompt === "string" ? data.illustration_prompt.trim() : "";
  const alt = typeof data.illustration_alt === "string" ? data.illustration_alt.trim() : "";
  const fallbackText =
    explicit ||
    alt ||
    (typeof data.text === "string" ? data.text.slice(0, 180) : "") ||
    (type === "vocab_spotlight" && typeof data.word === "string" ? `A scene illustrating "${data.word}"` : "") ||
    (type === "dialogue" && Array.isArray(data.lines) && data.lines[0]?.text
      ? `Characters talking: "${String(data.lines[0].text).slice(0, 100)}"`
      : "");
  if (!fallbackText) return null;

  const castHint = castVisualHint(job.cast);
  return [
    fallbackText,
    castHint ? `Featured characters: ${castHint}.` : "",
    `From the storybook "${job.title}".`,
  ].filter(Boolean).join(" ");
}

async function generatePageImage(
  db: any,
  pageId: string,
  prompt: string,
  job: MediaJob,
): Promise<string | null> {
  try {
    const { data, error } = await db.functions.invoke("ai-image-generation", {
      body: {
        prompt,
        imageStyle: HUB_REGISTER[job.hub].art_style,
        persist: true,
        storagePath: `storybooks/${job.bookId}/p_${pageId}.png`,
      },
    });
    if (error) { console.warn(`storybook media: image invoke failed for page ${pageId}:`, error.message); return null; }
    const url = data?.imageUrl || data?.url || data?.publicUrl;
    if (!url) { console.warn(`storybook media: image returned no url for page ${pageId}`); return null; }
    const { error: upErr } = await db.from("storybook_pages").update({ illustration_url: url }).eq("id", pageId);
    if (upErr) console.warn(`storybook media: page update failed ${pageId}:`, upErr.message);
    return url;
  } catch (e: any) {
    console.warn(`storybook media: image error page ${pageId}:`, e?.message ?? e);
    return null;
  }
}

async function generatePageAudio(
  db: any,
  pageId: string,
  text: string,
  job: MediaJob,
): Promise<string | null> {
  try {
    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed) return null;
    const ttsRes = await db.functions.invoke("generate-elevenlabs-audio", {
      body: { text: trimmed, voiceId: HUB_REGISTER[job.hub].voice_id },
    });
    // supabase-js returns the raw Blob in `data` for binary responses.
    let buf: ArrayBuffer | null = null;
    if (ttsRes?.data instanceof Blob) {
      buf = await (ttsRes.data as Blob).arrayBuffer();
    } else if (ttsRes?.data instanceof ArrayBuffer) {
      buf = ttsRes.data;
    } else if (ttsRes?.error) {
      // Surface full error JSON so quota/auth/network failures are distinguishable in logs.
      try {
        console.warn(
          `storybook media: tts invoke error page ${pageId}:`,
          JSON.stringify({
            message: ttsRes.error.message,
            name: (ttsRes.error as any)?.name,
            status: (ttsRes.error as any)?.context?.status,
            body: (ttsRes.error as any)?.context?.body,
          }),
        );
      } catch {
        console.warn(`storybook media: tts invoke error page ${pageId}:`, ttsRes.error.message);
      }
      return null;
    }
    if (!buf || buf.byteLength < 256) {
      console.warn(`storybook media: tts empty response page ${pageId}`);
      return null;
    }
    const path = `storybooks/${job.bookId}/p_${pageId}.mp3`;
    const { error: upErr } = await db.storage.from("lesson-assets").upload(path, new Uint8Array(buf), {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upErr) { console.warn(`storybook media: audio upload failed ${pageId}:`, upErr.message); return null; }
    const { data: pub } = db.storage.from("lesson-assets").getPublicUrl(path);
    const audioUrl = pub?.publicUrl;
    if (!audioUrl) return null;
    const { error: rowErr } = await db.from("storybook_pages").update({ audio_url: audioUrl }).eq("id", pageId);
    if (rowErr) console.warn(`storybook media: audio_url row update failed ${pageId}:`, rowErr.message);
    return audioUrl;
  } catch (e: any) {
    console.warn(`storybook media: audio error page ${pageId}:`, e?.message ?? e);
    return null;
  }
}

async function generateBookMedia(job: MediaJob): Promise<void> {
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  console.log(`storybook media: starting bookId=${job.bookId} images=${job.wantImages} audio=${job.wantAudio}`);

  // Load chapters in order, then pages in order.
  const { data: chapters, error: chErr } = await db
    .from("storybook_chapters")
    .select("id, order_index")
    .eq("book_id", job.bookId)
    .order("order_index", { ascending: true });
  if (chErr || !chapters) { console.error("storybook media: chapter fetch failed", chErr?.message); return; }

  const allPages: any[] = [];
  for (const ch of chapters) {
    const { data: pages, error: pgErr } = await db
      .from("storybook_pages")
      .select("id, order_index, page_type, content")
      .eq("chapter_id", ch.id)
      .order("order_index", { ascending: true });
    if (pgErr) { console.warn("storybook media: page fetch failed", pgErr.message); continue; }
    if (pages) allPages.push(...pages);
  }

  let coverSet = false;
  // Process sequentially with small fan-out to respect rate limits.
  for (let i = 0; i < allPages.length; i += 2) {
    const batch = allPages.slice(i, i + 2);
    await Promise.all(batch.map(async (page) => {
      if (job.wantImages) {
        const prompt = illustrationPromptFromPage(page, job);
        if (prompt) {
          const url = await generatePageImage(db, page.id, prompt, job);
          if (url && !coverSet) {
            coverSet = true;
            await db.from("storybooks").update({ cover_image_url: url }).eq("id", job.bookId)
              .then((r: any) => r.error && console.warn("storybook media: cover update failed:", r.error.message));
          }
        }
      }
      if (job.wantAudio) {
        const text = spokenTextFromPage(page);
        if (text) await generatePageAudio(db, page.id, text, job);
      }
    }));
  }
  console.log(`storybook media: finished bookId=${job.bookId} pages=${allPages.length}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.brief?.hub || !body?.brief?.cefr) {
      return new Response(JSON.stringify({ error: "Missing brief.hub or brief.cefr", stage: "input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(body.cast) || body.cast.length === 0) {
      return new Response(JSON.stringify({ error: "At least one Cast Vault character is required", stage: "input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.createdBy) {
      return new Response(JSON.stringify({ error: "createdBy is required", stage: "input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!["playground", "academy", "success"].includes(body.brief.hub)) {
      return new Response(JSON.stringify({ error: `Invalid hub: ${body.brief.hub}`, stage: "input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap payload size BEFORE sending to AI.
    const chapters = clampInt(body.brief.chapter_count, 1, MAX_CHAPTERS, DEFAULT_CHAPTERS);
    const pages = clampInt(body.brief.pages_per_chapter, 1, MAX_PAGES_PER_CHAPTER, DEFAULT_PAGES_PER_CHAPTER);
    const safeBrief: Brief = {
      ...body.brief,
      chapter_count: chapters,
      pages_per_chapter: pages,
      vocabulary_targets: (body.brief.vocabulary_targets ?? []).slice(0, MAX_VOCAB_TARGETS),
      grammar_targets: (body.brief.grammar_targets ?? []).slice(0, MAX_GRAMMAR_TARGETS),
      communication_goals: (body.brief.communication_goals ?? []).slice(0, MAX_COMM_GOALS),
    };
    const safeBody: RequestBody = { ...body, brief: safeBrief, cast: body.cast.slice(0, 6) };

    const warnings: string[] = [];

    // === 1. Generate book JSON via Gemini direct ===
    const systemPrompt = buildSystemPrompt(safeBody, chapters, pages);
    const userPrompt = [
      `Generate a complete interactive storybook as a single JSON object matching exactly this shape (no extra fields, no commentary, no markdown fences):`,
      BOOK_JSON_SHAPE,
      ``,
      `Story brief: ${safeBrief.theme ?? safeBrief.story_type ?? "an emotionally engaging narrative"}.`,
      `Use the Cast Vault characters by their EXACT id when referenced in dialogue (character_id field). Cast ids:`,
      safeBody.cast.map((c) => `  ${c.name} -> ${c.id}`).join("\n"),
    ].join("\n");

    let raw = "";
    try {
      raw = await callGemini(systemPrompt, userPrompt);
    } catch (e: any) {
      console.error("storybook-generate: AI call failed", e?.message);
      return new Response(JSON.stringify({
        error: e?.message || "AI generation failed",
        stage: "ai",
      }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = safeJsonParse(raw);
    let bookSource: any = parsed;
    if (!parsed || typeof parsed !== "object") {
      warnings.push("AI returned unparseable JSON — building draft scaffold from brief");
      bookSource = {};
    }

    // Always normalize into a known-good shape so persistence cannot fail
    // on a missing/garbage AI field.
    const book = buildFallbackBook(safeBody, bookSource, chapters, pages);

    // === 2. Persist via service role ===
    const db = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: bookRow, error: bookErr } = await db
      .from("storybooks")
      .insert({
        title: book.title ?? safeBrief.title ?? "Untitled",
        hub: safeBrief.hub,
        cefr_level: safeBrief.cefr,
        unit_id: safeBrief.unit_id ?? null,
        status: "draft",
        published: false,
        story_arc: book.story_arc ?? {},
        vocabulary_targets: safeBrief.vocabulary_targets ?? [],
        grammar_targets: safeBrief.grammar_targets ?? [],
        communication_goals: safeBrief.communication_goals ?? [],
        audio_layer: { hub_register: HUB_REGISTER[safeBrief.hub].audio, per_character: {} },
        adaptive_state: {},
        created_by: safeBody.createdBy,
      })
      .select("id")
      .single();

    if (bookErr || !bookRow) {
      console.error("storybook-generate: book insert failed", bookErr);
      return new Response(JSON.stringify({
        error: bookErr?.message ?? "Insert failed",
        stage: "persist_book",
      }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bookId = bookRow.id as string;

    // Cast bindings (non-fatal)
    if (safeBody.cast.length > 0) {
      const { error: bindErr } = await db.from("storybook_character_bindings").insert(
        safeBody.cast.map((c) => ({
          book_id: bookId,
          character_id: c.id,
          role_in_story: c.role,
        })),
      );
      if (bindErr) warnings.push(`character bindings insert: ${bindErr.message}`);
    }

    // Chapters & pages
    const bookChapters = Array.isArray(book.chapters) ? book.chapters : [];
    for (let ci = 0; ci < bookChapters.length; ci++) {
      const ch = bookChapters[ci];
      const { data: chRow, error: chErr } = await db
        .from("storybook_chapters")
        .insert({
          book_id: bookId,
          order_index: ci,
          title: ch.title ?? `Chapter ${ci + 1}`,
          summary: ch.summary ?? null,
          learning_objective: ch.learning_objective ?? null,
        })
        .select("id")
        .single();

      if (chErr || !chRow) {
        warnings.push(`chapter ${ci} insert failed: ${chErr?.message}`);
        continue;
      }

      const chapterId = (chRow as ChapterRow).id;
      const chPages = Array.isArray(ch.pages) ? ch.pages : [];
      const pageRows = chPages.map((p: any, pi: number) => {
        const pageType = normalizePageType(p.page_type);
        const baseData = (p.content && typeof p.content === "object") ? p.content : {};
        // Carry the AI-authored illustration prompt + alt into content.data so
        // the background media task (and the viewer) can read it back.
        const data = {
          ...baseData,
          ...(typeof p.illustration_prompt === "string" ? { illustration_prompt: p.illustration_prompt } : {}),
          ...(typeof p.illustration_alt === "string" ? { illustration_alt: p.illustration_alt } : {}),
        };
        return {
          chapter_id: chapterId,
          order_index: pi,
          page_type: pageType,
          content: { type: pageType, data },
          vocab_inline: Array.isArray(p.vocab_inline) ? p.vocab_inline : [],
          interactive_data: p.interactive_data ?? null,
        };
      });
      if (pageRows.length > 0) {
        const { error: pgErr } = await db.from("storybook_pages").insert(pageRows);
        if (pgErr) warnings.push(`chapter ${ci} pages insert failed: ${pgErr.message}`);
      }
    }

    // === 3. Hydrate full book to return ===
    const { data: full } = await db
      .from("storybooks")
      .select("*")
      .eq("id", bookId)
      .single();

    // === 4. Kick off media generation in the background (non-blocking) ===
    // We respond immediately so the client can navigate to the viewer; pages
    // hydrate as soon as each illustration / audio finishes uploading.
    const wantImages = body.withIllustrations !== false;
    const wantAudio = body.withAudio === true;
    if (wantImages || wantAudio) {
      const task = generateBookMedia({
        bookId,
        hub: safeBrief.hub,
        title: full?.title ?? safeBrief.title ?? "Untitled",
        cast: safeBody.cast,
        wantImages,
        wantAudio,
      }).catch((e) => console.error("storybook-generate: background media failed", e?.message ?? e));
      // Deno Deploy / Supabase edge-runtime keeps the worker alive for waitUntil.
      try { (globalThis as any).EdgeRuntime?.waitUntil?.(task); } catch { /* noop */ }
    }

    return new Response(JSON.stringify({
      book: full,
      bookId,
      verdict: warnings.length === 0 ? "draft" : "repair",
      warnings,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("storybook-generate error", e);
    return new Response(JSON.stringify({
      error: e?.message ?? "Unknown error",
      stage: "unhandled",
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
