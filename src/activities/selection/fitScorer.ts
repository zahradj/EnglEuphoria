// Deterministic scoring of catalog entries against a stage slot + context.

import type { Cefr } from '@/governance/types';
import { ACTIVITY_CATALOG } from '../catalog/activityCatalog';
import { isAnalyticalLocked } from '../catalog/activityAnnotations';
import { HUB_ACTIVITY_PROFILES } from '../catalog/hubActivityProfiles';
import { PREA1_FORBIDDEN_ACTIVITIES } from '@/planning/prea1Blueprint';
import { isA1Forbidden } from '@/planning/a1Blueprint';
import type {
  ActivityCatalogEntry,
  ActivitySpec,
  ActivityType,
  GenerationContext,
} from '../types';
import type { PedagogicalStageSpec } from '@/planning/types';

const CEFR_ORDER: Cefr[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
const cefrIdx = (c: Cefr) => CEFR_ORDER.indexOf(c);

function cefrInRange(target: Cefr, entry: ActivityCatalogEntry): boolean {
  const t = cefrIdx(target);
  return t >= cefrIdx(entry.min_cefr) && t <= cefrIdx(entry.max_cefr);
}

export interface ScoreBreakdown {
  type: ActivityType;
  score: number;
  rejected: boolean;
  reason?: string;
}

export function scoreActivity(
  entry: ActivityCatalogEntry,
  stageSpec: PedagogicalStageSpec,
  ctx: GenerationContext,
): ScoreBreakdown {
  const hub = ctx.state.hub;
  const cefr = ctx.state.cefr;
  const profile = HUB_ACTIVITY_PROFILES[hub];

  if (profile.banned.includes(entry.type)) {
    return { type: entry.type, score: -Infinity, rejected: true, reason: 'hub_banned' };
  }

  // Early-reader gate for phonics-system activities. Playground always allowed;
  // Academy/Success restricted to Pre-A1 / A1 (avoids juvenile content for older learners).
  const PHONICS_SYSTEM_TYPES = [
    'phonics_card', 'phoneme_isolation', 'blending_animation',
    'minimal_pair_tap', 'grapheme_hunt', 'decoding_probe',
  ] as const;
  if ((PHONICS_SYSTEM_TYPES as readonly string[]).includes(entry.type) && hub !== 'playground') {
    const earlyReader = cefr === 'Pre-A1' || cefr === 'A1';
    if (!earlyReader) {
      return { type: entry.type, score: -Infinity, rejected: true, reason: 'phonics_not_early_reader' };
    }
  }
  // Cycle 4 — hard lockout: analytical activities are forbidden ≤ A1 regardless of hub.
  if (isAnalyticalLocked(entry.type, cefr)) {
    return { type: entry.type, score: -Infinity, rejected: true, reason: 'analytical_locked_below_a2' };
  }
  // Pre-A1 non-reader gate — reading-dependent activities are forbidden at Pre-A1
  // regardless of hub. Mirrors validatePrea1BlueprintQA.
  if (cefr === 'Pre-A1' && (PREA1_FORBIDDEN_ACTIVITIES as readonly string[]).includes(entry.type)) {
    return { type: entry.type, score: -Infinity, rejected: true, reason: 'prea1_non_reader_forbidden' };
  }
  // A1 early-reader gate (Playground only) — forbidden types + writing gate.
  if (cefr === 'A1' && hub === 'playground') {
    const lessonNumber = (ctx.plan as any)?.blueprint?.lesson_number;
    if (isA1Forbidden(entry.type, lessonNumber)) {
      return { type: entry.type, score: -Infinity, rejected: true, reason: 'a1_early_reader_forbidden' };
    }
  }
  if (!cefrInRange(cefr, entry)) {
    return { type: entry.type, score: -Infinity, rejected: true, reason: 'cefr_out_of_range' };
  }
  if (!entry.fits_stages.includes(stageSpec.stage)) {
    return { type: entry.type, score: -Infinity, rejected: true, reason: 'stage_mismatch' };
  }

  let score = 0;
  score += 4; // base stage fit
  score += entry.hub_fit[hub] * 3;
  if (profile.preferred.includes(entry.type)) score += 1.5;

  // Anti-repetition: decayed penalty on recency + full-plan usage cap.
  const recent = ctx.previous.slice(-3);
  const decayWeights = [3.5, 2, 1]; // most-recent → older
  for (let i = 0; i < recent.length; i++) {
    const back = recent[recent.length - 1 - i];
    if (back?.type === entry.type) score -= decayWeights[i] ?? 0.5;
  }
  // Full-plan overuse: if this type already appears ≥2× anywhere in the plan, hit hard.
  const totalUses = ctx.previous.filter((a) => a.type === entry.type).length;
  if (totalUses >= 2) score -= 4;

  // Anti-fatigue: penalize same dominant modality streak.
  const lastModalities = recent.flatMap((a) => a.modalities);
  const overlap = entry.modalities.filter((m) => lastModalities.includes(m)).length;
  score -= overlap * 0.4;

  // Cognitive load budget vs planner max_consecutive_high_load.
  if (entry.load === 'high') {
    const highStreak = recent.filter((a) => a.estimated_load === 'high').length;
    if (highStreak >= profile.max_consecutive_high_load) score -= 3;
  }

  // Vocab recycling debt: reward productive types when debt is high.
  const debt = vocabDebt(ctx);
  if (debt > 0 && entry.productive) score += Math.min(debt, 3);

  // Speaking cadence: if planner says speaking_every_n and we've drifted, boost speaking types.
  const speakingEveryN = ctx.plan.cognitive_load.speaking_every_n_slides;
  if (entry.modalities.includes('speaking')) {
    const sinceSpeaking = sinceLastSpeaking(ctx.previous);
    if (sinceSpeaking >= speakingEveryN) score += 2;
  }

  // Modality target alignment with stage spec.
  const modalityAlign = entry.modalities.filter((m) => stageSpec.modalities.includes(m)).length;
  score += modalityAlign * 0.6;

  // ── Intelligence-aware boosts (tier 6 soft) ─────────────────────
  const hint = ctx.intelligence;
  if (hint) {
    // Mastery gaps: boost types that train weak skills.
    if (hint.mastery) {
      for (const m of entry.modalities) {
        const skill =
          m === 'speaking' ? 'speaking' :
          m === 'listening' ? 'listening' :
          m === 'reading' ? 'reading' :
          m === 'writing' ? 'writing' :
          null;
        if (skill && hint.mastery[skill as keyof typeof hint.mastery] != null) {
          const gap = 1 - (hint.mastery[skill as keyof typeof hint.mastery] ?? 1);
          score += gap * 1.5; // up to +1.5 per weak modality
        }
      }
    }
    // Vocab review debt → boost vocab-recycling board.
    if ((hint.memory_due_count ?? 0) >= 3 && entry.type === 'vocab_match_board') {
      score += 2.5;
    }
    // Low speaking confidence → boost low-rung speaking types.
    if ((hint.speaking_confidence ?? 1) < 0.5 &&
        entry.modalities.includes('speaking') &&
        ['echo_repetition', 'pronunciation', 'dialogue_completion', 'speaking_mission'].includes(entry.type)) {
      score += 1.8;
    }
    // Low engagement → boost playful/visual types.
    if ((hint.engagement ?? 1) < 0.5 &&
        ['vocab_match_board', 'hotspot', 'drag_drop', 'matching', 'storytelling', 'interactive_story'].includes(entry.type)) {
      score += 1.2;
    }
    // Recent grammar errors → boost grammar-correction types.
    if (hint.recent_error_tags?.some((t) => t.startsWith('grammar:')) &&
        ['tense_transform', 'substitution_drill', 'fill_blank', 'sentence_builder'].includes(entry.type)) {
      score += 1.5;
    }
  }

  return { type: entry.type, score, rejected: false };
}

function vocabDebt(ctx: GenerationContext): number {
  const targets = ctx.plan.blueprint.target_vocab;
  if (!targets.length) return 0;
  let debt = 0;
  for (const w of targets) {
    const seen = ctx.vocabAppearances[w] ?? 0;
    if (seen < 3) debt += (3 - seen) * 0.5;
  }
  return debt;
}

function sinceLastSpeaking(previous: ActivitySpec[]): number {
  for (let i = previous.length - 1; i >= 0; i--) {
    if (previous[i].modalities.includes('speaking')) return previous.length - 1 - i;
  }
  return previous.length;
}

export function rankForStage(
  stageSpec: PedagogicalStageSpec,
  ctx: GenerationContext,
): ScoreBreakdown[] {
  return Object.values(ACTIVITY_CATALOG)
    .map((e) => scoreActivity(e, stageSpec, ctx))
    .sort((a, b) => b.score - a.score);
}
