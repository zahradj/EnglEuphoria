// Stage 10.7 — validateArcade. Hard / soft gates.
import type { Hub } from '@/governance/types';
import type { ArcadeIssue, ArcadeReport, GameSpec } from './types';
import { ARCADE_HUB_PROFILES } from './hubProfiles';
import { cefrIdx } from './gameRegistry';

export interface ValidateArgs {
  hub: Hub;
  specs: GameSpec[];
  lessonVocab?: string[];
  lessonGrammar?: string[];
  memoryDueCount?: number;
}

export function validateArcade(args: ValidateArgs): ArcadeReport {
  const issues: ArcadeIssue[] = [];
  const profile = ARCADE_HUB_PROFILES[args.hub];
  const total_seconds = args.specs.reduce((s, x) => s + x.est_seconds, 0);
  const game_count = args.specs.length;
  const speaking_count = args.specs.filter((s) => s.game.supports_speaking).length;

  // HARD: ceiling
  if (total_seconds > profile.max_minutes_per_lesson * 60) {
    issues.push({ code: 'hub_minute_ceiling', severity: 'hard', message: 'Total minutes exceed hub ceiling.' });
  }
  if (game_count > profile.max_games_per_lesson) {
    issues.push({ code: 'hub_count_ceiling', severity: 'hard', message: 'Game count exceeds hub ceiling.' });
  }
  // HARD: speaking floor
  if (game_count > 0 && speaking_count < profile.speaking_floor) {
    issues.push({ code: 'speaking_floor', severity: 'hard', message: 'Hub speaking floor not met.' });
  }
  // HARD: CEFR ceiling per hub
  const ceilingCefr = profile.ceiling_cefr;
  const ceilIdx = cefrIdx(ceilingCefr);
  for (const s of args.specs) {
    if (cefrIdx(s.game.cefr_min) > ceilIdx) {
      issues.push({
        code: 'cefr_above_hub_ceiling',
        severity: 'hard',
        message: `Game ${s.game.id} requires CEFR above ${ceilingCefr}.`,
      });
    }
  }
  // HARD: Playground unsupervised long text
  if (args.hub === 'playground') {
    const longText = args.specs.find((s) => !profile.allow_long_text_input && s.game.id === 'spelling_race');
    if (longText) issues.push({ code: 'pg_long_text', severity: 'hard', message: 'Playground forbids unsupervised long text.' });
  }
  // HARD: curriculum drift — target must reference lesson vocab/grammar when bound to a lesson.
  if (args.lessonVocab && args.lessonGrammar) {
    const allowed = new Set<string>([
      ...args.lessonVocab.map((v) => v.toLowerCase()),
      ...args.lessonGrammar.map((v) => v.toLowerCase()),
    ]);
    for (const s of args.specs) {
      if (!s.target) continue;
      const key = s.target.skill_key.toLowerCase();
      if (!allowed.has(key) && s.target.source === 'lesson_target') {
        issues.push({
          code: 'curriculum_drift',
          severity: 'hard',
          message: `Spec ${s.spec_id} references ${key} not in lesson scope.`,
        });
      }
    }
  }

  // SOFT: educational value avg
  const avg = game_count > 0 ? args.specs.reduce((s, x) => s + x.educational_value, 0) / game_count : 0;
  if (game_count > 0 && avg < 0.6) {
    issues.push({ code: 'low_educational_value', severity: 'soft', message: `Avg educational value ${avg.toFixed(2)} < 0.6.` });
  }
  // SOFT: missing character binding
  for (const s of args.specs) {
    if (s.game.character_slots > 0 && s.characters.length === 0) {
      issues.push({ code: 'no_character_binding', severity: 'soft', message: `Spec ${s.spec_id} missing character binding.` });
    }
  }
  // SOFT: review game expected when memory has due items
  if ((args.memoryDueCount ?? 0) >= 3 && !args.specs.some((s) => s.game.category === 'review')) {
    issues.push({ code: 'missing_review_game', severity: 'soft', message: 'Memory has ≥3 due items but no review game scheduled.' });
  }

  const hard = issues.some((i) => i.severity === 'hard');
  const soft = issues.some((i) => i.severity === 'soft');
  const verdict = hard ? 'block' : soft ? 'repair' : 'pass';
  return { verdict, issues, total_seconds, speaking_count, game_count };
}
