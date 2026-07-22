// Coherence validator — stage 10.6 publish gate.
import type { Hub } from '@/governance/types';
import type { CoherenceDecision, CoherenceIssue, CoherenceVerdict, GamePack, HomeworkPack } from './types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';
import { MIN_AVG_VALUE, MIN_ITEM_VALUE } from './educationalValueScorer';
import { validateQuizPedagogy } from './quizPedagogyValidator';

export interface ValidateArgs {
  hub: Hub;
  decision: Pick<CoherenceDecision, 'homework' | 'game' | 'targets'>;
  lessonVocab: string[];
  lessonGrammar: string[];
}

export interface CoherenceValidationReport {
  verdict: CoherenceVerdict;
  issues: CoherenceIssue[];
}

export function validateCoherence(args: ValidateArgs): CoherenceValidationReport {
  const issues: CoherenceIssue[] = [];
  const profile = COHERENCE_HUB_PROFILES[args.hub];
  const { homework, game, targets } = args.decision;

  // Every game round MUST cite a reinforcement target id known to the decision.
  const targetIds = new Set(targets.map(t => t.id));
  for (const r of game.rounds) {
    if (!r.reinforcement_target_id || !targetIds.has(r.reinforcement_target_id)) {
      issues.push({ code: 'game_round_missing_target', severity: 'hard',
        message: `Round ${r.id} lacks a valid reinforcement target.` });
    }
  }
  for (const t of homework.tasks) {
    if (!t.reinforcement_target_id || !targetIds.has(t.reinforcement_target_id)) {
      issues.push({ code: 'homework_missing_target', severity: 'hard',
        message: `Homework task ${t.id} lacks a valid reinforcement target.` });
    }
  }

  // Homework MUST NOT introduce vocab/grammar absent from the lesson set.
  const allowedVocab = new Set(args.lessonVocab.map(s => s.toLowerCase()));
  const allowedGrammar = new Set(args.lessonGrammar.map(s => s.toLowerCase()));
  for (const t of homework.tasks) {
    const tgt = targets.find(x => x.id === t.reinforcement_target_id);
    if (!tgt) continue;
    const key = tgt.skill_key.toLowerCase();
    if (tgt.skill_kind === 'vocab' && tgt.source === 'lesson_target' && !allowedVocab.has(key)) {
      issues.push({ code: 'homework_introduces_novel_vocab', severity: 'hard',
        message: `Homework "${t.id}" references vocab "${tgt.skill_key}" not in the lesson.` });
    }
    if (tgt.skill_kind === 'grammar' && tgt.source === 'lesson_target' && !allowedGrammar.has(key)) {
      issues.push({ code: 'homework_introduces_novel_grammar', severity: 'hard',
        message: `Homework "${t.id}" references grammar "${tgt.skill_key}" not in the lesson.` });
    }
  }

  // Hub homework minutes cap.
  if (homework.total_minutes > profile.homework_minutes_cap) {
    issues.push({ code: 'homework_over_cap', severity: 'hard',
      message: `Homework exceeds ${profile.homework_minutes_cap}-minute cap (${homework.total_minutes}).` });
  }

  // PG unsupervised writing length guard.
  if (args.hub === 'playground') {
    for (const t of homework.tasks) {
      if (t.modality === 'writing' && t.estimated_minutes > 5) {
        issues.push({ code: 'pg_unsupervised_writing_too_long', severity: 'hard',
          message: `Playground homework "${t.id}" requires too much unsupervised writing.` });
      }
    }
  }

  // Average educational value.
  if (homework.coherence_score < MIN_AVG_VALUE && homework.tasks.length > 0) {
    issues.push({ code: 'homework_low_value', severity: 'hard',
      message: `Homework avg value ${homework.coherence_score.toFixed(2)} < ${MIN_AVG_VALUE}.` });
  }
  if (game.educational_value_avg < MIN_AVG_VALUE && game.rounds.length > 0) {
    issues.push({ code: 'game_low_value', severity: 'hard',
      message: `Game avg value ${game.educational_value_avg.toFixed(2)} < ${MIN_AVG_VALUE}.` });
  }

  // Per-item floor → soft.
  for (const t of homework.tasks) {
    if (t.educational_value < MIN_ITEM_VALUE) {
      issues.push({ code: 'homework_item_below_floor', severity: 'soft',
        message: `Homework "${t.id}" value ${t.educational_value.toFixed(2)} below ${MIN_ITEM_VALUE}.` });
    }
  }
  for (const r of game.rounds) {
    if (r.educational_value < MIN_ITEM_VALUE) {
      issues.push({ code: 'game_round_below_floor', severity: 'soft',
        message: `Game round "${r.id}" value ${r.educational_value.toFixed(2)} below ${MIN_ITEM_VALUE}.` });
    }
  }

  // Minimum counts (soft — repair can backfill).
  if (homework.tasks.length < profile.homework_min_tasks) {
    issues.push({ code: 'homework_count_low', severity: 'soft',
      message: `Homework has ${homework.tasks.length}, expected ≥${profile.homework_min_tasks}.` });
  }
  if (game.rounds.length === 0) {
    issues.push({ code: 'game_rounds_empty', severity: 'hard',
      message: `Game pack is empty.` });
  }

  // Quiz/Homework pedagogy contract checks (soft).
  issues.push(...validateQuizPedagogy(homework, game));


  const hasHard = issues.some(i => i.severity === 'hard');
  const hasSoft = issues.some(i => i.severity === 'soft');
  const verdict: CoherenceVerdict = hasHard ? 'block' : hasSoft ? 'repair' : 'pass';
  return { verdict, issues };
}

export function repairCoherence(
  pack: { homework: HomeworkPack; game: GamePack },
  issues: CoherenceIssue[],
): { homework: HomeworkPack; game: GamePack } {
  // Light repair: drop sub-floor items.
  const homework: HomeworkPack = {
    ...pack.homework,
    tasks: pack.homework.tasks.filter(t => t.educational_value >= MIN_ITEM_VALUE),
  };
  const game: GamePack = {
    ...pack.game,
    rounds: pack.game.rounds.filter(r => r.educational_value >= MIN_ITEM_VALUE),
  };
  homework.coherence_score = avg(homework.tasks.map(t => t.educational_value));
  game.educational_value_avg = avg(game.rounds.map(r => r.educational_value));
  homework.total_minutes = homework.tasks.reduce((s, t) => s + t.estimated_minutes, 0);
  void issues;
  return { homework, game };
}

function avg(ns: number[]): number {
  return ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : 0;
}
