// Booster lesson catalog — Academy & Success workshops.

import type { BoosterLesson } from '../types';

export const BOOSTER_CATALOG: BoosterLesson[] = [
  {
    id: 'boost_shadowing_academy_b1',
    title: 'Shadowing Practice — Teen Voices',
    hub: 'academy',
    topic: 'shadowing',
    cefr_min: 'A2', cefr_max: 'B2',
    focus: {
      pronunciation_focus: 'Shadowing native-speed teen dialogue',
      target_sounds: [],
      stress_patterns: ['interESting', 'COMfortable'],
      intonation_patterns: ['rising for surprise', 'falling for conclusions'],
      connected_speech_targets: ['wanna', 'gonna', 'gotta'],
      common_pronunciation_errors: ['breaking words at every syllable', 'flat affect'],
    },
  },
  {
    id: 'boost_connected_speech_academy_b1',
    title: 'Connected Speech Workshop',
    hub: 'academy',
    topic: 'connected_speech',
    cefr_min: 'B1', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Linking, elision, weak forms',
      target_sounds: ['/ə/'],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: ['linking C+V', 'schwa in function words', 'elision of /t/ /d/'],
      common_pronunciation_errors: ['stressing every word equally'],
    },
  },
  {
    id: 'boost_rhythm_stress_academy',
    title: 'Rhythm & Stress Training',
    hub: 'academy',
    topic: 'rhythm_stress',
    cefr_min: 'A2', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Sentence rhythm and content-word stress',
      target_sounds: [],
      stress_patterns: ['CONtent vs FUNCtion'],
      intonation_patterns: [],
      connected_speech_targets: [],
      common_pronunciation_errors: ['stressing function words'],
    },
  },
  {
    id: 'boost_public_speaking_success',
    title: 'Public Speaking Pronunciation',
    hub: 'success',
    topic: 'public_speaking',
    cefr_min: 'B1', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Clarity and projection for presentations',
      target_sounds: [],
      stress_patterns: ['imPORtant', 'STRAtegy'],
      intonation_patterns: ['emphatic falling on key terms'],
      connected_speech_targets: [],
      common_pronunciation_errors: ['monotone delivery', 'trailing off'],
    },
  },
  {
    id: 'boost_fast_speech_success',
    title: 'Fast Speech Comprehension',
    hub: 'success',
    topic: 'fast_speech_comprehension',
    cefr_min: 'B1', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Decoding natural-speed input',
      target_sounds: [],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: ['linking', 'reductions', 'contractions'],
      common_pronunciation_errors: ['expecting word-by-word delivery'],
    },
  },
  {
    id: 'boost_presentation_success',
    title: 'Presentation Fluency',
    hub: 'success',
    topic: 'presentation_fluency',
    cefr_min: 'B2', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Pausing, chunking, emphasis',
      target_sounds: [],
      stress_patterns: [],
      intonation_patterns: ['chunking with pause', 'list intonation'],
      connected_speech_targets: [],
      common_pronunciation_errors: ['filler words', 'rushing'],
    },
  },
  {
    id: 'boost_accent_clarity_success',
    title: 'Accent Clarity Coaching',
    hub: 'success',
    topic: 'accent_clarity',
    cefr_min: 'A2', cefr_max: 'C1',
    focus: {
      pronunciation_focus: 'Intelligibility-focused L1-specific drills',
      target_sounds: ['/θ/', '/ð/', '/v/', '/w/'],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: [],
      common_pronunciation_errors: ['L1 substitutions for /θ/ /ð/'],
    },
  },
];

export function boostersForHub(hub: 'academy' | 'success'): BoosterLesson[] {
  return BOOSTER_CATALOG.filter((b) => b.hub === hub);
}
