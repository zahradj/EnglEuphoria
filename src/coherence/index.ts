// Game & Homework Coherence Engine — orchestrator entry point.
import type { Cefr, Hub } from '@/governance/types';
import type { LearnerIntelligence } from '@/intelligence/types';
import type { MemoryDecision } from '@/memory';
import type { SpeakingDecision } from '@/speaking';
import type { GrammarPackage } from '@/grammar';
import type { AdaptationContext } from '@/adaptive/types';
import { buildReinforcementTargets } from './reinforcementTargets';
import { buildHomeworkPack } from './homeworkBuilder';
import { buildGamePack } from './gameBuilder';
import { repairCoherence, validateCoherence } from './validator';
import { pinAuthoredHomework, type AuthoredHomeworkInput } from './authoredHomeworkPin';
import { pinAuthoredGamePack, type AuthoredGamePackInput } from './authoredGamePin';
import type { CoherenceDecision } from './types';
import type { RecentEntry } from './dedupLedger';

export interface RunCoherenceArgs {
  hub: Hub;
  cefr: Cefr;
  studentId: string;
  lessonId: string;
  lessonVocab: string[];
  lessonGrammar: string[];
  pronunciationTargets: string[];
  intelligence?: LearnerIntelligence;
  memory?: MemoryDecision | null;
  speaking?: SpeakingDecision;
  grammar?: GrammarPackage | null;
  adaptive?: AdaptationContext;
  homeworkHistory?: RecentEntry[];
  gameHistory?: RecentEntry[];
  /** Tier-6 stabilization nudge — `hub_drift` from prior lesson biases the
   * reinforcement-target scorer against off-hub topics. */
  hubDrift?: boolean;
  /**
   * Teacher-authored homework (Playground Creator). When provided,
   * runCoherence pins these tasks into the HomeworkPack instead of
   * generating one. Tasks are still validated against the lesson vocab/
   * grammar and hub caps — over-cap or novel-content authored packs
   * will surface as hard issues.
   */
  authoredHomework?: AuthoredHomeworkInput;
  /**
   * Teacher-authored game rounds (Playground Creator). When provided,
   * runCoherence pins these into the GamePack instead of generating one.
   * Off-catalog rounds are dropped; boss round auto-appended if omitted.
   */
  authoredGames?: AuthoredGamePackInput;
  /** Backdrop world hint from the unit (e.g. "Space"). Threaded into
   * `buildCoherenceSystemPrompt` so homework + game copy stay in-world
   * ("draw your family in the kitchen…", "count planets on the rocket…"). */
  unitTheme?: string;
  /** Human-friendly scene phrase (e.g. "in a deep-space rocket"). */
  scenePhrase?: string;
}

const MAX_REPAIRS = 2;

export function runCoherence(args: RunCoherenceArgs): CoherenceDecision {
  const targets = buildReinforcementTargets({
    hub: args.hub,
    cefr: args.cefr,
    lessonVocab: args.lessonVocab,
    lessonGrammar: args.lessonGrammar,
    pronunciationTargets: args.pronunciationTargets,
    intelligence: args.intelligence,
    memory: args.memory,
    speaking: args.speaking,
    grammar: args.grammar,
    hubDrift: args.hubDrift,
  });

  // Pin authored homework only when we have reinforcement targets to
  // bind against — otherwise every task would fail `homework_missing_target`.
  let homework = args.authoredHomework && args.authoredHomework.tasks.length && targets.length
    ? pinAuthoredHomework(args.authoredHomework, targets)
    : buildHomeworkPack({
        hub: args.hub,
        studentId: args.studentId,
        lessonId: args.lessonId,
        targets,
        history: args.homeworkHistory,
      });
  let game = args.authoredGames && args.authoredGames.rounds.length && targets.length
    ? pinAuthoredGamePack(args.authoredGames, targets, args.cefr, args.adaptive)
    : buildGamePack({
        hub: args.hub,
        cefr: args.cefr,
        studentId: args.studentId,
        lessonId: args.lessonId,
        targets,
        adaptive: args.adaptive,
        history: args.gameHistory,
      });

  let report = validateCoherence({
    hub: args.hub,
    decision: { homework, game, targets },
    lessonVocab: args.lessonVocab,
    lessonGrammar: args.lessonGrammar,
  });
  let repairs = 0;
  while (report.verdict === 'repair' && repairs < MAX_REPAIRS) {
    const repaired = repairCoherence({ homework, game }, report.issues);
    homework = repaired.homework;
    game = repaired.game;
    report = validateCoherence({
      hub: args.hub,
      decision: { homework, game, targets },
      lessonVocab: args.lessonVocab,
      lessonGrammar: args.lessonGrammar,
    });
    repairs += 1;
  }

  const unit_theme = args.unitTheme?.trim() || undefined;
  const scene_phrase = args.scenePhrase?.trim() || undefined;
  // Propagate the backdrop world onto the packs so downstream runners
  // (HomeworkRunner, GamePlayer) can render the same theme chip.
  if (unit_theme || scene_phrase) {
    homework = { ...homework, unit_theme, scene_phrase };
    game = { ...game, unit_theme, scene_phrase };
  }

  return {
    hub: args.hub,
    cefr: args.cefr,
    targets,
    homework,
    game,
    verdict: report.verdict,
    issues: report.issues,
    repairs_applied: repairs,
    unit_theme,
    scene_phrase,
  };
}

export type { CoherenceDecision, HomeworkPack, GamePack, ReinforcementTarget } from './types';
export { buildCoherenceSystemPrompt } from './promptInjector';
export { validateCoherence } from './validator';
export { pinAuthoredHomework } from './authoredHomeworkPin';
export type { AuthoredHomeworkInput, AuthoredHomeworkTaskInput } from './authoredHomeworkPin';
export { pinAuthoredGamePack } from './authoredGamePin';
export type { AuthoredGamePackInput, AuthoredGameRoundInput } from './authoredGamePin';
