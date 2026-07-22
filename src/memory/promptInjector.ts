// Memory system prompt — binding instructions for downstream Gemini prompts.

import type { MemoryDecision } from './types';

export function buildMemorySystemPrompt(d: MemoryDecision): string {
  if (d.review_queue.length === 0) return '';
  const top = d.review_queue.slice(0, 8);
  const queueLines = top
    .map((e) => {
      const tags = [
        `priority=${e.priority.toFixed(2)}`,
        `recall=L${e.target_recall_level}`,
        e.must_be_spoken ? 'MUST_BE_SPOKEN' : null,
        e.spiral_escalation ? `spiral→${e.spiral_escalation.toStage}` : null,
      ].filter(Boolean).join(' ');
      return `- ${e.item.skill_kind}:${e.item.skill_key} [${tags}] — ${e.rationale.join('; ')}`;
    })
    .join('\n');

  const slotLines = Object.entries(d.injectionPlan.slots)
    .map(([slot, entries]) => `  • ${slot}: ${(entries ?? []).map((e) => e.item.skill_key).join(', ')}`)
    .join('\n');

  return [
    '## MEMORY & REVIEW DIRECTIVES (binding)',
    'You are generating inside a long-term retention system. Apply these rules:',
    '1. Recycle the items below into the relevant slots — do NOT invent isolated topics for them.',
    '2. Items tagged MUST_BE_SPOKEN must surface in a speaking task at the target recall level or higher.',
    '3. Spiral escalations must reuse the SAME skill_key in a NEW communicative context — never relabel the skill.',
    '4. Maintain interleaving — mix skill kinds across review moments, do not cluster.',
    '5. Never label review as "Review" for Playground learners; integrate via song/chant/character callbacks.',
    '6. Review density target: ' + (d.injectionPlan.reviewDensity * 100).toFixed(0) + '% of the lesson (hard cap 30%).',
    '',
    `Interleaving mix: ${d.injectionPlan.interleavingMix.join(', ')}`,
    '',
    'Review queue (highest priority first):',
    queueLines,
    '',
    'Pre-seeded injection slots:',
    slotLines || '  (none)',
    '',
    d.systemPromptHint ? `Heatmap context: ${d.systemPromptHint}` : '',
  ].filter(Boolean).join('\n');
}
