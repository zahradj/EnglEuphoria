// Hub-specific generation profiles for the Storybook Creator.

import type { Hub } from '@/governance/types';

export interface StorybookHubProfile {
  chapter_count: { min: number; max: number; default: number };
  pages_per_chapter: { min: number; max: number; default: number };
  sentences_per_page: { min: number; max: number };
  vocab_density: number;        // approximate target ratio of target words across pages
  speaking_checkpoints: number; // mandatory per book
  comprehension_pages: number;  // mandatory per book
  vocab_spotlights: number;
  reflection_pages: number;
  audio_register: 'expressive_playful' | 'modern_emotional' | 'natural_professional';
  story_types: string[];
  forbidden_topics: string[];
  voice_style_notes: string;
  reading_register_hint: string;
}

export const STORYBOOK_HUB_PROFILES: Record<Hub, StorybookHubProfile> = {
  playground: {
    chapter_count: { min: 2, max: 4, default: 3 },
    pages_per_chapter: { min: 3, max: 6, default: 4 },
    sentences_per_page: { min: 1, max: 2 },
    vocab_density: 0.45,
    speaking_checkpoints: 3,
    comprehension_pages: 3,
    vocab_spotlights: 4,
    reflection_pages: 1,
    audio_register: 'expressive_playful',
    story_types: ['phonics', 'bedtime', 'emotional', 'visual', 'mini_adventure', 'repetitive_pattern'],
    forbidden_topics: ['violence', 'romance', 'death', 'politics', 'horror', 'alcohol', 'gambling'],
    voice_style_notes: 'Expressive, playful, slightly sing-song. Short sentences with rhythm.',
    reading_register_hint: 'Use repeating phrases, concrete nouns, present simple. No idioms.',
  },
  academy: {
    chapter_count: { min: 3, max: 5, default: 4 },
    pages_per_chapter: { min: 4, max: 7, default: 5 },
    sentences_per_page: { min: 2, max: 4 },
    vocab_density: 0.35,
    speaking_checkpoints: 4,
    comprehension_pages: 4,
    vocab_spotlights: 6,
    reflection_pages: 2,
    audio_register: 'modern_emotional',
    story_types: ['slice_of_life', 'friendship', 'school', 'mystery', 'social', 'growth'],
    forbidden_topics: ['explicit_sexuality', 'drugs', 'graphic_violence', 'politics'],
    voice_style_notes: 'Modern, emotionally honest, contemporary teen voice.',
    reading_register_hint: 'A2-C1 register. Real teen dilemmas. Allow contractions and natural dialogue.',
  },
  success: {
    chapter_count: { min: 3, max: 6, default: 4 },
    pages_per_chapter: { min: 4, max: 8, default: 6 },
    sentences_per_page: { min: 3, max: 5 },
    vocab_density: 0.3,
    speaking_checkpoints: 5,
    comprehension_pages: 5,
    vocab_spotlights: 8,
    reflection_pages: 2,
    audio_register: 'natural_professional',
    story_types: ['workplace', 'travel', 'business', 'negotiation', 'leadership', 'life_experience'],
    forbidden_topics: ['childish_themes', 'fairy_tale_devices'],
    voice_style_notes: 'Natural, professional, realistic adult register.',
    reading_register_hint: 'B1-C1 register. Multi-clause sentences. Real workplace/life situations.',
  },
};

export function getStorybookHubProfile(hub: Hub): StorybookHubProfile {
  return STORYBOOK_HUB_PROFILES[hub];
}
