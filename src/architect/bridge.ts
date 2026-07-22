// Thin bridge used by the three Hub Creators (Playground / Academy / Success).
// Optionally calls the Expert Curriculum Architect *before* the deterministic
// slide generator runs, so the generator receives a pedagogically tightened
// seed (title, theme, vocab, grammar, goal, review targets).
//
// Failure mode: returns the original seed untouched. Zero regression risk —
// existing creators keep working if the architect edge function is unavailable.

import { runExpertArchitect } from './index';
import type { ArchitectInput, ArchitectOverrides, ArchitectResult } from './types';
import type { Hub, Cefr } from '@/governance/types';

export interface CreatorArchitectSeed {
  topic: string;
  vocabulary: string[];
  grammar: string;
  learning_objective?: string;
  final_output_task?: string;
  interests?: string;
  specific_needs?: string;
  visual_theme?: string;
  completedUnits?: number;
}

export interface CreatorArchitectOutput {
  overrides: ArchitectOverrides | null;
  result: ArchitectResult | null;
}

/** Maps the workspace hub keys to the governance Hub enum. */
function normalizeHub(hub: string): Hub {
  const v = hub.toLowerCase();
  if (v === 'playground') return 'playground' as Hub;
  if (v === 'academy') return 'academy' as Hub;
  return 'success' as Hub;
}

function normalizeCefr(level: string): Cefr {
  const v = (level || '').toUpperCase().trim();
  if (/^(PRE-?A1|A0)$/.test(v)) return 'Pre-A1' as Cefr;
  if (/^(A1|A2|B1|B2|C1|C2)$/.test(v)) return v as Cefr;
  return 'A1' as Cefr;
}

/**
 * Run the Architect against a creator seed. Safe to call from any hub creator.
 * Returns `{overrides: null}` if the architect is unavailable or errors out.
 */
export async function runCreatorArchitect(
  hubKey: 'playground' | 'academy' | 'success',
  cefrLevel: string,
  seed: CreatorArchitectSeed,
): Promise<CreatorArchitectOutput> {
  const input: ArchitectInput = {
    hub: normalizeHub(hubKey),
    cefr: normalizeCefr(cefrLevel),
    lessonRef: `creator:${hubKey}:${Date.now()}`,
    completedUnits: seed.completedUnits,
    seed: {
      title: seed.topic,
      theme: seed.visual_theme || seed.topic,
      grammarFocus: seed.grammar ? [seed.grammar] : [],
      targetVocab: seed.vocabulary || [],
      communicationGoal: seed.learning_objective || seed.final_output_task,
    },
    context: {
      analyticsHints: [
        seed.interests ? `interests:${seed.interests}` : '',
        seed.specific_needs ? `needs:${seed.specific_needs}` : '',
      ].filter(Boolean),
    },
  };

  try {
    const result = await runExpertArchitect(input);
    if (!result || result.status === 'fallback') return { overrides: null, result };
    return { overrides: result.overrides, result };
  } catch (e) {
    console.warn('[architect.bridge] failed', e);
    return { overrides: null, result: null };
  }
}

/**
 * Merges architect overrides into the payload accepted by the
 * `generate-ppp-slides` edge function.
 */
export function applyArchitectOverridesToPayload<T extends Record<string, any>>(
  basePayload: T,
  overrides: ArchitectOverrides | null,
): T {
  if (!overrides) return basePayload;
  const merged: any = { ...basePayload };
  if (overrides.lesson_title) merged.lesson_title = overrides.lesson_title;
  if (overrides.target_vocab?.length) merged.target_vocabulary = overrides.target_vocab;
  if (overrides.grammar_focus?.length) merged.grammar_focus = overrides.grammar_focus.join(', ');
  if (overrides.communication_goal) merged.learning_objective = overrides.communication_goal;
  if (overrides.theme) merged.visual_theme = overrides.theme;
  if (merged.blueprint && typeof merged.blueprint === 'object') {
    merged.blueprint = {
      ...merged.blueprint,
      lesson_title: merged.lesson_title,
      target_vocabulary: merged.target_vocabulary,
      grammar_focus: merged.grammar_focus,
      learning_objective: merged.learning_objective,
      visual_theme: merged.visual_theme,
    };
  }
  merged.architect_enriched = true;
  merged.architect_review_targets = overrides.review_targets ?? [];
  return merged;
}
