// Deterministic homework selection bound to lesson content.
import type { Hub } from '@/governance/types';
import type { HomeworkPack, HomeworkTask, HomeworkTaskType, ReinforcementTarget } from './types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';
import { scoreHomeworkTask } from './educationalValueScorer';
import { isRecentlyUsed, type RecentEntry } from './dedupLedger';

const MODALITY_BY_TYPE: Record<HomeworkTaskType, HomeworkTask['modality']> = {
  vocab_recall: 'mixed',
  sentence_build: 'writing',
  mini_recording: 'speaking',
  listening_recap: 'listening',
  micro_reading: 'reading',
  micro_writing: 'writing',
  parent_script: 'speaking',
  peer_message: 'writing',
  email_draft: 'writing',
};

const MINUTES_BY_TYPE: Record<HomeworkTaskType, number> = {
  vocab_recall: 3,
  sentence_build: 4,
  mini_recording: 4,
  listening_recap: 4,
  micro_reading: 5,
  micro_writing: 6,
  parent_script: 3,
  peer_message: 5,
  email_draft: 8,
};

export interface BuildHomeworkArgs {
  hub: Hub;
  studentId: string;
  lessonId: string;
  targets: ReinforcementTarget[];
  history?: RecentEntry[];
  /** Playground only — narrows recipe by L1–L7 lesson kind. */
  lessonKind?: import('@/planning/playgroundUnitTemplates').PlaygroundLessonKind;
}

export function buildHomeworkPack(args: BuildHomeworkArgs): HomeworkPack {
  const profile = COHERENCE_HUB_PROFILES[args.hub];
  // Playground L1–L7 contract overrides hub defaults when present.
  let allowedTypes = profile.homework_modes;
  let maxTasks = profile.homework_max_tasks;
  let minTasks = profile.homework_min_tasks;
  let minutesCap = profile.homework_minutes_cap;
  if (args.hub === 'playground' && args.lessonKind) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getPlaygroundLessonContract } =
      require('@/planning/playgroundLessonContract') as typeof import('@/planning/playgroundLessonContract');
    const contract = getPlaygroundLessonContract(args.lessonKind);
    if (contract) {
      allowedTypes = contract.homework_recipe.allowed_kinds.length
        ? contract.homework_recipe.allowed_kinds
        : allowedTypes;
      maxTasks = contract.homework_recipe.tasks_max;
      minTasks = contract.homework_recipe.tasks_min;
      minutesCap = contract.homework_recipe.minutes_cap;
    }
  }
  const tasks: HomeworkTask[] = [];
  let minutes = 0;

  // For each top target, pick the highest-value modality available for this hub.
  for (const target of args.targets) {
    if (tasks.length >= maxTasks) break;
    if (minutes >= minutesCap) break;

    const candidateTypes = pickTypesForTarget(target, allowedTypes);
    let chosen: { type: HomeworkTaskType; value: number; templateKey: string } | null = null;

    for (const t of candidateTypes) {
      const templateKey = `${t}:${target.skill_kind}:${target.skill_key}`;
      if (isRecentlyUsed(templateKey, { history: args.history, withinDays: 3 })) continue;
      const partial = {
        id: `hw_${tasks.length + 1}`,
        type: t,
        template_key: templateKey,
        reinforcement_target_id: target.id,
        estimated_minutes: MINUTES_BY_TYPE[t],
        prompt: buildPrompt(t, target, args.hub),
        bound_to_lesson: true as const,
        modality: MODALITY_BY_TYPE[t],
      };
      const value = scoreHomeworkTask(partial, target);
      if (!chosen || value > chosen.value) chosen = { type: t, value, templateKey };
    }

    if (!chosen) continue;
    if (minutes + MINUTES_BY_TYPE[chosen.type] > minutesCap) continue;

    const partial = {
      id: `hw_${tasks.length + 1}`,
      type: chosen.type,
      template_key: chosen.templateKey,
      reinforcement_target_id: target.id,
      estimated_minutes: MINUTES_BY_TYPE[chosen.type],
      prompt: buildPrompt(chosen.type, target, args.hub),
      bound_to_lesson: true as const,
      modality: MODALITY_BY_TYPE[chosen.type],
    };
    tasks.push({ ...partial, educational_value: chosen.value });
    minutes += MINUTES_BY_TYPE[chosen.type];
  }

  // Ensure minimum task count by relaxing dedup.
  while (tasks.length < minTasks && args.targets[tasks.length] && allowedTypes.length > 0) {
    const target = args.targets[tasks.length];
    const t = allowedTypes[0];
    if (minutes + MINUTES_BY_TYPE[t] > minutesCap) break;
    const partial = {
      id: `hw_${tasks.length + 1}`,
      type: t,
      template_key: `${t}:${target.skill_kind}:${target.skill_key}`,
      reinforcement_target_id: target.id,
      estimated_minutes: MINUTES_BY_TYPE[t],
      prompt: buildPrompt(t, target, args.hub),
      bound_to_lesson: true as const,
      modality: MODALITY_BY_TYPE[t],
    };
    const value = scoreHomeworkTask(partial, target);
    tasks.push({ ...partial, educational_value: value });
    minutes += MINUTES_BY_TYPE[t];
  }

  const avg = tasks.length ? tasks.reduce((s, t) => s + t.educational_value, 0) / tasks.length : 0;

  // Hand-of-Cards drill plan over vocab targets (RoadWords-inspired).
  // Always starts receptive; the player advances cards to expressive after first hit.
  const vocabTargets = args.targets.filter((t) => t.skill_kind === 'vocab').slice(0, 6);
  const drill_plan = vocabTargets.length
    ? {
        direction_start: 'receptive' as const,
        cards: vocabTargets.map((t) => ({ skill_key: t.skill_key, label: t.label })),
      }
    : undefined;

  return {
    lessonId: args.lessonId,
    studentId: args.studentId,
    hub: args.hub,
    tasks,
    total_minutes: minutes,
    coherence_score: avg,
    drill_plan,
  };
}

function pickTypesForTarget(target: ReinforcementTarget, allowed: HomeworkTaskType[]): HomeworkTaskType[] {
  const preferences: Record<ReinforcementTarget['skill_kind'], HomeworkTaskType[]> = {
    vocab: ['vocab_recall', 'sentence_build', 'mini_recording', 'micro_writing'],
    grammar: ['sentence_build', 'micro_writing', 'mini_recording'],
    phoneme: ['mini_recording', 'listening_recap'],
    speaking: ['mini_recording', 'parent_script', 'peer_message'],
    function: ['peer_message', 'email_draft', 'mini_recording'],
  };
  return (preferences[target.skill_kind] ?? []).filter(t => allowed.includes(t));
}

function buildPrompt(type: HomeworkTaskType, target: ReinforcementTarget, hub: Hub): string {
  const what = target.label;
  switch (type) {
    case 'vocab_recall': return `Recall and use "${what}" in 3 short sentences.`;
    case 'sentence_build': return `Build 3 sentences using "${what}" from today's lesson.`;
    case 'mini_recording': return `Record yourself saying 2 sentences with "${what}".`;
    case 'listening_recap': return `Listen to the lesson clip and write the line that uses "${what}".`;
    case 'micro_reading': return `Read the short passage and underline every "${what}".`;
    case 'micro_writing': return `Write 4 sentences using "${what}" in different forms.`;
    case 'parent_script': return `Say "${what}" out loud with a family member 3 times.`;
    case 'peer_message': return `Send a friend a short message using "${what}" naturally.`;
    case 'email_draft': return `Draft a short professional email that uses "${what}".`;
  }
}
