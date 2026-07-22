/**
 * Bridges the Deno `lessonEnrichment` shape stored on
 * `curriculum_lessons.gamified_elements` into the frontend
 * `GamePack` / `HomeworkPack` / `ChatQuestSeed` types used by
 * GameRunner, HomeworkRunner, and CastChatPanel.
 */
import type {
  GamePack,
  HomeworkPack,
  ReinforcementTarget,
  GameRound,
  HomeworkTask,
} from "@/coherence/types";
import type { Hub } from "@/governance/types";

type RawEnrichment = {
  game_pack?: {
    hub?: Hub;
    rounds?: Array<{ id?: string; game?: string; prompt?: string; vocab?: string[]; xp?: number; speaking?: boolean }>;
  };
  homework_pack?: {
    hub?: Hub;
    tasks?: Array<{ id?: string; type?: string; prompt?: string; target?: string; expected_answers?: string[]; hints?: string[] }>;
    minutes?: number;
  };
  chat_quest_seed?: {
    character?: { id?: string; name?: string };
    objective?: string;
    target_vocab?: string[];
    success_phrases?: string[];
    hub?: Hub;
  };
};

const GAME_TYPE_MAP: Record<string, GameRound["type"]> = {
  word_rush: "WordRush",
  sound_match: "SoundMatch",
  vocab_flip: "MemoryGrid",
  drag_pair: "MeaningMaze",
  fill_blank_arcade: "MeaningMaze",
  listen_pick: "SoundMatch",
  speak_repeat: "WordRush",
  spelling_bee: "WordRush",
};

export function adaptEnrichment(
  raw: unknown,
  ctx: {
    hub: Hub;
    lessonId: string;
    studentId?: string;
    cast?: { id: string; name: string; role?: string }[];
  },
): { gamePack: GamePack; gameTargets: ReinforcementTarget[]; homeworkPack: HomeworkPack } | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as RawEnrichment;
  if (!r.game_pack?.rounds?.length && !r.homework_pack?.tasks?.length) return null;

  const studentId = ctx.studentId ?? "preview";
  const targets: ReinforcementTarget[] = [];
  const seen = new Set<string>();

  const targetFor = (skill: string, label: string): ReinforcementTarget => {
    const key = skill.toLowerCase();
    const existing = targets.find((t) => t.skill_key === key);
    if (existing) return existing;
    const t: ReinforcementTarget = {
      id: `t-${ctx.lessonId}-${targets.length}`,
      source: "lesson_target",
      skill_kind: "vocab",
      skill_key: key,
      label,
      priority: 0.7,
      cefr_ceiling: "A1",
    };
    targets.push(t);
    seen.add(key);
    return t;
  };

  const rounds: GameRound[] = (r.game_pack?.rounds ?? []).map((rr, i) => {
    const label = rr.vocab?.[0] ?? rr.prompt ?? `item-${i}`;
    const t = targetFor(label, label);
    return {
      id: rr.id ?? `r-${ctx.lessonId}-${i}`,
      type: GAME_TYPE_MAP[rr.game ?? ""] ?? "WordRush",
      reinforcement_target_id: t.id,
      scenario_key: `lesson_${ctx.lessonId}`,
      difficulty_tier: 1,
      educational_value: 0.7,
      is_boss: i === (r.game_pack?.rounds?.length ?? 1) - 1,
    };
  });

  const tasks: HomeworkTask[] = (r.homework_pack?.tasks ?? []).map((tt, i) => {
    const label = tt.target ?? tt.prompt ?? `task-${i}`;
    const t = targetFor(label, label);
    const modality: HomeworkTask["modality"] =
      tt.type === "speaking_card" ? "speaking" : tt.type === "writing_card" ? "writing" : "mixed";
    return {
      id: tt.id ?? `hw-${ctx.lessonId}-${i}`,
      type: "vocab_recall" as HomeworkTask["type"],
      template_key: tt.type ?? "drill_card",
      reinforcement_target_id: t.id,
      estimated_minutes: 2,
      prompt: tt.prompt ?? "",
      bound_to_lesson: true,
      educational_value: 0.7,
      modality,
    };
  });

  const gamePack: GamePack = {
    lessonId: ctx.lessonId,
    studentId,
    hub: ctx.hub,
    rounds,
    educational_value_avg: 0.7,
  };
  const homeworkPack: HomeworkPack = {
    lessonId: ctx.lessonId,
    studentId,
    hub: ctx.hub,
    tasks,
    total_minutes: r.homework_pack?.minutes ?? tasks.length * 2,
    coherence_score: 0.8,
    drill_plan: tasks.length
      ? {
          direction_start: "receptive",
          cards: tasks.slice(0, 6).map((t) => ({
            skill_key: targets.find((x) => x.id === t.reinforcement_target_id)?.skill_key ?? "",
            label: targets.find((x) => x.id === t.reinforcement_target_id)?.label ?? "",
          })),
        }
      : undefined,
  };
  // Character binding (Phase 4) — non-breaking side-channel for runners.
  if (ctx.cast?.length) {
    (gamePack as any).cast = ctx.cast;
    (homeworkPack as any).cast = ctx.cast;
  }
  return { gamePack, gameTargets: targets, homeworkPack };
}
