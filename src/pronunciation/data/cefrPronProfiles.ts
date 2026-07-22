// CEFR scaling rules for pronunciation depth.

import type { Cefr } from '@/governance/types';

export interface CefrPronProfile {
  emphasis: string[];
  allow_advanced_intonation: boolean;
  allow_connected_speech: boolean;
  max_target_sounds_per_lesson: number;
}

export const CEFR_PRON_PROFILES: Record<Cefr, CefrPronProfile> = {
  'Pre-A1': {
    emphasis: ['sound awareness', 'confidence building'],
    allow_advanced_intonation: false,
    allow_connected_speech: false,
    max_target_sounds_per_lesson: 2,
  },
  A1: {
    emphasis: ['decoding', 'basic stress', 'confidence building'],
    allow_advanced_intonation: false,
    allow_connected_speech: false,
    max_target_sounds_per_lesson: 3,
  },
  A2: {
    emphasis: ['rhythm', 'simple connected speech', 'clarity'],
    allow_advanced_intonation: false,
    allow_connected_speech: true,
    max_target_sounds_per_lesson: 3,
  },
  B1: {
    emphasis: ['fluency development', 'pronunciation clarity', 'stress'],
    allow_advanced_intonation: true,
    allow_connected_speech: true,
    max_target_sounds_per_lesson: 4,
  },
  B2: {
    emphasis: ['nuanced intonation', 'discourse rhythm', 'connected speech'],
    allow_advanced_intonation: true,
    allow_connected_speech: true,
    max_target_sounds_per_lesson: 5,
  },
  C1: {
    emphasis: ['persuasive speaking', 'presentation fluency', 'advanced connected speech'],
    allow_advanced_intonation: true,
    allow_connected_speech: true,
    max_target_sounds_per_lesson: 6,
  },
};
