// Continuity Context — the Architect must remember where the learner has been
// and where they are going. Prevents isolated "one-off" lessons.

import type { ArchitectContextBundle, ArchitectSeed } from '../types';

export interface ContinuityInput {
  seed?: ArchitectSeed;
  context?: ArchitectContextBundle;
  nextLessonHint?: { title?: string; grammar?: string[]; theme?: string } | null;
  studentLevel?: string;
  studentMistakes?: string[];
}

export function buildContinuityPrompt(input: ContinuityInput): string {
  const prior = input.context?.priorLessons ?? [];
  const previous = prior[prior.length - 1];
  const reviewVocab =
    input.seed?.reviewTargets?.length
      ? input.seed.reviewTargets
      : input.context?.memoryDue ?? [];
  const mistakes = input.studentMistakes ?? [];
  const level =
    input.studentLevel ?? input.context?.governanceConstraints?.cefrCeiling ?? 'unknown';

  const lines = [
    '## CONTINUITY CONTEXT (remember the learner, not just the lesson)',
    'You are NOT generating a stand-alone lesson. You are placing today\'s lesson',
    'inside a longer learning journey. Bind every decision to the memory below.',
    '',
    `**Previous lesson:** ${
      previous
        ? `"${previous.title}"${previous.theme ? ` (theme: ${previous.theme})` : ''}${
            previous.grammar?.length ? ` — grammar: ${previous.grammar.join(', ')}` : ''
          }${previous.vocab?.length ? ` — vocab: ${previous.vocab.slice(0, 8).join(', ')}` : ''}`
        : 'none on record — this is a first lesson.'
    }`,
    `**Current lesson seed:** theme="${input.seed?.theme ?? '?'}", grammar=${
      input.seed?.grammarFocus?.join(', ') || '?'
    }, goal="${input.seed?.communicationGoal ?? '?'}"`,
    `**Next lesson hint:** ${
      input.nextLessonHint
        ? `"${input.nextLessonHint.title ?? '?'}"${
            input.nextLessonHint.grammar?.length
              ? ` — future grammar: ${input.nextLessonHint.grammar.join(', ')}`
              : ''
          }`
        : 'not yet planned — leave a hook the next lesson can pick up.'
    }`,
    `**Review vocabulary (spiral):** ${reviewVocab.length ? reviewVocab.join(', ') : 'none due — introduce fresh anchors only.'}`,
    `**Student level:** ${level}`,
    `**Recurring student mistakes:** ${mistakes.length ? mistakes.join('; ') : 'none logged.'}`,
    '',
    'Binding rules:',
    '- Warm-up MUST recycle ≥1 item from Review vocabulary when the list is non-empty.',
    '- Never re-introduce a word already mastered in a previous lesson as "new".',
    '- Grammar MUST be one step forward from Previous lesson grammar — never a repeat and never a skip past Future grammar.',
    '- If Recurring mistakes overlap today\'s frame, insert one targeted micro-repair activity.',
    '- Leave one narrative hook (character question, unfinished mission) that the Next lesson can pick up.',
    '- Difficulty MUST match Student level — never above the CEFR ceiling.',
  ];
  return lines.join('\n');
}
