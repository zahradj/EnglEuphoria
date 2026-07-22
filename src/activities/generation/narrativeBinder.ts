// Narrative binder — injects theme, characters, setting, scene continuity.
// Also prepends a per-slide Expert Teacher preamble so every activity prompt
// inherits the lesson's identity (title, focus, role, vocab, grammar).

import type { GenerationContext, ActivitySpec } from '../types';

export function buildNarrativeBinder(
  ctx: GenerationContext,
  previousActivities: ActivitySpec[],
): string {
  const t = ctx.state.theme;
  const bp = ctx.plan.blueprint;
  const lastScene = previousActivities.length
    ? previousActivities[previousActivities.length - 1].narrative_anchor.scene
    : `Opening moment of the "${t.theme}" scenario.`;

  const lines: string[] = [];

  // ── Step 4: Expert Teacher per-slide preamble ──────────────────────
  lines.push('## EXPERT TEACHER — PER-SLIDE CONTRACT');
  lines.push(
    `You are a CELTA-trained ESL teacher authoring ONE slide for "${bp.lesson_title}" (${bp.hub} · ${bp.cefr_level}).`,
  );
  lines.push(
    `This slide MUST visibly advance the lesson focus — every prompt, example, and answer key has to use the target vocab and grammar below. Off-topic filler is rejected.`,
  );
  lines.push(`Lesson focus / title: ${bp.lesson_title}`);
  lines.push(`Communication goal:   ${bp.communication_goal}`);
  lines.push(`Grammar target:       ${(bp.grammar_focus || []).join(', ') || '(see plan)'}`);
  lines.push(`Target vocabulary:    ${(bp.target_vocab || []).join(', ') || '(see plan)'}`);
  lines.push('');

  // ── Narrative binder ───────────────────────────────────────────────
  lines.push('## NARRATIVE BINDER (binding)');
  lines.push(`Theme: ${t.theme}`);
  lines.push(`Setting: ${t.setting}`);
  lines.push(
    `Characters: ${(t.characters || []).join(', ') || '(use lesson-consistent named characters; do not invent unrelated ones)'}`,
  );
  lines.push(`Tone: ${t.tone}`);
  lines.push(`Communication goal: ${t.communication_goal}`);
  lines.push('');
  lines.push(`Scene continuity — previous beat: "${lastScene}"`);
  lines.push('Continue from this beat. Do not reset the scenario. Do not switch settings or characters.');
  lines.push('');
  return lines.join('\n');
}
