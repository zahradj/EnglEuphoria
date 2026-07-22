// Grammar hub profiles — pedagogical register & constraints per hub.

import type { DrillType } from './types';
import type { Hub } from '@/governance/types';

export interface GrammarHubProfile {
  hub: Hub;
  explanationDepth: 'implicit' | 'explicit_engaging' | 'concise_practical';
  metalanguageAllowed: boolean;
  drillMix: DrillType[];
  minDrillCount: number;
  speakingDrillMin: number;
  productionContexts: string[];
  visualMode: 'animated_cues' | 'highlighted_forms' | 'clean_cards';
  forbidden: string[];
}

export const GRAMMAR_HUB_PROFILES: Record<Hub, GrammarHubProfile> = {
  playground: {
    hub: 'playground',
    explanationDepth: 'implicit',
    metalanguageAllowed: false,
    drillMix: ['repetition', 'substitution', 'speaking', 'pron_linked'],
    minDrillCount: 3,
    speakingDrillMin: 1,
    productionContexts: ['roleplay', 'song_frame', 'sentence_frame', 'mini_game'],
    visualMode: 'animated_cues',
    forbidden: ['error_correction', 'fast_recognition'],
  },
  academy: {
    hub: 'academy',
    explanationDepth: 'explicit_engaging',
    metalanguageAllowed: true,
    drillMix: [
      'repetition',
      'transformation',
      'negative_conversion',
      'question_conversion',
      'substitution',
      'completion',
      'error_correction',
      'fast_recognition',
      'speaking',
      'pron_linked',
    ],
    minDrillCount: 6,
    speakingDrillMin: 2,
    productionContexts: ['speaking_mission', 'structured_dialogue', 'teen_topic_chat'],
    visualMode: 'highlighted_forms',
    forbidden: [],
  },
  success: {
    hub: 'success',
    explanationDepth: 'concise_practical',
    metalanguageAllowed: true,
    drillMix: [
      'transformation',
      'completion',
      'error_correction',
      'fast_recognition',
      'speaking',
      'pron_linked',
    ],
    minDrillCount: 6,
    speakingDrillMin: 2,
    productionContexts: ['meeting_roleplay', 'interview', 'email_rewrite', 'negotiation', 'presentation'],
    visualMode: 'clean_cards',
    forbidden: ['childish', 'cartoon'],
  },
};
