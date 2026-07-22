// Score educational value of homework/game items.
// retrieval > recognition, production > reception, lesson-bound > generic.
import type { GameRound, HomeworkTask, ReinforcementTarget } from './types';

export function scoreHomeworkTask(t: Omit<HomeworkTask, 'educational_value'>, target: ReinforcementTarget): number {
  let score = 0.4;
  // Production-leaning modalities
  if (t.modality === 'speaking' || t.modality === 'writing') score += 0.25;
  if (t.modality === 'mixed') score += 0.15;
  // Retrieval > recognition
  if (t.type === 'mini_recording' || t.type === 'sentence_build' || t.type === 'email_draft' || t.type === 'peer_message') score += 0.15;
  // Lesson-bound
  if (target.source === 'lesson_target' || target.source === 'memory_due') score += 0.15;
  // High priority items boost
  score += target.priority * 0.1;
  return clamp01(score);
}

export function scoreGameRound(r: Omit<GameRound, 'educational_value'>, target: ReinforcementTarget): number {
  let score = 0.4;
  if (r.is_boss) score += 0.2;
  if (r.type === 'DialogueDash' || r.type === 'FluencyArcade' || r.type === 'GrammarSprint') score += 0.2;
  if (r.type === 'WordRush' || r.type === 'SoundMatch') score += 0.1;
  if (target.source === 'lesson_target' || target.source === 'memory_due') score += 0.15;
  score += target.priority * 0.1;
  // Difficulty alignment (mid-tier is sweet spot)
  if (r.difficulty_tier >= 2 && r.difficulty_tier <= 4) score += 0.05;
  return clamp01(score);
}

export const MIN_ITEM_VALUE = 0.5;
export const MIN_AVG_VALUE = 0.6;

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
