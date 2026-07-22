// Pin teacher-authored game rounds (Playground Creator) into the coherence
// engine's GamePack shape. Mirrors `pinAuthoredHomework`.
//
// Improvements over a naive passthrough:
//   • Hub-cap enforcement (`game_rounds`).
//   • Type-dedup across the pack (no back-to-back same-type rounds unless
//     targets differ) — mirrors `dedupLedger` intent inside a single pack.
//   • Boss round auto-append if authored omits one and catalog allows.
//   • Deterministic `educational_value` via `scoreGameRound`.
//   • Falls back gracefully when an authored `type` is not in the hub catalog
//     (drops the round instead of hard-blocking downstream).
import type { Cefr, Hub } from '@/governance/types';
import type { AdaptationContext } from '@/adaptive/types';
import type { GamePack, GameRound, GameType, ReinforcementTarget } from './types';
import { COHERENCE_HUB_PROFILES } from './hubProfiles';
import { scoreGameRound } from './educationalValueScorer';
import { resolveDifficultyTier } from './difficultyResolver';

export interface AuthoredGameRoundInput {
  id?: string;
  type: string;                 // must resolve to a GameType in the hub catalog
  scenario_key?: string;
  difficulty_tier?: number;     // 1..5
  is_boss?: boolean;
}

export interface AuthoredGamePackInput {
  studentId: string;
  lessonId: string;
  hub: Hub;
  rounds: AuthoredGameRoundInput[];
}

export function pinAuthoredGamePack(
  input: AuthoredGamePackInput,
  targets: ReinforcementTarget[],
  cefr: Cefr,
  adaptive?: AdaptationContext,
): GamePack {
  const profile = COHERENCE_HUB_PROFILES[input.hub];
  const catalog = new Set<string>(profile.game_catalog);
  const rounds: GameRound[] = [];
  const usedTypes = new Set<string>();

  // Cap by hub round count.
  const capped = input.rounds.slice(0, profile.game_rounds);

  capped.forEach((r, i) => {
    if (!catalog.has(r.type)) return;              // drop off-catalog rounds
    const target = targets[i % Math.max(1, targets.length)];
    if (!target) return;
    // Dedup: skip same type on same target.
    const dedupKey = `${r.type}:${target.id}`;
    if (usedTypes.has(dedupKey)) return;
    usedTypes.add(dedupKey);

    const gType = r.type as GameType;
    const tier = Math.max(
      1,
      Math.min(5, r.difficulty_tier ?? resolveDifficultyTier(cefr, adaptive, target.priority)),
    );
    const scenarioKey = r.scenario_key ?? `${gType}:${target.skill_kind}:${target.skill_key}`;
    const partial = {
      id: r.id ?? `gr_${rounds.length + 1}`,
      type: gType,
      reinforcement_target_id: target.id,
      scenario_key: scenarioKey,
      difficulty_tier: tier,
      is_boss: Boolean(r.is_boss) || gType === 'BossRound',
    };
    rounds.push({ ...partial, educational_value: scoreGameRound(partial, target) });
  });

  // Auto-append a boss round if authored omits one and we still have room.
  const hasBoss = rounds.some((r) => r.is_boss);
  if (
    !hasBoss &&
    profile.game_catalog.includes('BossRound') &&
    targets.length > 0 &&
    rounds.length < profile.game_rounds
  ) {
    const target = targets[0];
    const tier = Math.min(5, resolveDifficultyTier(cefr, adaptive, 1) + 1);
    const partial = {
      id: 'gr_boss',
      type: 'BossRound' as GameType,
      reinforcement_target_id: target.id,
      scenario_key: `BossRound:${target.skill_key}`,
      difficulty_tier: tier,
      is_boss: true,
    };
    rounds.push({ ...partial, educational_value: scoreGameRound(partial, target) });
  }

  const avg = rounds.length
    ? rounds.reduce((s, r) => s + r.educational_value, 0) / rounds.length
    : 0;
  return {
    lessonId: input.lessonId,
    studentId: input.studentId,
    hub: input.hub,
    rounds,
    educational_value_avg: avg,
  };
}
