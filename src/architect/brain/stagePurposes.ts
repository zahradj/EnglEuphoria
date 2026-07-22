// Learning-Stage Purpose Map.
// Explains WHY each stage exists — not what it outputs.
// Injected into the Architect brain so the agent picks activities from
// purpose, not from a template.

import type { Hub } from '@/governance/types';

export function buildStagePurposePrompt(hub: Hub): string {
  const shared = [
    '## LEARNING-STAGE PURPOSE MAP (why each stage exists)',
    '',
    '**Warm-Up** — Capture attention. Create curiosity. Introduce today\'s mission.',
    '**Vocabulary** — Teach meaning through concrete anchors. Never teach isolated words.',
    '**Flashcards** — Build recognition. Bind word ↔ image ↔ sound.',
    '**Story** — Use vocabulary naturally inside a mission arc (Goal → Problem → Adventure → Success → Celebration).',
    '**Games** — Practice without feeling like studying. Progression: Recognition → Identification → Decision → Speaking → Communication.',
    '**Sentence** — Move from words to communication using the lesson\'s exact grammar frame.',
    '**Homework** — Reinforce today\'s mission. Same frame, new context. Never a random drill.',
  ];
  if (hub === 'playground') {
    shared.push(
      '',
      'Playground rule: every stage pairs language with a gesture, image, or manipulative BEFORE any text.',
    );
  } else if (hub === 'success') {
    shared.push(
      '',
      'Success rule: every stage opens by stating the real-world scenario the learner will accomplish.',
    );
  }
  return shared.join('\n');
}
