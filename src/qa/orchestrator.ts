import type { QADomain, QADomainScore, QAIssue, QALesson, QAReport, QAVerdict } from './types';
import { validateAcademicQuality } from './validators/academicQuality';
import { validateCefrAccuracy } from './validators/cefrAccuracy';
import { validateAgeAppropriateness } from './validators/ageAppropriateness';
import { validateEmotionalSafety } from './validators/emotionalSafety';
import { validateGrammarLanguage } from './validators/grammarLanguage';
import { validateActivityQuality } from './validators/activityQuality';
import { validateNarrativeConsistency } from './validators/narrativeConsistency';
import { validateJsonStructural } from './validators/jsonStructural';
import { validateDuplicateDetection } from './validators/duplicateDetection';
import { validateCambridgePedagogy } from './validators/cambridgePedagogy';
import { validateJsonIntegrity } from './validators/jsonIntegrity';
import { validateVocabCardSchema } from './validators/vocabCardSchema';
import { validateVocabSequencing } from './validators/vocabSequencing';
import { validateTopicImmersion } from './validators/topicImmersion';
import { validateThemeDrift } from './validators/themeDrift';
import { validateImageIntegrity } from './validators/imageIntegrity';
import { validateImagePromptContract } from './validators/imagePromptContract';
import { validateWarmupLyricImage } from './validators/warmupLyricImage';
import { validateMultiAnswerSchema } from './validators/multiAnswerSchema';
import { validateIntroSlide } from './validators/introSlide';
import { validateMotionMascotContract } from './validators/motionMascotContract';
import { validateVocabGamificationArc } from './validators/vocabGamificationArc';
import { validateStoryContinuity } from './validators/storyContinuity';
import { validateStorybookArc } from './validators/storybookArc';
import { validateVocabConsistency } from './validators/vocabConsistency';
import { validateReportedSpeechBackshift } from './validators/reportedSpeechBackshift';
import { validatePollShape } from './validators/pollShape';
import { validateEdPronunciation } from './validators/edPronunciation';
import { validateImagePromptComplexity } from './validators/imagePromptComplexity';
import { validateActivityMetadata } from './validators/activityMetadata';
import { validatePhonicsGate } from './validators/phonicsGate';
import { validateVocabBandLevel } from './validators/vocabBandLevel';
import { validateLessonKindContract } from './validators/lessonKindContract';
import { validateEngineSlot } from './validators/engineSlot';
import { validatePrea1BlueprintQA } from './validators/prea1Blueprint';
import { validateA1BlueprintQA } from './validators/a1Blueprint';
import { validateEsaChunks } from './validators/esaChunks';
import { validateArchitectPipeline } from './validators/architectPipeline';
import {
  validateEarlyLearnerTextDensity,
  validateEarlyLearnerVisualOptions,
  validateEarlyLearnerVoice,
  validateEarlyLearnerAbstractPrompts,
} from './validators/earlyLearner';
import {
  validateDefinitionConcreteness,
  validateLowTextDensity,
  validateSpeakingFloor,
  validatePlaygroundActivityBalance,
  validateMascotVisualRepeat,
} from '@/playground';
import { allText, hashContent } from './util/text';

const ALL_DOMAINS: QADomain[] = [
  'academic', 'cefr', 'age', 'safety', 'language',
  'activity', 'narrative', 'structural', 'hallucination', 'duplicate',
];

/**
 * Synchronous orchestrator: runs all deterministic validators.
 * The hallucination AI-judge runs separately via `runHallucinationJudge()`
 * and its issues can be merged via `mergeJudgeIssues()`.
 */
export function runDeterministicQA(lesson: QALesson): QAReport {
  // Strict JSON guard runs FIRST — if it blocks, skip downstream validators
  // so we never crash on malformed input.
  const integrity = validateJsonIntegrity(lesson);
  if (integrity.some((i) => i.severity === 'block' && i.code === 'JSON_LESSON_MALFORMED')) {
    return finalize(lesson, integrity);
  }

  const issues: QAIssue[] = [
    ...integrity,
    ...validateJsonStructural(lesson),
    ...validateIntroSlide(lesson),
    ...validateMotionMascotContract(lesson),
    ...validateVocabGamificationArc(lesson),
    ...validateEngineSlot(lesson),
    ...validateStoryContinuity(lesson),
    ...validateStorybookArc(lesson),
    ...validateVocabCardSchema(lesson),
    ...validateVocabSequencing(lesson),
    ...validateTopicImmersion(lesson),
    ...validateThemeDrift(lesson),
    ...validateImageIntegrity(lesson),
    ...validateImagePromptContract(lesson),
    ...validateWarmupLyricImage(lesson),
    ...validateMultiAnswerSchema(lesson),
    ...validateAcademicQuality(lesson),
    ...validateCefrAccuracy(lesson),
    ...validateAgeAppropriateness(lesson),
    ...validateEmotionalSafety(lesson),
    ...validateGrammarLanguage(lesson),
    ...validateActivityQuality(lesson),
    ...validateNarrativeConsistency(lesson),
    ...validateDuplicateDetection(lesson),
    ...validateCambridgePedagogy(lesson),
    ...validateVocabConsistency(lesson),
    ...validateReportedSpeechBackshift(lesson),
    ...validatePollShape(lesson),
    ...validateEdPronunciation(lesson),
    ...validateImagePromptComplexity(lesson),
    ...validateActivityMetadata(lesson),
    ...validatePhonicsGate(lesson),
    ...validateVocabBandLevel(lesson),
    ...validateLessonKindContract(lesson),
    // Early Learner Mode gates — Playground (all levels) + Academy ≤A1
    ...validateEarlyLearnerTextDensity(lesson),
    ...validateEarlyLearnerVisualOptions(lesson),
    ...validateEarlyLearnerVoice(lesson),
    ...validateEarlyLearnerAbstractPrompts(lesson),
    // Playground-only pedagogy gates (no-op for Academy/Success)
    ...validateDefinitionConcreteness(lesson),
    ...validateLowTextDensity(lesson),
    ...validateSpeakingFloor(lesson),
    ...validatePlaygroundActivityBalance(lesson),
    ...validateMascotVisualRepeat(lesson),
    // Pre-A1 non-reader blueprint gate (HARD)
    ...validatePrea1BlueprintQA(lesson),
    // A1 early-reader blueprint gate (HARD, Playground only)
    ...validateA1BlueprintQA(lesson),
    // Playground ESA + lexical chunks gate (HARD, Wave 2)
    ...validateEsaChunks(lesson),
    // Architect 8-brain pipeline gate (HARD)
    ...validateArchitectPipeline(lesson),
  ];

  return finalize(lesson, issues);
}

export function mergeJudgeIssues(report: QAReport, judgeIssues: QAIssue[], lesson: QALesson): QAReport {
  return finalize(lesson, [...report.issues, ...judgeIssues]);
}

function finalize(lesson: QALesson, issues: QAIssue[]): QAReport {
  const scorecard = buildScorecard(issues);
  const verdict = deriveVerdict(issues);
  return {
    verdict,
    issues,
    scorecard,
    generated_at: new Date().toISOString(),
    content_hash: hashContent(allText(lesson)),
  };
}

function buildScorecard(issues: QAIssue[]): Record<QADomain, QADomainScore> {
  const out = {} as Record<QADomain, QADomainScore>;
  for (const d of ALL_DOMAINS) {
    const inDomain = issues.filter((i) => i.domain === d);
    const blockers = inDomain.filter((i) => i.severity === 'block').length;
    const warns = inDomain.filter((i) => i.severity === 'warn').length;
    const score = Math.max(0, 100 - blockers * 40 - warns * 10);
    out[d] = { score, passing: blockers === 0 };
  }
  return out;
}

function deriveVerdict(issues: QAIssue[]): QAVerdict {
  const blocks = issues.filter((i) => i.severity === 'block');
  if (blocks.length === 0) return 'publish';

  const unrepairable = blocks.some((i) => !i.auto_repairable);
  const safetyBlock = blocks.some((i) => i.domain === 'safety');
  const hallucinationBlock = blocks.some((i) => i.domain === 'hallucination' && !i.auto_repairable);

  if (safetyBlock || unrepairable || hallucinationBlock) return 'block';
  return 'repair';
}
