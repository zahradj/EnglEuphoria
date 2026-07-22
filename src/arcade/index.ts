// Gamer Arcade — orchestrator entry points.
import type { Hub, Cefr } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import type { CoherenceDecision, ReinforcementTarget } from '@/coherence/types';
import type { ArcadeDecision, ArcadeSource } from './types';
import { selectGames } from './gameSelector';
import { planInjections } from './injectionPlanner';
import { validateArcade } from './validator';

export interface RunArcadeArgs {
  hub: Hub;
  cefr: Cefr;
  studentId: string;
  lessonId?: string;
  intelligence?: LearnerIntelligence;
  coherence?: CoherenceDecision;
  lessonVocab?: string[];
  lessonGrammar?: string[];
  memoryDueCount?: number;
}

const MAX_REPAIRS = 2;

export function runArcade(args: RunArcadeArgs): ArcadeDecision {
  const targets: ReinforcementTarget[] = args.coherence?.targets ?? [];
  const source: ArcadeSource = args.lessonId ? 'lesson_integrated' : 'standalone';

  let specs = selectGames({
    hub: args.hub,
    cefr: args.cefr,
    targets,
    intelligence: args.intelligence,
    includeStandalone: source === 'standalone',
  });
  let report = validateArcade({
    hub: args.hub,
    specs,
    lessonVocab: args.lessonVocab,
    lessonGrammar: args.lessonGrammar,
    memoryDueCount: args.memoryDueCount,
  });

  let repairs = 0;
  while (report.verdict === 'repair' && repairs < MAX_REPAIRS) {
    // Repair = trim lowest-value spec then re-validate.
    const sorted = [...specs].sort((a, b) => a.educational_value - b.educational_value);
    if (sorted.length <= 1) break;
    const drop = sorted[0].spec_id;
    specs = specs.filter((s) => s.spec_id !== drop);
    report = validateArcade({
      hub: args.hub,
      specs,
      lessonVocab: args.lessonVocab,
      lessonGrammar: args.lessonGrammar,
      memoryDueCount: args.memoryDueCount,
    });
    repairs += 1;
  }

  const injections = source === 'lesson_integrated' ? planInjections(specs) : [];

  return {
    hub: args.hub,
    cefr: args.cefr,
    source,
    selected: specs,
    injections,
    report,
    repairs_applied: repairs,
  };
}

/** Standalone arcade entry — used by `/arcade` student surface. */
export function runStandaloneArcade(args: Omit<RunArcadeArgs, 'lessonId' | 'coherence'> & { targets?: ReinforcementTarget[] }): ArcadeDecision {
  return runArcade({
    ...args,
    coherence: args.targets ? ({ targets: args.targets } as CoherenceDecision) : undefined,
  });
}

export type {
  ArcadeDecision,
  ArcadeReport,
  ArcadeIssue,
  ArcadeMode,
  ArcadeSource,
  GameSpec,
  InjectionDecision,
  InjectionSlot,
} from './types';
export { buildArcadeSystemPrompt } from './promptInjector';
export { validateArcade } from './validator';
export { ARCADE_GAMES } from './gameRegistry';
export { ARCADE_HUB_PROFILES } from './hubProfiles';
export { emitArcadeEvents } from './observer';
