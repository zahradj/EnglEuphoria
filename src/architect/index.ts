// Expert Lesson Architect — client entry.
//
// Sits ABOVE the existing orchestrator. Produces enriched
// BlueprintOverrides that the deterministic generation pipeline
// (planner → governance → adaptive → memory → grammar →
//  pronunciation → speaking → coherence → arcade → activities →
//  QA → stabilization) consumes as if a master ESL designer had
// hand-tuned them.
//
// Failure mode: ANY error → returns null and the caller falls back
// to the deterministic planner on the raw seed. Zero regression risk.

import { supabase } from '@/integrations/supabase/client';
import type { ArchitectInput, ArchitectResult } from './types';
import { buildBrainPrompt } from './brain';

export * from './types';
export * from './brain';
export { buildArchitectContext } from './contextBuilder';

export async function runExpertArchitect(
  input: ArchitectInput,
): Promise<ArchitectResult | null> {
  try {
    // Auto-compose the embedded curriculum brain for this hub × cefr.
    const brainPrompt =
      input.brainPrompt ??
      buildBrainPrompt({
        hub: input.hub,
        cefr: input.cefr,
        completedUnits: input.completedUnits,
        theme: input.seed?.theme,
        communicationGoal: input.seed?.communicationGoal,
        continuity: {
          seed: input.seed,
          context: input.context,
          studentLevel: input.cefr,
        },
      });

    const { data, error } = await supabase.functions.invoke('architect-lesson-plan', {
      body: { ...input, brainPrompt },
    });
    if (error) {
      console.warn('[architect] edge fn error', error);
      return null;
    }
    if (!data || (data as any).error) {
      console.warn('[architect] edge fn returned error payload', data);
      return null;
    }
    return data as ArchitectResult;
  } catch (e) {
    console.warn('[architect] invocation threw', e);
    return null;
  }
}

/** Whether the Expert Architect is globally enabled.
 *  Now ON by default — every lesson passes through the Curriculum Brain first.
 *  Individual calls may still opt out via the Unified Lesson Generator UI toggle. */
export const ARCHITECT_DEFAULT_ENABLED = true;
