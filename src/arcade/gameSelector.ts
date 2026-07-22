// Deterministic fit scorer + selector.
import type { Hub, Cefr } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import type { ReinforcementTarget } from '@/coherence/types';
import type { ArcadeGameMeta, GameSpec } from './types';
import { ARCADE_GAMES, cefrIdx } from './gameRegistry';
import { ARCADE_HUB_PROFILES } from './hubProfiles';
import { shape } from './adaptiveShaper';
import { bindCharacters } from './characterBinder';

export interface SelectArgs {
  hub: Hub;
  cefr: Cefr;
  targets: ReinforcementTarget[];
  intelligence?: LearnerIntelligence;
  includeStandalone?: boolean; // standalone arcade: allow no-target free play
  excludeIds?: string[];
}

function fitScore(g: ArcadeGameMeta, args: SelectArgs, t: ReinforcementTarget | null): number {
  if (!g.hub_allow.includes(args.hub)) return -1;
  const ci = cefrIdx(args.cefr);
  if (ci < cefrIdx(g.cefr_min) || ci > cefrIdx(g.cefr_max)) return -1;

  let s = 0;
  if (t) {
    // skill overlap
    const overlap = g.skill_focus.filter((sk) =>
      sk === t.skill_kind || sk.includes(t.skill_kind) || t.skill_key.includes(sk),
    ).length;
    s += overlap * 0.4;
    // priority weight
    s += t.priority * 0.4;
    // speaking targets prefer speaking games
    if (t.skill_kind === 'speaking' || t.skill_kind === 'phoneme') {
      s += g.supports_speaking ? 0.3 : -0.2;
    }
  } else {
    s += 0.2; // baseline for free-play
  }

  // engagement boost: low momentum → prefer foundational
  const eng = args.intelligence?.engagement_state.momentum;
  if (eng === 'low' && g.category === 'foundational') s += 0.15;
  if (eng === 'high' && g.category === 'communication') s += 0.1;

  return s;
}

function educationalValue(g: ArcadeGameMeta, t: ReinforcementTarget | null): number {
  let v = 0.5;
  if (g.supports_speaking) v += 0.15;            // production > reception
  if (g.category === 'review') v += 0.1;
  if (g.category === 'communication') v += 0.15;
  if (t) v += 0.1;                                // lesson-bound > generic
  if (t && t.source === 'mastery_gap') v += 0.05;
  return Math.min(1, v);
}

export function selectGames(args: SelectArgs): GameSpec[] {
  const profile = ARCADE_HUB_PROFILES[args.hub];
  const used = new Set(args.excludeIds ?? []);
  const targets = args.includeStandalone && args.targets.length === 0
    ? [null as ReinforcementTarget | null]
    : args.targets;

  const candidates: { game: ArcadeGameMeta; t: ReinforcementTarget | null; score: number }[] = [];
  for (const t of targets) {
    for (const g of ARCADE_GAMES) {
      if (used.has(g.id)) continue;
      const score = fitScore(g, args, t);
      if (score < 0) continue;
      candidates.push({ game: g, t, score });
    }
  }
  // Deterministic ordering: score desc, then id asc, then target id asc
  candidates.sort((a, b) =>
    b.score - a.score ||
    a.game.id.localeCompare(b.game.id) ||
    (a.t?.id ?? '').localeCompare(b.t?.id ?? ''),
  );

  const picked: GameSpec[] = [];
  const seenGameIds = new Set<string>();
  let speakingCount = 0;
  let totalSeconds = 0;
  const capSeconds = profile.max_minutes_per_lesson * 60;
  const capGames = profile.max_games_per_lesson;

  for (const c of candidates) {
    if (picked.length >= capGames) break;
    if (seenGameIds.has(c.game.id)) continue; // no duplicates same lesson
    const shaped = shape({ intelligence: args.intelligence, target: c.t }, c.game.ceiling_seconds);
    if (totalSeconds + shaped.est_seconds > capSeconds) continue;
    const characters = bindCharacters(args.intelligence, c.game.character_slots);
    const spec: GameSpec = {
      spec_id: `arcade_${c.game.id}_${c.t?.id ?? 'free'}`,
      game: c.game,
      target: c.t,
      difficulty_tier: shaped.difficulty_tier,
      scaffolding_boost: shaped.scaffolding_boost,
      est_seconds: shaped.est_seconds,
      is_boss: shaped.is_boss,
      characters,
      educational_value: educationalValue(c.game, c.t),
    };
    picked.push(spec);
    seenGameIds.add(c.game.id);
    totalSeconds += shaped.est_seconds;
    if (c.game.supports_speaking) speakingCount += 1;
  }

  // Speaking floor: replace lowest-value non-speaking pick with a speaking-capable one.
  while (speakingCount < profile.speaking_floor) {
    const replaceIdx = picked.findIndex((p) => !p.game.supports_speaking);
    if (replaceIdx < 0) break;
    const replacement = candidates.find(
      (c) => c.game.supports_speaking && !picked.some((p) => p.game.id === c.game.id),
    );
    if (!replacement) break;
    const shaped = shape(
      { intelligence: args.intelligence, target: replacement.t },
      replacement.game.ceiling_seconds,
    );
    picked[replaceIdx] = {
      spec_id: `arcade_${replacement.game.id}_${replacement.t?.id ?? 'free'}`,
      game: replacement.game,
      target: replacement.t,
      difficulty_tier: shaped.difficulty_tier,
      scaffolding_boost: shaped.scaffolding_boost,
      est_seconds: shaped.est_seconds,
      is_boss: shaped.is_boss,
      characters: bindCharacters(args.intelligence, replacement.game.character_slots),
      educational_value: educationalValue(replacement.game, replacement.t),
    };
    speakingCount += 1;
  }

  return picked;
}
