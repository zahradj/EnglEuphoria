// buildArcadeSystemPrompt — chained AFTER coherence, BEFORE activity prompts.
import type { ArcadeDecision } from './types';

export function buildArcadeSystemPrompt(decision: ArcadeDecision | null): string {
  if (!decision || decision.selected.length === 0) return '';
  const lines: string[] = [
    '## GAMER ARCADE DIRECTIVE (Tier 6 — soft, reinforcement)',
    `Selected games (${decision.selected.length}); total ≈ ${Math.round(decision.report.total_seconds / 60)}min:`,
  ];
  for (const s of decision.selected) {
    const t = s.target ? `${s.target.skill_kind}:${s.target.skill_key}` : 'free-play';
    const chars = s.characters.length > 0
      ? ` w/ ${s.characters.map((c) => `${c.name}(${c.role})`).join(', ')}`
      : '';
    lines.push(
      `- ${s.game.display_name} — tier ${s.difficulty_tier}, scaffold ${s.scaffolding_boost}, ${s.est_seconds}s, target=${t}${s.is_boss ? ' [BOSS]' : ''}${chars}`,
    );
  }
  if (decision.injections.length > 0) {
    lines.push('', 'Lesson slots:');
    for (const inj of decision.injections) {
      lines.push(`- ${inj.slot}: ${inj.spec.game.display_name}`);
    }
  }
  lines.push(
    '',
    'Rules:',
    '- Games are reinforcement, not gatekeeping. Never block lesson progression on game outcomes.',
    '- Speaking bravery is rewarded independently of correctness.',
    '- Stay within hub speaking floor and minute caps.',
    '- All in-game content must reference the lesson\'s reinforcement targets — no novel vocab/grammar.',
  );
  return lines.join('\n');
}
