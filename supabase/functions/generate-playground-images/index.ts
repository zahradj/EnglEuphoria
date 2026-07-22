// Generate kid-friendly cartoon illustrations for Playground lessons.
// Uses Google AI Studio (gemini-2.5-flash-image) and uploads PNGs to
// the public `playground_assets` Supabase Storage bucket. Returns a map of
// subject -> public URL. Cached by content hash to avoid regenerating
// the same subject twice.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateGoogleImage } from "../_shared/googleImageClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Playground image styles. The UI sends a `style` id; we resolve it to a
// strict art-style prompt. Defaults to the Playground house style when omitted.

const SINGLE_PANEL_GUARD =
  `SINGLE image, ONE panel only — never a diptych, split-screen, side-by-side ` +
  `comparison, grid, before/after, or multiple variants of the same subject. ` +
  `Do NOT show the subject twice. One unified illustrated scene, edge-to-edge. ` +
  `EXACTLY ONE subject in the frame: do NOT add any extra animal, bird, pet, ` +
  `companion, mascot, sidekick, person, or secondary creature of any kind. ` +
  `No kiwi bird, no butterflies, no insects, no background animals.`;

const PREMIUM_QUALITY_GUARD =
  `PROFESSIONAL ILLUSTRATION QUALITY — finished, art-directed, gallery-grade ` +
  `artwork by a senior illustrator. Bold confident linework with deliberate ` +
  `ink-weight variation, razor-sharp edges, strong defined silhouette, ` +
  `controlled dramatic lighting with clear key/fill/rim, rich saturated ` +
  `palette with intentional contrast, sculpted volumetric shading, crisp ` +
  `detail in eyes/hands/textures, dynamic confident pose, polished ` +
  `composition. HARD-EDGED and WELL-DRAWN — NOT soft, NOT mushy, NOT blurry, ` +
  `NOT babyish, NOT a rough sketch, NOT a flat pastel wash, NOT a doodle. ` +
  `No warped anatomy, no muddy colors, no fuzzy edges, no amateur lineart, ` +
  `no clutter, no watermark. Stray/decorative text is forbidden, but a SMALL ` +
  `clean speech bubble containing the exact target vocabulary phrase is ` +
  `ALLOWED when a character is present and acting it out.`;

const HARD_EDGE_OVERRIDE =
  `FINAL OVERRIDE (highest priority — overrides any "soft", "gentle", or ` +
  `"subtle" wording in the style block above): the finished image MUST be ` +
  `HARD-EDGED, CRISP, and WELL-DRAWN. Bold confident inking with deliberate ` +
  `line-weight, razor-sharp silhouette, defined shape language, controlled ` +
  `chiaroscuro shading with clear light/shadow separation, rich saturated ` +
  `palette, polished professional finish. NEVER mushy, NEVER blurry, NEVER ` +
  `a pastel wash, NEVER babyish, NEVER a rough doodle, NEVER amateur lineart.`;

// ONE style only — locked Pip-Fox house style. Nano Banana was drifting when
// given multiple style aliases, so every alias now resolves to the same prompt.
const PIP_FOX_STYLE =
  `STRICT ART STYLE — "Pip the Fox" Playground house style (the ONLY ` +
  `allowed style — never mix in another aesthetic). Premium glossy stylized ` +
  `chibi mascot illustration for kids ages 4-10. Rounded chibi proportions ` +
  `with a DEFINED silhouette: oversized head, large sparkling reflective ` +
  `eyes with crisp specular highlights, clean rosy cheek shapes, confident ` +
  `friendly smile. Fluffy fur painted with controlled brushwork and clean ` +
  `shape edges, sculpted volumetric shading, strong rim light, deliberate ` +
  `ambient occlusion. Warm Playground palette: vivid orange (#FE6A2F), ` +
  `sunny yellow (#FEFBDD), cream whites, peach accents; bold readable ` +
  `silhouette. Hero pose, single centered subject, clean white background, ` +
  `sticker-ready composition with razor-crisp edges. Pixar-meets-kawaii ` +
  `feel but HARD-EDGED and POLISHED, never mushy. NO photorealism, NO ` +
  `dark inking, NO manga screentones, NO flat vector look, NO gradient ` +
  `backgrounds, NO watermark. No stray decorative text — but a SMALL clean ` +
  `speech bubble with the target vocabulary phrase is allowed when a ` +
  `character is acting it out. ${SINGLE_PANEL_GUARD}`;

const STYLE_PROMPTS: Record<string, string> = {
  "pip-fox": PIP_FOX_STYLE,
};

// ── VISUAL PROMPT ORCHESTRATOR CONTRACT ─────────────────────────────
// Build a concrete mini-scenario from the vocabulary word + (optional)
// locked cast character. The model must SHOW the meaning, not just label it.

const CHARACTER_ACTION_FORMULA =
  `CHARACTER SCENARIO FORMULA — show, don't label. Render the locked cast ` +
  `character as the single hero clearly ACTING OUT the target vocabulary ` +
  `with an unambiguous pose, facial expression, and at most one tiny prop ` +
  `or motion cue (waving hand, speech-gesture, pointing to self, holding ` +
  `the object, etc.). A 4–7 year old must instantly read the meaning. ` +
  `A SMALL clean speech bubble containing the EXACT target vocabulary ` +
  `phrase (e.g. "Hi!", "Hello", "My name is Pip") is ALLOWED and ` +
  `encouraged for greetings/introductions/expressions — keep the text ` +
  `short, legible, correctly spelled, and inside one tidy bubble. ` +
  `Keep the character strictly ON-MODEL per the provided visual blueprint ` +
  `— never re-design, recolor, or swap species. ` +
  `No second character, no extra animals, no background scenery.`;

const NO_CHARACTER_VOCAB_FORMULA =
  `STICKER VOCABULARY FORMULA — literal flashcard sticker. Render ONLY the ` +
  `target noun/object/animal as the central hero, large, readable, ` +
  `centered, with a thick clean white sticker-style outline and crisp ` +
  `edges. Plain background (will be removed). If the target is an animal, ` +
  `draw that one animal only. Do not add mascots, people, hands, ` +
  `sidekicks, props, scenery, or any second subject. NO text or captions.`;

// ── Playground supporting cast (companions Pip can interact with) ──
// Used for social/dialogue vocabulary like greetings, partings, intros,
// "friend", etc. so the illustration shows the meaning through interaction.
const COMPANIONS: Array<{ name: string; visual: string }> = [
  { name: "Bella the Bunny", visual: "soft cream-and-pink bunny chibi, long floppy ears, big sparkly eyes, tiny pink bow, warm friendly smile" },
  { name: "Charlie the Chick", visual: "round fluffy yellow chick chibi, orange beak, tiny wings, big shiny eyes, cheerful grin" },
  { name: "Daisy the Duckling", visual: "pastel-yellow duckling chibi with a pale-blue ribbon, orange bill, gentle smile, large round eyes" },
  { name: "Hoot the Owl", visual: "lavender-and-cream owl chibi, big round glasses, tufted ears, wise warm smile, sparkly eyes" },
];

function pickCompanion(word: string, lead?: string): { name: string; visual: string } {
  // Deterministic pick so the same word always gets the same companion.
  const seed = (word + "|" + (lead ?? "")).toLowerCase();
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pool = lead ? COMPANIONS.filter((c) => c.name.toLowerCase() !== lead.toLowerCase()) : COMPANIONS;
  return pool[h % pool.length];
}

// Words that are inherently social/relational and read MUCH clearer when
// two characters interact (with optional speech bubbles).
function isDialogueVocab(word: string): boolean {
  const w = word.trim().toLowerCase();
  return /^(hi|hello|hey|goodbye|bye|see you|good morning|good afternoon|good evening|good night|nice to meet you|how are you|my name is|i am|i'm|thank you|thanks|you're welcome|sorry|please|friend|friends|hug|share|help)\b/.test(w);
}

// Build a dialogue scene with TWO characters + speech bubbles.
// IMPORTANT: The speech bubble MUST contain ONLY the exact vocabulary word
// being taught (e.g. "hello" → bubble says "Hello!", NOT "Hello!" + "Hi!").
// Otherwise the flashcard teaches two words at once and confuses learners.
function buildDialogueScenario(word: string, lead: string, companion: { name: string; visual: string }): string {
  const w = word.trim().toLowerCase();
  const cName = companion.name;
  const display = word.trim().charAt(0).toUpperCase() + word.trim().slice(1);
  const bubble = `"${display}!"`;
  const map: Array<[RegExp, string]> = [
    [/^(hello|hi|hey)\b/, `${lead} on the left waving with a big smile, ONE small speech bubble above ${lead} saying exactly ${bubble}; ${cName} on the right smiling and waving back with NO speech bubble`],
    [/^(goodbye|bye|see you)\b/, `${lead} and ${cName} side by side waving to each other, gentle smiles, ONE small speech bubble above ${lead} saying exactly ${bubble}`],
    [/^my name is\b/, `${lead} pointing one paw to own chest with a friendly smile, ONE speech bubble above saying exactly "My name is ${lead.split(" ")[0]}", ${cName} listening attentively beside`],
    [/^i am\b|^i'm\b/, `${lead} pointing to own chest, ONE speech bubble saying exactly "I am ${lead.split(" ")[0]}", ${cName} smiling beside`],
    [/^how are you\b/, `${lead} tilting head curiously toward ${cName}, ONE speech bubble above ${lead} saying exactly "How are you?"; ${cName} smiling back with NO bubble`],
    [/^nice to meet you\b/, `${lead} and ${cName} shaking paws, both smiling warmly, ONE speech bubble saying exactly "Nice to meet you!"`],
    [/^(thank you|thanks)\b/, `${cName} offering a small gift to ${lead}; ${lead} smiling with ONE speech bubble saying exactly ${bubble}`],
    [/^(you're welcome)\b/, `${lead} smiling with ONE speech bubble saying exactly "You're welcome!" facing ${cName}`],
    [/^(sorry)\b/, `${lead} with apologetic eyes, paws together, ONE speech bubble saying exactly ${bubble}; ${cName} smiling gently in forgiveness`],
    [/^(please)\b/, `${lead} with paws clasped politely, hopeful look at ${cName}, ONE speech bubble saying exactly ${bubble}`],
    [/^(good morning)\b/, `${lead} and ${cName} greeting each other under a sunny sky, ONE speech bubble above ${lead} saying exactly "Good morning!"`],
    [/^(good night)\b/, `${lead} and ${cName} waving softly with a small moon overhead, ONE speech bubble above ${lead} saying exactly "Good night!"`],
    [/^(friend|friends)\b/, `${lead} and ${cName} standing close side by side, smiling warmly with one arm/wing around each other, tiny heart between them, NO speech bubbles`],
    [/^(hug)\b/, `${lead} and ${cName} sharing a warm friendly hug, both smiling with eyes closed, NO speech bubbles`],
    [/^(share)\b/, `${lead} sharing a piece of fruit with ${cName}, both smiling, NO speech bubbles`],
    [/^(help)\b/, `${lead} helping ${cName} up with an extended paw, kind smile, NO speech bubbles`],
  ];
  for (const [re, scene] of map) if (re.test(w)) return scene;
  return `${lead} and ${cName} together clearly acting out the meaning of "${word}", warm friendly interaction, expressive faces, if any speech bubble appears it must contain ONLY the exact text ${bubble} and nothing else`;
}

// Tiny scenario generator: turns a vocab term into a concrete visible action
// when a character is present. Keeps the model from defaulting to a generic
// mug-shot pose.
function buildScenario(word: string, characterName?: string): string {
  const w = word.trim().toLowerCase();
  const name = characterName || "the character";
  const map: Array<[RegExp, string]> = [
    [/^(hello|hi|hey)\b/, `${name} smiling and waving one paw in greeting, small speech bubble above saying "Hello!"`],
    [/^(goodbye|bye|see you)\b/, `${name} waving goodbye, speech bubble saying "Goodbye!"`],
    [/^(thank you|thanks)\b/, `${name} bowing slightly with both paws together, speech bubble "Thank you!"`],
    [/^(sorry)\b/, `${name} with paws together, apologetic expression, speech bubble "Sorry"`],
    [/^(please)\b/, `${name} with paws clasped politely, hopeful eyes, speech bubble "Please"`],
    [/^(yes)\b/, `${name} nodding enthusiastically with a big smile and thumbs-up paw, speech bubble "Yes!"`],
    [/^(no)\b/, `${name} shaking head, paws crossed in a friendly "no" gesture, speech bubble "No"`],
    [/^my name is\b/, `${name} pointing one paw to own chest, speech bubble above saying exactly "My name is ${name.split(" ")[0]}"`],
    [/^i am\b|^i'm\b/, `${name} pointing one paw to own chest, speech bubble "I am ${name.split(" ")[0]}"`],
    [/^how are you\b/, `${name} tilting head with a curious friendly smile, one paw raised, speech bubble "How are you?"`],
    [/^nice to meet you\b/, `${name} extending one paw for a handshake, speech bubble "Nice to meet you!"`],
    [/^(happy|joy|glad)\b/, `${name} jumping with arms up, huge joyful smile, sparkles around`],
    [/^(sad)\b/, `${name} with droopy ears, single tear, gentle frown`],
    [/^(angry|mad)\b/, `${name} with furrowed brow and puffed cheeks, paws on hips`],
    [/^(scared|afraid)\b/, `${name} wide-eyed, paws up near face, trembling lines`],
    [/^(tired|sleepy)\b/, `${name} yawning, one paw rubbing eye, droopy lids`],
    [/^(eat|eating|food|hungry)\b/, `${name} happily eating, holding food up to mouth`],
    [/^(drink|drinking|thirsty)\b/, `${name} sipping from a cup with a content smile`],
    [/^(run|running)\b/, `${name} mid-stride running pose with motion lines`],
    [/^(walk|walking)\b/, `${name} mid-step walking pose, cheerful expression`],
    [/^(jump|jumping)\b/, `${name} mid-air jump with arms up, joyful expression`],
    [/^(sleep|sleeping)\b/, `${name} curled up with eyes closed, small "Z" above head`],
    [/^(read|reading)\b/, `${name} holding an open book, focused friendly expression`],
    [/^(write|writing)\b/, `${name} holding a pencil, writing on paper with focused smile`],
    [/^(sing|singing)\b/, `${name} mouth open singing, music notes floating nearby`],
    [/^(dance|dancing)\b/, `${name} dancing pose with arms out, motion swirls`],
    [/^(play|playing)\b/, `${name} playing joyfully with a simple toy or ball`],
    [/^(look|see|watch)\b/, `${name} cupping a paw over eyes, looking off to one side curiously`],
    [/^(listen|hear)\b/, `${name} cupping a paw to ear, attentive smile`],
    [/^(point)\b/, `${name} pointing one paw forward, confident expression`],
    [/^(give|share)\b/, `${name} offering a small wrapped gift with both paws forward`],
    [/^(love|like)\b/, `${name} hugging a tiny red heart to chest, warm smile`],
  ];
  for (const [re, scene] of map) if (re.test(w)) return scene;
  // Generic fallback: present the concept with an expressive gesture.
  return `${name} as the single hero clearly acting out or presenting the meaning of "${word}" — expressive face, one clear pose, minimal prop only if essential to read the meaning`;
}


// No-character vocab: build a tighter sticker-scene hint so the model frames
// the literal subject as a centered flashcard hero (not a tiny dot or a busy
// scene). This is appended after NO_CHARACTER_VOCAB_FORMULA when relevant.
function buildStickerHint(word: string): string {
  const w = word.trim().toLowerCase();
  return `STICKER SCENE: large centered "${w}", filling 70–80% of the frame, hero angle, slight 3/4 perspective for readability, crisp clean edges, no ground, no shadow ground plane, no extra objects — pure flashcard sticker of "${w}".`;
}


const DEFAULT_STYLE = "pip-fox";
const CACHE_VERSION = "v34-title-overlay-hoist"; // bump → new contract live

// Hard rule: scenes (warm-up / story / topic cards) must NEVER include
// a narrator bubble, caption, or any text overlay — pure visual storytelling.
const NO_TEXT_RULE =
  `NO TEXT OVERLAY RULE (highest priority — overrides any bubble allowance ` +
  `above): this image MUST NOT contain ANY speech bubble, thought bubble, ` +
  `caption, label, sign text, watermark, narrator box, dialogue balloon, ` +
  `onomatopoeia, or any rendered letters/words/numbers. Describe the scene ` +
  `purely through pose, expression, gesture, and environment. Zero text of ` +
  `any kind anywhere in the frame.`;

// ── PEDAGOGY CONTRACT — structured payload from Visual Architect ──
// When the caller provides a `pedagogy` object we prepend an explicit
// phase-specific instructional contract so the model knows WHAT the
// student is learning and HOW the image must support it. This makes the
// Image Generator a consumer of structured data instead of inferring intent.
function buildPedagogyContract(p?: Pedagogy): string {
  if (!p) return "";
  const phase = (p.phase ?? "").toLowerCase();
  const vocab = (p.target_vocabulary ?? []).filter(Boolean).slice(0, 8).join(", ");
  const head: string[] = [
    `VISUAL ARCHITECT PEDAGOGY CONTRACT — every choice in this image must serve the learning goal below.`,
  ];
  if (p.unit_theme) head.push(`Unit theme: ${p.unit_theme}.`);
  if (p.lesson_objective) head.push(`Lesson objective: ${p.lesson_objective}.`);
  if (vocab) head.push(`Target vocabulary: ${vocab}.`);
  if (p.grammar_target) head.push(`Grammar target: ${p.grammar_target}.`);
  if (p.cefr) head.push(`CEFR: ${p.cefr}.`);
  if (p.age_group) head.push(`Age group: ${p.age_group}.`);

  const phaseRule: Record<string, string> = {
    intro:
      `PHASE = INTRO CARD. Mirror the unit theme literally with the lead character placed inside the theme setting. Build curiosity; bright colors; single panel. Render the lesson title as a bold hand-lettered TITLE BANNER across the top — NO speech bubbles, NO thought bubbles, NO dialogue balloons anywhere in the frame.`,
    warmup:
      `PHASE = WARM-UP. Illustrate the chant/song lyrics so children want to sing. Characters perform the action from the lyrics; mood matches the rhythm.`,
    vocabulary:
      `PHASE = VOCABULARY. Teach ONE item only ("${p.target_vocabulary?.[0] ?? ""}"). Sticker framing, centered, plain background, no distractors, instantly recognisable by a 4–7 year old.`,
    grammar:
      `PHASE = GRAMMAR. Illustrate the target sentence "${p.grammar_target ?? ""}" so the structure is obvious (correct subject, correct count, correct preposition/position). Nothing in the image may contradict the sentence.`,
    storybook:
      `PHASE = STORYBOOK PAGE. Match the page text exactly. Keep characters on-model, reflect emotions, reinforce target vocab + grammar, never invent events.`,
    phonics:
      `PHASE = PHONICS. Highlight the target sound. Show the letter and 2–4 visually separated example objects whose names start with that sound. No unrelated objects.`,
    review:
      `PHASE = REVIEW. Display the learned vocabulary in ONE organised scene; every object stays easy to identify; avoid clutter.`,
    ccq:
      `PHASE = CCQ SUPPORT. The image must make the CCQ answer unambiguous. Nothing in the frame may contradict the correct answer.`,
  };
  const rule = phaseRule[phase] ?? `PHASE = ${phase || "general"}. Every element must serve the learning goal above.`;
  head.push(rule);
  if (p.visual_style) head.push(`Visual style hint: ${p.visual_style}.`);
  head.push(
    `Quality checklist (must pass): matches objective ✓ matches vocabulary ✓ matches grammar ✓ age-appropriate ✓ visually simple ✓ reduces cognitive load ✓.`,
  );
  return head.join(" ");
}





const BUCKET = "playground_assets";

function resolveStyle(id?: string): { id: string; prompt: string } {
  const key = id && STYLE_PROMPTS[id] ? id : DEFAULT_STYLE;
  return { id: key, prompt: STYLE_PROMPTS[key] };
}

interface Pedagogy {
  /** intro | warmup | vocabulary | grammar | storybook | phonics | review | ccq */
  phase?: string;
  unit_theme?: string;
  lesson_objective?: string;
  target_vocabulary?: string[];
  grammar_target?: string;
  visual_style?: string; // "sticker" | "scene" | etc.
  cefr?: string;
  age_group?: string;
}

interface NormalizedSubject {
  text: string;
  prompt?: string;
  transparent: boolean;
  styleId: string;
  character?: { name: string; visual_blueprint?: string } | null;
  companion?: { name: string; visual: string } | null;
  /** Random/per-click seed; when present it is mixed into the cache hash so
   *  re-clicking "Regenerate" actually produces a NEW image instead of
   *  returning the previously cached one. */
  nonce?: string;
  /** When true the NO_TEXT_RULE is replaced with a TEXT_OVERLAY_RULE — used
   *  by the warm-up song card so the chant lyrics are rendered ON the image. */
  allowText?: boolean;
  /** Exact lyrics / words to render inside the image when allowText is true. */
  textOverlay?: string;
  /** Structured pedagogical payload from the Visual Architect contract.
   *  When present, a phase-specific contract block is prepended to the prompt
   *  so the model receives the explicit instructional intent. */
  pedagogy?: Pedagogy;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "img";
}

async function hashSubject(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s.toLowerCase().trim());
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .slice(0, 6)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function extractLegacyConcept(raw: string): { text: string; prompt?: string } {
  const trimmed = raw.trim();
  const concept =
    trimmed.match(/Concept to teach:\s*["“]([^"”]+)["”]/i)?.[1] ||
    trimmed.match(/focal word:\s*["“]([^"”]+)["”]/i)?.[1] ||
    trimmed.match(/vocabulary item\s+["“]([^"”]+)["”]/i)?.[1];
  if (!concept) return { text: trimmed };
  return { text: concept.trim(), prompt: trimmed };
}

function isHumanSubject(subject: string): boolean {
  return /\b(boy|girl|child|kid|student|teacher|man|woman|mother|father|parent|friend|baby|brother|sister|person|people)\b/i.test(subject);
}

function isSentenceSubject(subject: string): boolean {
  const wordCount = subject.trim().split(/\s+/).filter(Boolean).length;
  return /[.!?]/.test(subject) || wordCount > 3;
}

function stripContradictoryVocabularyContext(context: string): string {
  return context
    .replace(/Optionally featuring[^.]*\./gi, "")
    .replace(/Featuring\s+[^.]*from the Playground cast[^.]*\./gi, "")
    .replace(/Scene may include[^.]*\./gi, "")
    .replace(/Additional direction:\s*add\s+(?:a|an|the)?\s*(?:bird|animal|pet|mascot|friend|companion|sidekick|person|character|prop)[^.]*\./gi, "")
    .trim();
}


async function generateOne(
  input: NormalizedSubject,
  supabase: ReturnType<typeof createClient>,
): Promise<{ subject: string; url: string }> {
  const safe = input.text.trim().slice(0, 120);
  const context = input.prompt?.trim().slice(0, 1200);
  const isScene = isSentenceSubject(safe);
  // Vocabulary items always render as transparent stickers (background removed).
  // Only multi-sentence scenes keep their background.
  const transparent = !isScene;
  const style = resolveStyle(input.styleId);

  if (!safe) throw new Error("Subject text is required");
  const charKey = input.character?.name ? `${input.character.name}-${input.character.visual_blueprint || ""}` : "";
  const compKey = input.companion?.name ? `+${input.companion.name}` : "";
  const nonceKey = input.nonce ? `::n=${input.nonce}` : "";
  const textKey = input.allowText ? `::txt=${(input.textOverlay ?? "").slice(0, 80)}` : "";
  const pedKey = input.pedagogy
    ? `::ped=${(input.pedagogy.phase ?? "")}|${(input.pedagogy.grammar_target ?? "").slice(0, 40)}|${(input.pedagogy.lesson_objective ?? "").slice(0, 40)}`
    : "";
  const hash = await hashSubject(`${CACHE_VERSION}::${style.id}::${transparent ? "cutout" : "scene"}::${safe}::${context ?? ""}::${charKey}${compKey}${textKey}${pedKey}${nonceKey}`);

  const folder = `ai-${style.id}-${transparent ? "cutout" : "scene"}-${CACHE_VERSION}`;
  const path = `${folder}/${slugify(safe)}-${hash}.png`;
  // Skip the cache lookup entirely when the caller forced a fresh render via
  // `nonce` — otherwise a re-click would still hit the just-written file.
  if (!input.nonce) {
    const { data: list } = await supabase.storage.from(BUCKET).list(folder, { search: `${slugify(safe)}-${hash}` });
    if (list && list.some((f) => f.name === `${slugify(safe)}-${hash}.png`)) {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { subject: safe, url: pub.publicUrl };
    }
  }

  const stylePrompt = style.prompt;
  const hasCharacter = Boolean(input.character?.name && input.character.name.toLowerCase() !== "none" && input.character.name.toLowerCase() !== "__none__");
  const humanRule = hasCharacter
    ? `STAR CHARACTER RULE: The Playground cast member "${input.character!.name}" MUST appear as the hero of the image, performing or embodying "${safe}". Character visual blueprint (follow EXACTLY, keep on-model every time): ${input.character!.visual_blueprint ?? input.character!.name}. Do not draw any other person or mascot.`
    : isHumanSubject(safe)
    ? `HUMAN SUBJECT RULE: Draw one friendly, age-appropriate person matching "${safe}". Full body or waist-up, modest everyday clothing, natural skin tone, warm expression, standing or waving. Do not draw clouds, empty sky, a mascot, an animal, or an abstract symbol instead of the person.`
    : `SUBJECT RULE: Draw the literal object, animal, action, or concept named by "${safe}" as the clear hero subject.`;
  const vocabularyRule = hasCharacter
    ? `CHARACTER + CONCEPT RULE: Show ${input.character!.name} clearly performing, holding, or expressing "${safe}". One single subject scene, no extra characters or props beyond what is needed to convey "${safe}". Plain white or very simple background.`
    : isScene
    ? `SENTENCE / SCENE RULE: Because the concept is a sentence or long phrase, create one coherent scene that expresses the sentence meaning. Keep all characters and props necessary, minimal, and directly tied to the sentence.`
    : `VOCABULARY WORD RULE: Because the concept is a single vocabulary term or short noun phrase, draw exactly ONE visible subject: "${safe}". Do not add props, scenery, a bird, a second animal, a mascot, a person, a companion, a sidekick, or any other secondary subject. Plain white or very simple empty background only.`;
  const safeContext = context && !isScene && !hasCharacter ? stripContradictoryVocabularyContext(context) : context;
  const contextRule = safeContext
    ? `Teacher context for meaning only; lower priority than the subject rules. Do not turn this context into extra subjects and do not add its words as text: ${safeContext}`
    : `No extra story context was supplied; keep the image literal and simple.`;
  // ── Visual Prompt Orchestrator Contract — pick ONE formula ──────
  // Character-action shot iff a cast member is locked OR the subject
  // is a human/action sentence. Otherwise treat as no-character vocab.
  const contractFormula = (hasCharacter || isScene || isHumanSubject(safe))
    ? CHARACTER_ACTION_FORMULA
    : NO_CHARACTER_VOCAB_FORMULA;

  // Per-image SCENARIO: build a concrete visible action so Nano Banana
  // renders meaning instead of a static mug-shot. For social/dialogue vocab
  // with a locked character, bring in a Playground companion + speech bubbles
  // so the meaning is unmistakable.
  // Explicit companion from the UI always wins; otherwise auto-pick for
  // dialogue/social vocab. When a companion is present we ALWAYS render the
  // two-character dialogue scenario (even for non-greeting words).
  const explicitCompanion = input.companion ?? null;
  const isDialogue = hasCharacter && !isScene && (Boolean(explicitCompanion) || isDialogueVocab(safe));
  const companion = explicitCompanion ?? (isDialogue ? pickCompanion(safe, input.character!.name) : null);
  const scenario = hasCharacter
    ? (isDialogue && companion
        ? `SCENARIO TO DRAW: ${buildDialogueScenario(safe, input.character!.name, companion)}.`
        : `SCENARIO TO DRAW: ${buildScenario(safe, input.character!.name)}.`)
    : (!isScene ? buildStickerHint(safe) : "");

  const dialoguePanelOverride = isDialogue
    ? `TWO-CHARACTER DIALOGUE OVERRIDE: this image is a social/communicative ` +
      `vocabulary card, so EXACTLY TWO characters are allowed and required — ` +
      `${input.character!.name} (lead, on-model per blueprint) and ` +
      `${companion!.name} (${companion!.visual}). Both characters in ONE single ` +
      `panel, side by side, interacting. Small clean speech bubbles with the ` +
      `EXACT target phrase are required and must be spelled correctly. No third ` +
      `character, no background animals, no scenery clutter.`
    : "";

  // Scenes (sentences, warm-up cards, topic cards) NEVER carry a narrator
  // bubble or caption — describe the moment purely visually — UNLESS the
  // caller explicitly opted in via `allowText` (e.g. warm-up lyrics card).
  const allowText = Boolean(input.allowText && (input.textOverlay ?? "").trim());
  const suppressText = isScene && !allowText;

  const textOverlayClean = (input.textOverlay ?? "").replace(/\s+\n/g, "\n").trim();
  const isMultiLine = textOverlayClean.includes("\n");
  const TEXT_OVERLAY_RULE = allowText
    ? isMultiLine
      ? `LYRIC POSTER TEXT OVERLAY RULE (highest priority): render the text ` +
        `below as SONG LYRICS printed INSIDE a large soft-white rounded lyric ` +
        `card that fills the center of the frame (~60% of the image area). ` +
        `Use a clean bold kid-friendly hand-lettered font, one lyric per line, ` +
        `centered, generously spaced, perfectly spelled — preserve EVERY line ` +
        `break exactly. Do NOT place lyrics over the character. ABSOLUTELY NO ` +
        `speech bubbles, NO thought bubbles, NO dialogue balloons, NO caption ` +
        `boxes — this is a POSTER, not dialogue. Do NOT render any words from ` +
        `the composition prompt above; ONLY the lyrics below may appear as ` +
        `text in the image. LYRICS:\n"""\n${textOverlayClean}\n"""`
      : `TITLE TEXT OVERLAY RULE (highest priority): render the text below as ` +
        `bold hand-lettered kawaii display typography — a title banner or sign ` +
        `placed across the TOP of the image. Spell EACH word EXACTLY as ` +
        `written, place the text so it does NOT cover the character's face. ` +
        `Use cheerful contrasting colors that match the Playground palette ` +
        `(orange #FE6A2F, yellow #FEFBDD, purple #7C3AED accents). ABSOLUTELY ` +
        `NO speech bubbles, NO thought bubbles, NO dialogue balloons, NO ` +
        `caption boxes — this is a TITLE, not dialogue. Do NOT render any ` +
        `words from the composition prompt above; ONLY the text below may ` +
        `appear. TEXT:\n"""\n${textOverlayClean}\n"""`
    : "";

  const pedagogyBlock = buildPedagogyContract(input.pedagogy);

  // When the caller opts into a title/lyric overlay, strip the anti-text
  // clauses from the shared quality/style guards so the model is not told to
  // suppress text and render the required overlay at the same time.
  const stripAntiText = (s: string) =>
    s
      .replace(/Stray\/decorative text is forbidden,\s*but a SMALL clean speech bubble containing the exact target vocabulary phrase is ALLOWED when a character is present and acting it out\.?/gi, "")
      .replace(/No stray decorative text\s*—\s*but a SMALL clean speech bubble with the target vocabulary phrase is allowed when a character is acting it out\.?/gi, "");
  const qualityGuard = allowText ? stripAntiText(PREMIUM_QUALITY_GUARD) : PREMIUM_QUALITY_GUARD;
  const styleGuard = allowText ? stripAntiText(stylePrompt) : stylePrompt;

  // Subject FIRST, repeated, and explicitly bound so the model cannot drift.
  const fullPrompt =
    (pedagogyBlock ? `${pedagogyBlock}\n\n` : "") +
    `PRIMARY SUBJECT (MANDATORY): "${safe}"${hasCharacter ? ` — starring ${input.character!.name}${companion ? ` with ${companion.name}` : ""}` : ""}. The image MUST depict this subject clearly and literally.\n` +
    (allowText ? `${TEXT_OVERLAY_RULE}\n\n` : "") +
    (scenario ? `${scenario}\n` : "") +
    (dialoguePanelOverride && !suppressText ? `${dialoguePanelOverride}\n` : "") +
    `${qualityGuard}\n` +
    `${contractFormula}\n` +
    `${vocabularyRule}\n` +
    (isDialogue && !suppressText
      ? `Allow exactly the two named characters above; do not invent extras.\n`
      : `Do NOT substitute, add, or invent any other objects, characters, animals, or props unless this is a sentence scene and they are necessary to the sentence. `) +
    `${humanRule}\n` +
    `${contextRule}\n\n` +
    `${styleGuard}\n\n` +
    `${HARD_EDGE_OVERRIDE}\n\n` +
    (suppressText ? `${NO_TEXT_RULE}\n\n` : "") +
    (allowText ? `FINAL REMINDER (highest priority): the ${isMultiLine ? "LYRIC POSTER" : "TITLE BANNER"} text overlay described above MUST be rendered in the image, spelled exactly as written. Do NOT omit it.\n\n` : "") +
    `Reminder — the image MUST clearly and unambiguously show: "${safe}"${hasCharacter ? ` with ${input.character!.name}${companion ? ` and ${companion.name}` : ""} ${scenario ? "acting out the scenario above" : "as the hero"}` : ""}.`;



  const { bytes, contentType } = await generateGoogleImage(fullPrompt);

  let finalBytes: Uint8Array = bytes;
  let finalType = contentType;

  // Vocabulary cutouts: strip the background via Picsart so the word stands
  // alone on transparent. Scenes and sentence subjects keep their background.
  const PICSART_API_KEY = Deno.env.get("PICSART_API_KEY");
  if (transparent && !isScene && PICSART_API_KEY) {
    try {
      // Upload original to a temp path so Picsart can fetch it by URL.
      const tmpPath = `${folder}/_tmp/${slugify(safe)}-${hash}.png`;
      await supabase.storage.from(BUCKET).upload(tmpPath, bytes, { contentType, upsert: true });
      const { data: tmpPub } = supabase.storage.from(BUCKET).getPublicUrl(tmpPath);
      const form = new FormData();
      form.append("image_url", tmpPub.publicUrl);
      form.append("output_type", "cutout");
      form.append("format", "PNG");
      const resp = await fetch("https://api.picsart.io/tools/1.0/removebg", {
        method: "POST",
        headers: { "X-Picsart-API-Key": PICSART_API_KEY },
        body: form,
      });
      if (resp.ok) {
        const json = await resp.json();
        const cutoutUrl = json?.data?.url;
        if (cutoutUrl) {
          const imgRes = await fetch(cutoutUrl);
          if (imgRes.ok) {
            finalBytes = new Uint8Array(await imgRes.arrayBuffer());
            finalType = "image/png";
          }
        }
      } else {
        console.warn(`[generate-playground-images] removebg failed: ${resp.status}`);
      }
      await supabase.storage.from(BUCKET).remove([tmpPath]).catch(() => {});
    } catch (e) {
      console.warn("[generate-playground-images] background removal error:", e);
    }
  }

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, finalBytes, { contentType: finalType, upsert: true });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { subject: safe, url: pub.publicUrl };
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    const { subjects, style: topStyle } = body as { subjects?: unknown[]; style?: string };
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return new Response(JSON.stringify({ error: "subjects[] required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const defaultStyleId = typeof topStyle === "string" ? topStyle : DEFAULT_STYLE;

    // Accept `string` (auto-detect: ≤3 words → transparent vocab cutout)
    // or `{ text, transparent, style }` for explicit control.
    const normalized: NormalizedSubject[] = subjects.slice(0, 16).map((s: unknown) => {
      if (typeof s === "string") {
        const extracted = extractLegacyConcept(s);
        const wordCount = extracted.text.trim().split(/\s+/).filter(Boolean).length;
        return { text: extracted.text, prompt: extracted.prompt, transparent: wordCount <= 3, styleId: defaultStyleId };
      }
      const obj = s as { text?: unknown; prompt?: unknown; transparent?: unknown; style?: unknown; character?: unknown; companion?: unknown; nonce?: unknown; allowText?: unknown; textOverlay?: unknown };
      const extracted = extractLegacyConcept(String(obj?.text ?? ""));
      let character: { name: string; visual_blueprint?: string } | null = null;
      if (obj?.character && typeof obj.character === "object") {
        const c = obj.character as { name?: unknown; visual_blueprint?: unknown };
        if (typeof c.name === "string" && c.name.trim()) {
          character = {
            name: c.name.trim(),
            visual_blueprint: typeof c.visual_blueprint === "string" ? c.visual_blueprint : undefined,
          };
        }
      } else if (typeof obj?.character === "string" && obj.character.trim()) {
        character = { name: obj.character.trim() };
      }
      let companion: { name: string; visual: string } | null = null;
      if (obj?.companion && typeof obj.companion === "object") {
        const c = obj.companion as { name?: unknown; visual?: unknown; visual_blueprint?: unknown };
        const cn = typeof c.name === "string" ? c.name.trim() : "";
        if (cn && cn.toLowerCase() !== character?.name.toLowerCase()) {
          companion = {
            name: cn,
            visual: String((c.visual ?? c.visual_blueprint ?? cn)).trim(),
          };
        }
      }
      const wordCount = extracted.text.trim().split(/\s+/).filter(Boolean).length;
      const autoTransparent = wordCount <= 5;
      const allowText = Boolean(obj?.allowText);
      // Structured pedagogy payload (Visual Architect contract).
      let pedagogy: Pedagogy | undefined;
      const rawPed = (obj as { pedagogy?: unknown }).pedagogy;
      if (rawPed && typeof rawPed === "object") {
        const r = rawPed as Record<string, unknown>;
        pedagogy = {
          phase: typeof r.phase === "string" ? r.phase : undefined,
          unit_theme: typeof r.unit_theme === "string" ? r.unit_theme : undefined,
          lesson_objective: typeof r.lesson_objective === "string" ? r.lesson_objective : undefined,
          target_vocabulary: Array.isArray(r.target_vocabulary)
            ? (r.target_vocabulary as unknown[]).filter((x) => typeof x === "string").map(String)
            : undefined,
          grammar_target: typeof r.grammar_target === "string" ? r.grammar_target : undefined,
          visual_style: typeof r.visual_style === "string" ? r.visual_style : undefined,
          cefr: typeof r.cefr === "string" ? r.cefr : undefined,
          age_group: typeof r.age_group === "string" ? r.age_group : undefined,
        };
      }
      return {
        text: extracted.text,
        prompt: typeof obj?.prompt === "string" ? obj.prompt : extracted.prompt,
        // Lyric-overlay images must KEEP their background, so disable transparent.
        transparent: allowText ? false : (autoTransparent || Boolean(obj?.transparent)),
        styleId: typeof obj?.style === "string" ? obj.style : defaultStyleId,
        character,
        companion,
        nonce: typeof obj?.nonce === "string" || typeof obj?.nonce === "number" ? String(obj.nonce) : undefined,
        allowText,
        textOverlay: typeof obj?.textOverlay === "string" ? obj.textOverlay : undefined,
        pedagogy,
      };
    });

    const results = await Promise.allSettled(
      normalized.map((s) => generateOne(s, supabase)),
    );
    const images = results
      .map((r, i) => (r.status === "fulfilled" ? r.value : { subject: normalized[i].text, url: "" }))
      .filter((x) => x.url);
    const errors = results
      .map((r, i) => (r.status === "rejected" ? { subject: normalized[i].text, error: r.reason instanceof Error ? r.reason.message : String(r.reason) } : null))
      .filter(Boolean);

    if (images.length === 0) {
      return new Response(JSON.stringify({ error: "Image generation failed", images, errors }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    return new Response(JSON.stringify({ images, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-playground-images error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
