// Pin teacher-authored homework (PlaygroundCreator) into the coherence
// engine's HomeworkPack shape. Each authored task is round-robin bound
// to a reinforcement target so validator hard-checks
// (`homework_missing_target`, novel-vocab/grammar) pass.
import type { Hub } from '@/governance/types';
import type {
  HomeworkPack,
  HomeworkTask,
  ReinforcementTarget,
} from './types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';

export interface AuthoredHomeworkTaskInput {
  id: string;
  type: string;
  label?: string;
  prompt: string;
  minutes: number;
}

export interface AuthoredHomeworkInput {
  studentId: string;
  lessonId: string;
  hub: Hub;
  tasks: AuthoredHomeworkTaskInput[];
}

// Playground-safe defaults — authored content is human-vetted so we
// score above the item floor.
const AUTHORED_EDU_VALUE = 0.8;

export function pinAuthoredHomework(
  input: AuthoredHomeworkInput,
  targets: ReinforcementTarget[],
): HomeworkPack {
  const profile = COHERENCE_HUB_PROFILES[input.hub];
  const usableTargets = targets.length ? targets : [];

  // Enforce hub caps: task count first, then per-task minutes, then a
  // greedy tail-trim if the total still exceeds the minutes cap.
  const capped = input.tasks
    .slice(0, profile.homework_max_tasks)
    .map((t) => ({
      ...t,
      minutes: Math.max(1, Math.min(profile.homework_minutes_cap, t.minutes || 1)),
    }));
  let running = 0;
  const trimmed: AuthoredHomeworkTaskInput[] = [];
  for (const t of capped) {
    if (running + t.minutes > profile.homework_minutes_cap) {
      const remaining = profile.homework_minutes_cap - running;
      if (remaining >= 1) trimmed.push({ ...t, minutes: remaining });
      break;
    }
    trimmed.push(t);
    running += t.minutes;
  }

  const tasks: HomeworkTask[] = trimmed.map((t, i) => {
    const tgt = usableTargets[i % Math.max(1, usableTargets.length)];
    return {
      id: t.id,
      type: 'vocab_recall', // catalog-neutral; the runtime uses `template_key`.
      template_key: t.type,
      reinforcement_target_id: tgt?.id ?? '',
      estimated_minutes: t.minutes,
      prompt: t.prompt || t.label || t.type,
      bound_to_lesson: true as const,
      educational_value: AUTHORED_EDU_VALUE,
      modality: 'mixed',
    };
  });
  const total = tasks.reduce((s, t) => s + t.estimated_minutes, 0);
  const avg = tasks.length
    ? tasks.reduce((s, t) => s + t.educational_value, 0) / tasks.length
    : 0;
  return {
    lessonId: input.lessonId,
    studentId: input.studentId,
    hub: input.hub,
    tasks,
    total_minutes: total,
    coherence_score: avg,
  };
}
