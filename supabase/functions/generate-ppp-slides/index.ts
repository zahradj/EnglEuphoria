// Generate a 15-20 slide progressive lesson via Lovable AI Gateway with strict tool-calling.
// The AI acts as a Master Curriculum Director: routes media (image vs video),
// enforces a 5-phase progressive arc, and forces divergent interactivity.
//
// Hub-aware (Playground / Academy / Success) and framework-aware (the blueprint's
// `phases[]` array dictates lesson_phase order, not a hardcoded sequence).
import {
  buildPhaseSequenceBlock,
  buildSlideHubBlock,
  isPhase,
  normalizeHub,
  type LessonPhase,
} from "../_shared/hubProfiles.ts";

import { aiFetch } from "../_shared/aiFetch.ts";
import { buildStudioSystemPrompt } from "../_shared/studioPersona.ts";
import { buildHubEnforcementBlock } from "../_shared/hubEnforcementBlock.ts";
import { buildEarlyLearnerPromptBlock } from "../_shared/earlyLearnerBlock.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PHASES = ["Hook", "Presentation", "Practice", "Production", "Mission"] as const;
// 6-Step Integrated Skills Blueprint — every slide MUST be tagged with one of these.
const LESSON_PHASES = [
  "Vocabulary",
  "Reading",
  "Comprehension",
  "Grammar",
  "Speaking",
  "Writing",
] as const;
const SLIDE_TYPES = [
  "mascot_speech",
  "multiple_choice",
  "drawing_canvas",
  "drag_and_drop",
  "flashcard",
  "drag_and_match",
  "fill_in_the_gaps",
] as const;
const MEDIA_TYPES = ["image", "video"] as const;
const LAYOUTS = ["split_left", "split_right", "center_card", "full_background"] as const;
const MISSION_TYPES = ["memory_match", "listen_and_choose", "word_scramble"] as const;
const SKILLS = ["Reading", "Writing", "Listening", "Speaking", "Grammar", "Vocabulary"] as const;

// ─────────────────────────────────────────────────────────────────────────────
// DATA INTEGRITY — prepended to every system prompt (playground/academy/success)
// Non-negotiable rules that prevent the frontend from crashing on sloppy JSON.
// ─────────────────────────────────────────────────────────────────────────────
const DATA_INTEGRITY_BLOCK = `
[DATA INTEGRITY — NON-NEGOTIABLE]
1. NO EMPTY FIELDS: You are STRICTLY FORBIDDEN from returning "" or null for any
   required educational field. Every vocab block MUST include a complete,
   non-empty definition AND a complete example sentence for every single word.
   Every quiz / MCQ / true-false MUST include a non-empty question/statement,
   options array, and answer.
2. EXACT MCQ STRINGS: For every multiple_choice / multiple / quiz / end_quiz /
   truefalse-with-options block, the "answer" field MUST be the EXACT literal
   string copied from the "options" array. NEVER output letter indices
   ("A","B","C","1","2"). Example: options=["do","does","doing"] → answer MUST
   be "does", never "B".
3. CASE-PRESERVING SENTENCE BUILDERS: For sentence_builder / build / scramble
   tasks, every string in the "answer" array MUST match the EXACT casing of
   the corresponding string in the "words" / word-bank array. Do NOT capitalize
   the first answer word if it is lowercase in the bank, and do NOT add or
   remove punctuation that is not present in the bank.
4. CHARACTER NAME CONSISTENCY: Every character name MUST be spelled identically
   across ALL slide fields — especially every image_prompt and every "AI:"
   prefixed prompt. No typos, no nicknames, no variants (e.g. "Leo" must never
   appear as "loe", "Lio", or "Leon" in image_prompts).
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      lesson_title,
      objective,
      skill_focus = "Vocabulary",
      cefr_level = "A1",
      hub = "academy",
      target_hub, // ← preferred new field; falls back to `hub`
      blueprint, // ← Approved Blueprint (optional). When present, treated as ground truth.
      student_profile, // ← Hyper-personalization: { industry, age, interests[] }
      hub_type, // ← when 'playground', returns the kid-friendly Playground schema instead of the 20-slide Academy deck.
      previous_topics, // ← anti-repetition list (last N lesson titles by this user)
      language_variant: bodyLanguageVariant,
      visual_theme: bodyVisualTheme,
      learning_objective: bodyLearningObjective,
      final_output_task: bodyFinalOutputTask,
      starring_character, // ← optional Cast Vault character to feature in this lesson
    } = body || {};

    // ── Casting Director block (shared across all hub prompts) ──
    let castingBlock = '';
    if (starring_character && typeof starring_character === 'object') {
      const cName = String((starring_character as any).name || '').trim();
      const cPersona = String((starring_character as any).personality_traits || '').trim();
      const cVisual = String((starring_character as any).visual_blueprint || '').trim();
      if (cName) {
        castingBlock = `\n\n[CASTING INSTRUCTIONS]\n` +
          `You must feature the following character as the main subject of this content.\n` +
          `Name: ${cName}\n` +
          `Personality & Role: ${cPersona || '(not specified — infer a consistent voice)'}\n` +
          `Rule: Write their dialogue and actions to perfectly match this personality. Ensure they are the one interacting with the target vocabulary. Use ${cName} as a recurring narrator, example speaker, or story protagonist where it fits naturally. Do not invent a different main character.\n\n` +
          `[VOCABULARY RULE]\n` +
          `For every vocabulary word you generate, the example_sentence MUST feature ${cName}. ${cName} must be the subject performing the action or experiencing the word. Instead of "The dog ran fast", write "${cName} ran fast". Align every example sentence with their personality: ${cPersona || '(consistent recurring voice)'}.\n\n` +
          `[ACTIVITY RULE]\n` +
          `When creating quiz questions, fill-in-the-blanks, matching items, or roleplay scenarios, base the context entirely around ${cName}. Formulate questions like "What did ${cName} do?" or "Help ${cName} choose the right word." Every activity prompt must reference ${cName} by name.\n\n` +
          `[ART DIRECTION RULE]\n` +
          `Every image_prompt / "AI:" subject in this lesson — including vocabulary cards and activity slides — MUST feature ${cName}. You must use this exact visual description for them verbatim: "${cVisual}". Do not invent new visual traits for them.`;
      }
    }

    const language_variant: string =
      (typeof bodyLanguageVariant === 'string' && bodyLanguageVariant) ||
      blueprint?.language_variant ||
      'American English';
    const visual_theme: string =
      (typeof bodyVisualTheme === 'string' && bodyVisualTheme) ||
      blueprint?.visual_theme ||
      'Professional/Realistic';
    const learning_objective: string =
      bodyLearningObjective || blueprint?.learning_objective || '';
    const final_output_task: string =
      bodyFinalOutputTask || blueprint?.final_output_task || '';

    const VISUAL_THEME_PROMPT_SUFFIX: Record<string, string> = {
      '3D Animation': ', rendered in vibrant Pixar-style 3D animation, soft global illumination, cinematic lighting, clean vector edges, family-friendly',
      'Anime/Manga': ', rendered in modern Japanese anime / manga style, crisp ink line art, cel-shaded coloring, expressive character design',
      'Watercolor': ', painted in soft watercolor illustration style, gentle pastel washes, visible paper texture, hand-painted feel',
      'Professional/Realistic': ', professional editorial illustration with realistic proportions, clean modern composition, high-quality stock-photo-grade lighting',
    };
    const visualThemeSuffix = VISUAL_THEME_PROMPT_SUFFIX[visual_theme] || VISUAL_THEME_PROMPT_SUFFIX['Professional/Realistic'];

    const ensureSuffix = (s: unknown): string => {
      if (typeof s !== 'string' || !s.trim()) return typeof s === 'string' ? s : '';
      return s.includes(visualThemeSuffix) ? s : `${s.replace(/\s+$/, '')}${visualThemeSuffix}`;
    };
    const enforceVisualTheme = (slides: unknown): void => {
      if (!Array.isArray(slides)) return;
      for (const slide of slides) {
        if (!slide || typeof slide !== 'object') continue;
        const s = slide as Record<string, unknown>;
        for (const key of ['image_prompt', 'image_prompt_detailed', 'image_description']) {
          if (typeof s[key] === 'string') s[key] = ensureSuffix(s[key]);
        }
        const hero = s['hero_media'];
        if (hero && typeof hero === 'object') {
          const h = hero as Record<string, unknown>;
          if (typeof h['image_prompt_detailed'] === 'string') h['image_prompt_detailed'] = ensureSuffix(h['image_prompt_detailed']);
          if (typeof h['image_prompt'] === 'string') h['image_prompt'] = ensureSuffix(h['image_prompt']);
        }
      }
    };

    const prevTopics: string[] = Array.isArray(previous_topics)
      ? previous_topics.filter((s: unknown) => typeof s === 'string' && s.trim()).slice(0, 10)
      : [];

    // Allow the title to fall back to blueprint.lesson_title when caller omits it.
    const effectiveTitle: string | undefined = lesson_title || blueprint?.lesson_title;
    if (!effectiveTitle) {
      return new Response(JSON.stringify({ error: "lesson_title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    // ─── Playground branch ─────────────────────────────────────────────────
    // Kids/Interactive hub: short, highly gamified deck. Output matches the
    // Playground Engine's slide schema exactly so the WYSIWYG renderer can
    // consume it without translation.
    if (hub_type === "playground" || normalizeHub(target_hub ?? hub) === "playground") {
      const isPreA1 = String(cefr_level).toLowerCase() === "pre-a1";

      // Pull the canonical target vocabulary + grammar from the blueprint or top-level body.
      const targetVocab: string[] = Array.isArray(body?.target_vocabulary)
        ? body.target_vocabulary
        : Array.isArray(blueprint?.target_vocabulary)
          ? blueprint.target_vocabulary
          : Array.isArray(blueprint?.vocabulary)
            ? blueprint.vocabulary
            : [];
      const grammarFocus: string =
        body?.grammar_focus || blueprint?.grammar_focus || blueprint?.grammar || "";
      const vocabCount = isPreA1
        ? Math.min(4, Math.max(3, targetVocab.length))
        : Math.max(1, targetVocab.length);

      // ── Target phonics (Synthetic Phonics for kids) ─────────────────────
      const phonics = body?.target_phonics || blueprint?.target_phonics || null;
      const phonicsFocus: string =
        (typeof phonics === "string" ? phonics : phonics?.focus) || "";
      const phonicsIPA: string = phonics?.sound_ipa || phonics?.phoneme || "";
      const phonicsGrapheme: string = phonics?.grapheme || "";
      const phonicsExamples: string[] = Array.isArray(phonics?.example_words)
        ? phonics.example_words
        : [];
      const hasPhonics = !!phonicsFocus;

      const phonicsBlock = hasPhonics ? `

PHONICS LAYER (MANDATORY for Playground — Synthetic Phonics):
TARGET PHONICS FOCUS: "${phonicsFocus}"${phonicsIPA ? ` (IPA: ${phonicsIPA})` : ""}${phonicsGrapheme ? ` (grapheme: "${phonicsGrapheme}")` : ""}.
EXAMPLE WORDS (must come from the target vocabulary): ${JSON.stringify(phonicsExamples)}.
You MUST insert (in this exact order):
  • EXACTLY 1 "phonics_focus" slide IMMEDIATELY AFTER the "intro" slide and BEFORE any "vocab_solo" slides — display the grapheme + IPA, isolated sound + 3 example words.
  • EXACTLY 2 EXTRA "multiple" or "match" Phonemic Awareness mini-games inside Phase 2 — these are IN ADDITION to the existing 3 practice slides. Question patterns: "Click the words that start with ${phonicsIPA || phonicsFocus}." or "Tap the picture whose name has the ${phonicsFocus} sound."
` : "";

      // Pre-A1 deck skips the grammar phase entirely; it's pure phonics + vocab.
      const blueprintBlock = isPreA1 ? `
TARGET VOCABULARY (exact list — do NOT add or remove words): ${JSON.stringify(targetVocab.slice(0, vocabCount))}
TARGET GRAMMAR: NONE — Pre-A1 mode forbids grammar rules and full sentences.
${phonicsBlock}
STRICT PRE-A1 COUNTS (30-MINUTE PLAYGROUND LESSON — pace ~2 min/slide) — your output MUST contain EXACTLY:
  • Phase 1 PRESENTATION: 1 "intro"${hasPhonics ? ` + 1 "phonics_focus"` : ""} + ${vocabCount} "vocab_solo" slides — one per word, in the order listed above. The "word" field MUST exactly equal the target word (uppercase OK).
  • Phase 2 PRACTICE: EXACTLY ${hasPhonics ? "7 (4 vocab drills + 3 phonemic-awareness games)" : "6"} interactive slides ("multiple" with image options, "match" image↔word, or "drag"). NO "fill", NO "truefalse", NO "storybook".
  • End with EXACTLY 1 "lesson_summary" recapping the target words.
Total slides: ${1 + (hasPhonics ? 1 : 0) + vocabCount + (hasPhonics ? 7 : 6) + 1} (sized to fill a 30-minute Playground lesson).` : `
TARGET VOCABULARY (exact list — do NOT add or remove words): ${JSON.stringify(targetVocab)}
TARGET GRAMMAR: "${grammarFocus}"
${phonicsBlock}
STRICT PPP COUNTS (30-MINUTE PLAYGROUND LESSON — pace ~2 min/slide) — your output MUST contain EXACTLY:
  • Phase 1 PRESENTATION: 1 "intro"${hasPhonics ? ` + 1 "phonics_focus"` : ""} + ${vocabCount} "vocab_solo" slides — one per word, in the order listed above. The "word" field of each vocab_solo MUST exactly equal the corresponding target word (uppercase OK).
  • Phase 2 PRACTICE: EXACTLY ${hasPhonics ? "7 (4 vocab drills + 3 phonemic-awareness games)" : "5"} interactive slides drilling those same words ("multiple" with image options, "match" image↔word, or "drag"). No new vocabulary.
  • Phase 3 GRAMMAR: EXACTLY 3 slides ("fill" or "multiple") that USE the target grammar pattern with the target vocabulary (e.g., "The duck is _______").
  • Phase 4 PRODUCTION: EXACTLY 1 "storybook" (3–4 pages) recycling every target word in a simple narrative.
  • End with EXACTLY 1 "lesson_summary" recapping the target words.
Total slides: ${1 + (hasPhonics ? 1 : 0) + vocabCount + (hasPhonics ? 7 : 5) + 3 + 1 + 1} (sized to fill a 30-minute Playground lesson).`;

      const preA1Directive = isPreA1 ? `

⚠️ PRE-A1 NON-READER MODE — STRICT
- Audience: 4-5 year olds. The student CANNOT read in any language.
- DO NOT generate grammar rules or full sentences. Build the lesson SOLELY around the target phoneme.
- EVERY slide MUST have a "voice" object whose "text" is the spoken instruction (1 short sentence, ≤6 words).
- Allowed slide types ONLY: "intro", "phonics_focus", "vocab_solo", "multiple", "match", "drag", "draw", "memory", "tap_order", "hotspot", "thumbs", "sort", "word_builder", "sound_blend", "lesson_summary".
- DO NOT generate "fill", "truefalse", or "storybook" slides. No Phase 3 (grammar). No Phase 4 (production storybook).
- Every interactive prompt should be answerable purely by listening + looking at images.
` : "";

      const playgroundPersona = buildStudioSystemPrompt({
        role: 'game-designer',
        cefr: cefr_level,
        hub: 'playground',
        ageGroup: 'kids',
        targetGrammar: grammarFocus,
        previousTopics: prevTopics,
      });
      const playgroundSystem = `${DATA_INTEGRITY_BLOCK}\n${playgroundPersona}${castingBlock}\n\nYou are an expert children's EdTech game designer. Create a highly interactive, fun English lesson. Keep vocabulary very simple. Output ONLY a valid JSON array of slide objects. Do not wrap in markdown or backticks. You MUST use a variety of these exact slide types.

STRICT SCHEMA (per type) — every slide MUST include a "voice" object { "text": string, "autoPlay": true }. Use simple 1-2 syllable words. NEVER include emojis in image fields — use the literal placeholder string "AI:<short subject>" anywhere an image is needed and the server will replace it with an AI-generated cartoon URL.

Allowed types and required shape:
{ "type": "intro", "title": "...", "text": "...", "image_url": "AI:<subject>", "voice": { "text": "...", "autoPlay": true } }
{ "type": "phonics_focus", "phoneme": "/æ/", "grapheme": "a", "sound_ipa": "/æ/", "label": "Listen to the sound", "example_words": ["CAT","BAT","HAT"], "voice": { "text": "short a", "autoPlay": true } }
{ "type": "vocab_solo", "word": "APPLE", "definition": "A red fruit.", "image_url": "AI:shiny red apple", "voice": { "text": "apple", "autoPlay": true } }
{ "type": "multiple", "question": "...", "options": ["a","b","c"], "answer": "<one of options>", "image_url": "AI:<subject>", "voice": {...} }
{ "type": "truefalse", "statement": "...", "answer": true|false, "image_url": "AI:<subject>", "voice": {...} }
{ "type": "fill", "text": "I see a ____", "answer": "<word>", "voice": {...} }
{ "type": "match", "instruction": "...", "pairs": [ { "word": "DOG", "image_url": "AI:friendly puppy" }, { "word": "CAT", "image_url": "AI:cute kitten" } ], "voice": {...} }
{ "type": "drag", "instruction": "Drag the word onto the picture", "word": "APPLE", "image_url": "AI:shiny red apple", "voice": {...} }
{ "type": "storybook", "title": "...", "topic": "...", "pages": [ { "page_number": 1, "text": "Short kid sentence", "image_url": "AI:<subject>" } ], "voice": {...} }

── TRAIL-STYLE GAMES (First English Adventure visual identity — USE THESE LIBERALLY) ──
{ "type": "memory", "instruction": "Find the matching pairs!", "emoji": "🧠", "pairs": [ { "id":"cat", "label":"cat", "emoji":"🐱" }, { "id":"dog", "label":"dog", "emoji":"🐶" } ], "voice": {...} }
  // 3–6 pairs. Each pair renders twice automatically as flip cards.

{ "type": "tap_order", "instruction": "Tap 1 to 5 in order!", "emoji": "🔢", "items": [ {"label":"1","emoji":"1️⃣"}, {"label":"2","emoji":"2️⃣"} ], "voice": {...} }
  // Items in TARGET ORDER; renderer shuffles visually. Use for numbers, alphabet, days.

{ "type": "hotspot", "instruction": "Tap each body part!", "emoji": "👀", "parts": [ {"label":"nose","emoji":"👃"}, {"label":"ear","emoji":"👂"} ], "prompts": ["nose","ear"], "voice": {...} }

{ "type": "thumbs", "instruction": "Do you like it?", "emoji": "👍", "items": [ {"label":"ice cream","emoji":"🍦","correct":"like"}, {"label":"spider","emoji":"🕷️","correct":"dislike"} ], "voice": {...} }
  // Balanced mix of like/dislike.

{ "type": "sort", "instruction": "Sort the animals!", "emoji": "🗂️", "buckets": [ {"id":"farm","label":"Farm","emoji":"🚜"}, {"id":"jungle","label":"Jungle","emoji":"🌴"} ], "items": [ {"label":"cow","emoji":"🐄","bucket":"farm"}, {"label":"tiger","emoji":"🐯","bucket":"jungle"} ], "voice": {...} }
  // Every item.bucket MUST equal an existing bucket.id.

{ "type": "word_builder", "instruction": "Build the word!", "emoji": "🔤", "word": "cat", "image_url": "AI:friendly cartoon cat", "extras": ["s","o"], "show_sounds": true, "voice": {...} }
  // CVC word-scramble. word ≤3 letters at Pre-A1; ≤5 at A1. 0–3 distractor "extras". show_sounds:true at Pre-A1.

{ "type": "sound_blend", "instruction": "Tap each sound, then blend!", "emoji": "🔊", "word": "cat", "sounds": ["c","a","t"], "image_url": "AI:friendly cartoon cat", "voice": {...} }
  // Phonemes as graphemes; digraphs are ONE tile: ["sh","i","p"]. sounds[] length = phoneme count.

${blueprintBlock}

RULES:
- Follow the STRICT ${isPreA1 ? "PRE-A1" : "PPP"} COUNTS above EXACTLY. Do not invent extra slides or skip phases.
- For every "AI:<subject>" placeholder, write a clear, kid-friendly subject ≤ 6 words.
- For EVERY slide include a short "teacher_notes" (≤120 chars) for the live teacher. Never shown to the student.
- Topic: "${effectiveTitle}". ${objective ? `Goal: ${objective}.` : ""}
- GAME VARIETY (MANDATORY): Include at least 4 trail-style game slides per lesson, chosen from: memory, tap_order, hotspot, thumbs, sort, word_builder, sound_blend. Do NOT make a lesson out of only "multiple" and "match" — those are bland. ${isPreA1 ? 'For Pre-A1, ALWAYS include ≥1 word_builder (CVC) and ≥1 sound_blend.' : 'For A1+, include ≥1 word_builder.'}
- VISUAL VARIETY: Vary slide types — never 2 of the same type in a row.
- Return RAW JSON ARRAY only.${preA1Directive}${buildHubEnforcementBlock('playground', cefr_level, {
  target_vocabulary: targetVocab,
  grammar_focus: grammarFocus,
  target_phonics: phonics,
  learning_objective: objective,
})}

${buildEarlyLearnerPromptBlock({ hub: 'playground', level: cefr_level })}`;

      const TRAIL_GAMES = ["memory", "tap_order", "hotspot", "thumbs", "sort", "word_builder", "sound_blend"];
      const allowed = isPreA1
        ? new Set(["intro", "phonics_focus", "vocab_solo", "multiple", "match", "drag", "draw", "lesson_summary", ...TRAIL_GAMES])
        : new Set(["intro", "phonics_focus", "vocab_solo", "multiple", "truefalse", "fill", "drag", "match", "storybook", "draw", "lesson_summary", ...TRAIL_GAMES]);

      const toCvc = (word?: string) => {
        const cleaned = String(word || "cat").toLowerCase().replace(/[^a-z]/g, "");
        return cleaned.length >= 2 && cleaned.length <= 5 ? cleaned : "cat";
      };
      const firstWord = toCvc(targetVocab?.[0]);
      const normalizePlaygroundType = (s: any) => {
        if (!s || typeof s !== "object") return s;
        if (["matching", "matching_pairs", "vocab_match_board", "listen_match", "listen_and_match", "audio_to_image_match", "rhyme_match"].includes(s.type)) {
          return { ...s, type: "match", instruction: s.instruction || s.prompt || "Tap a word, then tap its picture" };
        }
        if (s.type === "drag_drop") return { ...s, type: "drag", instruction: s.instruction || s.prompt || "Drag the word onto the picture" };
        if (["blend_builder", "blending_animation"].includes(s.type)) {
          const word = toCvc(s.word || s.answer || firstWord);
          return { ...s, type: "sound_blend", word, sounds: Array.isArray(s.sounds) ? s.sounds : word.split(""), image_url: s.image_url || `AI:${word}` };
        }
        if (["cvc_builder", "drag_the_letters", "decode_the_word"].includes(s.type)) {
          const word = toCvc(s.word || s.answer || firstWord);
          return { ...s, type: "word_builder", word, extras: Array.isArray(s.extras) ? s.extras : [], show_sounds: s.show_sounds ?? true, image_url: s.image_url || `AI:${word}` };
        }
        return s;
      };

      const ensureTrailCoverage = (slides: any[]) => {
        const present = new Set(slides.map((s) => s?.type));
        const additions: any[] = [];
        const add = (type: string, slide: any) => { if (!present.has(type)) { additions.push(slide); present.add(type); } };
        add("word_builder", { type: "word_builder", instruction: "Build the word!", emoji: "🔤", word: firstWord, image_url: `AI:${firstWord}`, extras: ["s", "o"], show_sounds: true, voice: { text: `Build ${firstWord}`, autoPlay: true }, teacher_notes: "Pip points to each letter; child taps the sounds." });
        add("sound_blend", { type: "sound_blend", instruction: "Tap each sound, then blend!", emoji: "🔊", word: firstWord, sounds: firstWord.split(""), image_url: `AI:${firstWord}`, voice: { text: firstWord.split("").join(" ") + `, ${firstWord}`, autoPlay: true }, teacher_notes: "Pip stretches the sounds, then blends the word." });
        const memoryWords = targetVocab.length > 0 ? targetVocab : ["cat", "dog", "sun"];
        add("memory", { type: "memory", instruction: "Find the matching pairs!", emoji: "🧠", pairs: memoryWords.slice(0, 3).map((w: string) => ({ id: toCvc(w), label: toCvc(w), image_url: `AI:${toCvc(w)}` })), voice: { text: "Find the matching pairs", autoPlay: true }, teacher_notes: "Pip flips one card; child finds its twin." });
        add("tap_order", { type: "tap_order", instruction: "Tap 1 to 5 in order!", emoji: "🔢", items: ["1", "2", "3", "4", "5"].map((n) => ({ label: n })), voice: { text: "Tap in order", autoPlay: true }, teacher_notes: "Pip counts with fingers while child taps." });
        return [...slides.slice(0, Math.max(1, slides.length - 1)), ...additions, ...slides.slice(Math.max(1, slides.length - 1))];
      };

      const callModel = async (extraUserMsg?: string): Promise<any[]> => {
        const messages: any[] = [
          { role: "system", content: playgroundSystem },
          { role: "user", content: `Generate the Playground deck for topic: "${effectiveTitle}". Output JSON array only.` },
        ];
        if (extraUserMsg) messages.push({ role: "user", content: extraUserMsg });

        const aiRes = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, max_tokens: 16384 }),
        });
        if (!aiRes.ok) throw new Error(`AI error ${aiRes.status}: ${await aiRes.text()}`);
        const aiData = await aiRes.json();
        const raw: string = aiData?.choices?.[0]?.message?.content ?? "";
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        let parsed: any;
        try { parsed = JSON.parse(cleaned); }
        catch {
          const m = cleaned.match(/\[[\s\S]*\]/);
          if (!m) throw new Error("AI did not return valid JSON array");
          parsed = JSON.parse(m[0]);
        }
        if (!Array.isArray(parsed)) throw new Error("AI did not return a JSON array");
        const normalized = parsed.map(normalizePlaygroundType);
        const filtered = normalized.filter((s: any) => s && allowed.has(s.type));
        if (filtered.length === 0) throw new Error("AI returned no valid Playground slides");
        return ensureTrailCoverage(filtered);
      };

      // Up to 2 retries on parse/validation failure.
      let playground_slides: any[] | null = null;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 3 && !playground_slides; attempt++) {
        try {
          playground_slides = await callModel(
            attempt === 0 ? undefined : "Your previous output was not valid JSON. Return ONLY a valid JSON array matching the schema. No prose, no markdown.",
          );
        } catch (e) { lastErr = e; }
      }
      if (!playground_slides) {
        return new Response(JSON.stringify({ error: `AI failed after retries: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ─── Hydrate "AI:<subject>" placeholders with generated cartoon URLs ───
      const subjects: string[] = [];
      const collect = (v: unknown) => {
        if (typeof v === "string" && v.startsWith("AI:")) {
          const subj = v.slice(3).trim();
          if (subj && !subjects.includes(subj)) subjects.push(subj);
        }
      };
      for (const s of playground_slides) {
        collect(s.image_url);
        if (Array.isArray(s.pairs)) for (const p of s.pairs) collect(p?.image_url);
      }
      let urlMap = new Map<string, string>();
      if (subjects.length > 0) {
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const imgRes = await fetch(`${supabaseUrl}/functions/v1/generate-playground-images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`,
            },
            body: JSON.stringify({ subjects: subjects.slice(0, 16) }),
          });
          if (imgRes.ok) {
            const j = await imgRes.json();
            for (const it of (j?.images ?? [])) {
              if (it?.subject && it?.url) urlMap.set(it.subject, it.url);
            }
          } else {
            console.error("image gen non-ok:", imgRes.status, await imgRes.text());
          }
        } catch (e) {
          console.error("image hydrate failed:", e);
        }
      }
      const fallback = "/playground/placeholder-dropzone.svg";
      const swap = (v: unknown) =>
        typeof v === "string" && v.startsWith("AI:")
          ? (urlMap.get(v.slice(3).trim()) ?? fallback)
          : v;
      for (const s of playground_slides) {
        if ("image_url" in s) s.image_url = swap(s.image_url);
        if (Array.isArray(s.pairs)) {
          s.pairs = s.pairs.map((p: any) => ({ ...p, image_url: swap(p?.image_url) }));
        }
        // Force autoplay audio so non-readers always hear the prompt.
        s.voice = { ...(s.voice || {}), autoPlay: true };
        if (!s.voice.text) {
          s.voice.text = s.question || s.statement || s.instruction || s.word || s.title || "";
        }
      }

      enforceVisualTheme(playground_slides);
      return new Response(JSON.stringify({ playground_slides }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Academy branch (TEFL/CELTA 7-block, 60-min teen lesson) ──────────
    if (hub_type === "academy") {
      const allowedBlocks = ["warmup", "vocab", "reading", "grammar", "practice", "interactive", "speaking"] as const;
      const allowedTypes = new Set([
        "intro","question","poll","opinion","vocab","matching","reading_passage","listening",
        "truefalse","multiple","grammar_pattern","grammar_color_decode","frequency_thermometer","grammar_formula","error_detection","correction","fill_blank",
        "sentence_builder","debate_scale","role_play","speaking_task","reflection","cluster","lesson_summary",
        "phonics_focus","listen_repeat",
      ]);

      const phonicsAcademy = blueprint?.target_phonics || body?.target_phonics || null;
      const phonicsAcademyFocus = (typeof phonicsAcademy === "string" ? phonicsAcademy : phonicsAcademy?.focus) || "";
      const phonicsAcademyBlock = phonicsAcademyFocus ? `

PRONUNCIATION LAYER (MANDATORY): The lesson MUST include EXACTLY 1 "phonics_focus" slide inside the "vocab" block (after the matching slide) framed as PRONUNCIATION ACCURACY for "${phonicsAcademyFocus}"${phonicsAcademy?.sound_ipa ? ` (IPA: ${phonicsAcademy.sound_ipa})` : ""}, with example_words drawn from the target vocabulary. Also include EXACTLY 1 "listen_repeat" slide inside the "practice" block providing a comparison_audio prompt drilling that same sound. Both slides MUST set "block": "vocab" or "block": "practice" respectively.` : "";

      const academyPersona = buildStudioSystemPrompt({
        role: 'pedagogue',
        cefr: cefr_level,
        hub: 'academy',
        ageGroup: 'teens',
        previousTopics: prevTopics,
      });
      const academySystem = `${DATA_INTEGRITY_BLOCK}\n${academyPersona}${castingBlock}\n\nYou are a Master TEFL/CELTA-trained ESL lesson designer for TEENAGERS.
Output ONLY a valid raw JSON array of slide objects (no markdown, no prose, no backticks).

Build a 60-minute Academy lesson at CEFR ${cefr_level}. Topic: "${effectiveTitle}". ${objective ? `Goal: ${objective}.` : ""}

STRICT 7-BLOCK STRUCTURE (60-MINUTE ACADEMY LESSON — pace ~2 min/slide → 26–30 slides total) — slides MUST appear in this order:
  1. warmup       — opinion / poll / question (3-4 slides)
  2. vocab        — prefer ONE "vocab_deck" (paginated cards with images) + ONE "vocab_image_match" (drag word↔image) + optional "matching" (4-6 slides)
  3. reading      — reading_passage + listening + comprehension multiple/truefalse (4-6 slides)
  4. grammar      — VISUAL FIRST: open with ONE creative grammar visual, then drill (4-5 slides total).
                   • Use "frequency_thermometer" whenever the target grammar is adverbs of frequency.
                   • Use "grammar_formula" for tense formulas (e.g. Present Perfect = Subject + have/has + V3).
                   • Use "grammar_color_decode" for word-order / sentence-anatomy patterns (color-coded chunks).
                   • Fall back to "grammar_pattern" only if none of the above fit.
                   • Follow the visual with "error_detection" and/or "correction" drills.
  5. practice     — fill_blank + sentence_builder + cluster (5-6 slides)
  6. interactive  — debate_scale + role_play (3-4 slides)
  7. speaking     — speaking_task + reflection (3-4 slides)

EVERY slide MUST include a "block" field equal to one of:
  "warmup" | "vocab" | "reading" | "grammar" | "practice" | "interactive" | "speaking".

Allowed types and required minimal shapes (omit any irrelevant key):
{ "type":"intro","block":"warmup","title":"...","subtitle":"..." }
{ "type":"question","block":"warmup","prompt":"...","placeholder":"" }
{ "type":"opinion","block":"warmup","prompt":"..." }
{ "type":"poll","block":"warmup","prompt":"...","options":[{"label":"A","pct":33},{"label":"B","pct":34},{"label":"C","pct":33}] }
{ "type":"vocab","block":"vocab","word":"...","definition":"...","example":"..." }
{ "type":"vocab_deck","block":"vocab","title":"Today's words","cards":[{"word":"...","definition":"...","example":"...","image_url":"AI:<subject>"}] }
{ "type":"vocab_image_match","block":"vocab","prompt":"Drag each word onto the matching image.","pairs":[{"word":"...","image_url":"AI:<subject>"}] }
{ "type":"matching","block":"vocab","prompt":"Match the pairs.","pairs":[{"left":"...","right":"..."}] }
{ "type":"reading_passage","block":"reading","title":"...","passage":"... 60-120 words ..." }
{ "type":"listening","block":"reading","prompt":"Listen and answer.","transcript":"..." }
{ "type":"multiple","block":"reading|vocab|practice|grammar","question":"...","options":["A","B","C"],"answer":"<one of options>" }
{ "type":"truefalse","block":"reading|practice","statement":"...","answer":true|false }
{ "type":"grammar_pattern","block":"grammar","title":"...","rows":[{"a":"...","b":"..."}],"rule":"..." }
{ "type":"grammar_color_decode","block":"grammar","title":"...","chunks":[{"role":"subject","text":"She"},{"role":"aux","text":"is"},{"role":"verb","text":"watching"},{"role":"object","text":"TikTok"},{"role":"time","text":"now"}],"variants":[{"chunks":[{"role":"subject","text":"They"},{"role":"aux","text":"are"},{"role":"verb","text":"playing"},{"role":"object","text":"games"}]}],"rule":"..." }
{ "type":"frequency_thermometer","block":"grammar","title":"How often?","shape":"thermometer","items":[{"adverb":"always","pct":100,"example":"..."},{"adverb":"usually","pct":85},{"adverb":"often","pct":70},{"adverb":"sometimes","pct":50},{"adverb":"rarely","pct":20},{"adverb":"never","pct":0}],"rule":"..." }
{ "type":"grammar_formula","block":"grammar","title":"...","terms":[{"label":"Subject","role":"subject"},{"label":"have/has","role":"aux"},{"label":"V3","role":"verb","note":"past participle"}],"example":[{"text":"She","role":"subject"},{"text":"has","role":"aux"},{"text":"eaten","role":"verb"}],"rule":"..." }
{ "type":"error_detection","block":"grammar","prompt":"Tap the wrong word.","sentence":"He go to school.","wrongIndex":1 }
{ "type":"correction","block":"grammar","prompt":"Fix the sentence.","wrong":"...","answer":"..." }
{ "type":"fill_blank","block":"practice","prompt":"Complete the sentence.","before":"...","after":"...","answer":"..." }
{ "type":"sentence_builder","block":"practice","prompt":"Order the words.","words":["..."],"answer":["..."] }
{ "type":"cluster","block":"practice","title":"Quick Drill","content":"...","activities":[
   {"type":"mcq","question":"...","options":["A","B","C"],"answer":"A"},
   {"type":"fill","text":"He ___ phone.","answer":"uses"},
   {"type":"tf","statement":"...","answer":true},
   {"type":"build","prompt":"Build it.","words":["I","use"],"answer":["I","use"]}
]}
{ "type":"debate_scale","block":"interactive","prompt":"..." }
{ "type":"role_play","block":"interactive","title":"...","lineA":"...","lineB":"..." }
{ "type":"speaking_task","block":"speaking","prompt":"...","starters":["I think…"] }
{ "type":"reflection","block":"speaking","prompt":"..." }
{ "type":"lesson_summary","block":"speaking","title":"Review Sheet","vocab_recap":["...","..."],"grammar_recap":"...","takeaway":"..." }

PEDAGOGICAL RULES:
- Vocabulary taught in block "vocab" MUST appear inside the "reading" passage AND in the "practice" cluster.
- Grammar pattern in block "grammar" MUST be required by the "speaking" prompts.
- Total 26-30 slides (NEVER fewer than 26). Block order is STRICT: never interleave blocks out of order. This deck MUST fill a full 60-minute classroom session.
- Use teen-appropriate, modern, culturally inclusive examples. Keep sentences level-appropriate (${cefr_level}).
- For EVERY slide, include a "teacher_notes" string (≤140 chars) telling the live teacher how to deliver the slide. Never reveal it to the student.
- The FINAL slide MUST be a "lesson_summary" auto-recapping the 5 vocab words taught + the grammar rule + a one-line takeaway.
- Return RAW JSON ARRAY only.${phonicsAcademyBlock}

ADDITIONAL ALLOWED TYPES (when phonics layer is required):
{ "type":"phonics_focus","block":"vocab","phoneme":"/v/","grapheme":"v","sound_ipa":"/v/","label":"/v/ vs /w/","example_words":["VAN","VERY","VISIT"] }
{ "type":"listen_repeat","block":"practice","prompt":"Listen and repeat. Notice the /v/ sound.","target_word":"VERY","comparison_audio_url":"" }
${buildHubEnforcementBlock('academy', cefr_level, {
  target_vocabulary: Array.isArray(blueprint?.target_vocabulary) ? blueprint.target_vocabulary : Array.isArray(blueprint?.vocabulary) ? blueprint.vocabulary : [],
  grammar_focus: blueprint?.grammar_focus || blueprint?.grammar || '',
  target_phonics: phonicsAcademy,
  learning_objective: objective,
})}

${buildEarlyLearnerPromptBlock({ hub: 'academy', level: cefr_level })}
`;

      const callAcademy = async (extra?: string): Promise<any[]> => {
        const messages: any[] = [
          { role: "system", content: academySystem },
          { role: "user", content: `Build the Academy 7-block deck for "${effectiveTitle}" at ${cefr_level}. JSON array only.` },
        ];
        if (extra) messages.push({ role: "user", content: extra });
        const aiRes = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, max_tokens: 16384 }),
        });
        if (!aiRes.ok) throw new Error(`AI error ${aiRes.status}: ${await aiRes.text()}`);
        const aiData = await aiRes.json();
        const raw: string = aiData?.choices?.[0]?.message?.content ?? "";
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        let parsed: any;
        try { parsed = JSON.parse(cleaned); }
        catch {
          const m = cleaned.match(/\[[\s\S]*\]/);
          if (!m) throw new Error("AI did not return valid JSON array");
          parsed = JSON.parse(m[0]);
        }
        if (!Array.isArray(parsed)) throw new Error("AI did not return a JSON array");

        const filtered = parsed.filter((s: any) =>
          s && allowedTypes.has(s.type) && (allowedBlocks as readonly string[]).includes(s.block),
        );
        if (filtered.length < 24) throw new Error(`AI returned only ${filtered.length} valid Academy slides (need ≥24 for a 60-minute lesson)`);

        // Validate strict block order: each block must appear at least once and in canonical order.
        const seen: string[] = [];
        for (const s of filtered) {
          if (seen[seen.length - 1] !== s.block) seen.push(s.block);
        }
        const orderIdx = seen.map((b) => allowedBlocks.indexOf(b as any));
        for (let i = 1; i < orderIdx.length; i++) {
          if (orderIdx[i] < orderIdx[i - 1]) {
            throw new Error(`Blocks out of order: ${seen.join(" → ")}`);
          }
        }
        const present = new Set(seen);
        const missing = allowedBlocks.filter((b) => !present.has(b));
        if (missing.length > 0) throw new Error(`Missing required blocks: ${missing.join(", ")}`);
        return filtered;
      };

      let academy_slides: any[] | null = null;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 3 && !academy_slides; attempt++) {
        try {
          academy_slides = await callAcademy(
            attempt === 0
              ? undefined
              : `Your previous output failed validation: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}. Return the deck again, fixing this and obeying the strict 7-block order, with every slide tagged with a valid "block".`,
          );
        } catch (e) { lastErr = e; }
      }
      if (!academy_slides) {
        return new Response(JSON.stringify({ error: `Academy AI failed after retries: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      enforceVisualTheme(academy_slides);
      return new Response(JSON.stringify({ academy_slides }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── Success branch (Business English, 7-block 60-min adult lesson) ────
    if (hub_type === "success" || normalizeHub(target_hub ?? hub) === "Success") {
      const allowedBlocks = ["warmup", "vocab", "context", "functional", "practice", "simulation", "output"] as const;
      const allowedTypes = new Set([
        "intro","question","opinion","vocab","matching","reading_passage","listening","multiple",
        "tone_compare","functional_pattern","rewrite","fill_blank","cluster",
        "scenario","email_task","role_play","speaking_task","reflection","lesson_summary",
      ]);

      const phonicsSuccess = blueprint?.target_phonics || body?.target_phonics || null;
      const phonicsSuccessFocus = (typeof phonicsSuccess === "string" ? phonicsSuccess : phonicsSuccess?.focus) || "";
      const phonicsSuccessBlock = phonicsSuccessFocus ? `

PRONUNCIATION LAYER (MANDATORY): Include EXACTLY 1 pronunciation-oriented "multiple" or "cluster" slide inside the "vocab" or "practice" block drilling "${phonicsSuccessFocus}"${(phonicsSuccess as any)?.sound_ipa ? ` (IPA: ${(phonicsSuccess as any).sound_ipa})` : ""}, framed for adult professionals (word stress, intonation, connected speech, weak forms).` : "";

      const successPersona = buildStudioSystemPrompt({
        role: 'pedagogue',
        cefr: cefr_level,
        hub: 'success',
        ageGroup: 'adults',
        previousTopics: prevTopics,
      });

      const successSystem = `${DATA_INTEGRITY_BLOCK}\n${successPersona}${castingBlock}\n\nYou are a Master Business English / ESP lesson designer for ADULT PROFESSIONALS.
Output ONLY a valid raw JSON array of slide objects (no markdown, no prose, no backticks).

Build a 60-minute Success (Business English) lesson at CEFR ${cefr_level}. Topic: "${effectiveTitle}". ${objective ? `Goal: ${objective}.` : ""}

STRICT 7-BLOCK STRUCTURE (60-MINUTE SUCCESS HUB LESSON — pace ~2 min/slide → 26–30 slides total) — slides MUST appear in this order:
  1. warmup       — intro / opinion / question (3-4 slides)
  2. vocab        — vocab + matching (4-6 slides)
  3. context      — reading_passage (workplace email/message) + listening + comprehension multiple (4-6 slides)
  4. functional   — tone_compare + functional_pattern (3-4 slides)
  5. practice     — rewrite + fill_blank + cluster (5-6 slides)
  6. simulation   — scenario + email_task + role_play (3-4 slides)
  7. output       — speaking_task + reflection + lesson_summary (3-4 slides)

EVERY slide MUST include a "block" field equal to one of:
  "warmup" | "vocab" | "context" | "functional" | "practice" | "simulation" | "output".

Allowed types and required minimal shapes (omit any irrelevant key):
{ "type":"intro","block":"warmup","title":"...","subtitle":"..." }
{ "type":"question","block":"warmup","prompt":"...","placeholder":"" }
{ "type":"opinion","block":"warmup","prompt":"...","options":["A","B","C"] }
{ "type":"vocab","block":"vocab","word":"...","definition":"professional definition","example":"... workplace example ..." }
{ "type":"matching","block":"vocab","prompt":"Match the pairs.","pairs":[{"left":"...","right":"..."}] }
{ "type":"reading_passage","block":"context","title":"Short message","passage":"... 60-140 words workplace email/message ..." }
{ "type":"listening","block":"context","prompt":"Listen and answer.","transcript":"..." }
{ "type":"multiple","block":"context|practice","prompt":"Choose the correct answer.","items":[{"question":"...","options":["A","B","C"],"answer":"A"}] }
{ "type":"tone_compare","block":"functional","title":"Direct vs. Polite","direct":"Send me the file.","polite":"Could you please send me the file when you have a moment?","note":"..." }
{ "type":"functional_pattern","block":"functional","title":"...","rule":"...","examples":["...","...","..."] }
{ "type":"rewrite","block":"practice","prompt":"Rewrite to sound more professional.","original":"...","instruction":"...","sample":"..." }
{ "type":"fill_blank","block":"practice","prompt":"Complete the polite request.","items":[{"before":"...","answer":"...","after":"..."}] }
{ "type":"cluster","block":"practice","title":"Quick Drill","content":"...","activities":[
   {"type":"mcq","question":"...","options":["A","B","C"],"answer":"A","explanation":"..."},
   {"type":"fill","text":"Could you please ___ the agenda?","answer":"send"},
   {"type":"rewrite","text":"Send me the file.","instruction":"Make it polite.","sample":"Could you please send me the file?"}
]}
{ "type":"scenario","block":"simulation","title":"...","situation":"...","task":"...","placeholder":"Hi [name], could you please…" }
{ "type":"email_task","block":"simulation","subject":"...","brief":"...","sample":"Hi [name],\\n\\n…\\n\\nThanks,\\n[You]" }
{ "type":"role_play","block":"simulation","title":"...","lineA":"...","lineB":"..." }
{ "type":"speaking_task","block":"output","prompt":"...","starters":["I'd like to…"] }
{ "type":"reflection","block":"output","prompt":"..." }
{ "type":"lesson_summary","block":"output","title":"Review Sheet","vocab_recap":["...","..."],"grammar_recap":"...","takeaway":"..." }

PEDAGOGICAL RULES:
- Adult professional register at ALL times — no childish copy, no teen slang.
- Vocabulary taught in block "vocab" MUST appear inside the "context" passage AND in the "practice" cluster.
- Functional patterns in block "functional" MUST be required by the "simulation" and "output" prompts.
- Total 26-30 slides (NEVER fewer than 26). Block order is STRICT: never interleave blocks out of order. This deck MUST fill a full 60-minute professional session.
- For EVERY slide, include a "teacher_notes" string (≤140 chars) telling the live teacher how to deliver the slide. Never shown to the student.
- The FINAL slide MUST be a "lesson_summary" recapping up to 5 vocab + the functional pattern + a one-line takeaway.
- Return RAW JSON ARRAY only.${phonicsSuccessBlock}
${buildHubEnforcementBlock('success', cefr_level, {
  target_vocabulary: Array.isArray(blueprint?.target_vocabulary) ? blueprint.target_vocabulary : Array.isArray(blueprint?.vocabulary) ? blueprint.vocabulary : [],
  grammar_focus: blueprint?.grammar_focus || blueprint?.grammar || '',
  target_phonics: phonicsSuccess,
  learning_objective: objective,
})}
`;

      const callSuccess = async (extra?: string): Promise<any[]> => {
        const messages: any[] = [
          { role: "system", content: successSystem },
          { role: "user", content: `Build the Success 7-block Business English deck for "${effectiveTitle}" at ${cefr_level}. JSON array only.` },
        ];
        if (extra) messages.push({ role: "user", content: extra });
        const aiRes = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, max_tokens: 16384 }),
        });
        if (!aiRes.ok) throw new Error(`AI error ${aiRes.status}: ${await aiRes.text()}`);
        const aiData = await aiRes.json();
        const raw: string = aiData?.choices?.[0]?.message?.content ?? "";
        const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
        let parsed: any;
        try { parsed = JSON.parse(cleaned); }
        catch {
          const m = cleaned.match(/\[[\s\S]*\]/);
          if (!m) throw new Error("AI did not return valid JSON array");
          parsed = JSON.parse(m[0]);
        }
        if (!Array.isArray(parsed)) throw new Error("AI did not return a JSON array");

        const filtered = parsed.filter((s: any) =>
          s && allowedTypes.has(s.type) && (allowedBlocks as readonly string[]).includes(s.block),
        );
        if (filtered.length < 24) throw new Error(`AI returned only ${filtered.length} valid Success slides (need ≥24 for a 60-minute lesson)`);

        // Validate strict block order — each present block in canonical order.
        const seen: string[] = [];
        for (const s of filtered) {
          if (seen[seen.length - 1] !== s.block) seen.push(s.block);
        }
        const orderIdx = seen.map((b) => allowedBlocks.indexOf(b as any));
        for (let i = 1; i < orderIdx.length; i++) {
          if (orderIdx[i] < orderIdx[i - 1]) {
            throw new Error(`Blocks out of order: ${seen.join(" → ")}`);
          }
        }
        const present = new Set(seen);
        const missingBlocks = allowedBlocks.filter((b) => !present.has(b));
        if (missingBlocks.length > 0) throw new Error(`Missing required blocks: ${missingBlocks.join(", ")}`);
        return filtered;
      };

      let success_slides: any[] | null = null;
      let lastErr: unknown = null;
      for (let attempt = 0; attempt < 3 && !success_slides; attempt++) {
        try {
          success_slides = await callSuccess(
            attempt === 0
              ? undefined
              : `Your previous output failed validation: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}. Return the deck again, fixing this and obeying the strict 7-block order, with every slide tagged with a valid "block".`,
          );
        } catch (e) { lastErr = e; }
      }
      if (!success_slides) {
        return new Response(JSON.stringify({ error: `Success AI failed after retries: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}` }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      enforceVisualTheme(success_slides);
      return new Response(JSON.stringify({ success_slides }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }



    const resolvedHub = normalizeHub(target_hub ?? blueprint?.target_hub ?? hub);
    const hubBlock = buildSlideHubBlock(resolvedHub, cefr_level);

    // Phase sequence — driven by the blueprint when present, else fall back to the
    // legacy 6-step Integrated Skills order.
    const blueprintPhases: LessonPhase[] = Array.isArray(blueprint?.phases)
      ? blueprint!.phases.filter(isPhase)
      : [];
    const usingDynamicPhases = blueprintPhases.length >= 4;
    const dynamicPhaseBlock = usingDynamicPhases
      ? buildPhaseSequenceBlock(blueprintPhases, blueprint?.pedagogical_framework)
      : "";

    // Authoritative slide sequence — when the planner provided
    // blueprint.lesson_structure, instruct the AI to follow it exactly.
    const lessonStructure: Array<{ phase: string; slide_type?: string; note?: string }> =
      Array.isArray(blueprint?.lesson_structure) ? blueprint!.lesson_structure : [];
    const structureBlock = lessonStructure.length > 0
      ? `\n\nAUTHORITATIVE LESSON STRUCTURE (MUST follow in order — one slide per entry, plus the mandatory lesson_summary at the end):\n${lessonStructure
          .map((e, i) => `  ${i + 1}. lesson_phase=${e.phase}${e.slide_type ? ` · type=${e.slide_type}` : ''}${e.note ? ` — ${e.note}` : ''}`)
          .join('\n')}\n`
      : "";

    const successPersona = buildStudioSystemPrompt({
      role: 'pedagogue',
      cefr: cefr_level,
      hub: resolvedHub,
      ageGroup: resolvedHub === 'success' ? 'adults' : resolvedHub === 'playground' ? 'kids' : 'teens',
      previousTopics: prevTopics,
    });

    // CEFR-tiered pronunciation layer for Success / generic decks.
    const phonicsGeneric = blueprint?.target_phonics || body?.target_phonics || null;
    const phonicsGenericFocus = (typeof phonicsGeneric === "string" ? phonicsGeneric : phonicsGeneric?.focus) || "";
    const phonicsGenericIPA = (phonicsGeneric as any)?.sound_ipa || (phonicsGeneric as any)?.phoneme || "";
    const pronunciationBlock = phonicsGenericFocus ? `

PRONUNCIATION LAYER (MANDATORY when target_phonics is supplied):
TARGET PRONUNCIATION FOCUS: "${phonicsGenericFocus}"${phonicsGenericIPA ? ` (IPA: ${phonicsGenericIPA})` : ""}.
Insert EXACTLY 1 dedicated pronunciation slide inside the vocab/practice phase — frame it for ${resolvedHub === 'success' ? 'adult professionals (workplace context, e.g. word stress, intonation, connected speech, weak forms)' : 'the target learner level'}. Use a "multiple" or "drag" slide drilling the focus with example phrases drawn from the target vocabulary. Add a short "teacher_notes" explaining how to model the sound.
` : "";

    const variantThemeBlock = `

REGIONAL LANGUAGE VARIANT (MANDATORY): ${language_variant}.
ALL slide text — vocabulary definitions, example sentences, reading passages, dialogues,
quiz questions, hints, teacher notes — MUST use spelling and lexis matching this variant.
- "American English" → color, fries, elevator, apartment, soccer.
- "British English"  → colour, chips, lift, flat, football.
- "Global/Neutral"   → avoid region-specific slang or spellings.

VISUAL THEME (MANDATORY for every image_prompt / image_prompt_detailed): ${visual_theme}.
After describing the scene, you MUST append this exact suffix to every image_prompt:
"${visualThemeSuffix}"
Do not change wording from this suffix; the renderer relies on it.
${learning_objective ? `\nLEARNING OBJECTIVE (SWBAT — drives every slide): "${learning_objective}".` : ''}
${final_output_task ? `\nFINAL OUTPUT TASK (the LAST slide MUST implement this exact production task): "${final_output_task}".` : ''}
`;

    const systemPrompt = `${DATA_INTEGRITY_BLOCK}\n${successPersona}${castingBlock}${pronunciationBlock}${variantThemeBlock}\n\nYou are the EXPERT CURRICULUM DESIGNER for Engleuphoria — an elite ESL platform.
You design ONE classroom-ready 1-HOUR (≈60 minute) deeply COHESIVE interactive lesson as a 26–30 slide deck.
Total slide count MUST be between 26 and 30 inclusive — never fewer than 26. Pace ≈ 2 minutes per slide so the deck genuinely fills a full 60-minute classroom session.

UNIVERSAL ADD-ONS (apply to EVERY slide unless impossible):
• Include a "teacher_notes" string (≤140 chars) — a single sentence telling the live teacher how to deliver this slide. Never shown to the student.
• The FINAL slide MUST be { "type": "lesson_summary", ... } recapping up to 5 vocabulary words taught + the grammar rule + a one-sentence takeaway.
• If hub === "success" / Business English: include 7 ordered blocks (warmup, vocab, context, functional, practice, simulation, output) AND append 3–4 EXTRA slides tagged "block": "buffer" with "is_buffer": true — these are optional review/extension activities the teacher uses if time remains.

You think like a chess master 5 moves ahead. The vocabulary you teach in Phase 1 MUST appear in
the reading passage in Phase 2. The grammar rule you extract in Phase 4 MUST be required in
Phase 5 speaking and Phase 6 writing prompts. Every slide is part of one woven story.

═══════════════════════════════════════════════════════
RULE 1 — THE 6-STEP INTEGRATED SKILLS BLUEPRINT (STRICT ORDER, MANDATORY)
═══════════════════════════════════════════════════════
The deck MUST follow this EXACT 6-phase sequence, in order. Every slide MUST be tagged with
"lesson_phase" matching one of: "Vocabulary" | "Reading" | "Comprehension" | "Grammar" | "Speaking" | "Writing".

• Phase 1 — VOCABULARY INTRO  (3–4 slides, lesson_phase = "Vocabulary")
  Introduce 5–8 target words (the TARGET LEXICON). Each must include a clear definition + an example sentence.
  End the phase with at least ONE quick check: a "drag_and_match" or "multiple_choice" slide to verify recognition.
  slide_type mix: "flashcard", "mascot_speech", "drag_and_match", "multiple_choice".

• Phase 2 — CONTEXTUAL READING  (1–3 slides, lesson_phase = "Reading")
  A reading passage (article, story, dialogue, email, message thread) that NATURALLY incorporates the
  Phase 1 TARGET LEXICON. Every Phase-1 vocabulary word MUST appear at least once in the reading.
  IMPORTANT: If the total reading text exceeds 100 words, split it across MULTIPLE consecutive
  Reading slides (e.g., paragraph-by-paragraph). Never put a wall of text on a single slide.
  Wrap every TARGET LEXICON word in the reading text with **double asterisks** (markdown bold)
  so the renderer can highlight them for the student. Example: "She **ordered** a coffee."
  slide_type: "mascot_speech" or "flashcard". layout_style should be "split_left" for reading slides.

• Phase 3 — COMPREHENSION CHECK  (3–4 slides, lesson_phase = "Comprehension")
  Gamified questions that test understanding of the Phase 2 reading.
  Use a mix of "fill_in_the_gaps" and "multiple_choice". No two same slide_type back-to-back.

• Phase 4 — GRAMMAR FOCUS  (4–5 slides, lesson_phase = "Grammar")
  Extract ONE grammar rule actually used in the Phase 2 reading. First explain the rule clearly
  (mascot_speech / flashcard). Then drill with controlled practice: "drag_and_match" (matching tense
  forms), "fill_in_the_gaps" (rule application), or "multiple_choice".

• Phase 5 — SPEAKING / DISCUSSION  (2–3 slides, lesson_phase = "Speaking")
  Open-ended speaking prompts or roleplay scenarios that REQUIRE the student to use BOTH the
  Phase-1 target lexicon AND the Phase-4 grammar rule. set requires_audio = true on these slides.
  slide_type: "mascot_speech" (with prompt in interactive_data) or "drawing_canvas".

• Phase 6 — WRITING & HOMEWORK MISSIONS  (2–3 slides, lesson_phase = "Writing")
  Final production. The student WRITES (drawing_canvas or fill_in_the_gaps with longer answers)
  using the target lexicon + grammar in a real-world scenario (reply to an email, write a caption,
  send a message). The 3–5 homework_missions reinforce the same TARGET LEXICON.

Phase totals MUST sum to 20–25. Distribution example: 4 + 2 + 4 + 5 + 3 + 3 = 21.

═══════════════════════════════════════════════════════
RULE 2 — SKILL TAGGING (MANDATORY for every slide)
═══════════════════════════════════════════════════════
Every slide MUST include a non-empty "target_skills" array drawn from:
["Reading", "Writing", "Listening", "Speaking", "Grammar", "Vocabulary"].
Across the FULL deck, AT LEAST 3 of the four CORE skills (Reading, Writing, Listening, Speaking) MUST appear.

═══════════════════════════════════════════════════════
RULE 3 — AUDIO GATING (MANDATORY for every slide)
═══════════════════════════════════════════════════════
Every slide MUST include a boolean "requires_audio".
true ONLY for: pronunciation modelling, listening comprehension, dialogue, songs, and Phase-5 Speaking prompts.
false for: silent reading, drag-and-match, fill-in-the-gaps, grammar explanation, writing.

═══════════════════════════════════════════════════════
RULE 4 — SMART MEDIA ROUTING
═══════════════════════════════════════════════════════
For EVERY slide pick the best media_type for the visual_keyword:
• "image" — static nouns, adjectives, reading-supportive scene art, backgrounds for games.
• "video" — action verbs, emotions, brain-breaks, hook energy.
If unsure, default to "image".

═══════════════════════════════════════════════════════
RULE 5 — DIVERGENT INTERACTIVITY
═══════════════════════════════════════════════════════
You are FORBIDDEN from placing two slides of the SAME slide_type back-to-back, EXCEPT consecutive
"mascot_speech" slides inside the Reading phase (multi-slide passages) or the Vocabulary phase (intros).

═══════════════════════════════════════════════════════
RULE 6 — INTERACTIVE_DATA SHAPES (by slide_type)
═══════════════════════════════════════════════════════
• mascot_speech    → { "speech": string }
• multiple_choice  → { "question": string, "options": string[4], "correct_index": 0..3 }
• flashcard        → { "front": string, "back": string }
• drawing_canvas   → { "prompt": string }
• drag_and_drop    → { "instruction": string, "items": string[], "targets": string[], "pairs": [{"item": string, "target": string}] }
• drag_and_match   → { "instruction": string, "pairs": [{"left_item": string, "right_item": string, "left_thumbnail_keyword"?: string, "right_thumbnail_keyword"?: string}] }
                     // EXACTLY 3 pairs.
• fill_in_the_gaps → { "instruction": string, "sentence_parts": string[], "missing_word": string, "distractors": string[2..3] }
• drag_and_drop_sorting → { "instruction": string, "categories": string[2..3], "draggable_items": [{"text": string, "category": string}] }
                          // 8-12 items distributed across categories. Example for /sh/ vs /th/:
                          // { categories: ["sh","th"], draggable_items: [{text:"ship",category:"sh"},{text:"this",category:"th"},...] }
• matching_lines → { "instruction": string, "left_column": string[3..6], "right_column": string[3..6], "pairs": [[leftIdx, rightIdx], ...] }
                   // Example present↔past:
                   // { left_column:["go","eat","run"], right_column:["ate","ran","went"], pairs:[[0,2],[1,0],[2,1]] }
• tracing_canvas → { "instruction": string, "target_letters": string[1..4], "font_style": "print" | "cursive" }
                   // Pre-A1 / Playground only. Example: { target_letters:["C","c"], font_style:"print" }
• spinner_wheel → { "instruction": string, "wheel_segments": string[4..8], "prompt_template"?: string }
                  // Speaking practice. Example: { wheel_segments:["cat","mat","hat","bat"], prompt_template:"Say: {segment}" }

═══════════════════════════════════════════════════════
RULE 6B — PREMIUM EDITORIAL SLIDE TYPES (OPTIONAL — USE FOR RICHER UX)
═══════════════════════════════════════════════════════
You may ALSO use these premium slide_type values. The frontend has dedicated wide-format components for each:
• hero_media             → { "description": string, "requires_video": boolean, "youtube_query"?: string, "image_prompt_detailed"?: string }
• vocab_list             → { "words": string[], "examples": string[] }
• grammar_explanation    → { "rule_text": string, "common_signals": string, "examples": string[] }
• sorting_game           → { "categories": string[2..3], "items": [{"word": string, "correct_category": string}] }
• fill_in_blanks         → { "sentences": [{"text_with_blank": string, "hint": string, "correct_answer": string}] }
• match_halves           → { "pairs": [{"left_part": string, "right_part": string}] }  // Frontend shuffles right parts
• quiz_mcq               → { "question": string, "options": string[4], "correct_index": 0..3, "explanation"?: string }
• role_play              → { "scenario_text": string, "tips": string[], "key_phrases": string[], "requires_voice_recording": true }
• audio_listening        → { "audio_script": string, "description": string }
                           // audio_script = exact text for ElevenLabs TTS. The frontend shows a placeholder player + script.
• true_false             → { "statements": [{"text": string, "is_true": boolean}] }
                           // 3-6 statements the student marks True or False.
• sentence_builder       → { "target_sentence": string, "scrambled_words": string[] }
                           // Student drags scrambled words into the correct order.
• reading_quiz           → Same schema as quiz_mcq. Use for comprehension questions after a reading passage.
• listening_comprehension → Same schema as quiz_mcq. Use for comprehension questions after an audio_listening slide.
• match_words            → Same schema as sorting_game. Use to test vocab by sorting words into meaning categories.
• image_match            → Same schema as sorting_game. Use to match words to visual categories.

For EVERY interactive slide (multiple_choice, drag_and_match, fill_in_the_gaps, drag_and_drop) you
MUST also include a top-level "hint_text": short kid-friendly hint (≤ 90 chars) revealed after the
student's first wrong answer. Never spoil the answer outright — guide them. Example for a past
tense gap: "Past tense often ends in -ed."

═══════════════════════════════════════════════════════
RULE 6C — INTERACTIVE_DATA IS STRICTLY REQUIRED
═══════════════════════════════════════════════════════
For ANY slide whose slide_type is one of: quiz_mcq, multiple_choice, reading_quiz,
listening_comprehension, fill_in_blanks, fill_in_the_gaps, match_halves, match_words, image_match,
sorting_game, sentence_builder, true_false, drag_and_match, drag_and_drop —
the "interactive_data" field is STRICTLY REQUIRED and MUST contain ALL keys defined for that type
in RULE 6 / RULE 6B (e.g. options + correct_index for quizzes, sentences[] for fill_in_blanks,
pairs[] for match_halves, items + categories for sorting_game). Slides emitted with empty or missing
interactive_data WILL BE REJECTED by the server validator and dropped from the final deck.

═══════════════════════════════════════════════════════
RULE 12 — NO DUPLICATE / REDUNDANT SLIDES
═══════════════════════════════════════════════════════
DO NOT generate duplicate speaking exercises (no two real_world_task, no two role_play,
no two shadowing_drill in the same deck). DO NOT repeat the same slide_type back-to-back
(see RULE 5). DO NOT pad with redundant review activities — every slide must teach something
new or test something just taught.

═══════════════════════════════════════════════════════
RULE 7 — MULTIMODAL MEDIA PROMPTS (THE AI ART DIRECTOR)
═══════════════════════════════════════════════════════
For every slide that has a visual (vocab presentation, hero image, drag_and_match thumbnails,
flashcards, etc.) you MUST emit a HIGHLY DESCRIPTIVE "image_generation_prompt" — never a generic
prompt. Describe the SPECIFIC concept, character, action, environment, mood, and composition
in 25+ words. Do NOT include the visual style — the platform appends a hub-specific style suffix
automatically. Examples:
  • Word "Bear" (Playground): "A friendly fluffy brown bear character sitting upright in a colourful
    sun-dappled forest clearing, holding a small red apple, smiling, soft natural light, centred composition."
  • Word "Negotiation" (Success): "Two professionals across a polished walnut table mid-conversation,
    one taking notes, warm window light, modern glass office, eye-level shot, shallow depth."
Other media fields:
  • "elevenlabs_script": Phonetic, kid-friendly TTS string under 120 chars.
  • "video_generation_prompt": 2–4s seamlessly looping motion; end with "seamless loop, solid pastel background, no text, no camera motion."

═══════════════════════════════════════════════════════
RULE 7B — AUTONOMOUS YOUTUBE CONTEXT ENGINE
═══════════════════════════════════════════════════════
For EVERY slide also emit:
  • "requires_video": boolean — true ONLY when a real YouTube clip would teach better than a still image
    (typical: hook scenes, real-world dialogues, listening comprehension, cultural context).
  • "youtube_query": string — when requires_video is true, write a HIGHLY SPECIFIC search query
    (≤ 90 chars). Otherwise pass an empty string.
Distribution rule: at most 2 slides in the entire deck may have requires_video = true. Default false.
If the APPROVED BLUEPRINT below contains a video_strategy block, you MUST set requires_video = true
on EXACTLY ONE slide whose lesson_phase matches video_strategy.target_phase, and copy
video_strategy.youtube_query verbatim into that slide's youtube_query. Add a short text prompt
for active listening into that slide's "content" (e.g. "Watch how she apologises. Which word does she use?").

═══════════════════════════════════════════════════════
RULE 8 — GAMIFIED HOMEWORK MISSIONS (MANDATORY)
═══════════════════════════════════════════════════════
Generate EXACTLY 3 to 5 "homework_missions" that recycle the Phase-1 TARGET LEXICON.
Each mission MUST be one of:
• "memory_match"      → { mission_type, prompt, pairs: [{ term, match }] }   // 3–5 pairs
• "listen_and_choose" → { mission_type, prompt, target_word, options: string[3..4], correct_answer }
• "word_scramble"     → { mission_type, prompt, target_word, scrambled }
Vary mission_type. correct_answer ∈ options. scrambled ≠ target_word.

═══════════════════════════════════════════════════════
GENERAL TONE
═══════════════════════════════════════════════════════
Supportive, professional, joyful. CEFR-aligned. No placeholders.
"content" = short on-slide text (1–3 sentences max). For Reading slides, "content" carries the
passage paragraph (with **bold** target words).
"teacher_script" = 2–3 high-energy sentences for the teacher to read aloud.

═══════════════════════════════════════════════════════
RULE 9 — CONTEXT-AWARE ACTIVITY SEQUENCING (MANDATORY)
═══════════════════════════════════════════════════════
NEVER generate random activities. Every teaching slide MUST be immediately followed by its
corresponding intensive practice slide testing the EXACT content just taught:

• VOCABULARY RULE: A "vocab_list" slide → immediate next slide MUST be "match_words" or "image_match"
  testing those exact words (same categories derived from the vocab definitions).
• GRAMMAR RULE: A "grammar_explanation" slide → immediate next slide MUST be "fill_in_blanks" or
  "sentence_builder" testing that exact grammar rule with sentences that require applying it.
• READING RULE: A reading passage (mascot_speech in Reading phase) → immediate next slide MUST be
  "reading_quiz" (quiz_mcq) or "true_false" based strictly on the passage content.
• LISTENING RULE: An "audio_listening" slide → immediate next slide MUST be "listening_comprehension"
  (quiz_mcq) with questions about the audio script content.
• SHADOWING RULE: After a "listening_comprehension" slide, you MUST follow with a "shadowing_drill"
  where the student repeats a key phrase from the audio script out loud.

This pairing is NON-NEGOTIABLE. The practice slide must reference the SPECIFIC words, rules,
or passage from the teaching slide — never generic or unrelated content.

═══════════════════════════════════════════════════════
RULE 10 — THE FINAL BOSS (MANDATORY)
═══════════════════════════════════════════════════════
The LAST teaching/activity slide before the lesson ends MUST be a "real_world_task". This is an
open-ended roleplay/production scenario where the student must speak or type a free-form answer
using the lesson's target vocabulary and grammar. It is the ultimate test of applied knowledge.

═══════════════════════════════════════════════════════
RULE 11 — HYPER-PERSONALIZATION
═══════════════════════════════════════════════════════
If the request payload includes student_profile data (industry, age, interests), you MUST weave
that context into examples, vocabulary sentences, scenarios, and role-play prompts. A student
interested in cooking should get food-related examples; a finance professional should get
business-context sentences. This makes the lesson feel tailor-made.

═══════════════════════════════════════════════════════
RULE 12 — BRANCHING DIALOGUE (NEW PREMIUM TYPE)
═══════════════════════════════════════════════════════
You may generate "branching_dialogue" slides for the Speaking phase. These create an interactive
conversation simulator where the student chooses from 3 response options, each triggering a
unique AI reaction.

═══════════════════════════════════════════════════════
RULE 6C — NEW SLIDE TYPE SCHEMAS
═══════════════════════════════════════════════════════
• shadowing_drill       → { "target_phrase": string, "requires_voice_recording": true }
                          // Student must repeat this exact phrase. Used after listening activities.
• real_world_task       → { "mission_briefing": string, "success_criteria": string[], "mode": "speaking" | "writing" }
                          // Open-ended final production task. success_criteria lists grammar/vocab they must include.
• branching_dialogue    → { "scenario_context": string, "ai_starting_message": string,
                           "options": [{"text": string, "consequence_feedback": string}] }
                          // 3 options. Each has the student's reply and the AI's reaction.

${hubBlock}

${dynamicPhaseBlock ? dynamicPhaseBlock + "\n\nThe DYNAMIC PHASE SEQUENCE above OVERRIDES the default 6-step order in RULE 1 — follow the dynamic order instead, but keep all other RULE 1 phase requirements (vocab counts, reading word coverage, grammar drilling, etc.)." : ""}${structureBlock}`;

    // ── BLUEPRINT GROUND-TRUTH BLOCK (only when caller supplied a blueprint) ──
    let blueprintBlock = "";
    if (blueprint && typeof blueprint === "object") {
      const vocabList = Array.isArray(blueprint.target_vocabulary)
        ? blueprint.target_vocabulary
            .filter((v: any) => v && typeof v.word === "string" && v.word.trim())
            .map((v: any) => {
              const def = v.definition ? ` — ${v.definition}` : "";
              const ex = v.example ? `  e.g. "${v.example}"` : "";
              return `  • ${v.word}${def}${ex}`;
            })
            .join("\n")
        : "";
      blueprintBlock = `

═══════════════════════════════════════════════════════
APPROVED BLUEPRINT — TREAT AS GROUND TRUTH
═══════════════════════════════════════════════════════
The teacher has reviewed and approved this plan. You MUST NOT invent additional vocabulary
words or substitute the grammar rule with a different one.

TARGET LEXICON (Phase 1 must teach EXACTLY these words, in this order — every word must
also appear at least once, wrapped in **bold**, inside the Phase-2 reading passage):
${vocabList}

TARGET GRAMMAR RULE (Phase 4 must teach this and ONLY this):
  "${blueprint.target_grammar_rule ?? ""}"
${blueprint.grammar_explanation ? `Teacher rationale: ${blueprint.grammar_explanation}` : ""}

READING DIRECTION (Phase 2 passage MUST follow this summary — same genre, scenario, characters):
  ${blueprint.reading_passage_summary ?? ""}

FINAL MISSION (Phase 5/6 production MUST end with this exact task):
  ${blueprint.final_speaking_mission ?? ""}
${
  blueprint.video_strategy && blueprint.video_strategy.youtube_query
    ? `
VIDEO STRATEGY (mandatory — you MUST insert ONE slide implementing this):
  • youtube_query : "${blueprint.video_strategy.youtube_query}"
  • target_phase  : "${blueprint.video_strategy.target_phase}"
  ${blueprint.video_strategy.rationale ? `• rationale : ${blueprint.video_strategy.rationale}` : ""}
On EXACTLY ONE slide whose lesson_phase = "${blueprint.video_strategy.target_phase}", set
requires_video = true and youtube_query verbatim. Add an active-listening question into "content".`
    : ""
}
`;
    }

    // Build personalization context if student profile is available
    let personalizationBlock = "";
    if (student_profile && typeof student_profile === "object") {
      const parts: string[] = [];
      if (student_profile.industry) parts.push(`Industry: ${student_profile.industry}`);
      if (student_profile.age) parts.push(`Age: ${student_profile.age}`);
      if (Array.isArray(student_profile.interests) && student_profile.interests.length > 0) {
        parts.push(`Interests: ${student_profile.interests.join(", ")}`);
      }
      if (parts.length > 0) {
        personalizationBlock = `\n\nSTUDENT PROFILE (use for hyper-personalization — weave into examples, scenarios, vocabulary sentences):\n${parts.join("\n")}`;
      }
    }

    const userPrompt = `Lesson title: ${effectiveTitle}
Objective: ${objective ?? "(not provided)"}
Skill focus: ${skill_focus}
CEFR level: ${cefr_level}
Hub: ${hub}
${blueprintBlock}${personalizationBlock}
Generate the dense 20–25 slide 1-hour lesson NOW following the 6-Step Integrated Skills Blueprint
EXACTLY (Vocabulary → Reading → Comprehension → Grammar → Speaking → Writing). Every slide MUST be
tagged with lesson_phase. The Phase-2 reading passage MUST reuse Phase-1 vocabulary (wrapped in
**bold**), and Phase 5 + 6 MUST require both the lexicon and the Phase-4 grammar rule.
The FINAL activity slide MUST be a "real_world_task" (The Final Boss).`;


    // JSON-mode contract appended to the system prompt. We avoid Gemini's
    // tool-calling structured-output validator entirely (it caps schema
    // "states" and rejects our 16-field × 20-25 item shape). Instead we
    // ask for a single JSON object and validate server-side.
    const jsonContract = `

═══════════════════════════════════════════════════════
OUTPUT FORMAT (STRICT)
═══════════════════════════════════════════════════════
Respond with a SINGLE valid JSON object — no prose, no markdown, no code fences.
Top-level shape:
{
  "slides": [ /* 20–25 slide objects */ ],
  "homework_missions": [ /* 3–5 mission objects */ ]
}

Each slide object MUST have these keys:
  "phase": "Hook" | "Presentation" | "Practice" | "Production" | "Mission",
  "lesson_phase": "Vocabulary" | "Reading" | "Comprehension" | "Grammar" | "Speaking" | "Writing",
  "slide_type": "mascot_speech" | "multiple_choice" | "drawing_canvas" | "drag_and_drop" | "flashcard" | "drag_and_match" | "fill_in_the_gaps" | "hero_media" | "vocab_list" | "grammar_explanation" | "sorting_game" | "fill_in_blanks" | "match_halves" | "quiz_mcq" | "role_play" | "audio_listening" | "true_false" | "sentence_builder" | "reading_quiz" | "listening_comprehension" | "match_words" | "image_match" | "shadowing_drill" | "real_world_task" | "branching_dialogue" | "drag_and_drop_sorting" | "matching_lines" | "tracing_canvas" | "spinner_wheel",
  "media_type": "image" | "video",
  "layout_style": "split_left" | "split_right" | "center_card" | "full_background",
  "title": string,
  "content": string,
  "teacher_script": string,
  "visual_keyword": string,
  "elevenlabs_script": string,
  "image_generation_prompt": string,
  "video_generation_prompt": string,
  "interactive_data": object,  // shape per RULE 6 (NOT stringified)
  "hint_text": string,         // required for interactive slides
  "target_skills": string[],   // ≥1 of Reading/Writing/Listening/Speaking/Grammar/Vocabulary
  "requires_audio": boolean,
  "requires_video": boolean,   // true ONLY when a real YouTube clip teaches better than an image
  "youtube_query": string      // empty string when requires_video is false

Each homework mission object MUST have:
  "mission_type": "memory_match" | "listen_and_choose" | "word_scramble",
  "prompt": string,
  // PLUS the type-specific keys directly on the object:
  // memory_match → "pairs": [{"term":string,"match":string}]   (3–5 pairs)
  // listen_and_choose → "target_word":string, "options":string[3..4], "correct_answer":string
  // word_scramble → "target_word":string, "scrambled":string

Return ONLY the JSON object.`;

    async function callAI(): Promise<
      | { ok: true; slides: any[]; homework_missions: any[] }
      | { ok: false; status: number; detail: string }
    > {
      console.log("Sending payload to Gemini via Lovable AI Gateway...", { lesson_title: effectiveTitle, cefr_level, hub, hasBlueprint: !!blueprint });
      // NOTE: We deliberately omit `response_format` and `tools`. The Lovable
      // gateway converts both into a Gemini responseSchema that exceeds the
      // provider's "schema states" limit for our 16-field × 20–25 item shape.
      // The prompt itself instructs Gemini to emit a single JSON object; we
      // strip any code fences and parse defensively below.
      const aiResp = await aiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          max_tokens: 16384,
          messages: [
            { role: "system", content: systemPrompt + jsonContract },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!aiResp.ok) {
        return { ok: false, status: aiResp.status, detail: await aiResp.text() };
      }

      const data = await aiResp.json();
      const raw = data?.choices?.[0]?.message?.content;
      if (!raw || typeof raw !== "string") {
        return { ok: false, status: 502, detail: "No content in AI response" };
      }
      // Extract the largest {...} block — handles code fences and any
      // leading/trailing prose the model might emit.
      let cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
      }
      let parsedArgs: any;
      try {
        parsedArgs = JSON.parse(cleaned);
      } catch (e) {
        return { ok: false, status: 502, detail: `JSON parse failed: ${(e as Error).message}` };
      }
      if (!parsedArgs || !Array.isArray(parsedArgs.slides) || parsedArgs.slides.length === 0) {
        return { ok: false, status: 502, detail: "Validation failed: missing slides[]" };
      }
      const homework = Array.isArray(parsedArgs.homework_missions) ? parsedArgs.homework_missions : [];
      return { ok: true, slides: parsedArgs.slides, homework_missions: homework };
    }

    let aiResult = await callAI();
    if (!aiResult.ok && aiResult.status === 502) {
      // One automatic retry on validation/structural failures.
      console.warn("First AI call failed validation — retrying once.", aiResult.detail);
      aiResult = await callAI();
    }

    if (!aiResult.ok) {
      if (aiResult.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResult.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      console.error("AI gateway error:", aiResult.status, aiResult.detail);
      return new Response(JSON.stringify({ error: "AI gateway error", detail: aiResult.detail }), {
        status: aiResult.status >= 500 ? 502 : aiResult.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rawSlides: any[] = aiResult.slides;

    // ── Server-side validator: drop interactive slides with empty interactive_data ──
    const REQUIRED_KEYS: Record<string, string[]> = {
      quiz_mcq: ["options"],
      multiple_choice: ["options"],
      reading_quiz: ["options"],
      listening_comprehension: ["options"],
      fill_in_blanks: ["sentences"],
      fill_in_the_gaps: ["sentence_parts", "missing_word"],
      match_halves: ["pairs"],
      match_words: ["items", "categories"],
      image_match: ["items", "categories"],
      sorting_game: ["items", "categories"],
      sentence_builder: ["scrambled_words"],
      true_false: ["statements"],
      drag_and_match: ["pairs"],
      drag_and_drop: ["items", "targets"],
    };
    rawSlides = rawSlides.filter((slide: any) => {
      const t = slide?.slide_type;
      const required = t && REQUIRED_KEYS[t];
      if (!required) return true;
      const data = slide?.interactive_data;
      if (!data || typeof data !== "object") {
        console.warn("[ppp] dropped malformed slide", slide?.id, t, "missing interactive_data");
        return false;
      }
      const ok = required.some((k) => {
        const v = (data as any)[k];
        return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
      });
      if (!ok) console.warn("[ppp] dropped malformed slide", slide?.id, t, "empty payload");
      return ok;
    });

    // ── Dedup pass: cap one occurrence per "production" speaking slide_type ──
    const SINGLE_OCCURRENCE = new Set(["real_world_task", "role_play", "shadowing_drill"]);
    const seen = new Set<string>();
    rawSlides = rawSlides.filter((slide: any) => {
      const t = slide?.slide_type;
      if (SINGLE_OCCURRENCE.has(t)) {
        if (seen.has(t)) {
          console.warn("[ppp] dropped duplicate speaking slide", slide?.id, t);
          return false;
        }
        seen.add(t);
      }
      return true;
    });


    // Post-process: enforce divergent interactivity (no two same slide_type back-to-back, except Hook).
    for (let i = 1; i < rawSlides.length; i++) {
      const prev = rawSlides[i - 1];
      const curr = rawSlides[i];
      const inHook = prev?.phase === "Hook" && curr?.phase === "Hook";
      if (!inHook && prev?.slide_type && curr?.slide_type === prev.slide_type) {
        console.warn(
          `Director violation at slide ${i + 1}: ${curr.slide_type} repeated. Consider regenerating.`,
        );
      }
    }

    const CORE_SKILLS = new Set(["Reading", "Writing", "Listening", "Speaking"]);
    const slides = rawSlides.map((s: any) => {
      const rawSkills: string[] = Array.isArray(s.target_skills)
        ? s.target_skills.filter((x: any) => typeof x === "string")
        : [];
      const target_skills = rawSkills.length > 0 ? rawSkills : ["Vocabulary"];
      // Audio gate: trust the AI's boolean; if missing, infer conservatively (only true for Listening/Speaking).
      const requires_audio = typeof s.requires_audio === "boolean"
        ? s.requires_audio
        : target_skills.some((k) => k === "Listening" || k === "Speaking");
      const lesson_phase = (LESSON_PHASES as readonly string[]).includes(s.lesson_phase)
        ? s.lesson_phase
        : "Vocabulary";
      return {
        id: crypto.randomUUID(),
        phase: s.phase,
        lesson_phase,
        slide_type: s.slide_type,
        media_type: s.media_type ?? "image",
        layout_style: s.layout_style ?? "center_card",
        title: s.title,
        content: s.content,
        teacher_script: s.teacher_script,
        visual_keyword: s.visual_keyword,
        elevenlabs_script: s.elevenlabs_script ?? "",
        image_generation_prompt: s.image_generation_prompt ?? "",
        video_generation_prompt: s.video_generation_prompt ?? "",
        target_skills,
        requires_audio,
        requires_video: typeof s.requires_video === "boolean" ? s.requires_video : false,
        youtube_query: typeof s.youtube_query === "string" ? s.youtube_query.trim() : "",
        hint_text: typeof s.hint_text === "string" ? s.hint_text : "",
        interactive_data: (() => {
          if (s.interactive_data && typeof s.interactive_data === "object") return s.interactive_data;
          if (typeof s.interactive_data_json === "string") {
            try { return JSON.parse(s.interactive_data_json); } catch { return {}; }
          }
          return {};
        })(),
      };
    });

    // Deck-level validation: at least 3 distinct CORE skills used, and ≥20 slides.
    const coreSkillsUsed = new Set<string>();
    for (const s of slides) {
      for (const k of s.target_skills) if (CORE_SKILLS.has(k)) coreSkillsUsed.add(k);
    }
    if (slides.length < 20) {
      console.warn(`Density violation: deck has ${slides.length} slides (<20). 1-hour target missed.`);
    }
    if (coreSkillsUsed.size < 3) {
      console.warn(
        `Skill-blend violation: only ${coreSkillsUsed.size} of 4 core skills covered (${[...coreSkillsUsed].join(", ")}). Need ≥3.`,
      );
    }

    // 6-Step Blueprint validation: all 6 lesson_phases must appear, in non-decreasing order.
    const phasesPresent = new Set(slides.map((s) => s.lesson_phase));
    const missing = LESSON_PHASES.filter((p) => !phasesPresent.has(p));
    if (missing.length) {
      console.warn(`Blueprint violation: missing lesson_phase(s): ${missing.join(", ")}`);
    }
    const phaseOrderIndex = (p: string) => LESSON_PHASES.indexOf(p as any);
    for (let i = 1; i < slides.length; i++) {
      if (phaseOrderIndex(slides[i].lesson_phase) < phaseOrderIndex(slides[i - 1].lesson_phase)) {
        console.warn(
          `Blueprint order violation at slide ${i + 1}: ${slides[i].lesson_phase} after ${slides[i - 1].lesson_phase}.`,
        );
      }
    }

    // ─── Self-heal video_strategy: ensure ONE slide carries the blueprint's youtube_query ───
    if (blueprint?.video_strategy?.youtube_query && blueprint?.video_strategy?.target_phase) {
      const targetPhase = blueprint.video_strategy.target_phase;
      const alreadyHas = slides.some((s: any) => s.requires_video && s.youtube_query);
      if (!alreadyHas) {
        const idx = slides.findIndex((s: any) => s.lesson_phase === targetPhase);
        const finalIdx = idx >= 0 ? idx : 0;
        slides[finalIdx].requires_video = true;
        slides[finalIdx].youtube_query = blueprint.video_strategy.youtube_query;
        if (!/(watch|listen|notice)/i.test(slides[finalIdx].content || "")) {
          slides[finalIdx].content =
            `${slides[finalIdx].content || ""}\n\n👀 Watch the video. ${
              blueprint.video_strategy.rationale || "What new word do you hear?"
            }`.trim();
        }
        console.log(`[video] Healed slide ${finalIdx + 1} with youtube_query="${blueprint.video_strategy.youtube_query}"`);
      }
    }

    // ─── Homework missions: parse stringified payload + validate per-type shape ───
    const rawMissions: any[] = (aiResult as any).homework_missions ?? [];
    const homework_missions = rawMissions
      .map((m: any) => {
        // Prefer direct keys on the mission (new JSON-mode shape).
        // Fall back to legacy payload_json string if the model returns it.
        let payload: any = m ?? {};
        if (m?.payload_json && typeof m.payload_json === "string") {
          try { payload = { ...payload, ...JSON.parse(m.payload_json) }; } catch { /* keep payload */ }
        }
        const base = {
          id: crypto.randomUUID(),
          mission_type: m?.mission_type,
          prompt: m?.prompt ?? "",
        };
        switch (m?.mission_type) {
          case "memory_match": {
            const pairs = Array.isArray(payload.pairs)
              ? payload.pairs.filter((p: any) => p?.term && p?.match)
              : [];
            return pairs.length >= 2 ? { ...base, pairs } : null;
          }
          case "listen_and_choose": {
            const options = Array.isArray(payload.options) ? payload.options.filter((o: any) => typeof o === "string") : [];
            const target = typeof payload.target_word === "string" ? payload.target_word : "";
            const correct = typeof payload.correct_answer === "string" ? payload.correct_answer : target;
            if (!target || options.length < 2 || !options.includes(correct)) return null;
            return { ...base, target_word: target, options, correct_answer: correct };
          }
          case "word_scramble": {
            const target = typeof payload.target_word === "string" ? payload.target_word : "";
            let scrambled = typeof payload.scrambled === "string" ? payload.scrambled : "";
            if (!target) return null;
            // Self-heal: if scrambled is missing or equals target, shuffle locally.
            if (!scrambled || scrambled.toLowerCase() === target.toLowerCase()) {
              const arr = target.split("");
              for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
              }
              scrambled = arr.join("");
              if (scrambled.toLowerCase() === target.toLowerCase()) scrambled = target.split("").reverse().join("");
            }
            return { ...base, target_word: target, scrambled };
          }
          default:
            return null;
        }
      })
      .filter(Boolean);

    if (homework_missions.length < 3) {
      console.warn(
        `Director returned only ${homework_missions.length} valid homework missions (need 3-5). Returning what we have.`,
      );
    }

    // ── Blueprint coverage validation: every approved word must appear in a Phase-1 slide ──
    if (blueprint && Array.isArray(blueprint.target_vocabulary)) {
      const phase1Text = slides
        .filter((s: any) => s.lesson_phase === "Vocabulary")
        .map((s: any) => `${s.title ?? ""} ${s.content ?? ""} ${s.teacher_script ?? ""} ${JSON.stringify(s.interactive_data ?? {})}`)
        .join(" ")
        .toLowerCase();
      const missing: string[] = blueprint.target_vocabulary
        .map((v: any) => (typeof v?.word === "string" ? v.word.trim() : ""))
        .filter((w: string) => w && !phase1Text.includes(w.toLowerCase()));
      if (missing.length > 0) {
        console.warn("Blueprint vocabulary coverage gap:", missing);
        return new Response(
          JSON.stringify({
            error: `Generated lesson skipped these target words in Phase 1: ${missing.join(", ")}. Please regenerate.`,
            missing,
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    enforceVisualTheme(slides);
    return new Response(JSON.stringify({ slides, homework_missions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("generate-ppp-slides error:", err.message, err.stack);
    return new Response(
      JSON.stringify({
        error: err.message || "generate-ppp-slides failed",
        detail: err.stack ? err.stack.split("\n").slice(0, 4).join(" | ") : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
