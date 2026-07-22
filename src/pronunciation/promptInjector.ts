// Pronunciation prompt prefix — chained AFTER planner + governance prompts,
// BEFORE the per-activity prompt, when a pronunciation layer is active.

import { PRONUNCIATION_HUB_PROFILES } from './hubProfiles';
import { CEFR_PRON_PROFILES } from './data/cefrPronProfiles';
import type { LessonPlan } from '@/planning/types';
import type { PronunciationFocus, PronunciationLayer } from './types';

export interface PronPromptOpts {
  plan: LessonPlan;
  focus: PronunciationFocus;
  activeLayers: PronunciationLayer[];
}

export function buildPronunciationSystemPrompt(opts: PronPromptOpts): string {
  const { plan, focus, activeLayers } = opts;
  const hub = plan.lesson_state.hub;
  const cefr = plan.lesson_state.cefr;
  const hubProfile = PRONUNCIATION_HUB_PROFILES[hub];
  const cefrProfile = CEFR_PRON_PROFILES[cefr];

  const lines: string[] = [];
  lines.push('## PRONUNCIATION CONTRACT (binding)');
  lines.push(`Active layers: ${activeLayers.join(', ') || '(none)'}`);
  lines.push(`Hub: ${hub} (tone: ${hubProfile.tone}, IPA: ${hubProfile.use_ipa})`);
  lines.push(`CEFR emphasis: ${cefrProfile.emphasis.join(' · ')}`);
  lines.push('');
  lines.push(`Pronunciation focus: ${focus.pronunciation_focus}`);
  if (focus.target_sounds.length) lines.push(`Target sounds: ${focus.target_sounds.join(' ')}`);
  if (focus.stress_patterns.length) lines.push(`Stress patterns: ${focus.stress_patterns.join(' · ')}`);
  if (focus.intonation_patterns.length) lines.push(`Intonation: ${focus.intonation_patterns.join(' · ')}`);
  if (focus.connected_speech_targets.length) lines.push(`Connected speech: ${focus.connected_speech_targets.join(' · ')}`);
  if (focus.common_pronunciation_errors.length) lines.push(`Common errors to address: ${focus.common_pronunciation_errors.join(' · ')}`);
  lines.push('');
  lines.push('### Hard rules');
  lines.push('1. Pronunciation MUST support the lesson communication goal — no isolated meaningless drills.');
  lines.push('2. Use vocabulary and sentences already from the lesson scope; do NOT invent unrelated example words.');
  lines.push(`3. Banned activity types for this hub: ${hubProfile.banned_activities.join(', ') || '(none)'}.`);
  lines.push(`4. Preferred activity types: ${hubProfile.preferred_activities.join(', ')}.`);
  lines.push(`5. IPA usage: ${hubProfile.use_ipa === 'minimal' ? 'AVOID raw IPA — use plain spelling and audio.' : hubProfile.use_ipa === 'expected' ? 'IPA is expected alongside spelling.' : 'IPA is optional and only when it clarifies meaning.'}`);
  lines.push('6. Keep pronunciation moments lightweight — never derail the lesson flow.');
  lines.push('');
  return lines.join('\n');
}
