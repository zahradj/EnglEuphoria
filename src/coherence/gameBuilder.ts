// Deterministic game pack builder.
import type { Cefr, Hub } from '@/governance/types';
import type { AdaptationContext } from '@/adaptive/types';
import type { GamePack, GameRound, GameType, ReinforcementTarget } from './types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';
import { scoreGameRound } from './educationalValueScorer';
import { resolveDifficultyTier } from './difficultyResolver';
import { isRecentlyUsed, type RecentEntry } from './dedupLedger';

const PREFERRED_GAME_BY_KIND: Record<ReinforcementTarget['skill_kind'], GameType[]> = {
  vocab: ['WordRush', 'MemoryGrid', 'MeaningMaze'],
  grammar: ['GrammarSprint', 'DialogueDash'],
  phoneme: ['SoundMatch', 'FluencyArcade'],
  speaking: ['FluencyArcade', 'DialogueDash'],
  function: ['DialogueDash', 'MeaningMaze'],
};

export interface BuildGameArgs {
  hub: Hub;
  cefr: Cefr;
  studentId: string;
  lessonId: string;
  targets: ReinforcementTarget[];
  adaptive?: AdaptationContext;
  history?: RecentEntry[];
}

export function buildGamePack(args: BuildGameArgs): GamePack {
  const profile = COHERENCE_HUB_PROFILES[args.hub];
  const rounds: GameRound[] = [];

  for (const target of args.targets) {
    if (rounds.length >= profile.game_rounds) break;
    const candidates = (PREFERRED_GAME_BY_KIND[target.skill_kind] ?? []).filter(g =>
      profile.game_catalog.includes(g),
    );
    let chosen: { type: GameType; value: number; scenarioKey: string } | null = null;

    for (const gType of candidates) {
      const scenarioKey = `${gType}:${target.skill_kind}:${target.skill_key}`;
      if (isRecentlyUsed(scenarioKey, { history: args.history, withinDays: 5 })) continue;
      const tier = resolveDifficultyTier(args.cefr, args.adaptive, target.priority);
      const partial = {
        id: `gr_${rounds.length + 1}`,
        type: gType,
        reinforcement_target_id: target.id,
        scenario_key: scenarioKey,
        difficulty_tier: tier,
        is_boss: false,
      };
      const value = scoreGameRound(partial, target);
      if (!chosen || value > chosen.value) chosen = { type: gType, value, scenarioKey };
    }

    if (!chosen) continue;
    const tier = resolveDifficultyTier(args.cefr, args.adaptive, target.priority);
    const partial = {
      id: `gr_${rounds.length + 1}`,
      type: chosen.type,
      reinforcement_target_id: target.id,
      scenario_key: chosen.scenarioKey,
      difficulty_tier: tier,
      is_boss: false,
    };
    rounds.push({ ...partial, educational_value: chosen.value });
  }

  // BossRound — mastery unlock if catalog allows and targets exist
  if (profile.game_catalog.includes('BossRound') && args.targets.length > 0 && rounds.length < profile.game_rounds) {
    const target = args.targets[0];
    const tier = Math.min(5, resolveDifficultyTier(args.cefr, args.adaptive, 1) + 1);
    const partial = {
      id: `gr_boss`,
      type: 'BossRound' as GameType,
      reinforcement_target_id: target.id,
      scenario_key: `BossRound:${target.skill_key}`,
      difficulty_tier: tier,
      is_boss: true,
    };
    rounds.push({ ...partial, educational_value: scoreGameRound(partial, target) });
  }

  const avg = rounds.length ? rounds.reduce((s, r) => s + r.educational_value, 0) / rounds.length : 0;
  return {
    lessonId: args.lessonId,
    studentId: args.studentId,
    hub: args.hub,
    rounds,
    educational_value_avg: avg,
  };
}
