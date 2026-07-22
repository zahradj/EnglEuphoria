// Builds a LessonBlueprint from a minimal input.
// This is the FIRST step before any activity generation.

import type { Cefr, Hub } from '@/governance/types';
import { HUB_PLANNING_PROFILES } from './hubProfiles';
import type { LessonBlueprint } from './types';

export interface BlueprintInput {
  hub: Hub;
  cefr_level: Cefr;
  lesson_title: string;
  theme: string;
  grammar_focus: string[];
  target_vocab: string[];
  communication_goal: string;
  speaking_goal?: string;
  reading_goal?: string;
  review_targets?: string[];
  unit_theme?: string;
  scene_phrase?: string;
}

export function buildLessonBlueprint(input: BlueprintInput): LessonBlueprint {
  const profile = HUB_PLANNING_PROFILES[input.hub];
  return {
    hub: input.hub,
    cefr_level: input.cefr_level,
    lesson_title: input.lesson_title,
    theme: input.theme,
    grammar_focus: input.grammar_focus,
    target_vocab: input.target_vocab,
    communication_goal: input.communication_goal,
    speaking_goal:
      input.speaking_goal ??
      `Use target language to ${input.communication_goal.toLowerCase()} in a short, supported exchange.`,
    reading_goal:
      input.reading_goal ??
      `Comprehend a short ${profile.default_tone} text using target vocabulary and grammar.`,
    lesson_duration: profile.default_duration,
    emotional_tone: profile.default_tone,
    interaction_style: profile.default_style,
    review_targets: input.review_targets ?? [],
    unit_theme: input.unit_theme?.trim() || undefined,
    scene_phrase: input.scene_phrase?.trim() || undefined,
  };
}
