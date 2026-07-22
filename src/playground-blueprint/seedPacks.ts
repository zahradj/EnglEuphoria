/**
 * seedPacks — deterministic hydrator that fills empty Game Pack + Homework Pack
 * fields on generated lessons so the AI-generate flow never leaves those two
 * inspector tabs blank. Bound to real lesson vocab so rounds/tasks are
 * lesson-specific (not generic filler).
 *
 * Called from CreatorShell.applyGeneratedUnit right after the unit is
 * built + validated.
 */
import type {
  PlaygroundAuthoredGameRound,
  PlaygroundHomework,
  PlaygroundHomeworkTask,
  PlaygroundLessonContent,
} from "./types";
import { isPreA1 } from "@/curriculum/preA1Profile";

const PG_GAME_TYPES = ["WordRush", "SoundMatch", "MemoryGrid", "BossRound"] as const;
// Pre-A1 non-readers can't handle WordRush (text-based). Swap to audio-first.
const PG_GAME_TYPES_PREA1 = ["SoundMatch", "MemoryGrid", "SoundMatch", "BossRound"] as const;


function seedGames(lesson: PlaygroundLessonContent): PlaygroundAuthoredGameRound[] {
  const n = lesson.lesson_number;
  const preA1 = isPreA1((lesson as any).cefr);
  const types = preA1 ? PG_GAME_TYPES_PREA1 : PG_GAME_TYPES;
  return types.map((type, i) => {
    const bindWord = (lesson.vocab ?? [])[i];
    return {
      id: `${n}.game.${type}.seed${i}`,
      type,
      difficulty_tier: type === "BossRound" ? 3 : 2,
      is_boss: type === "BossRound",
      reinforcement_key: bindWord ? `vocab:${bindWord}` : undefined,
    };
  });
}


function seedHomework(lesson: PlaygroundLessonContent): PlaygroundHomework {
  const n = lesson.lesson_number;
  const vocab = (lesson.vocab ?? []).filter(Boolean);
  const v4 = vocab.slice(0, 4);
  const first = v4[0] ?? "hello";
  const character = lesson.starring_character?.name ?? "Pip";
  const preA1 = isPreA1((lesson as any).cefr);
  const sentence = (lesson as any).sentence_frame
    ? String((lesson as any).sentence_frame).replace("___", first)
    : `It is a ${first}.`;


  const tasks: PlaygroundHomeworkTask[] = [];

  if (v4.length) {
    tasks.push({
      id: `${n}.hw.flashcard.seed`,
      type: "flashcard_review",
      label: "Flashcard review",
      prompt: `Flip and say each word out loud with ${character}.`,
      payload: {
        prompt: `Flip and say each word out loud with ${character}.`,
        cards: v4.map((w) => ({ front: w, back: w })),
      },
      minutes: 3,
      reinforcement_key: `vocab:${first}`,
    });
    tasks.push({
      id: `${n}.hw.memory.seed`,
      type: "memory",
      label: "Memory match",
      prompt: "Find the matching pairs.",
      payload: {
        prompt: "Find the matching pairs.",
        pairs: v4.map((w, i) => ({ id: `p${i}`, label: w, emoji: "⭐" })),
      },
      minutes: 3,
      reinforcement_key: `vocab:${first}`,
    });
  }

  tasks.push({
    id: `${n}.hw.echo.seed`,
    type: "echo",
    label: "Echo speaking",
    prompt: `Listen and repeat after ${character}.`,
    payload: {
      prompt: `Listen and repeat after ${character}.`,
      word: sentence,
      scaffold: { guided: `Say: "${sentence}"`, ladder_rung: "repetition" },
    },
    minutes: 2,
    reinforcement_key: `speaking:${first}`,
  });

  if (v4.length >= 2) {
    tasks.push(
      preA1
        ? {
            // Non-readers: audio-first "listen and tap the picture" task.
            id: `${n}.hw.listen_match.seed`,
            type: "listen_match",
            label: "Listen and match",
            prompt: `Tap the picture ${character} says.`,
            payload: {
              prompt: `Tap the picture ${character} says.`,
              items: v4.slice(0, 3).map((w) => ({ audio_word: w, image_prompt: w })),
            },
            minutes: 3,
            reinforcement_key: `vocab:${first}`,
          }
        : {
            id: `${n}.hw.quiz.seed`,
            type: "quick_quiz",
            label: "Quick quiz",
            prompt: "Pick the right word.",
            payload: {
              prompt: "Pick the right word.",
              questions: v4.slice(0, 3).map((w) => ({
                q: `Which one is "${w}"?`,
                options: v4,
                answer: w,
              })),
            },
            minutes: 3,
            reinforcement_key: `vocab:${first}`,
          },
    );
  }


  return {
    lesson_number: n,
    title: `Home mission · Lesson ${n}`,
    tasks,
    total_minutes: tasks.reduce((s, t) => s + (t.minutes ?? 0), 0),
  };
}

/**
 * Fills `authored_games` and `homework` on every lesson that lacks them.
 * Non-destructive: existing teacher-authored packs are preserved.
 */
export function seedPacksForLesson(lesson: PlaygroundLessonContent): PlaygroundLessonContent {
  const patch: Partial<PlaygroundLessonContent> = {};
  if (!lesson.authored_games || lesson.authored_games.length === 0) {
    patch.authored_games = seedGames(lesson);
  }
  if (!lesson.homework || !lesson.homework.tasks?.length) {
    patch.homework = seedHomework(lesson);
  }
  return Object.keys(patch).length ? { ...lesson, ...patch } : lesson;
}
