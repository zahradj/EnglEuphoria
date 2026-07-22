/**
 * vocabCastBrain — Deno-side classifier + Playground cast picker for the
 * image generator. Decides whether a vocabulary image should be:
 *   - OBJECT  → render the thing alone, no character
 *   - ACTION/EXPRESSION → render a cast character performing it
 *   - FAMILY/PEOPLE theme → render the cast "family" together
 *
 * Mirror of src/media/vocabClassifier.ts + src/media/castPicker.ts, but
 * standalone for edge-function use (no @/ alias support in Deno).
 */

export type VocabKind = "object" | "action" | "expression" | "abstract";

const OBJECTS = new Set<string>([
  "cat","dog","fox","rabbit","bunny","bear","tiger","lion","monkey","duck","duckling","chick","owl","fish","crab","cow","horse","pig","sheep","bird","frog","elephant","giraffe","zebra",
  "apple","banana","bread","milk","egg","cake","cookie","rice","water","juice","pizza","cheese","fruit","orange","grape","watermelon","pumpkin","cucumber","tomato","carrot","potato",
  "red","blue","green","yellow","purple","pink","brown","black","white",
  "hat","shoe","shoes","shirt","sock","bag","book","ball","car","bus","train","bike","chair","table","bed","door","window","toy","pen","pencil","cup",
  "home","house","school","park","garden","jungle","sea","beach","forest","farm","zoo","room",
  "eye","ear","nose","mouth","hand","foot","head","hair","arm","leg",
  "big","small","tall","short","long","little",
]);

const ACTIONS = new Set<string>([
  "run","jump","walk","sit","stand","clap","wave","sing","dance","eat","drink","sleep","play","swim","read","write","draw","look","listen","smile","laugh","cry","hug","point","open","close","push","pull","throw","catch","climb","fly","ride","wash","brush","fall",
]);

const EXPRESSIONS = new Set<string>([
  "hello","hi","goodbye","bye","please","thanks","thank","sorry","yes","no","ok","okay","welcome",
  "happy","sad","angry","scared","tired","sleepy","excited","shy","surprised","hungry","thirsty","cold","hot",
]);

const FAMILY_WORDS = new Set<string>([
  "family","mother","mom","mum","mommy","father","dad","daddy","sister","brother","baby","grandma","grandpa","grandmother","grandfather","parent","parents","aunt","uncle","cousin",
]);

function norm(w: string): string {
  return (w || "").toLowerCase().trim().replace(/[.,!?'"]/g, "");
}

export function classifyVocab(word: string): VocabKind {
  const w = norm(word);
  if (!w) return "abstract";
  if (FAMILY_WORDS.has(w)) return "expression"; // people-centric → needs cast
  if (OBJECTS.has(w)) return "object";
  if (ACTIONS.has(w)) return "action";
  if (EXPRESSIONS.has(w)) return "expression";
  const stem = w.replace(/(ing|ed|s)$/i, "");
  if (stem !== w) {
    if (ACTIONS.has(stem)) return "action";
    if (OBJECTS.has(stem)) return "object";
    if (EXPRESSIONS.has(stem)) return "expression";
    if (FAMILY_WORDS.has(stem)) return "expression";
  }
  return "abstract";
}

export function needsCharacter(word: string, unitTheme?: string): boolean {
  const theme = norm(unitTheme || "");
  if (FAMILY_WORDS.has(theme) || theme.includes("family") || theme.includes("greeting") || theme.includes("feeling")) return true;
  const k = classifyVocab(word);
  return k === "action" || k === "expression" || k === "abstract";
}

export function isFamilyTheme(word: string, unitTheme?: string): boolean {
  const t = norm(unitTheme || "");
  const w = norm(word);
  return FAMILY_WORDS.has(w) || FAMILY_WORDS.has(t) || t.includes("family");
}

// ───────── Playground cast (mirror of playgroundCastPresets.ts) ─────────

export interface CastMember {
  name: string;
  visual_blueprint: string;
  voice_id: string;
}

const KIWI = "Kiwi Chibi art style: oversized round head, tiny stubby body, huge sparkling eyes, rosy blush cheeks, clean thin outlines, pastel palette, plain off-white background, no text.";

export const PLAYGROUND_CAST: CastMember[] = [
  { name: "Pip the Fox", visual_blueprint: `${KIWI} Pastel orange fox cub, fluffy white belly, oversized ears, amber eyes, tiny red scarf.`, voice_id: "kPtEHAvRnjUJFv7SK9WI" },
  { name: "Bella the Bunny", visual_blueprint: `${KIWI} Pastel pink bunny, long floppy ears, yellow daisy behind one ear, gentle smile.`, voice_id: "XB0fDUnXU5powFXDhCwa" },
  { name: "Charlie the Chick", visual_blueprint: `${KIWI} Pastel yellow chick, blue explorer cap, red bandana, brave excited smile.`, voice_id: "TX3LPaxmHKxFdv7VOQHJ" },
  { name: "Daisy the Duckling", visual_blueprint: `${KIWI} Pastel yellow duckling, teal raincoat and matching boots, giggly smile.`, voice_id: "pFZP5JQG7iQjIQuC4Bku" },
  { name: "Hoot the Owl", visual_blueprint: `${KIWI} Pastel lavender owl, round glasses, tiny gold wizard hat with stars, wise smile.`, voice_id: "XrExE9yKIg1WjnnlVkGX" },
];

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

export function pickLeadCharacter(unitTheme: string, seed = ""): CastMember {
  const idx = hash(`${unitTheme || "unit"}::${seed}`) % PLAYGROUND_CAST.length;
  return PLAYGROUND_CAST[idx];
}

export function pickCharacterForWord(word: string, lead: CastMember, seed = ""): CastMember {
  const idx = hash(`${(word || "").toLowerCase()}::${seed}`) % PLAYGROUND_CAST.length;
  const pick = PLAYGROUND_CAST[idx];
  return hash(word + seed) % 5 < 2 ? lead : pick;
}

/** Age stage from CEFR — same character identity, older body per level. */
export function cefrAgeStage(cefr?: string | null): { label: string; descriptor: string } {
  const c = (cefr || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (c.startsWith("prea")) return { label: "toddler", descriptor: "AGE STAGE: toddler (~3–4 yrs), extra-chubby chibi, head ~1.4× body, very short stubby limbs, baby-soft features, simplest outfit." };
  if (c === "a1") return { label: "little kid", descriptor: "AGE STAGE: little kid (~5–6 yrs), chibi, head ~1.2× body, round cheeks, classic signature outfit." };
  if (c === "a2") return { label: "child", descriptor: "AGE STAGE: school child (~7–8 yrs), slightly taller, more even proportions, confident stance, signature outfit refined with a small accessory." };
  if (c === "b1") return { label: "preteen", descriptor: "AGE STAGE: preteen (~9–11 yrs), slimmer, longer limbs, head ~0.9× body, mature confident expression, sportier upgraded outfit keeping iconic colors." };
  return { label: "kid", descriptor: "AGE STAGE: kid, standard chibi proportions, signature outfit." };
}

/** Build the character art-direction block to append to an image prompt. */
export function characterDirective(members: CastMember[], action: string, cefr?: string | null): string {
  if (members.length === 0) return "";
  const stage = cefrAgeStage(cefr);
  const blueprints = members
    .map((m) => `• ${m.name}: ${m.visual_blueprint} ${stage.descriptor}`)
    .join("\n");
  const names = members.map((m) => m.name).join(" and ");
  return [
    "",
    "[CAST DIRECTION — MANDATORY]",
    `The image MUST feature ${names} as ${stage.label}s, clearly recognizable, performing the action: "${action}".`,
    "Use the EXACT visual blueprint(s) below verbatim — do not invent new traits or swap species/colors — but render them at the specified age stage:",
    blueprints,
    "Keep the cast as the hero(es) of the composition; no other unrelated characters.",
  ].join("\n");
}

/**
 * Top-level decision: given a vocabulary word + unit context, return the
 * cast members to inject (empty array = render the object alone).
 */
export function planVocabCast(opts: {
  word: string;
  unitTheme?: string;
  lessonId?: string;
  forcedLead?: CastMember | null;
}): CastMember[] {
  const { word, unitTheme = "", lessonId = "", forcedLead = null } = opts;
  if (!needsCharacter(word, unitTheme)) return [];
  const lead = forcedLead ?? pickLeadCharacter(unitTheme, lessonId);
  if (isFamilyTheme(word, unitTheme)) {
    // Render the lead's "family" — lead + 2 supporting cast deterministically.
    const others = PLAYGROUND_CAST.filter((c) => c.name !== lead.name);
    const a = others[hash(`a::${word}::${lessonId}`) % others.length];
    const b = others[hash(`b::${word}::${lessonId}`) % others.length];
    const set = [lead, a];
    if (b.name !== a.name) set.push(b);
    return set;
  }
  // Action / expression → single character (lead-biased).
  return [pickCharacterForWord(word, lead, lessonId)];
}
