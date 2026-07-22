import { HubType, MediaType, AnimationType, ActivityType } from './types';

export interface HubConfig {
  hub: HubType;
  label: string;
  emoji: string;
  tone: string;
  persona: string;
  mediaType: MediaType;
  animations: AnimationType[];
  defaultAnimation: AnimationType;
  permittedActivities: ActivityType[];
  imageStyleSuffix: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    highlight: string;
  };
  vocabularyCount: number;
  mascot?: { name: string; src: string; animation: string };
  forbiddenWords?: string[];
}

export const HUB_CONFIGS: Record<HubType, HubConfig> = {
  playground: {
    hub: 'playground',
    label: '🛝 Playground',
    emoji: '🛝',
    tone: 'Enthusiastic, magical, adventurous. Use fun exclamations and kid-friendly language. Emoji-rich.',
    persona: 'Pip the Penguin is the guide. Enthusiastic, magical, adventurous.',
    mediaType: 'cartoon',
    animations: ['bounce', 'float', 'wiggle'],
    defaultAnimation: 'bounce',
    permittedActivities: ['drag_and_drop_image', 'match_sound_to_picture', 'pop_the_word_bubble'],
    imageStyleSuffix: 'High-quality 3D character illustration, vibrant colors, soft clay textures, isolated on white/transparent background, bubbly pastel gradients, claymation style',
    colorPalette: {
      primary: '#FF9F1C',
      secondary: '#FFBF00',
      accent: '#7c3aed',
      background: '#FFF7ED',
      text: '#1a1a2e',
      highlight: '#fef3c7',
    },
    vocabularyCount: 4,
    mascot: { name: 'pip', src: '/pip-mascot.png', animation: 'bounce' },
  },
  academy: {
    hub: 'academy',
    label: '🏫 The Academy',
    emoji: '🏫',
    tone: 'Relatable, dynamic, hacker-cool. Use modern references, engaging hooks, and trendy language.',
    persona: 'Relatable, dynamic, hacker-cool mentor.',
    mediaType: '3d_render',
    animations: ['glitch', 'slide_fast', 'neon_pulse'],
    defaultAnimation: 'slide_fast',
    permittedActivities: ['fill_in_blanks', 'sentence_unscramble', 'speed_quiz'],
    imageStyleSuffix: 'Digital 3D render, holographic elements, neon lighting, trending artstation style, cyber-retro aesthetic',
    colorPalette: {
      primary: '#6366f1',
      secondary: '#A855F7',
      accent: '#06b6d4',
      background: '#0f172a',
      text: '#e2e8f0',
      highlight: '#1e1b4b',
    },
    vocabularyCount: 5,
  },
  professional: {
    hub: 'professional',
    label: '🏢 The Hub',
    emoji: '🏢',
    tone: 'Executive, concise, high-stakes, corporate. Formal but clear. Business-focused examples.',
    persona: 'Executive coach. Concise, high-stakes, no fluff.',
    mediaType: 'real_photography',
    animations: ['none'],
    defaultAnimation: 'none',
    permittedActivities: ['case_study_analysis', 'business_email_reply', 'vocabulary_expansion'],
    imageStyleSuffix: 'Hyper-realistic professional photography, cinematic lighting, corporate setting, 8k resolution, realistic textures, minimalist',
    colorPalette: {
      primary: '#059669',
      secondary: '#0d9488',
      accent: '#1e293b',
      background: '#f8fafc',
      text: '#1e293b',
      highlight: '#ecfdf5',
    },
    vocabularyCount: 5,
    forbiddenWords: ['fun', 'awesome', 'cool', 'amazing', 'yay'],
  },
};

export function resolveHub(ageGroup: string): HubType {
  switch (ageGroup) {
    case 'kids': return 'playground';
    case 'teens': return 'academy';
    case 'adults': return 'professional';
    default: return 'playground';
  }
}
