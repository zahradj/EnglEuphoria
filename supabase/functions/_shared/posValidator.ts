// Part-of-Speech classifier + sentence-pattern guard.
// Prevents the "It is a/an + word" template being applied to colors, adjectives,
// verbs, etc. Used to build a binding directive injected into every brain prompt.

export type Pos = "noun" | "adjective" | "verb" | "color" | "adverb" | "preposition" | "number" | "pronoun" | "other";

const COLORS = new Set([
  "red","orange","yellow","green","blue","purple","pink","black","white","brown","grey","gray","gold","silver","violet","turquoise",
]);

const COMMON_ADJECTIVES = new Set([
  "big","small","tall","short","long","old","young","new","happy","sad","angry","tired","hungry","thirsty","hot","cold","warm","cool",
  "fast","slow","loud","quiet","strong","weak","kind","mean","funny","beautiful","ugly","pretty","clean","dirty","easy","hard","soft",
  "heavy","light","rich","poor","busy","free","safe","dangerous","sunny","rainy","cloudy","snowy","windy","bright","dark","sweet","sour","spicy","salty",
]);

const COMMON_ADVERBS = new Set([
  "always","usually","often","sometimes","rarely","never","quickly","slowly","carefully","well","badly","here","there","now","later","today","tomorrow","yesterday",
]);

const PREPOSITIONS = new Set([
  "in","on","at","under","over","next","behind","between","near","by","with","without","into","onto","from","to","of","for","about","across","through",
]);

const PRONOUNS = new Set(["i","you","he","she","it","we","they","me","him","her","us","them","my","your","his","its","our","their"]);

// Tiny verb hint list — full POS-tagging is impractical in a static map, so we
// rely on suffixes + a curated common set, then fall back to noun.
const COMMON_VERBS = new Set([
  "be","is","are","was","were","have","has","do","does","go","goes","come","like","love","hate","want","need","make","take","give","get","see","look","listen","speak","talk","say","tell","read","write","draw","play","run","walk","jump","sit","stand","sleep","wake","eat","drink","cook","study","learn","teach","help","work","live","know","think","feel","open","close","buy","sell","wash","brush","clean",
]);

function isVowelStart(word: string): boolean {
  return /^[aeiou]/i.test(word.trim());
}

export function classifyWord(rawInput: string): Pos {
  const raw = (rawInput || "").trim().toLowerCase();
  if (!raw) return "other";
  // Strip parenthetical hints like "orange (color)" or "run (verb)"
  const hintMatch = raw.match(/\(([^)]+)\)/);
  const hint = hintMatch?.[1]?.trim();
  const word = raw.replace(/\s*\([^)]*\)\s*/g, "").trim();

  if (hint) {
    if (/color|colour/.test(hint)) return "color";
    if (/^adj/.test(hint)) return "adjective";
    if (/^verb/.test(hint)) return "verb";
    if (/^noun/.test(hint)) return "noun";
    if (/^adv/.test(hint)) return "adverb";
    if (/^prep/.test(hint)) return "preposition";
    if (/^num/.test(hint)) return "number";
    if (/^pron/.test(hint)) return "pronoun";
  }

  if (COLORS.has(word)) return "color";
  if (PRONOUNS.has(word)) return "pronoun";
  if (PREPOSITIONS.has(word)) return "preposition";
  if (COMMON_ADVERBS.has(word)) return "adverb";
  if (COMMON_ADJECTIVES.has(word)) return "adjective";
  if (COMMON_VERBS.has(word)) return "verb";
  if (/^\d+$/.test(word) || ["one","two","three","four","five","six","seven","eight","nine","ten"].includes(word)) return "number";
  // Suffix heuristics
  if (/(ous|ful|less|ish|ive|able|ible|ant|ent|al|ary|ic)$/.test(word)) return "adjective";
  if (/ly$/.test(word) && word.length > 3) return "adverb";
  return "noun";
}

/** Generate a grammatically correct "describe it" pattern for one vocab item. */
export function patternFor(word: string, pos: Pos = classifyWord(word)): string {
  const clean = word.replace(/\s*\([^)]*\)\s*/g, "").trim();
  switch (pos) {
    case "noun":      return `It is ${isVowelStart(clean) ? "an" : "a"} ${clean}.`;
    case "color":
    case "adjective": return `It is ${clean}.`;
    case "verb":      return `I ${clean}.`;
    case "adverb":    return `I do it ${clean}.`;
    case "preposition": return `It is ${clean} the table.`;
    case "number":    return `There are ${clean}.`;
    case "pronoun":   return `${clean.charAt(0).toUpperCase()}${clean.slice(1)} is here.`;
    default:          return clean;
  }
}

export interface VocabClassification {
  word: string;
  pos: Pos;
  example: string;
}

export function classifyVocabulary(words: string[]): VocabClassification[] {
  return (words || []).map((w) => {
    const pos = classifyWord(w);
    return { word: w.replace(/\s*\([^)]*\)\s*/g, "").trim(), pos, example: patternFor(w, pos) };
  });
}

/** Binding directive injected into prompts so the model never forces "It is a/an + word". */
export function buildPosDirective(words: string[]): string {
  if (!words?.length) return "";
  const rows = classifyVocabulary(words);
  const table = rows
    .map((r) => `- ${r.word} -> ${r.pos.toUpperCase()} -> ${r.example}`)
    .join("\n");
  return [
    `=== GRAMMATICAL VALIDATION (BINDING) ===`,
    `Before generating any example sentence, classify each vocabulary item by part of speech.`,
    `Sentence patterns MUST adapt to the POS. Never apply a fixed "It is a/an + word" template to every item.`,
    `Rules:`,
    `- Nouns: use an article when appropriate ("a"/"an"/"the"). "an" before vowel sounds.`,
    `- Adjectives & colors: NO article. Use "It is <adjective>." (e.g. "It is orange.", "It is big.").`,
    `- Verbs: conjugate with a subject ("I run.", "She runs.").`,
    `- Adverbs: modify a verb ("I run quickly.").`,
    `- Prepositions: place inside a phrase ("The cat is under the table.").`,
    ``,
    `Classified vocabulary for THIS lesson:`,
    table,
    ``,
    `Use the example column as the minimum grammatical pattern. Reject any output where an adjective or color is preceded by "a"/"an" (e.g. "It is a orange." is INVALID).`,
    `=== END GRAMMATICAL VALIDATION ===`,
  ].join("\n");
}
