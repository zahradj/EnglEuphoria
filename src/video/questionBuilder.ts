// Video Lesson track — deterministic comprehension question builder.
// Mixes tap_picture and yes_no per user spec. No AI at play time.

import type { ReinforcementTarget } from '@/coherence/types';
import type { Hub } from '@/governance/types';
import type { VideoQuestion, TapPictureOption } from './types';

interface BuildInput {
  targets: ReinforcementTarget[];
  vocab: string[];
  hub: Hub;
  count?: 2 | 3;
}

function distractorsFor(target: ReinforcementTarget, vocab: string[]): string[] {
  const pool = vocab.filter((v) => v.toLowerCase() !== target.label.toLowerCase());
  // deterministic: sort alphabetically, take first 2
  return pool.slice().sort().slice(0, 2);
}

function tapPicture(target: ReinforcementTarget, vocab: string[]): VideoQuestion {
  const distractors = distractorsFor(target, vocab);
  const options: TapPictureOption[] = [
    { id: target.skill_key || target.id, label: target.label, image_prompt: target.label },
    ...distractors.map((d) => ({ id: d, label: d, image_prompt: d })),
  ];
  // correct answer always index 0 in source; shuffling is deterministic in the player if needed
  return {
    kind: 'tap_picture',
    target_id: target.id,
    prompt_text: `Who did you see? Tap the picture of ${target.label}.`,
    options,
    correct_index: 0,
  };
}

function yesNo(target: ReinforcementTarget): VideoQuestion {
  return {
    kind: 'yes_no',
    target_id: target.id,
    prompt_text: `Did you see ${target.label}?`,
    options: ['yes', 'no'],
    correct_index: 0,
  };
}

export function buildVideoQuestions(input: BuildInput): VideoQuestion[] {
  const count = input.count ?? 2;
  const usable = input.targets.filter((t) => t.label && t.label.length > 0).slice(0, count);
  if (usable.length === 0) return [];

  // Deterministic mix: even indexes → tap_picture, odd → yes_no
  return usable.map((t, i) =>
    i % 2 === 0 ? tapPicture(t, input.vocab) : yesNo(t),
  );
}
