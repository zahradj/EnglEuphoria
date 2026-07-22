// Build prioritized reinforcement targets from cross-engine signals.
import type { Cefr, Hub } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import type { MemoryDecision } from '@/memory';
import type { SpeakingDecision } from '@/speaking';
import type { GrammarPackage } from '@/grammar';
import type { ReinforcementTarget } from './types';

export interface BuildTargetsArgs {
  hub: Hub;
  cefr: Cefr;
  lessonVocab: string[];
  lessonGrammar: string[];
  pronunciationTargets: string[];
  intelligence?: LearnerIntelligence;
  memory?: MemoryDecision | null;
  speaking?: SpeakingDecision;
  grammar?: GrammarPackage | null;
  /** Stabilization tier-6 nudge: when the learner has a `hub_drift` signal,
   * off-hub reinforcement targets (mastery gaps / memory-due items not tied
   * to current lesson vocab or grammar) are demoted by `HUB_DRIFT_PENALTY`
   * so homework/game packs stop repeating off-hub topics. Never overrides
   * CEFR / curriculum / age / safety. */
  hubDrift?: boolean;
}

const MAX_TARGETS = 12;
const HUB_DRIFT_PENALTY = 0.2;

export function buildReinforcementTargets(args: BuildTargetsArgs): ReinforcementTarget[] {
  const targets: ReinforcementTarget[] = [];

  // Lesson-bound vocab (always seeded — homework must reinforce what was taught)
  for (const v of args.lessonVocab.slice(0, 6)) {
    targets.push({
      id: `lt_vocab_${v}`,
      source: 'lesson_target',
      skill_kind: 'vocab',
      skill_key: v,
      label: v,
      priority: 0.9,
      cefr_ceiling: args.cefr,
    });
  }
  for (const g of args.lessonGrammar.slice(0, 3)) {
    targets.push({
      id: `lt_gram_${g}`,
      source: 'lesson_target',
      skill_kind: 'grammar',
      skill_key: g,
      label: g,
      priority: 0.95,
      cefr_ceiling: args.cefr,
    });
  }

  // Intelligence: weak mastery items
  if (args.intelligence) {
    for (const m of Object.values(args.intelligence.mastery_map)) {
      if (m.recall < 70 || m.spontaneous_production < 60) {
        targets.push({
          id: `mg_${m.skill}`,
          source: 'mastery_gap',
          skill_kind: 'vocab',
          skill_key: m.skill,
          label: m.skill,
          priority: clamp01(1 - m.recall / 100),
          cefr_ceiling: args.cefr,
        });
      }
    }
  }

  // Memory due items (top of review queue)
  if (args.memory) {
    for (const entry of args.memory.review_queue.slice(0, 8)) {
      const it = entry.item;
      targets.push({
        id: `md_${it.skill_kind}_${it.skill_key}`,
        source: 'memory_due',
        skill_kind: (it.skill_kind === 'grammar' ? 'grammar'
          : it.skill_kind === 'pronunciation' || it.skill_kind === 'phonics' ? 'phoneme'
          : it.skill_kind === 'speaking_pattern' ? 'speaking'
          : it.skill_kind === 'communication_function' ? 'function'
          : 'vocab') as ReinforcementTarget['skill_kind'],
        skill_key: it.skill_key,
        label: it.skill_key,
        priority: entry.priority ?? 0.7,
        cefr_ceiling: args.cefr,
      });
    }
  }

  // Speaking weak rungs
  if (args.speaking) {
    args.speaking.required_tasks.slice(0, 3).forEach((t, i) => {
      targets.push({
        id: `sp_${t.task_type}_${i}`,
        source: 'speaking_weak_rung',
        skill_kind: 'speaking',
        skill_key: t.task_type,
        label: `Speaking: ${t.rung}`,
        priority: 0.75,
        cefr_ceiling: args.cefr,
      });
    });
  }

  // Grammar struggles
  if (args.grammar && args.grammar.target?.label) {
    targets.push({
      id: `gs_${args.grammar.target.label}`,
      source: 'grammar_struggle',
      skill_kind: 'grammar',
      skill_key: args.grammar.target.label,
      label: args.grammar.target.label,
      priority: 0.8,
      cefr_ceiling: args.cefr,
    });
  }

  // Pronunciation
  for (const p of args.pronunciationTargets.slice(0, 4)) {
    targets.push({
      id: `pn_${p}`,
      source: 'pronunciation_target',
      skill_kind: 'phoneme',
      skill_key: p,
      label: `/${p}/`,
      priority: 0.65,
      cefr_ceiling: args.cefr,
    });
  }

  // Dedup by id, sort by priority desc, cap
  const seen = new Set<string>();
  const unique = targets.filter(t => (seen.has(t.id) ? false : (seen.add(t.id), true)));

  // Stabilization handshake — demote off-hub mastery_gap / memory_due targets
  // when `hub_drift` was flagged on the previous lesson.
  if (args.hubDrift) {
    const onHubKeys = new Set([
      ...args.lessonVocab.map(s => s.toLowerCase()),
      ...args.lessonGrammar.map(s => s.toLowerCase()),
    ]);
    for (const t of unique) {
      if ((t.source === 'mastery_gap' || t.source === 'memory_due') &&
          !onHubKeys.has(String(t.skill_key).toLowerCase())) {
        t.priority = Math.max(0, t.priority - HUB_DRIFT_PENALTY);
      }
    }
  }

  unique.sort((a, b) => b.priority - a.priority);
  return unique.slice(0, MAX_TARGETS);
}

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }
