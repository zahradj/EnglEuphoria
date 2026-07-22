import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleBrainRequest, corsHeaders } from "../_shared/hub-brain.ts";
import {
 PLAYGROUND_BRAIN_PROMPT_WITH_CONTRACT as PLAYGROUND_BRAIN_PROMPT,
  PLAYGROUND_RESPONSE_FORMAT,
} from "../_shared/prompts/playground.ts";

type BrainInputLike = { topic?: string; cefr?: string; review_targets?: string[] };

type LessonLike = Record<string, any>;

const TOPIC_LEXICON: Array<{ test: RegExp; theme: string; vocab: string[]; frame: string; goal: string; story: string }> = [
  { test: /greet|hello|hi|introduc|name|meet/i, theme: "Friendly greetings", vocab: ["hello", "hi", "goodbye", "my name is", "nice to meet you"], frame: "My name is ___.", goal: "Greet a friend and say your name", story: "Meet a new friend" },
  { test: /animal|pet|cat|dog|farm/i, theme: "Animal friends", vocab: ["cat", "dog", "fish", "bird", "rabbit"], frame: "It is a ___.", goal: "Name friendly animals", story: "Find the animal friend" },
  { test: /color|colour/i, theme: "Bright colors", vocab: ["red", "blue", "green", "yellow", "pink"], frame: "It is ___.", goal: "Name colors", story: "Find the colorful card" },
  { test: /food|eat|drink/i, theme: "Snack time", vocab: ["apple", "bread", "milk", "water", "egg"], frame: "I like ___.", goal: "Name snacks politely", story: "Share a snack" },
  { test: /family|home|mom|dad/i, theme: "Family at home", vocab: ["mom", "dad", "baby", "brother", "sister"], frame: "This is my ___.", goal: "Name family members", story: "Say hello at home" },
  { test: /feel|happy|sad|angry|tired/i, theme: "Feelings faces", vocab: ["happy", "sad", "tired", "scared", "excited"], frame: "I am ___.", goal: "Say how I feel", story: "Help a friend feel better" },
  { test: /school|class|book|pen/i, theme: "My classroom", vocab: ["book", "pen", "bag", "chair", "desk"], frame: "This is a ___.", goal: "Name classroom things", story: "Find the classroom item" },
  { test: /toy|play|ball|doll/i, theme: "Toy box", vocab: ["ball", "doll", "car", "kite", "blocks"], frame: "I have a ___.", goal: "Name favorite toys", story: "Share a toy" },
];

function phonicFor(index: number) {
  const phonics = [
    { letter: "a", sound: "/a/", words: ["ant", "apple", "axe"] },
    { letter: "b", sound: "/b/", words: ["bat", "ball", "bus"] },
    { letter: "c", sound: "/k/", words: ["cat", "cow", "cup"] },
  ];
  return phonics[index];
}

function sentenceFor(frame: string, word: string) {
  if (/___/.test(frame)) return frame.replace("___", word.replace(/\.$/, ""));
  return `${frame} ${word}.`;
}

function isGreetingTopic(topic: string, frame: string) {
  return /greet|hello|hi|introduc|name|meet/i.test(topic) || /my name|hello|hi|nice to meet/i.test(frame);
}

function greetingModels(words: string[]) {
  const has = (needle: RegExp, fallback: string) => words.find((w) => needle.test(w)) || fallback;
  return [
    `${has(/^hello$/i, "Hello")}!`,
    `${has(/^hi$/i, "Hi")}!`,
    "My name is Pip.",
    `${has(/nice to meet/i, "Nice to meet you")}!`,
    `${has(/goodbye|bye/i, "Goodbye")}!`,
  ];
}

function uniqueStrings(values: unknown[], fallback: string[]) {
  const out = values
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  return Array.from(new Set(out)).slice(0, 6).length ? Array.from(new Set(out)).slice(0, 6) : fallback;
}

function isPreA1Value(value?: string) {
  return /pre[-_ ]?a1/i.test(String(value || ""));
}

function isGreetingLesson(lesson: LessonLike, topic = "") {
  return isGreetingTopic(
    [topic, lesson.unit_theme, lesson.communication_goal, lesson.grammar_target, lesson.focus_label, ...(lesson.vocab ?? [])].join(" "),
    String(lesson.grammar_target || ""),
  );
}

function imageBlock(id: string, label: string, subject: string) {
  return { kind: "image", id, label, subject };
}

function audioBlock(id: string, label: string, text: string, voice = "pip") {
  return { kind: "audio", id, label, text, voice };
}

function textBlock(id: string, label: string, value: string) {
  return { kind: "text", id, label, value };
}

function activityBlock(id: string, label: string, type: string, config: Record<string, unknown>) {
  return { kind: "activity", id, label, type, config };
}

function l1Pages(lesson: LessonLike, unitTopic: string) {
  const greeting = isGreetingLesson(lesson, unitTopic);
  const vocab = uniqueStrings(
    lesson.vocab ?? [],
    greeting ? ["hello", "hi", "goodbye", "my name is"] : ["cat", "dog", "fish"],
  ).slice(0, greeting ? 4 : 5);
  const phonic = lesson.phonic ?? { letter: "a", sound: "/a/", words: ["ant", "apple", "axe"] };
  const modelLines = greeting
    ? ["Hello!", "Hi!", "My name is Pip.", "Goodbye!"]
    : vocab.slice(0, 3).map((word) => sentenceFor(String(lesson.grammar_target || "It is a ___."), word));
  const pairs = vocab.map((word) => ({ word, image: "", image_url: "", audio_word: word }));
  const phase = (phase_id: string, title: string, blocks: any[]) => ({
    id: `l1.${phase_id}`,
    phase_id,
    title,
    blocks,
  });

  return [
    phase("warmup", "Hello routine", [
      textBlock("l1.warmup.goal", "Goal", greeting ? "Say hello." : "Listen first."),
      imageBlock("l1.warmup.img", "Pip waves", greeting ? "Pip the fox waves hello with a friendly smile" : `Pip points to ${vocab[0]}`),
      audioBlock("l1.warmup.aud-1", greeting ? "Hello" : "Listen", greeting ? "Hello!" : `Listen. ${vocab[0]}.`),
      audioBlock("l1.warmup.aud-2", greeting ? "Hi" : "Point", greeting ? "Hi!" : `Point to ${vocab[0]}.`),
    ]),
    phase("vocabulary", "Picture words", vocab.flatMap((word, index) => [
      imageBlock(`l1.vocabulary.img-${index}`, word, greeting ? `${word} greeting gesture with Pip and Bella, no text` : word),
      audioBlock(`l1.vocabulary.aud-${index}`, word, word),
    ])),
    phase("flashcards", "Listen and tap", [
      textBlock("l1.flashcards.goal", "Objective", "Hear then tap."),
      activityBlock("l1.flashcards.act", "Listen and tap", "hotspot", {
        prompt: "Listen. Tap picture.",
        objective: "Recognize the greeting sound from a picture.",
        words: vocab,
        prompts: vocab,
        pairs,
        reinforcement_target: { skill_key: "listening_vocab", target_words: vocab },
      }),
    ]),
    phase("listen_and_point", "Listen and point", [
      textBlock("l1.listen_and_point.goal", "Objective", "Point to sound."),
      ...vocab.map((word, index) => imageBlock(`l1.listen_and_point.img-${index}`, word, greeting ? `${word} as a clear greeting action, no text` : word)),
      activityBlock("l1.listen_and_point.act", "Listen and point", "hotspot", {
        prompt: "Listen. Point.",
        objective: "Connect audio to one picture.",
        words: vocab,
        prompts: vocab,
        pairs,
        reinforcement_target: { skill_key: "audio_picture_match", target_words: vocab },
      }),
    ]),
    phase("modeling", greeting ? "Model: hello" : "Model: say it", [
      imageBlock("l1.modeling.scene", "Model scene", greeting ? "Pip and Bella wave hello and introduce themselves, no speech bubbles, no text" : `Pip shows ${vocab[0]} to Bella, no text`),
      ...modelLines.map((line, index) => audioBlock(`l1.modeling.line-${index}`, `Line ${index + 1}`, line, index % 2 === 0 ? "pip" : "bella")),
      textBlock("l1.modeling.goal", "Objective", greeting ? "Listen. Wave. Repeat." : "Listen. Repeat."),
    ]),
    phase("match_word", "Sound match", [
      textBlock("l1.match_word.goal", "Objective", "Match sound."),
      activityBlock("l1.match_word.act", "Sound match", "match", {
        prompt: "Match sound picture.",
        objective: "Review vocabulary by sound, not reading.",
        pairs: vocab.slice(0, 4).map((word) => ({ left: word, right: word, image_url: "" })),
        reinforcement_target: { skill_key: "vocab_review", target_words: vocab.slice(0, 4) },
      }),
    ]),
    phase("practice", "Drag pictures", [
      textBlock("l1.practice.goal", "Objective", "Drag to match."),
      activityBlock("l1.practice.act", "Drag picture", "drag_drop", {
        prompt: "Drag to picture.",
        objective: "Use one active matching game after listening practice.",
        words: vocab,
        pairs,
        reinforcement_target: { skill_key: "vocab_picture_match", target_words: vocab },
      }),
    ]),
    phase("memory_match", "Memory pictures", [
      textBlock("l1.memory_match.goal", "Objective", "Find a pair."),
      activityBlock("l1.memory_match.act", "Memory pictures", "memory_match", {
        prompt: "Find a pair.",
        objective: "Review vocabulary with picture memory.",
        words: vocab,
        pairs,
        reinforcement_target: { skill_key: "vocab_recall", target_words: vocab },
      }),
    ]),
    phase("phonics", "Sound play", [
      textBlock("l1.phonics.goal", "Objective", "Hear the sound."),
      audioBlock("l1.phonics.sound", "Focus sound", `${phonic.sound || phonic.letter}.`),
      ...(phonic.words ?? []).slice(0, 3).flatMap((word: string, index: number) => [
        imageBlock(`l1.phonics.img-${index}`, word, word),
        audioBlock(`l1.phonics.aud-${index}`, word, word),
      ]),
    ]),
    phase("sentence", greeting ? "Say my name" : "Say it", [
      textBlock("l1.sentence.goal", "Objective", greeting ? "Say your name." : "Say one line."),
      imageBlock("l1.sentence.img", "Speaking turn", greeting ? "Pip points to himself, then waves to Bella, no text" : `Pip points to ${vocab[0]}, no text`),
      audioBlock("l1.sentence.model", "Model", greeting ? "My name is Pip." : modelLines[0]),
      activityBlock("l1.sentence.act", "Tap and say", "hotspot", {
        prompt: "Tap. Say it.",
        objective: greeting ? "Repeat the name chunk with support." : "Repeat one model sentence with support.",
        words: greeting ? ["Pip", "Bella"] : vocab.slice(0, 3),
        prompts: greeting ? ["My name is Pip."] : modelLines.slice(0, 3),
        reinforcement_target: { skill_key: greeting ? "speaking_chunk" : "guided_sentence", target_words: vocab },
      }),
    ]),
    phase("spelling", "Trace and say", [
      textBlock("l1.spelling.goal", "Objective", "Move and say."),
      imageBlock("l1.spelling.img", "Air trace", `Pip air-traces the ${phonic.letter || "a"} sound, no text`),
      audioBlock("l1.spelling.aud", "Say the sound", `${phonic.sound || phonic.letter}. ${((phonic.words ?? [])[0]) || vocab[0]}.`),
    ]),
    phase("cooldown", "Goodbye", [
      imageBlock("l1.cooldown.img", "Goodbye", "Pip and Bella wave goodbye, smiling, no text"),
      audioBlock("l1.cooldown.aud", "Goodbye", greeting ? "Goodbye!" : "Great work! Goodbye!"),
    ]),
  ];
}

// ============ Lesson 1 rule-based specification (mirrors prea1Directive) ============
const LESSON_1_FORBIDDEN_TYPES = new Set([
  "word_gap", "mini_dictation", "missing_letter", "sentence_builder",
  "transform_it", "fill_blank", "typing", "reading_paragraph",
  "role_play", "flashcard_review",
]);
const LESSON_1_ALLOWED_TYPES = new Set([
  "spin_wheel", "picture_choice", "listen_and_match", "echo_repeat",
  "drag_drop", "memory_match", "storybook", "balloon_pop", "hotspot",
  "tap_and_say", "match",
]);
const GREETING_WORDS = /(hello|hi|goodbye|bye|name)/i;
const FORBIDDEN_GREETING_FRAME = /\b(it\s+is|i\s+am)\s+(a|an|my)?\s*(hello|hi|goodbye|name)\b/i;

function validateLesson1Pages(pages: any[]): any[] {
  const seenTypes = new Set<string>();
  const out: any[] = [];
  for (const page of pages) {
    if (!page || !Array.isArray(page.blocks)) { out.push(page); continue; }
    const cleaned: any[] = [];
    for (const block of page.blocks) {
      // Drop forbidden greeting frames from audio/text
      const text = String(block?.text ?? block?.value ?? "");
      if (FORBIDDEN_GREETING_FRAME.test(text)) continue;
      if (block?.kind === "activity") {
        const type = String(block.type || "").toLowerCase();
        if (LESSON_1_FORBIDDEN_TYPES.has(type)) continue;
        if (LESSON_1_ALLOWED_TYPES.size && !LESSON_1_ALLOWED_TYPES.has(type)) continue;
        if (seenTypes.has(type)) continue; // no duplicate activity types
        seenTypes.add(type);
        // Objective must be present + non-empty
        const cfg = { ...(block.config || {}) };
        if (!cfg.objective || String(cfg.objective).trim().length === 0) {
          cfg.objective = `Practice ${type.replace(/_/g, " ")} with the target vocabulary.`;
        }
        cleaned.push({ ...block, type, config: cfg });
      } else {
        cleaned.push(block);
      }
    }
    // De-duplicate consecutive identical audio lines (warm-up dup fix)
    const deduped: any[] = [];
    for (const b of cleaned) {
      const prev = deduped[deduped.length - 1];
      if (
        b?.kind === "audio" && prev?.kind === "audio" &&
        String(b.text).trim().toLowerCase() === String(prev.text).trim().toLowerCase() &&
        String(b.voice || "") === String(prev.voice || "")
      ) continue;
      deduped.push(b);
    }
    if (deduped.length) out.push({ ...page, blocks: deduped });
  }
  return out;
}

function normalizePlaygroundUnitPayload(payload: unknown, body: BrainInputLike): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const root = payload as Record<string, any>;
  if (!Array.isArray(root.lessons)) return payload;
  if (!isPreA1Value(body.cefr)) return payload;
  const unitTopic = String(root.unit_topic || body.topic || "");
  return {
    ...root,
    lessons: root.lessons.map((lesson: LessonLike) => {
      if (!lesson || lesson.lesson_number !== 1) return lesson;
      const vocabRaw = uniqueStrings(lesson.vocab ?? [], []);
      const greeting = isGreetingLesson(lesson, unitTopic) || vocabRaw.some((w) => GREETING_WORDS.test(w));
      const vocab = uniqueStrings(
        lesson.vocab ?? [],
        greeting ? ["hello", "hi", "goodbye", "my name is"] : ["cat", "dog", "fish"],
      ).slice(0, greeting ? 4 : 5);
      const grammar_target = greeting ? "My name is ___." : String(lesson.grammar_target || "It is a ___.");
      const sentence_models = greeting
        ? greetingModels(vocab).slice(0, 5)
        : vocab.slice(0, 3).map((word) => sentenceFor(grammar_target, word));
      const pages = validateLesson1Pages(l1Pages({ ...lesson, vocab, grammar_target, sentence_models }, unitTopic));
      return {
        ...lesson,
        vocab,
        grammar_target,
        sentence_models,
        key_phrases: sentence_models,
        objectives: greeting ? ["I can say hello.", "I can say my name."] : lesson.objectives,
        success_check: greeting ? "Wave and say hello." : lesson.success_check,
        pages,
      };
    }),
  };
}

function buildPlaygroundFallbackUnit(body: BrainInputLike, _message: string) {
  const topic = (body.topic || "Greetings").trim();
  const picked = TOPIC_LEXICON.find((x) => x.test.test(topic)) ?? TOPIC_LEXICON[0];
  const review = Array.isArray(body.review_targets) ? body.review_targets.filter((v) => typeof v === "string" && v.trim()) : [];
  const base = Array.from(new Set([...picked.vocab, ...review])).slice(0, 5);
  const l1 = base.slice(0, Math.min(/pre[-_ ]?a1/i.test(body.cefr || "") ? 4 : 5, base.length));
  const l2 = l1.slice(0, Math.min(3, l1.length));
  const l3 = l1.slice(Math.max(0, l1.length - 3));
  const greeting = isGreetingTopic(topic, picked.frame);
  const models = greeting ? greetingModels(l1).slice(0, 5) : l1.slice(0, 3).map((word) => sentenceFor(picked.frame, word));
  const l2Models = greeting ? greetingModels(l2).slice(0, 4) : l2.map((word) => sentenceFor(picked.frame, word));
  const l3Models = greeting ? greetingModels(l3).slice(1, 5) : l3.map((word) => sentenceFor(picked.frame, word));
  const unitTheme = picked.theme;
  const allTargets = Array.from(new Set([...l1, ...l2, ...l3]));

  return {
    unit_topic: topic,
    unit_theme: unitTheme,
    unit_topics: { l1: topic, l2: `${topic} practice`, l3: `${topic} speaking` },
    lessons: [
      {
        lesson_number: 1,
        unit_theme: unitTheme,
        communication_goal: picked.goal,
        grammar_target: picked.frame,
        story_goal: picked.story,
        focus_label: "Meet the words",
        sentence_models: models,
        objectives: greeting ? ["I can say hello.", "I can say my name."] : ["I can say the target words.", "I can say one short sentence."],
        key_phrases: models,
        success_check: greeting ? "Wave and say hello." : "Say one target sentence.",
        greet_chunks: /pre[-_ ]?a1/i.test(body.cefr || "") ? ["Hello!", "How are you?", "I am fine, thank you!"] : undefined,
        target_grammar_tier: "Baseline",
        vocab: l1,
        phonic: phonicFor(0),
      },
      {
        lesson_number: 2,
        unit_theme: unitTheme,
        communication_goal: `Use ${topic} words with a friend`,
        grammar_target: picked.frame,
        story_goal: "Practice with a friend",
        focus_label: "Practice with friends",
        sentence_models: l2Models,
        objectives: greeting ? ["I can remember hello.", "I can answer with help."] : ["I can remember the words.", "I can answer with help."],
        key_phrases: l2Models,
        success_check: "Choose and say one phrase.",
        greet_chunks: /pre[-_ ]?a1/i.test(body.cefr || "") ? ["Hello!", "How are you?", "I am fine, thank you!"] : undefined,
        target_grammar_tier: "Single Descriptor",
        vocab: l2,
        phonic: phonicFor(1),
      },
      {
        lesson_number: 3,
        unit_theme: unitTheme,
        communication_goal: `Say ${topic} language in a short turn`,
        grammar_target: picked.frame,
        story_goal: "Use the words to solve a small problem",
        focus_label: "Say it together",
        sentence_models: l3Models,
        objectives: greeting ? ["I can use greetings again.", "I can speak in a short turn."] : ["I can use old words again.", "I can speak in a short turn."],
        key_phrases: l3Models,
        success_check: "Say two phrases with a partner.",
        greet_chunks: /pre[-_ ]?a1/i.test(body.cefr || "") ? ["Hello!", "How are you?", "I am fine, thank you!"] : undefined,
        target_grammar_tier: "Complex Stacking",
        vocab: l3,
        phonic: phonicFor(2),
      },
      {
        lesson_number: 4,
        unit_theme: unitTheme,
        communication_goal: `Follow a short ${topic} story`,
        grammar_target: picked.frame,
        story_goal: picked.story,
        focus_label: "Story with friends",
        sentence_models: models,
        objectives: ["I can follow a short story.", "I can say one story phrase."],
        key_phrases: models,
        success_check: "Tell one thing from the story.",
        story: {
          title: `${topic} with Pip and Bella`,
          scenes: [
            { id: "s1", text: `Pip sees Bella. ${models[0] ?? "Hello!"}` },
            { id: "s2", text: `Bella smiles. ${l2Models[1] ?? l2Models[0] ?? models[0]}` },
            { id: "s3", text: `Pip and Bella are happy. ${l3Models[0] ?? models[0]}` },
          ],
          qa: { prea1: ["Who says hello?"], a1: ["What does Bella say?"], a2: ["Why are they happy?"] },
        },
      },
      { lesson_number: 5, review_targets: allTargets, quiz_seed: { sources: [1, 2, 3, 4] } },
      { lesson_number: 6, quiz_seed: { formats: ["picture", "text", "audio", "spell"], pass_score: 80, stretch_lesson_number: 7 } },
      { lesson_number: 7, review_targets: allTargets, remediation_source: "quiz_below_80" },
    ],
  };
}

function validatePlaygroundUnitPayload(payload: unknown): { ok: true } | { ok: false; message: string } {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, message: "Root must be a JSON object." };
  }

  const root = payload as Record<string, unknown>;
  if ("lesson" in root && !("unit_topic" in root) && !("lessons" in root)) {
    return { ok: false, message: "Root is wrapped in `lesson` or contains a single lesson instead of a unit." };
  }
  if (typeof root.unit_topic !== "string" || !root.unit_topic.trim()) {
    return { ok: false, message: "Missing root string field `unit_topic`." };
  }
  if (typeof root.unit_theme !== "string" || !root.unit_theme.trim()) {
    return { ok: false, message: "Missing root string field `unit_theme`." };
  }
  if (!Array.isArray(root.lessons)) {
    return { ok: false, message: "Missing root array field `lessons`." };
  }
  if (root.lessons.length !== 7) {
    return { ok: false, message: `Expected exactly 7 lessons; got ${root.lessons.length}.` };
  }

  const labels: string[] = [];
  const phonics: string[] = [];
  const phonicsOrder = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    "sh", "ch", "th", "wh", "ph", "ck", "ng",
    "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr", "gr", "pr", "tr", "sc", "sk", "sm", "sn", "sp", "st", "sw",
  ];
  for (let i = 0; i < 7; i += 1) {
    const lesson = root.lessons[i] as Record<string, unknown> | undefined;
    if (!lesson || typeof lesson !== "object" || Array.isArray(lesson)) {
      return { ok: false, message: `Lesson ${i + 1} must be an object.` };
    }
    if (lesson.lesson_number !== i + 1) {
      return { ok: false, message: `Lesson ${i + 1} must have lesson_number ${i + 1}.` };
    }
    // Curriculum-Brain required fields for L1–L4.
    if (i < 4) {
      const required = ["unit_theme", "communication_goal", "grammar_target", "story_goal", "focus_label"] as const;
      for (const key of required) {
        const v = lesson[key];
        if (typeof v !== "string" || !v.trim()) {
          return { ok: false, message: `Lesson ${i + 1} missing required string field "${key}".` };
        }
      }
      const fl = (lesson.focus_label as string).trim();
      const wordCount = fl.split(/\s+/).length;
      if (wordCount < 2 || wordCount > 8) {
        return { ok: false, message: `Lesson ${i + 1} "focus_label" must be 2–8 words; got "${fl}".` };
      }
      labels.push(fl.toLowerCase());
      const models = lesson.sentence_models;
      if (!Array.isArray(models) || models.length < 3 || !models.every((s) => typeof s === "string" && s.trim().length > 0)) {
        return { ok: false, message: `Lesson ${i + 1} must include "sentence_models" as an array of ≥3 non-empty strings.` };
      }
      const objectives = lesson.objectives;
      if (
        !Array.isArray(objectives) ||
        objectives.length < 2 ||
        objectives.length > 3 ||
        !objectives.every((s) => typeof s === "string" && s.trim().length > 0)
      ) {
        return { ok: false, message: `Lesson ${i + 1} must include "objectives" as an array of 2–3 non-empty can-do statements.` };
      }
      const keyPhrases = lesson.key_phrases;
      if (
        !Array.isArray(keyPhrases) ||
        keyPhrases.length < 3 ||
        keyPhrases.length > 6 ||
        !keyPhrases.every((s) => typeof s === "string" && s.trim().length > 0)
      ) {
        return { ok: false, message: `Lesson ${i + 1} must include "key_phrases" as an array of 3–6 non-empty target chunks.` };
      }
      const successCheck = lesson.success_check;
      if (typeof successCheck !== "string" || !successCheck.trim()) {
        return { ok: false, message: `Lesson ${i + 1} must include non-empty string "success_check".` };
      }
    }

    // Locked Playground content requirements: L1-L3 carry the unit's concrete
    // input/recycling targets and one phonic anchor each. Enforce these here so
    // the repair loop can fix them before the frontend validator receives the payload.
    if (i < 3) {
      const vocab = lesson.vocab;
      const min = i === 0 ? 3 : 2;
      const max = i === 0 ? 6 : 4;
      if (
        !Array.isArray(vocab) ||
        vocab.length < min ||
        vocab.length > max ||
        !vocab.every((s) => typeof s === "string" && s.trim().length > 0)
      ) {
        return { ok: false, message: `Lesson ${i + 1} must include "vocab" as ${min}–${max} non-empty strings.` };
      }

      const phonic = lesson.phonic as Record<string, unknown> | undefined;
      if (!phonic || typeof phonic !== "object" || Array.isArray(phonic)) {
        return { ok: false, message: `Lesson ${i + 1} must include a "phonic" object.` };
      }
      const letter = typeof phonic.letter === "string" ? phonic.letter.trim().toLowerCase() : "";
      const sound = typeof phonic.sound === "string" ? phonic.sound.trim() : "";
      const words = phonic.words;
      if (!letter || !sound || !Array.isArray(words) || words.length < 3) {
        return { ok: false, message: `Lesson ${i + 1} phonic must include letter, sound, and at least 3 words.` };
      }
      const badWords = words.filter((w) => typeof w !== "string" || !w.trim().toLowerCase().startsWith(letter));
      if (badWords.length) {
        return { ok: false, message: `Lesson ${i + 1} phonic words must all start with "${letter}".` };
      }
      phonics.push(letter);
    }

    if (i === 3) {
      const story = lesson.story as Record<string, unknown> | undefined;
      const scenes = story?.scenes;
      if (!story || typeof story !== "object" || !Array.isArray(scenes) || scenes.length < 3) {
        return { ok: false, message: `Lesson 4 must include a story with at least 3 scenes.` };
      }
    }

    if (i === 5) {
      const quizSeed = lesson.quiz_seed as Record<string, unknown> | undefined;
      const formats = quizSeed?.formats;
      if (
        formats &&
        (!Array.isArray(formats) || !["picture", "text", "audio", "spell"].every((f) => formats.includes(f)))
      ) {
        return { ok: false, message: `Lesson 6 quiz_seed.formats must include picture, text, audio, and spell.` };
      }
    }

  }

  if (new Set(labels).size !== labels.length) {
    return { ok: false, message: `Lessons 1–4 must have DISTINCT "focus_label" values; duplicates found: ${labels.join(" | ")}.` };
  }
  if (new Set(phonics).size !== 3) {
    return { ok: false, message: `Lessons 1–3 must have three distinct phonic targets.` };
  }
  const phonicIndices = phonics.map((p) => phonicsOrder.indexOf(p));
  if (phonicIndices.some((n) => n < 0)) {
    return { ok: false, message: `Lessons 1–3 include a phonic target outside the A–Z to digraphs to blends progression: ${phonics.join(",")}.` };
  }
  if (!(phonicIndices[1] === phonicIndices[0] + 1 && phonicIndices[2] === phonicIndices[1] + 1)) {
    return { ok: false, message: `Lessons 1–3 phonics must be one consecutive progression window in order; got ${phonics.join(":")}.` };
  }

  return { ok: true };
}

function buildPlaygroundRepairPrompt(message: string): string {
  return [
    `Your previous response was rejected: ${message}`,
    `Return ONLY the complete Playground unit content JSON root object.`,
    `Required root shape: { "unit_topic": string, "unit_theme": string, "unit_topics": { "l1": string, "l2": string, "l3": string }, "lessons": [7 lesson objects] }.`,
    `Lessons 1–4 MUST each contain: "unit_theme" (string), "communication_goal" (string), "grammar_target" (string), "story_goal" (string), "focus_label" (2–6 word DISTINCT title reflecting the lesson's communication_goal), "sentence_models" (array of ≥3 non-empty strings aligned with grammar_target + lesson vocab), "objectives" (2–3 can-do statements), "key_phrases" (3–6 target chunks from sentence_models), and "success_check" (single-line exit-ticket string).`,
    `Lessons 1–3 MUST include valid vocab arrays (L1=3–6, L2=2–4 recycled, L3=2–4 recycled/extended) and a phonic object with letter, sound, and 3 examples that start with that letter. The three phonics must be one consecutive ordered window from A–Z, then digraphs, then blends (e.g. a,b,c or d,e,f or sh,ch,th).`,
    `Lesson 4 MUST include a real storybook object with at least 3 scenes and reuse L1–L3 targets. Lesson 6 quiz_seed.formats, when present, must include picture, text, audio, and spell.`,
    `The four focus_label values across L1–L4 MUST be DISTINCT and topic-specific (e.g. for "Greetings": "Hello, my name is", "Nice to meet you", "Say hello to friends", "Storybook: First day").`,
    `Keep vocabulary semantically coherent within a lesson (do NOT mix category nouns like boy/girl/man/woman with relationship nouns like friend).`,
    `Do not wrap it in "lesson". Do not create slides. Do not include image_url, audio_url, activities, blocks, or layout fields.`,
    `Lessons 1-7 must be in order and use lesson_number 1,2,3,4,5,6,7.`,
  ].join("\n");
}


serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  return handleBrainRequest("playground", PLAYGROUND_BRAIN_PROMPT, req, {
    responseFormat: PLAYGROUND_RESPONSE_FORMAT,
    validateResult: validatePlaygroundUnitPayload,
    buildResultRepairPrompt: buildPlaygroundRepairPrompt,
    buildFallbackResult: buildPlaygroundFallbackUnit,
    transformResult: normalizePlaygroundUnitPayload,
  });
});
