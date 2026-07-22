/**
 * derivePages — builds a default editable page list for a Playground lesson
 * from its vocab/phonic/story, using the locked phase_ids from unitTemplate.
 *
 * Pure & deterministic. Existing pages on the lesson are preserved.
 *
 * IMPORTANT: every phase ships with non-empty scaffold blocks (text + image +
 * audio + activity hints) so a freshly hydrated lesson is never "blank" in
 * the editor / player, even before AI generation runs.
 */
import { PLAYGROUND_UNIT_LESSONS, type PlaygroundLessonNumber } from "./unitTemplate";
import type {
  PlaygroundBlock,
  PlaygroundLessonContent,
  PlaygroundPage,
} from "./types";
import { buildLanguageEngineSlotSlide } from "@/lib/engineSlotInjector";
import { getCachedEngineAccuracy } from "@/lib/engineAutoTune";
import { assignEngineVariant } from "@/lib/engineAbTest";
import { getPinnedEngine } from "@/lib/engineSlotOverrides";

const pageId = (lessonNumber: number, phaseId: string) =>
  `l${lessonNumber}.${phaseId}`;

/**
 * Canonical cast look book — locked physical descriptors so the SAME character
 * renders identically across every image generation call. Any prompt that
 * mentions a character MUST include its descriptor verbatim via
 * `castLookGuide([...])` to prevent the model from re-inventing fur color,
 * outfit, or facial features between scenes.
 */
export const CAST_LOOK: Record<string, string> = {
  Pip:
    "Pip the fox — small, cheerful red fox cub, bright orange fur with a cream white belly and cheeks, fluffy white-tipped tail, big round amber eyes, tiny black nose, wearing a soft sky-blue hooded sweater and white sneakers.",
  Bella:
    "Bella the bunny — soft pastel-pink rabbit, long floppy ears with pale blush inner lining, cream muzzle, big sparkly violet eyes, tiny pink nose, wearing a buttery-yellow pinafore dress with a white collar and pink ballet flats.",
  Leo:
    "Leo the lion — golden-yellow lion cub, fluffy caramel mane around his face, round honey-brown eyes, friendly smile, wearing a red striped t-shirt and blue shorts.",
  Mia:
    "Mia the mouse — petite lavender-grey mouse, large round pink-lined ears, tiny pink nose, big sparkly teal eyes, wearing a mint-green polka-dot dress with a tiny pink bow on her head.",
  Ollie:
    "Ollie the owl — round teal-blue owl, cream feathered chest with soft spots, large amber eyes with black round pupils, tiny orange beak, wearing round black eyeglasses and a tiny grey bowtie.",
  Charlie:
    "Charlie the chick — round fluffy lemon-yellow chick, small orange beak, big shiny black dot eyes, tiny orange feet, wearing a leaf-green backpack and a red baseball cap turned sideways.",
};

export function castLookGuide(names: string[]): string {
  const seen = new Set<string>();
  const lines = names
    .filter((n) => {
      if (!n || seen.has(n)) return false;
      seen.add(n);
      return Boolean(CAST_LOOK[n]);
    })
    .map((n) => `- ${CAST_LOOK[n]}`);
  if (!lines.length) return "";
  return `CHARACTER LOOK BOOK (render EXACTLY as described, identical across every scene — same fur color, same eyes, same outfit, same proportions):\n${lines.join(
    "\n",
  )}`;
}

/** Storybook backdrops — rotated by lesson so the world feels continuous. */
export const STORY_BACKDROPS = [
  "a sunny school playground with a slide and tall trees",
  "a cozy classroom with a rug, bookshelf and big sunny window",
  "a friendly town park with a pond and picnic blanket",
  "a garden backyard with flowers, butterflies and a big tree",
  "a forest clearing with soft sunlight and friendly birds",
];

export type PlaygroundVoiceKey = "pip" | "bella" | "leo" | "mia" | "ollie" | "charlie";
export type CastMember = {
  name: string;
  species: string;
  voice: PlaygroundVoiceKey;
  bubble: { outline: string; fill: string };
};
export const CAST_ROSTER: CastMember[] = [
  { name: "Pip",     species: "fox",   voice: "pip",     bubble: { outline: "#FE6A2F", fill: "#FFF7E6" } },
  { name: "Bella",   species: "bunny", voice: "bella",   bubble: { outline: "#FF9DC4", fill: "#FFF0F6" } },
  { name: "Leo",     species: "lion",  voice: "leo",     bubble: { outline: "#F2B33D", fill: "#FFF8E1" } },
  { name: "Mia",     species: "mouse", voice: "mia",     bubble: { outline: "#B388EB", fill: "#F3ECFF" } },
  { name: "Ollie",   species: "owl",   voice: "ollie",   bubble: { outline: "#4FB3BF", fill: "#E6F7F9" } },
  { name: "Charlie", species: "chick", voice: "charlie", bubble: { outline: "#7BC47F", fill: "#EAF8EC" } },
];

/** Pick lead pair + support member, rotated by lesson number. */
export function pickStoryCast(lessonNumber: number): { leadA: CastMember; leadB: CastMember; support: CastMember } {
  const aIdx = ((lessonNumber - 1) % CAST_ROSTER.length + CAST_ROSTER.length) % CAST_ROSTER.length;
  let bIdx = (aIdx + 1 + ((lessonNumber - 1) % 2)) % CAST_ROSTER.length;
  if (bIdx === aIdx) bIdx = (aIdx + 1) % CAST_ROSTER.length;
  let sIdx = (aIdx + 3) % CAST_ROSTER.length;
  if (sIdx === aIdx || sIdx === bIdx) sIdx = (sIdx + 1) % CAST_ROSTER.length;
  return { leadA: CAST_ROSTER[aIdx], leadB: CAST_ROSTER[bIdx], support: CAST_ROSTER[sIdx] };
}

export function pickBackdrop(lessonNumber: number): string {
  return STORY_BACKDROPS[((lessonNumber - 1) % STORY_BACKDROPS.length + STORY_BACKDROPS.length) % STORY_BACKDROPS.length];
}




const PHASE_TITLES: Record<string, string> = {
  intro: "Intro card",
  warmup: "Warm-up",
  vocabulary: "Vocabulary",
  vocab_refresher: "Vocabulary refresher",
  modeling: "Modeling",
  phonics: "Phonics",
  phonics_review: "Phonics review",
  sentence: "Sentence",
  spelling: "Spelling",
  practice: "Practice game",
  listen_and_cage: "Listen and choose",
  sequence: "Story",
  story_vocab: "Story vocabulary",
  story_video: "Story video",
  look_and_say: "Look and say",
  retell: "Retell",
  story_review: "Story review",
  flashcards: "Flashcard review",
  colors: "Decode review",
  memory_match: "Memory match",
  sort_by_home: "Sort and group",
  odd_one_out: "Odd one out",
  sentence_mixer: "Sentence mixer",
  sentence_scramble: "Sentence scramble",
  spell_it: "Spell it",
  listening_sprint: "Listening sprint",
  quiz: "Mastery quiz",
  listen_and_point: "Listen and point",
  match_word: "Match words",
  build_frame: "Build the sentence",
  all_done: "Stretch complete",
  cooldown: "Cool down",
};

function mediaForWord(
  media: PlaygroundLessonContent["vocab_media"],
  word: string,
) {
  const key = word.toLowerCase().trim();
  return media?.[word] ?? media?.[key];
}

/** Lesson-number → sensible starter vocab so empty rows never render blank. */
const DEFAULT_VOCAB: Record<number, string[]> = {
  1: ["cat", "dog", "cow", "pig", "duck", "hen"],
  2: ["red", "blue", "green"],
  3: ["big", "small", "tiny"],
};

const DEFAULT_PHONIC: Record<number, { letter: string; sound: string; words: string[] }> = {
  1: { letter: "a", sound: "/æ/", words: ["apple", "ant", "axe"] },
  2: { letter: "b", sound: "/b/", words: ["bat", "ball", "bus"] },
  3: { letter: "c", sound: "/k/", words: ["cat", "cow", "car"] },
};

function ensureLessonDefaults(lesson: PlaygroundLessonContent): PlaygroundLessonContent {
  const next = { ...lesson };
  if (!next.vocab || next.vocab.length === 0) {
    next.vocab = DEFAULT_VOCAB[next.lesson_number] ?? [];
  }
  if (!next.phonic && DEFAULT_PHONIC[next.lesson_number]) {
    next.phonic = DEFAULT_PHONIC[next.lesson_number];
  }
  if (!next.story && (next.lesson_number === 4)) {
    const targets = Array.from(new Set([...(next.vocab ?? []), ...(((next as any).review_targets ?? []) as string[])]));
    if (isConversationLesson(next)) {
      next.story = {
        title: "Pip's hello day",
        scenes: [
          { id: "s1", text: "Pip sees Bella. Pip says, 'Hello!'", image_prompt: "Pip the fox waves hello to Bella Bunny at the classroom door." },
          { id: "s2", text: "Bella smiles. 'Hi! My name is Bella.'", image_prompt: "Bella Bunny smiles and introduces herself to Pip, friendly classroom scene." },
          { id: "s3", text: "Pip and Bella say, 'Nice to meet you!'", image_prompt: "Pip and Bella wave together, happy first meeting, no background clutter." },
        ],
      };
      return next;
    }
    next.story = {
      title: "Pip and the farm friends",
      scenes: [
        { id: "s1", text: `Pip meets a ${targets[0] ?? "cat"}. 'Hello!' says Pip.`, image_prompt: `Pip the fox waves at a friendly ${targets[0] ?? "cat"}.` },
        { id: "s2", text: `${targets[1] ?? "Dog"} helps Pip look.`, image_prompt: `Pip the fox and ${targets[1] ?? "dog"} look together.` },
        { id: "s3", text: "All the friends play together. 'Yay!' says Pip.", image_prompt: "Pip, cat, dog, cow and duck dancing in a field." },
      ],
    };
  }
  return next;
}

function unitTopicOf(lesson: PlaygroundLessonContent): string {
  return String((lesson as any).unit_theme || (lesson as any).unit_topic || "").trim();
}

function hasConversationSignals(lesson: PlaygroundLessonContent): boolean {
  const haystack = [
    unitTopicOf(lesson),
    (lesson as any).communication_goal,
    (lesson as any).grammar_target,
    (lesson as any).focus_label,
    ...(lesson.vocab ?? []),
    ...(((lesson as any).review_targets ?? []) as string[]),
  ].join(" ").toLowerCase();
  return /\b(hello|hi|goodbye|bye|greet|greeting|introduc|my name|nice to meet|meet you|thank you|please|sorry)\b/.test(haystack);
}

function conversationModels(lesson: PlaygroundLessonContent): string[] {
  const star = speakerName(lesson, "Pip");
  const vocab = lesson.vocab ?? [];
  const greeting = vocab.find((w) => /^(hello|hi)$/i.test(w)) || "Hello";
  const closing = vocab.find((w) => /^(bye|goodbye)$/i.test(w)) || "Nice to meet you";
  return [
    `${greeting}! My name is ${star}.`,
    `Hi! My name is Bella.`,
    `${closing}!`,
  ];
}

function getSentenceModels(lesson: PlaygroundLessonContent, frame?: string | null): string[] {
  const explicit = Array.isArray((lesson as any).sentence_models)
    ? (lesson as any).sentence_models.filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
    : [];
  if (explicit.length) return explicit;
  if (hasConversationSignals(lesson)) return conversationModels(lesson);
  const vocab = lesson.vocab ?? [];
  if (frame) return vocab.slice(0, 4).map((w) => frame.replace("___", w));
  return vocab.slice(0, 4).map((w) => w);
}

const CONVERSATION_REGEX = /\b(hello|hi|goodbye|bye|greet|greeting|introduc|my name|nice to meet|meet you|thank you|please|sorry)\b/;

function isConversationLesson(lesson: PlaygroundLessonContent): boolean {
  // HARD binding: an explicit grammar_target is the pedagogical contract for
  // this lesson. If it's set and is NOT itself a greeting/conversation frame,
  // this lesson must render that grammar — do NOT let stray greeting words in
  // vocab / sentence_models / communication_goal hijack the modeling stage.
  const grammarTarget = String((lesson as any).grammar_target || "").trim().toLowerCase();
  if (grammarTarget && !CONVERSATION_REGEX.test(grammarTarget)) return false;

  if (hasConversationSignals(lesson)) return true;
  const haystack = [
    unitTopicOf(lesson),
    (lesson as any).communication_goal,
    grammarTarget,
    (lesson as any).focus_label,
    ...(lesson.vocab ?? []),
    ...getSentenceModels(lesson),
  ].join(" ").toLowerCase();
  return CONVERSATION_REGEX.test(haystack);
}

function speakerName(lesson: PlaygroundLessonContent, fallback = "Pip"): string {
  return (lesson.starring_character as any)?.name || fallback;
}

function modelingDialogue(lesson: PlaygroundLessonContent): string[] {
  const star = speakerName(lesson, "Pip");
  const models = getSentenceModels(lesson);
  const hasName = models.find((s) => /my name is/i.test(s)) || "Hello! My name is Pip.";
  const greeting = (lesson.vocab ?? []).find((w) => /^(hello|hi)$/i.test(w)) || "Hello";
  const closing = (lesson.vocab ?? []).find((w) => /nice to meet you/i.test(w)) || "Nice to meet you!";
  return [
    `${star}: ${greeting}! ${hasName.replace(/___/g, star).replace(/\bPip\b/g, star)}`,
    `Bella: Hi! My name is Bella.`,
    `${star}: ${closing}`,
  ];
}

function blockIds(blocks: PlaygroundBlock[]): Set<string> {
  return new Set(blocks.map((b) => b.id));
}

function mergeDefaultBlocks(existing: PlaygroundPage, defaults: PlaygroundBlock[]): PlaygroundBlock[] {
  const ids = blockIds(existing.blocks ?? []);
  const missing = defaults.filter((b) => !ids.has(b.id));
  return [...missing, ...(existing.blocks ?? [])];
}

function blocksForPhase(
  lessonNumber: PlaygroundLessonNumber,
  phaseId: string,
  lesson: PlaygroundLessonContent,
): PlaygroundBlock[] {
  const blocks: PlaygroundBlock[] = [];
  const idP = (k: string) => `${pageId(lessonNumber, phaseId)}.${k}`;
  const vocab = lesson.vocab ?? [];
  const allVocab = Array.from(new Set([...(lesson.vocab ?? []), ...((lesson as any).review_targets ?? [])]));
  const targets = vocab.length ? vocab : allVocab;
  const frame = (PLAYGROUND_UNIT_LESSONS.find((l) => l.lesson_number === lessonNumber) as any)
    ?.sentence_frame as string | null | undefined;
  const grammarTarget = String((lesson as any).grammar_target || frame || "").trim();
  const sentenceModels = getSentenceModels(lesson, frame);
  const objective = String((lesson as any).communication_goal || (lesson as any).focus_label || "Use today’s English with Pip.").trim();

  switch (phaseId) {
    case "warmup": {
      blocks.push({
        kind: "text",
        id: idP("goal"),
        label: "Warm-up goal",
        value: `Today we will: ${objective}`,
      });
      const greetChunks = Array.isArray((lesson as any).greet_chunks)
        ? ((lesson as any).greet_chunks as string[]).filter(Boolean)
        : [];
      // Build a chant that echoes EVERY target word so each one is recycled
      // at least once in warm-up (boosts vocab_recycling on the critic).
      const echoLines = vocab.filter(Boolean).map((w) => `${w}, ${w} — say it loud!`);
      const warmupText = isConversationLesson(lesson)
        ? [
            "Hello, hello — wave hello!",
            "Hi, hi — touch the sky!",
            ...(greetChunks.length ? greetChunks : ["My name is Pip. What is your name?"]),
            ...echoLines,
          ].join("\n")
        : [
            `Hello, hello, ${vocab[0] ?? "friend"}!`,
            `Hello, hello, ${vocab[1] ?? "friend"}!`,
            ...echoLines,
            "Clap, stomp, jump — let's go!",
          ].join("\n");
      // Lyrics card — large, color-coded, readable so kids sing along while the
      // ElevenLabs audio plays. Same lines drive both card + audio.
      const lyricsLines = warmupText.split("\n").map((l) => l.trim()).filter(Boolean);
      blocks.push({
        kind: "lyrics_card" as any,
        id: idP("chant-card"),
        label: "Warm-up song",
        title: "Sing with us!",
        lines: lyricsLines.map((line, i) => ({
          text: line,
          speaker: i % 2 === 0 ? "Pip" : "Bella",
          color: i % 2 === 0 ? "#FE6A2F" : "#7C3AED",
        })),
        value: warmupText, // text fallback for renderers that don't know lyrics_card
      } as any);
      // ElevenLabs-narrated chant — render the ENTIRE song as ONE continuous
      // audio track (not one clip per line) so the singer performs the whole
      // song end-to-end. Line-per-clip generation was chopping the song into
      // fragments and losing musical continuity.
      blocks.push({
        kind: "audio",
        id: idP("chant-audio"),
        label: "Warm-up song",
        text: lyricsLines.join(" \n "),
        voice: "pip",
        fullSong: true,
      } as any);

      // Warm-up scene image — clean background + ONE cast member standing
      // silently. NO speech bubbles (lyrics live on the card). Dialogue scenes
      // belong to Modeling/Story phases, not the warm-up.
      const BACKDROPS = [
        "sunny school playground with trees, slide and benches in the background",
        "cozy classroom with a colorful rug, bookshelf and big window",
        "friendly town park with a pond, picnic table and flowers",
        "village market street with little shops and balloons",
        "garden backyard with butterflies, fence and a big tree",
        "beach boardwalk with palm trees and gentle waves behind",
        "forest clearing with mushrooms, friendly birds and soft sunlight",
      ];
      const backdrop = BACKDROPS[(lessonNumber - 1 + BACKDROPS.length) % BACKDROPS.length];
      const soloLead = (lessonNumber % 2 === 0) ? "Bella the bunny" : "Pip the fox";
      const soloName = soloLead.startsWith("Pip") ? "Pip" : "Bella";
      const titleWord = isConversationLesson(lesson) ? "Hello!" : "Sing with us!";
      // Compose a fixed LYRIC-POSTER layout that matches the reference design:
      // a big white rounded lyric card centered in the frame, decorative
      // title ribbon at the top, and the cast member standing in the
      // bottom-left corner. The actual lyric text is rendered by the image
      // edge function via TEXT_OVERLAY_RULE (see textOverlay below) — the
      // prompt below must ONLY describe the visual composition, never the
      // lyric text itself, so the model can't leak prompt sentences onto the
      // card.
      const sceneSubject = [
        `Warm-up SONG POSTER for a kawaii kids storybook.`,
        `LAYOUT (strict):`,
        `• A large soft-white rounded lyric card fills the CENTER of the frame (about 60% of the image area), with a thick clean black outline and gentle drop shadow.`,
        `• A bright yellow/orange decorative TITLE RIBBON is pinned across the TOP of the card, reading "${titleWord}" as bold hand-lettered kawaii display type.`,
        `• The song lyrics are rendered INSIDE the white card, centered, in a clean bold kid-friendly hand-lettered font, one line per lyric line, plenty of breathing room, perfectly spelled.`,
        `• ${soloLead} stands in the BOTTOM-LEFT corner in a joyful mid-action singing pose — happy face, one paw raised, small motion sparkles. Do NOT place the character on top of the lyric card and do NOT let any lyric text cover the character.`,
        `• Beautiful detailed background BEHIND the card: ${backdrop}. Soft depth, warm cinematic lighting.`,
        `HARD RULES: NO speech bubbles, NO thought bubbles, NO dialogue balloons, NO caption boxes anywhere. The lyric card is a POSTER, not dialogue. Do NOT render the words of this prompt anywhere — only the lyrics provided by the TEXT OVERLAY RULE.`,
        castLookGuide([soloName]),
      ].join(" ");

      // Cover / warm-up hero — for the warm-up we ALWAYS use the lyric-poster
      // layout above (never fall back to a Story Architect cover), otherwise
      // the model tries to render narrative prose as a speech bubble.
      blocks.push({
        kind: "image",
        id: idP("img"),
        label: "Warm-up song poster",
        subject: sceneSubject,
        prompt: sceneSubject,
        // Warm-up image renders the chant lyrics inside the picture so the
        // card doubles as a singable poster (see attached reference design).
        allowText: true,
        textOverlay: warmupText,
        suppressText: false,
      } as any);
      const coverPlan = (lesson as any).story_plan?.cover;
      if (coverPlan?.title) {
        blocks.push({ kind: "text", id: idP("cover-title"), label: "Story title", value: coverPlan.title + (coverPlan.tagline ? ` — ${coverPlan.tagline}` : "") });
      }

      blocks.push({ kind: "music", id: idP("song"), label: "Warm-up music", mood: "bright playful greeting chant", durationSec: 20 });
      blocks.push({
        kind: "audio",
        id: idP("aud"),
        label: "Pip says: Let's start!",
        text: "Hello friends! Are you ready? Let's go!",
        voice: "pip",
      });
      // Second warm-up page: rotating review mini-game (L2+ only, when
      // there's something to recycle). Game type rotates by lesson_number
      // so the same activity never appears two warm-ups in a row.
      const reviewPool = Array.from(
        new Set([...(((lesson as any).review_targets ?? []) as string[]), ...vocab]),
      ).filter(Boolean);
      if (lessonNumber >= 2 && reviewPool.length >= 2) {
        const REVIEW_GAMES = [
          { type: "memory_match",     label: "Memory match review",     prompt: "Flip two cards. Match the picture to the word!" },
          { type: "match_pictures",   label: "Match the pictures",      prompt: "Tap the word, then tap the matching picture." },
          { type: "sentence_builder", label: "Build the sentence",      prompt: "Drag the icons to build a sentence with today's words." },
          { type: "story_image",      label: "Look and remember",       prompt: "Look at the scene. Say every word you can see!" },
          { type: "drag_drop",        label: "Drag to the right home",  prompt: "Drag each word to where it belongs." },
        ] as const;
        const game = REVIEW_GAMES[(lessonNumber - 2) % REVIEW_GAMES.length];
        blocks.push({
          kind: "text",
          id: idP("review-title"),
          label: "Warm-up review",
          value: "Quick review — what do you remember?",
        });
        blocks.push({
          kind: "activity",
          id: idP("review-game"),
          label: game.label,
          type: game.type,
          config: {
            prompt: game.prompt,
            words: reviewPool.slice(0, 6),
            pairs: reviewPool.slice(0, 4).map((w) => ({
              word: w,
              image: mediaForWord(lesson.vocab_media, w)?.imageUrl ?? "",
            })),
          },
        });
      }
      break;
    }

    case "vocabulary":
    case "vocab_refresher":
    case "flashcards": {
      targets.forEach((w, i) => {
        blocks.push({
          kind: "image",
          id: idP(`img-${i}`),
          label: w,
          subject: w,
          url: mediaForWord(lesson.vocab_media, w)?.imageUrl,
        });
        blocks.push({
          kind: "audio",
          id: idP(`aud-${i}`),
          label: `${w} (Pip says)`,
          text: w,
          voice: "pip",
          url: mediaForWord(lesson.vocab_media, w)?.audioUrl,
        });
      });
      break;
    }
    case "modeling":
    case "describe":
    case "sentence":
    case "build_frame": {
      const sentence = sentenceModels[0] || ((vocab[0] && frame) ? frame.replace("___", vocab[0]) : (grammarTarget || "Hello!"));

      // Helper: build a 3-beat short-story scene prompt using today's vocab.

      const STORY_BACKDROPS = [
        "a sunny school playground with a slide and tall trees",
        "a cozy classroom with a rug, bookshelf and big sunny window",
        "a friendly town park with a pond and picnic blanket",
        "a garden backyard with flowers, butterflies and a big tree",
        "a forest clearing with soft sunlight and friendly birds",
      ];
      const storyBackdrop = STORY_BACKDROPS[(lessonNumber - 1 + STORY_BACKDROPS.length) % STORY_BACKDROPS.length];

      // Cast roster — the story rotates a different pair per lesson so the
      // unit feels populated. Each member has its OWN ElevenLabs voice key
      // (see PLAYGROUND_VOICES in lib/speech.ts) so audio identity stays
      // consistent across lessons + storybooks.
      type PlaygroundVoiceKey = "pip" | "bella" | "leo" | "mia" | "ollie" | "charlie";
      type CastMember = {
        name: string;
        species: string;
        voice: PlaygroundVoiceKey;
        bubble: { outline: string; fill: string };
      };
      const CAST_ROSTER: CastMember[] = [
        { name: "Pip",     species: "fox",   voice: "pip",     bubble: { outline: "#FE6A2F", fill: "#FFF7E6" } },
        { name: "Bella",   species: "bunny", voice: "bella",   bubble: { outline: "#FF9DC4", fill: "#FFF0F6" } },
        { name: "Leo",     species: "lion",  voice: "leo",     bubble: { outline: "#F2B33D", fill: "#FFF8E1" } },
        { name: "Mia",     species: "mouse", voice: "mia",     bubble: { outline: "#B388EB", fill: "#F3ECFF" } },
        { name: "Ollie",   species: "owl",   voice: "ollie",   bubble: { outline: "#4FB3BF", fill: "#E6F7F9" } },
        { name: "Charlie", species: "chick", voice: "charlie", bubble: { outline: "#7BC47F", fill: "#EAF8EC" } },
      ];
      // Pick lead A + lead B + a supporting cast member, rotated by lesson.
      const aIdx = (lessonNumber - 1) % CAST_ROSTER.length;
      const bIdx = (aIdx + 1 + ((lessonNumber - 1) % 2)) % CAST_ROSTER.length;
      const sIdx = (aIdx + 3) % CAST_ROSTER.length;
      const leadA = CAST_ROSTER[aIdx];
      const leadB = CAST_ROSTER[bIdx === aIdx ? (aIdx + 1) % CAST_ROSTER.length : bIdx];
      const support = CAST_ROSTER[sIdx === aIdx || sIdx === bIdx ? (sIdx + 1) % CAST_ROSTER.length : sIdx];
      const storySupportingCast = `${support.name} the ${support.species} in the background watching and cheering quietly (no speech bubble)`;

      // Vocab-aware enforcement: dialogue lines may use the current lesson's
      // vocab + a small closed-class allowlist of high-frequency function words
      // so that sentences remain grammatical (we still drill today's words but
      // we don't reduce "Hello! My name is Pip." down to "Pip.").
      const vocabPool = (targets.length ? targets : vocab).filter(Boolean);
      const lessonWordSet = new Set(vocabPool.map((w) => w.toLowerCase()));
      const nameSet = new Set(CAST_ROSTER.map((c) => c.name.toLowerCase()));
      const FUNCTION_WORDS = new Set([
        "a","an","and","the","is","am","are","my","your","you","i","it","this","that",
        "to","too","of","in","on","at","with","for","please","thank","thanks","yes","no",
        "ok","okay","hi","hey","hello","bye","goodbye","good","morning","afternoon","evening","night",
        "name","what","who","where","how","see","look","here","there","nice","meet","friend","friends",
        "let","lets","can","do","like","have","want","love","play","go","come","say","says","said",
        "me","we","us","he","she","they","them","one","two","three","big","small","happy",
      ]);
      const vocabOnly = (raw: string): string => {
        const kept = raw
          .split(/\s+/)
          .map((tok) => {
            const clean = tok.replace(/[^A-Za-z'-]/g, "").toLowerCase();
            if (!clean) return tok;
            if (lessonWordSet.has(clean) || nameSet.has(clean) || FUNCTION_WORDS.has(clean)) return tok;
            return null;
          })
          .filter(Boolean) as string[];
        return kept.join(" ").replace(/\s+([!?.,])/g, "$1").trim();
      };
      const w = (i: number): string => vocabPool[i % Math.max(vocabPool.length, 1)] || vocabPool[0] || "friend";
      const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

      // Real grammatical sentence templates per beat. Each template weaves in
      // today's target vocab around safe function-word scaffolding so the
      // bubbles read like natural kid English, not isolated word tokens.
      const beatDialogue: Record<1 | 2 | 3, Array<{ speaker: "A" | "B"; line: string }>> = isConversationLesson(lesson)
        ? {
            1: [
              { speaker: "A", line: `Hello! My name is ${leadA.name}.` },
              { speaker: "B", line: `Hi ${leadA.name}! I am ${leadB.name}.` },
            ],
            2: [
              { speaker: "A", line: `Nice to meet you, ${leadB.name}!` },
              { speaker: "B", line: `Nice to meet you too, ${leadA.name}!` },
            ],
            3: [
              { speaker: "A", line: `Let's play, ${leadB.name}!` },
              { speaker: "B", line: `Yes! Let's play, ${leadA.name}!` },
            ],
          }
        : {
            1: [
              { speaker: "A", line: `Look, ${leadB.name}! ${cap(w(0))}!` },
              { speaker: "B", line: `Wow, ${leadA.name}! I see ${w(1) || w(0)} too!` },
            ],
            2: [
              { speaker: "A", line: `I like ${w(0)}. Do you like ${w(1) || w(0)}?` },
              { speaker: "B", line: `Yes! I like ${w(1) || w(0)} and ${w(2) || w(0)}.` },
            ],
            3: [
              { speaker: "A", line: `${cap(w(0))} and ${w(1) || w(0)}! Yay!` },
              { speaker: "B", line: `Happy day, ${leadA.name}!` },
            ],
          };

      const nameFor = (s: "A" | "B") => (s === "A" ? leadA.name : leadB.name);
      const voiceFor = (s: "A" | "B"): PlaygroundVoiceKey => (s === "A" ? leadA.voice : leadB.voice);

      // Per-beat setting variations — same WORLD (storyBackdrop) but a
      // different corner/moment for each beat so the three story panels
      // don't look identical. Rotated by lessonNumber so consecutive
      // lessons don't feel repetitive either.
      const BEAT_VARIATIONS: Array<[string, string, string]> = [
        ["near the entrance, morning light streaming in", "in the middle of the space, mid-action with props around them", "by a bright window/sunny corner, celebrating together with confetti sparkles"],
        ["arriving from the left, curious", "at a small table/rock/bench in the center, working on the task", "standing together looking out at the horizon, arms up in celebration"],
        ["walking in from a path, greeting each other", "gathered around a colorful prop related to today's words", "under a rainbow arc / sunbeam / string of paper flags, cheering"],
      ];
      const beatSettings = BEAT_VARIATIONS[(lessonNumber - 1) % BEAT_VARIATIONS.length];

      const buildStoryScene = (beat: 1 | 2 | 3, _dialogueLines: string[]) => {
        const beatLabels = [
          `Beat 1 — Meet: ${leadA.name} the ${leadA.species} and ${leadB.name} the ${leadB.species} meet ${beatSettings[0]}, inside ${storyBackdrop}.`,
          `Beat 2 — Try: ${leadA.name} and ${leadB.name} explore today's words (${(targets.slice(0, 4).join(", ") || "today's vocabulary")}) ${beatSettings[1]}, still inside ${storyBackdrop}.`,
          `Beat 3 — Win: ${leadA.name} and ${leadB.name} celebrate ${beatSettings[2]}, closing the story inside ${storyBackdrop}.`,
        ];
        const lines = beatDialogue[beat];
        const dialogueText = lines.map((l) => `${nameFor(l.speaker)}: "${l.line}"`).join(" | ");
        return [
          `Playground short-story comic panel, two lead cast characters (${leadA.name} the ${leadA.species} + ${leadB.name} the ${leadB.species}) together,`,
          `plus ${storySupportingCast},`,
          beatLabels[beat - 1],
          `Camera composition MUST clearly differ from the other beats: change camera angle, character positions, and framing every beat. This panel is beat ${beat} of 3 — do NOT reuse the beat 1 composition.`,
          `They are practicing: "${objective}".`,
          `Exact dialogue to render in the bubbles (one bubble per speaker, in this order, spelled EXACTLY as written — do NOT rewrite, shorten, or invent new words): ${dialogueText}.`,
          "Expressive friendly poses, gesture matches the meaning of each line,",
          "rich storybook background with depth, warm cinematic lighting,",
          "INCLUDE comic-style speech bubbles containing EXACTLY the dialogue lines above verbatim, in clean large kid-friendly handwritten English letters, readable and correctly spelled, with tails pointing to the speaking character. Never invent additional bubbles or extra text.",
          `COLOR-CODE the bubbles: ${leadA.name}'s bubble has a ${leadA.bubble.outline} rounded outline with a ${leadA.bubble.fill} fill; ${leadB.name}'s bubble has a ${leadB.bubble.outline} rounded outline with a ${leadB.bubble.fill} fill. Text inside each bubble is dark charcoal for contrast.`,
          castLookGuide([leadA.name, leadB.name, support.name]),
        ].filter(Boolean).join(" ");
      };


      if (isConversationLesson(lesson) && (phaseId === "modeling" || phaseId === "sentence" || phaseId === "build_frame")) {
        const lines = modelingDialogue(lesson);
        blocks.push({ kind: "image", id: idP("scene-1"), label: "Story scene 1 — Meet", subject: buildStoryScene(1, lines) });
        blocks.push({ kind: "image", id: idP("scene-2"), label: "Story scene 2 — Try", subject: buildStoryScene(2, lines) });
        blocks.push({ kind: "image", id: idP("scene-3"), label: "Story scene 3 — Win", subject: buildStoryScene(3, lines) });

        if (phaseId === "modeling") {
          blocks.push({ kind: "video", id: idP("video"), label: "Quick model video", provider: "upload", url: "" });
        }
        lines.forEach((line, i) => blocks.push({ kind: "audio", id: idP(`line-${i + 1}`), label: `${i % 2 === 0 ? leadA.name : leadB.name} — line ${i + 1}`, text: vocabOnly(line.replace(/^\w+:\s*/, "")) || line.replace(/^\w+:\s*/, ""), voice: i % 2 === 0 ? leadA.voice : leadB.voice }));
        blocks.push({ kind: "text", id: idP("dialogue"), label: phaseId === "modeling" ? "Conversation model" : "Sentence chunks", value: lines.join("\n") });
        blocks.push({ kind: "activity", id: idP("act-echo"), label: phaseId === "modeling" ? "Echo roleplay" : "Build the greeting", type: phaseId === "modeling" ? "echo" : "sequence", config: { prompt: "Listen, wave, then say your line.", lines } });
        break;
      }
      // Non-conversation lessons: ship the 3 beats with the same color-coded
      // dialogue bubbles, narrated by the chosen lead pair via ElevenLabs.
      ([1, 2, 3] as const).forEach((beat) => {
        const lines = beatDialogue[beat];
        blocks.push({ kind: "image", id: idP(`scene-${beat}`), label: `Story scene ${beat} — ${beat === 1 ? "Meet" : beat === 2 ? "Try" : "Win"}`, subject: buildStoryScene(beat, []) });
        lines.forEach((l, j) => {
          blocks.push({ kind: "audio", id: idP(`scene-${beat}-line-${j + 1}`), label: `${nameFor(l.speaker)} — beat ${beat}`, text: l.line, voice: voiceFor(l.speaker) });
        });
      });
      blocks.push({ kind: "text", id: idP("frame"), label: "Target pattern", value: grammarTarget || frame || "It is a ___." });
      blocks.push({ kind: "text", id: idP("examples"), label: "Modeled examples", value: sentenceModels.join("\n") || sentence });
      if (phaseId === "sentence" || phaseId === "build_frame") {
        blocks.push({ kind: "activity", id: idP("act-build"), label: "Build the sentence", type: "fill", config: { prompt: "Build and say the sentence.", sentence: (grammarTarget || frame || "It is a ___.").replace("___", "____"), answer: targets[0] ?? "", options: targets.slice(0, 4) } });
      }
      // Open-ended guided speaking — lifts speaking_authenticity above scripted
      // chants without exceeding the Playground "guided" ladder ceiling.
      blocks.push({
        kind: "activity",
        id: idP("act-pretend-say"),
        label: "Pretend & say",
        type: "pretend_and_say",
        config: {
          prompt: `Pretend you are ${leadA.name}. Use today's words to tell ${leadB.name} something real: ${(targets.slice(0, 4).join(", ") || "today's words")}.`,
          scaffold: { guided: true, ladder_rung: "guided" },
          target_vocab: targets,
        },
      });
      break;
    }

    case "phonics":
    case "phonics_review": {
      const phonic = lesson.phonic;
      if (phonic) {
        blocks.push({
          kind: "text",
          id: idP("phonic"),
          label: `Phonic — letter ${phonic.letter?.toUpperCase()}`,
          value: `/${phonic.letter}/ ${phonic.sound} → ${phonic.words.join(", ")}`,
        });
        phonic.words.forEach((w, i) => {
          blocks.push({ kind: "image", id: idP(`img-${i}`), label: w, subject: w });
          blocks.push({ kind: "audio", id: idP(`aud-${i}`), label: `${w}`, text: w, voice: "pip" });
        });
      }
      break;
    }
    case "spelling":
    case "spell_it": {
      const target = targets[0] ?? lesson.phonic?.words?.[0] ?? "hello";
      blocks.push({
        kind: "text",
        id: idP("instr"),
        label: "Drag the letters to spell the word",
        value: targets.slice(0, 3).map((w) => `• ${w} → ${w.split("").join(" · ")}`).join("\n") || `${target} → ${target.split("").join(" · ")}`,
      });
      blocks.push({ kind: "activity", id: idP("act-spell"), label: "Letter builder", type: "word_builder", config: { prompt: "Drag the letters in order.", word: target, extras: ["s", "m"] } });
      blocks.push({
        kind: "audio",
        id: idP("aud"),
        label: "Pip cheers",
        text: "Spell it with me!",
        voice: "pip",
      });
      break;
    }
    case "memory_match":
    case "match_word":
    case "listen_and_cage":
    case "listen_and_point": {
      const activityType = phaseId === "memory_match"
        ? "memory_match"
        : phaseId === "listen_and_point"
          ? "listen_and_point"
          : "match_word";
      blocks.push({
        kind: "text",
        id: idP("instr"),
        label: "Game instructions",
        value: `Match the picture to the word.\nPairs: ${targets.slice(0, 4).join(", ") || "—"}`,
      });
      targets.slice(0, 4).forEach((w, i) =>
        blocks.push({ kind: "image", id: idP(`pair-${i}`), label: w, subject: w }),
      );
      blocks.push({
        kind: "activity",
        id: idP("act-game"),
        label: PHASE_TITLES[phaseId] ?? "Picture-word game",
        type: activityType,
        config: {
          prompt: phaseId === "listen_and_point" ? "Listen. Point to the correct picture." : "Match each word to its picture.",
          words: targets.slice(0, 6),
          pairs: targets.slice(0, 6).map((w) => ({ word: w, image: mediaForWord(lesson.vocab_media, w)?.imageUrl ?? "" })),
          // Playground telemetry parity with Academy/Success vocab-gamification arc.
          source: "playground_vocab_gamification",
          telemetry_tag: activityType === "memory_match" ? "vocab_arc_memory_match" : `vocab_arc_${activityType}`,
          reinforcement_target: { skill_key: "vocab_recognition", target_words: targets.slice(0, 6) },
        },
      });
      break;
    }
    case "colors": {
      const letter = lesson.phonic?.letter ?? targets[0]?.[0] ?? "a";
      blocks.push({ kind: "text", id: idP("instr"), label: "Decode game", value: `Find the words with ${letter.toUpperCase()}.` });
      blocks.push({ kind: "activity", id: idP("act-phonics-hunt"), label: "Phonics hunt", type: "phonics_hunt", config: { prompt: `Tap the words with ${letter.toUpperCase()}.`, letter, words: targets.slice(0, 6) } });
      break;
    }
    case "sort_by_home": {
      blocks.push({ kind: "text", id: idP("instr"), label: "Sort game", value: `Drag the cards into groups: ${targets.slice(0, 6).join(", ") || "today's words"}.` });
      blocks.push({ kind: "activity", id: idP("act-sort"), label: "Drag to the right home", type: "sort_by_home", config: { prompt: "Drag each card to the right home.", words: targets.slice(0, 8), buckets: [{ id: "group-1", label: "Group 1", emoji: "🏠" }, { id: "group-2", label: "Group 2", emoji: "🌳" }] } });
      break;
    }
    case "odd_one_out": {
      blocks.push({ kind: "text", id: idP("instr"), label: "Odd one out", value: "Look carefully. Which one is different?" });
      blocks.push({ kind: "activity", id: idP("act-odd"), label: "Odd one out", type: "odd_one_out", config: { prompt: "Which word is different?", options: targets.slice(0, 4), answer: targets[0] ?? "" } });
      break;
    }
    case "listening_sprint": {
      blocks.push({ kind: "text", id: idP("instr"), label: "Listening sprint", value: "Listen fast. Tap the word you hear." });
      blocks.push({ kind: "activity", id: idP("act-listen"), label: "Listen and point", type: "listen_and_point", config: { prompt: "Listen and tap the correct card.", words: targets.slice(0, 6) } });
      break;
    }
    case "practice":
    case "qa":
    case "sentence_mixer":
    case "sentence_scramble": {
      if (isConversationLesson(lesson)) {
        const lines = modelingDialogue(lesson);
        blocks.push({
          kind: "text",
          id: idP("prompt"),
          label: "Roleplay prompt",
          value: `Practice with a partner. Wave, say hello, say your name, and answer.\n\n${lines.join("\n")}`,
        });
        blocks.push({ kind: "activity", id: idP("act-roleplay"), label: "Greeting roleplay", type: "roleplay", config: { roles: [speakerName(lesson), "Bella"], lines } });
        break;
      }
      blocks.push({
        kind: "text",
        id: idP("prompt"),
        label: "Practice prompt",
        value: targets
          .slice(0, 3)
          .map((w) => `Teacher: What is it?\nChild: ${(grammarTarget || frame || "It is a ___.").replace("___", w)}`)
          .join("\n\n") || "Teacher asks. Child answers.",
      });
      blocks.push({
        kind: "activity",
        id: idP("act-practice"),
        label: phaseId.includes("sentence") ? "Sentence builder" : "Grab and drop game",
        type: phaseId.includes("sentence") ? "sentence_builder" : "drag_drop",
        config: {
          prompt: phaseId.includes("sentence") ? "Put the words in order." : "Grab each word and drop it on the matching picture.",
          words: targets.slice(0, 6),
          sentence: sentenceModels[0] || ((grammarTarget || frame || "It is a ___.").replace("___", targets[0] ?? "it")),
          pairs: targets.slice(0, 6).map((w) => ({ word: w, image: mediaForWord(lesson.vocab_media, w)?.imageUrl ?? "" })),
        },
      });
      break;
    }
    case "sequence":
    case "look_and_say":
    case "retell": {
      // ── Story Architect short-circuit ───────────────────────────────────
      // If a StoryPlan has been crafted by the Hub Story Architect agent,
      // render directly from it: each beat ships its own narration, dialogue
      // bubbles (color-coded by character), illustration prompt (backdrop +
      // look-book + bubbles already baked in), and per-line ElevenLabs audio.
      const storyPlan = (lesson as any).story_plan;
      if (storyPlan?.beats?.length) {
        // Front page (cover) first, so the storybook opens like a real book.
        if (storyPlan.cover?.illustration_prompt) {
          blocks.push({ kind: "text", id: idP("arch-cover-title"), label: "Story title", value: storyPlan.cover.title ?? storyPlan.title ?? "Our Story" });
          blocks.push({
            kind: "image",
            id: idP("arch-cover"),
            label: `Front page — ${storyPlan.cover.title ?? storyPlan.title ?? "Cover"}`,
            subject: storyPlan.cover.title ?? storyPlan.title ?? "Story cover",
            prompt: storyPlan.cover.illustration_prompt,
          });
        }
        storyPlan.beats.forEach((beat: any, i: number) => {
          blocks.push({ kind: "text", id: idP(`arch-${i}-narr`), label: `Scene ${i + 1} — ${beat.beat_label ?? "Beat"}`, value: beat.narration ?? "" });
          blocks.push({
            kind: "image",
            id: idP(`arch-${i}-img`),
            label: `Scene ${i + 1} image — ${beat.beat_label ?? "Beat"}`,
            subject: beat.narration ?? storyPlan.title ?? "Story scene",
            prompt: beat.illustration_prompt ?? "",
          });
          (beat.dialogue ?? []).forEach((d: any, j: number) => {
            const character = (storyPlan.characters ?? []).find((c: any) => c.name?.toLowerCase() === String(d.speaker ?? "").toLowerCase());
            blocks.push({
              kind: "audio",
              id: idP(`arch-${i}-line-${j + 1}`),
              label: `${d.speaker} — scene ${i + 1}`,
              text: d.line ?? "",
              voice: (character?.voice_id ?? "pip") as any,
            });
          });
        });
        break;
      }

      // Storybook L4 — perfection pass:
      //  • Locked backdrop (continuous across all scenes in this lesson)
      //  • Two lead cast members with color-coded speech bubbles
      //  • Look-book injected so characters never morph between scenes
      //  • Per-character ElevenLabs audio for every line
      //  • Dialogue derived from scene text — split on the first speaker tag
      //    (e.g. "Pip says, 'Hello!'") so bubbles read as real conversation.
      const { leadA, leadB, support } = pickStoryCast(lessonNumber);
      const backdrop = pickBackdrop(lessonNumber);
      const lookBook = castLookGuide([leadA.name, leadB.name, support.name]);

      const extractDialogue = (raw: string): Array<{ speaker: CastMember; line: string }> => {
        const out: Array<{ speaker: CastMember; line: string }> = [];
        // Match: NAME ...says/asks/replies, "line"  OR  "line," said NAME
        const reA = /\b([A-Z][a-z]+)[^"'""]*?["'""]([^"'""]+)["'""]/g;
        let m: RegExpExecArray | null;
        while ((m = reA.exec(raw))) {
          const who = CAST_ROSTER.find((c) => c.name.toLowerCase() === m![1].toLowerCase());
          if (who && m[2].trim()) out.push({ speaker: who, line: m[2].trim() });
        }
        return out;
      };

      lesson.story?.scenes?.forEach((s, i) => {
        const beatLabel = i === 0 ? "Meet" : i === (lesson.story?.scenes?.length ?? 3) - 1 ? "Win" : "Try";
        let dialogue = extractDialogue(s.text);
        if (dialogue.length === 0) {
          // Fallback: alternate leads with the narrative sentence so every
          // scene still ships at least one spoken line per character.
          dialogue = [
            { speaker: leadA, line: s.text },
            { speaker: leadB, line: "Yes! Let's go." },
          ];
        }
        const dialogueText = dialogue
          .map((d) => `${d.speaker.name}: "${d.line}"`)
          .join(" | ");

        blocks.push({ kind: "text", id: idP(`scene-${i}-text`), label: `Scene ${i + 1} — ${beatLabel}`, value: s.text });
        blocks.push({
          kind: "image",
          id: idP(`scene-${i}-img`),
          label: `Scene ${i + 1} image — ${beatLabel}`,
          subject: s.text,
          prompt: [
            `Storybook illustration, beat "${beatLabel}" of a 3-scene short story.`,
            `Setting (KEEP IDENTICAL across all scenes of this lesson): ${backdrop}.`,
            `Lead characters in scene: ${leadA.name} the ${leadA.species} and ${leadB.name} the ${leadB.species}.`,
            `Background cast: ${support.name} the ${support.species} watching quietly (no speech bubble).`,
            `Scene narration: ${s.text}`,
            `Exact dialogue to render in speech bubbles (one bubble per speaker, in this order): ${dialogueText}.`,
            "INCLUDE comic-style speech bubbles with EXACTLY the dialogue above, large kid-friendly handwritten English letters, correctly spelled, tails pointing to the speaker.",
            `COLOR-CODE bubbles: ${leadA.name}'s bubble = ${leadA.bubble.outline} rounded outline / ${leadA.bubble.fill} fill; ${leadB.name}'s bubble = ${leadB.bubble.outline} rounded outline / ${leadB.bubble.fill} fill. Text dark charcoal.`,
            "Expressive friendly poses, warm cinematic lighting, rich storybook background with depth, child-safe.",
            lookBook,
            s.image_prompt ? `Art notes: ${s.image_prompt}` : "",
          ].filter(Boolean).join(" "),
        });

        dialogue.forEach((d, j) => {
          blocks.push({
            kind: "audio",
            id: idP(`scene-${i}-line-${j + 1}`),
            label: `${d.speaker.name} — scene ${i + 1}`,
            text: d.line,
            voice: d.speaker.voice,
          });
        });
      });
      break;
    }

    case "story_vocab": {
      const targets = allVocab.length ? allVocab : vocab;
      blocks.push({ kind: "text", id: idP("instr"), label: "Story words", value: `Find the story words: ${targets.slice(0, 6).join(", ") || "today's words"}.` });
      targets.slice(0, 6).forEach((w, i) => {
        blocks.push({ kind: "image", id: idP(`img-${i}`), label: w, subject: w, url: mediaForWord(lesson.vocab_media, w)?.imageUrl });
        blocks.push({ kind: "audio", id: idP(`aud-${i}`), label: `${w}`, text: w, voice: "pip", url: mediaForWord(lesson.vocab_media, w)?.audioUrl });
      });
      blocks.push({ kind: "activity", id: idP("act-match"), label: "Story word match", type: "match", config: { prompt: "Match the story word to the picture.", pairs: targets.slice(0, 4).map((w) => ({ left: w, right: w })) } });
      break;
    }
    case "story_video": {
      blocks.push({ kind: "video", id: idP("video"), label: "Story video", provider: "upload", url: "" });
      blocks.push({ kind: "audio", id: idP("narration"), label: "Story narration", text: lesson.story?.scenes?.map((s) => s.text).join(" ") || "Listen to the story with Pip.", voice: "pip" });
      blocks.push({ kind: "text", id: idP("notes"), label: "Video direction", value: "Use the same story scenes and the same cast character. Keep the story video short, clear, and child-safe." });
      break;
    }
    case "story_review": {
      blocks.push({ kind: "text", id: idP("review"), label: "Story review", value: `Review: who was in the story, what happened, and which words we learned. Words: ${allVocab.slice(0, 8).join(", ") || "today's words"}.` });
      blocks.push({ kind: "activity", id: idP("act-qa"), label: "Story check", type: "multiple", config: { prompt: "Who was in the story?", options: [speakerName(lesson), "A robot", "A dragon"], answer: speakerName(lesson) } });
      break;
    }
    case "quiz": {
      const seed = ((lesson as any).quiz_seed ?? {}) as {
        pass_score?: number;
        total_questions?: number;
        format_weights?: { picture?: number; text?: number; audio?: number; spell?: number };
      };
      const passScore = typeof seed.pass_score === "number" ? seed.pass_score : 80;
      const totalQuestions = typeof seed.total_questions === "number" ? seed.total_questions : 24;
      const weights = seed.format_weights ?? {};
      const formats = (["picture", "text", "audio", "spell"] as const).filter(
        (k) => (weights[k] ?? (k === "picture" ? 40 : k === "text" ? 30 : k === "audio" ? 20 : 10)) > 0,
      );
      blocks.push({
        kind: "text",
        id: idP("intro"),
        label: "Mastery quiz",
        value: `${totalQuestions} questions across ${formats.join(", ")} formats. Score ${passScore}% to unlock the next unit; otherwise assign Lesson 7 Stretch.`,
      });
      blocks.push({
        kind: "activity",
        id: idP("act-quiz"),
        label: "Unit mastery quiz",
        type: "multiple",
        config: {
          prompt: "Choose the correct answer.",
          formats,
          format_weights: weights,
          total_questions: totalQuestions,
          pass_score: passScore,
        },
      });
      break;
    }
    case "cooldown":
    case "all_done": {
      blocks.push({
        kind: "text",
        id: idP("recap"),
        label: "Cool down",
        value: `Great job! Today we learned: ${targets.slice(0, 6).join(", ") || "new words"}.`,
      });
      blocks.push({
        kind: "audio",
        id: idP("aud"),
        label: "Pip says goodbye",
        text: "Amazing work! See you next time!",
        voice: "pip",
      });
      break;
    }
    default: {
      const title = phaseId.replace(/_/g, " ");
      blocks.push({
        kind: "text",
        id: idP("notes"),
        label: title,
        value: `Activity: ${title}. Use vocab: ${targets.slice(0, 4).join(", ") || "—"}.`,
      });
      blocks.push({
        kind: "image",
        id: idP("img"),
        label: title,
        subject: `${title} — ${targets[0] ?? "Pip the fox"}`,
      });
      blocks.push({
        kind: "audio",
        id: idP("aud"),
        label: `${title} (Pip says)`,
        text: targets[0] ?? title,
        voice: "pip",
      });
    }
  }
  return blocks;
}

export function derivePages(
  lessonIn: PlaygroundLessonContent,
): PlaygroundPage[] {
  const lesson = ensureLessonDefaults(lessonIn);
  const tpl = PLAYGROUND_UNIT_LESSONS.find(
    (l) => l.lesson_number === lesson.lesson_number,
  );
  if (!tpl) return [buildIntroPage(lesson)];
  const incoming = Array.isArray(lesson.pages) ? lesson.pages : [];
  const existingByPhase = new Map(incoming.filter((p) => p.phase_id !== "intro").map((p) => [p.phase_id, p]));
  const phasePages: PlaygroundPage[] = tpl.phase_ids.map((phaseId) => {
    const defaults = blocksForPhase(lesson.lesson_number, phaseId, lesson);
    const existing = existingByPhase.get(phaseId);
    if (!existing) {
      return {
        id: pageId(lesson.lesson_number, phaseId),
        phase_id: phaseId,
        title: PHASE_TITLES[phaseId] ?? phaseId.replace(/_/g, " "),
        blocks: defaults,
      };
    }
    return {
      ...existing,
      id: existing.id || pageId(lesson.lesson_number, phaseId),
      title: existing.title || PHASE_TITLES[phaseId] || phaseId.replace(/_/g, " "),
      blocks: mergeDefaultBlocks(existing, defaults),
    };
  });
  const pages: PlaygroundPage[] = [buildIntroPage(lesson), ...phasePages];
  const enginePage = buildLanguageEnginePage(lesson);
  return enginePage ? [...pages, enginePage] : pages;
}

function buildLanguageEnginePage(lesson: PlaygroundLessonContent): PlaygroundPage | null {
  try {
    const vocabList = Array.isArray(lesson.vocab) ? lesson.vocab : [];
    const media = ((lesson as any).vocab_media || {}) as Record<string, { image_url?: string | null; definition?: string; example?: string }>;
    const targets = vocabList.slice(0, 8).map((w) => ({
      word: String(w),
      definition: media[String(w)]?.definition,
      example: media[String(w)]?.example,
      image_url: media[String(w)]?.image_url ?? null,
    }));
    if (targets.length < 2) return null;
    const lessonId = String((lesson as any).id ?? `pg-l${lesson.lesson_number}`);
    const pinned = getPinnedEngine(`playground:l${lesson.lesson_number}`) ?? getPinnedEngine(lessonId) ?? undefined;
    // A/B test: 10% of lessons get a randomised engine (pin still wins).
    const ab = pinned ? null : assignEngineVariant(lessonId);
    const slide = buildLanguageEngineSlotSlide({
      hub: "playground",
      cefr: String((lesson as any).cefr || "A1") as any,
      targets,
      lessonNumber: lesson.lesson_number,
      lessonId,
      unitTitle: String((lesson as any).unit_title || ""),
      mode: "lesson",
      engineType: pinned || ab?.engine || undefined,
      recentAccuracy: getCachedEngineAccuracy() ?? undefined,
    });
    if (!slide) return null;
    const pid = pageId(lesson.lesson_number, "language_engine");
    const s = slide as any;
    const block: PlaygroundBlock = {
      kind: "language_engine_slot",
      id: `${pid}.engine`,
      label: s.title,
      engineType: s.type || s.kind,
      mode: s.mode,
      hub: s.hub,
      cefr: s.cefr,
      title: s.title,
      objective: s.objective,
      targets: s.targets,
      target_words: s.target_words,
      graph: s.graph,
      room: s.room,
      case: s.case,
      scene: s.scene,
    };
    return {
      id: pid,
      phase_id: "language_engine",
      title: s.title || "Language Engine",
      blocks: [block],
    };
  } catch {
    return null;
  }
}

function buildIntroPage(lesson: PlaygroundLessonContent): PlaygroundPage {
  const tpl = PLAYGROUND_UNIT_LESSONS.find(
    (l) => l.lesson_number === lesson.lesson_number,
  );
  const title = tpl?.title ?? `Lesson ${lesson.lesson_number}`;
  const introId = pageId(lesson.lesson_number, "intro");
  return {
    id: introId,
    phase_id: "intro",
    title: `Lesson ${lesson.lesson_number} · ${title}`,
    blocks: [
      {
        kind: "text",
        id: `${introId}.headline`,
        label: "Lesson title",
        value: title,
      },
      {
        kind: "text",
        id: `${introId}.objective`,
        label: "Objective",
        value: (tpl as any)?.objective ?? "Welcome to the lesson!",
      },
    ],
  };
}
