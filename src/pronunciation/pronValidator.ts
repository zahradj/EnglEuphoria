// Validates a PronunciationFocus against CEFR + hub rules.
// Reject disconnected drills, phonics overload, hub-banned activity types, etc.

import type { LessonPlan } from '@/planning/types';
import type { Hub, Cefr } from '@/governance/types';
import { PRONUNCIATION_HUB_PROFILES } from './hubProfiles';
import { CEFR_PRON_PROFILES } from './data/cefrPronProfiles';
import type {
  PronunciationActivityType,
  PronunciationFocus,
  PronunciationIssue,
  PronunciationValidationReport,
} from './types';

export interface ValidateFocusOpts {
  focus: PronunciationFocus;
  hub: Hub;
  cefr: Cefr;
}

export function validatePronunciationFocus(opts: ValidateFocusOpts): PronunciationValidationReport {
  const { focus, hub, cefr } = opts;
  const errors: PronunciationIssue[] = [];
  const warnings: PronunciationIssue[] = [];

  const hubProfile = PRONUNCIATION_HUB_PROFILES[hub];
  const cefrProfile = CEFR_PRON_PROFILES[cefr];

  if (!focus.pronunciation_focus || !focus.pronunciation_focus.trim()) {
    errors.push({ code: 'EMPTY_FOCUS', severity: 'error', message: 'pronunciation_focus is required.' });
  }

  if (focus.target_sounds.length > cefrProfile.max_target_sounds_per_lesson) {
    errors.push({
      code: 'PHONICS_OVERLOAD',
      severity: 'error',
      message: `Too many target sounds for ${cefr} (${focus.target_sounds.length} > ${cefrProfile.max_target_sounds_per_lesson}).`,
      field: 'target_sounds',
    });
  }

  if (!cefrProfile.allow_connected_speech && focus.connected_speech_targets.length > 0) {
    errors.push({
      code: 'CONNECTED_SPEECH_TOO_EARLY',
      severity: 'error',
      message: `Connected speech is not appropriate at ${cefr}.`,
      field: 'connected_speech_targets',
    });
  }

  if (!cefrProfile.allow_advanced_intonation) {
    const advanced = focus.intonation_patterns.filter((p) => !/rising|falling/i.test(p));
    if (advanced.length) {
      warnings.push({
        code: 'INTONATION_TOO_ADVANCED',
        severity: 'warning',
        message: `Advanced intonation patterns may be too complex at ${cefr}: ${advanced.join(', ')}`,
        field: 'intonation_patterns',
      });
    }
  }

  // Hub-specific tone checks (e.g., explicit IPA in playground without IPA support).
  if (hubProfile.use_ipa === 'minimal' && focus.target_sounds.length > 2) {
    warnings.push({
      code: 'IPA_HEAVY_FOR_HUB',
      severity: 'warning',
      message: `${hub} learners benefit from minimal IPA — consider chunking target sounds across lessons.`,
      field: 'target_sounds',
    });
  }

  return { passed: errors.length === 0, errors, warnings };
}

export function validateActivityChoice(
  activity: PronunciationActivityType,
  hub: Hub,
): PronunciationValidationReport {
  const errors: PronunciationIssue[] = [];
  const warnings: PronunciationIssue[] = [];
  const profile = PRONUNCIATION_HUB_PROFILES[hub];

  if (profile.banned_activities.includes(activity)) {
    errors.push({
      code: 'ACTIVITY_BANNED_FOR_HUB',
      severity: 'error',
      message: `"${activity}" is banned in the ${hub} hub.`,
    });
  } else if (!profile.preferred_activities.includes(activity)) {
    warnings.push({
      code: 'ACTIVITY_NOT_PREFERRED',
      severity: 'warning',
      message: `"${activity}" is allowed but not preferred in the ${hub} hub.`,
    });
  }

  return { passed: errors.length === 0, errors, warnings };
}

export function validateCommunicativeValue(plan: LessonPlan, focus: PronunciationFocus): PronunciationValidationReport {
  const errors: PronunciationIssue[] = [];
  const warnings: PronunciationIssue[] = [];

  const goal = plan.blueprint.communication_goal?.toLowerCase() ?? '';
  const supports =
    focus.stress_patterns.length > 0 ||
    focus.intonation_patterns.length > 0 ||
    focus.connected_speech_targets.length > 0 ||
    focus.target_sounds.length > 0;

  if (!supports) {
    errors.push({
      code: 'PRON_NOT_COMMUNICATIVE',
      severity: 'error',
      message: 'Pronunciation focus has no concrete targets — must support the lesson communication goal.',
    });
  }

  if (goal && focus.pronunciation_focus && !overlap(goal, focus.pronunciation_focus.toLowerCase())) {
    warnings.push({
      code: 'PRON_FOCUS_DISCONNECTED',
      severity: 'warning',
      message: 'Pronunciation focus has no surface link to the lesson communication goal.',
    });
  }

  return { passed: errors.length === 0, errors, warnings };
}

function overlap(a: string, b: string): boolean {
  const tokensA = new Set(a.split(/\W+/).filter((t) => t.length > 3));
  return [...tokensA].some((t) => b.includes(t));
}
