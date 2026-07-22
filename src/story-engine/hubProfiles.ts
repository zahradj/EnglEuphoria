import type { Hub } from './types';

export interface StoryHubProfile {
  max_nodes: number;
  choices_per_node: 2 | 3;
  narration_max_sentences: number;
  allow_free_text: boolean;
}

export const STORY_HUB_PROFILES: Record<Hub, StoryHubProfile> = {
  playground: { max_nodes: 4, choices_per_node: 2, narration_max_sentences: 2, allow_free_text: false },
  academy:    { max_nodes: 6, choices_per_node: 3, narration_max_sentences: 3, allow_free_text: false },
  success:    { max_nodes: 6, choices_per_node: 3, narration_max_sentences: 4, allow_free_text: true  },
};
