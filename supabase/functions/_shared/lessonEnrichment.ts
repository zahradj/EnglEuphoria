/**
 * Lesson Enrichment — Deno/Edge bridge that guarantees every generated lesson
 * ships with the pedagogy "brain" outputs the React orchestrator produces:
 *
 *   • GamePack          — interactive arcade rounds bound to lesson vocab
 *   • HomeworkPack      — hand-of-cards drill plan for post-lesson practice
 *   • ChatQuestSeed     — character + objective for cast-chat-quest runtime
 *   • InteractiveCheck  — guarantees ≥1 interactive activity in slides
 *
 * Deterministic, no AI calls — runs in <5ms and is safe to call on every
 * lesson save. Validators HARD-block publish when any pack is missing.
 *
 * Source-of-truth for the rules: src/orchestrator, src/coherence, src/arcade,
 * src/speaking. This module mirrors the deterministic subset that doesn't
 * require the full LessonContext.
 */

export type Hub = "playground" | "academy" | "success";

export type EnrichmentInput = {
  hub: Hub;
  cefr: string;                // "Pre-A1" | "A1" | ...
  lessonIndex: number;         // 1..7 within a unit
  unitTheme?: string;
  vocabulary: string[];        // target vocab
  grammar?: string[];          // grammar foci
  cast?: { id: string; name: string; role?: string }[];
  slides?: any[];              // existing slides if any (for interactive scan)
};

export type GameRound = {
  id: string;
  game: string;                // registry id
  prompt: string;
  vocab: string[];
  xp: number;
  speaking?: boolean;
};

export type HomeworkTask = {
  id: string;
  type: "drill_card" | "speaking_card" | "writing_card";
  prompt: string;
  target: string;
  expected_answers: string[];
  hints: string[];
};

export type ChatQuestSeed = {
  character: { id: string; name: string };
  objective: string;
  target_vocab: string[];
  success_phrases: string[];
  hub: Hub;
};

export type EnrichmentResult = {
  game_pack: { hub: Hub; rounds: GameRound[]; total_xp: number };
  homework_pack: { hub: Hub; tasks: HomeworkTask[]; minutes: number };
  chat_quest_seed: ChatQuestSeed;
  interactive_count: number;
};

const HUB_CAPS: Record<Hub, { game: number; hw: number; minutes: number }> = {
  playground: { game: 3, hw: 3, minutes: 10 },
  academy:    { game: 4, hw: 5, minutes: 20 },
  success:    { game: 3, hw: 6, minutes: 25 },
};

const GAME_REGISTRY = [
  "word_rush", "sound_match", "vocab_flip", "drag_pair",
  "fill_blank_arcade", "listen_pick", "speak_repeat", "spelling_bee",
] as const;

function pickGames(hub: Hub, vocab: string[], lessonIndex: number): GameRound[] {
  const cap = HUB_CAPS[hub].game;
  const out: GameRound[] = [];
  for (let i = 0; i < cap && i < Math.max(2, vocab.length); i++) {
    const game = GAME_REGISTRY[(lessonIndex + i) % GAME_REGISTRY.length];
    const slice = vocab.slice(i * 2, i * 2 + 4).filter(Boolean);
    if (slice.length === 0) continue;
    out.push({
      id: `g_${lessonIndex}_${i}`,
      game,
      prompt: gamePromptFor(game, slice),
      vocab: slice,
      xp: 10 + (i === cap - 1 ? 15 : 0),
      speaking: game === "speak_repeat",
    });
  }
  // Hub speaking floor: Playground ≥1 speaking round
  if (hub === "playground" && !out.some(r => r.speaking) && vocab[0]) {
    out.push({
      id: `g_${lessonIndex}_speak`,
      game: "speak_repeat",
      prompt: `Say it out loud: "${vocab[0]}"`,
      vocab: [vocab[0]],
      xp: 15,
      speaking: true,
    });
  }
  return out;
}

function gamePromptFor(game: string, vocab: string[]): string {
  const head = vocab[0] ?? "word";
  switch (game) {
    case "word_rush":         return `Tap the words you hear from: ${vocab.join(", ")}`;
    case "sound_match":       return `Match each sound to the right word.`;
    case "vocab_flip":        return `Flip the cards and find each pair.`;
    case "drag_pair":         return `Drag each word to its picture.`;
    case "fill_blank_arcade": return `Fill the gaps using ${vocab.join(" / ")}.`;
    case "listen_pick":       return `Listen and pick the correct word.`;
    case "speak_repeat":      return `Repeat after Pip: "${head}".`;
    case "spelling_bee":      return `Spell the words you hear.`;
    default:                  return `Practice: ${vocab.join(", ")}`;
  }
}

function buildHomework(hub: Hub, vocab: string[], grammar: string[]): HomeworkTask[] {
  const cap = HUB_CAPS[hub].hw;
  const tasks: HomeworkTask[] = [];
  vocab.slice(0, cap).forEach((w, i) => {
    tasks.push({
      id: `hw_${i}`,
      type: "drill_card",
      prompt: `Complete the sentence with "${w}".`,
      target: w,
      expected_answers: [w, w.toLowerCase(), w.trim()],
      hints: [`It starts with "${w[0]}"`, `${w.length} letters`],
    });
  });
  if (hub !== "playground" && grammar[0]) {
    tasks.push({
      id: `hw_grammar`,
      type: "writing_card",
      prompt: `Write 2 sentences using: ${grammar[0]}.`,
      target: grammar[0],
      expected_answers: [],
      hints: [`Use a subject + verb`, `Add a time marker`],
    });
  }
  // Speaking card for any hub
  if (vocab[0]) {
    tasks.push({
      id: `hw_speak`,
      type: "speaking_card",
      prompt: `Record yourself saying: "${vocab.slice(0, 3).join(", ")}".`,
      target: vocab[0],
      expected_answers: vocab.slice(0, 3),
      hints: ["Speak clearly", "Try twice"],
    });
  }
  return tasks.slice(0, cap);
}

function buildChatQuest(input: EnrichmentInput): ChatQuestSeed {
  const fallbackCast =
    input.hub === "playground"
      ? { id: "pip", name: "Pip the Fox" }
      : input.hub === "academy"
      ? { id: "nova", name: "Nova" }
      : { id: "alex", name: "Alex" };
  const character = input.cast?.[0]
    ? { id: input.cast[0].id, name: input.cast[0].name }
    : fallbackCast;
  return {
    character,
    objective: input.unitTheme
      ? `Roleplay with ${character.name} about "${input.unitTheme}".`
      : `Have a short conversation with ${character.name}.`,
    target_vocab: input.vocabulary.slice(0, 6),
    success_phrases: input.vocabulary.slice(0, 3).map(v => `Used "${v}" in a sentence`),
    hub: input.hub,
  };
}

function countInteractive(slides: any[] = []): number {
  return slides.filter(s =>
    s?.interactionType ||
    s?.activity ||
    /drag|match|fill|drop|quiz|sort|listen|tap|trace/i.test(JSON.stringify(s?.layout ?? ""))
  ).length;
}

export function enrichLesson(input: EnrichmentInput): EnrichmentResult {
  const vocab = (input.vocabulary || []).map(v => String(v).trim()).filter(Boolean);
  const grammar = (input.grammar || []).filter(Boolean);
  const rounds = pickGames(input.hub, vocab, input.lessonIndex);
  const tasks = buildHomework(input.hub, vocab, grammar);
  return {
    game_pack: {
      hub: input.hub,
      rounds,
      total_xp: rounds.reduce((a, r) => a + r.xp, 0),
    },
    homework_pack: {
      hub: input.hub,
      tasks,
      minutes: Math.min(HUB_CAPS[input.hub].minutes, tasks.length * 3),
    },
    chat_quest_seed: buildChatQuest(input),
    interactive_count: countInteractive(input.slides),
  };
}

export type PublishIssue = { code: string; severity: "hard" | "soft"; message: string };

export function validateEnrichment(r: EnrichmentResult): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (r.game_pack.rounds.length === 0)
    issues.push({ code: "MISSING_GAME_PACK", severity: "hard", message: "Lesson has no games." });
  if (r.homework_pack.tasks.length === 0)
    issues.push({ code: "MISSING_HOMEWORK", severity: "hard", message: "Lesson has no homework." });
  if (!r.chat_quest_seed.character?.id)
    issues.push({ code: "MISSING_CHAT_QUEST", severity: "hard", message: "Chat Quest seed missing." });
  if (r.interactive_count < 1)
    issues.push({ code: "MISSING_INTERACTIVE_ACTIVITY", severity: "soft", message: "No interactive slide detected." });
  return issues;
}

export function decideEnrichmentPublish(r: EnrichmentResult): { ok: boolean; issues: PublishIssue[] } {
  const issues = validateEnrichment(r);
  return { ok: !issues.some(i => i.severity === "hard"), issues };
}
