// Per-hub configuration consumed by the Unified Lesson Generator.
// Three creators (Playground, Academy, Success) — same pipeline,
// different config. Nothing here generates content; this only declares
// the hub-shaped knobs the orchestrator + slide compiler honor.

import type { Hub } from '@/governance/types';

export type Tone = 'playful' | 'modern' | 'professional';
export type CognitiveLoad = 'low' | 'medium-high' | 'high';
export type SentenceLength = 'very_short' | 'medium' | 'natural';
export type GrammarMode = 'implicit' | 'explicit_contextual' | 'explicit_applied';
export type PhonicsPriority = 'very_high' | 'integrated' | 'fluency_only';
export type SlideAesthetic = 'colorful_minimal_text' | 'interactive_structured' | 'clean_business';

export interface HubCreatorConfig {
  hub: Hub;
  ageBand: '4-9' | '10-17' | 'adults';
  tone: Tone;
  cognitiveLoad: CognitiveLoad;
  sentenceLength: SentenceLength;
  grammar: GrammarMode;
  phonicsPriority: PhonicsPriority;
  visualDependency: 'very_high' | 'high' | 'medium';
  slideAesthetic: SlideAesthetic;
  /** Speaking task style. */
  productionStyle: 'storytelling_game' | 'challenge_task' | 'real_world_task';
  defaultCefr: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  /** UX/brand label shown in the creator. */
  label: string;
  /** Hub-branded accent token name. */
  accentToken: string;
}

export const HUB_CONFIGS: Record<Hub, HubCreatorConfig> = {
  playground: {
    hub: 'playground',
    ageBand: '4-9',
    tone: 'playful',
    cognitiveLoad: 'low',
    sentenceLength: 'very_short',
    grammar: 'implicit',
    phonicsPriority: 'very_high',
    visualDependency: 'very_high',
    slideAesthetic: 'colorful_minimal_text',
    productionStyle: 'storytelling_game',
    defaultCefr: 'A1',
    label: 'Playground Creator (4–9)',
    accentToken: 'playground',
  },
  academy: {
    hub: 'academy',
    ageBand: '10-17',
    tone: 'modern',
    cognitiveLoad: 'medium-high',
    sentenceLength: 'medium',
    grammar: 'explicit_contextual',
    phonicsPriority: 'integrated',
    visualDependency: 'high',
    slideAesthetic: 'interactive_structured',
    productionStyle: 'challenge_task',
    defaultCefr: 'B1',
    label: 'Academy Creator (10–17)',
    accentToken: 'academy',
  },
  success: {
    hub: 'success',
    ageBand: 'adults',
    tone: 'professional',
    cognitiveLoad: 'high',
    sentenceLength: 'natural',
    grammar: 'explicit_applied',
    phonicsPriority: 'fluency_only',
    visualDependency: 'medium',
    slideAesthetic: 'clean_business',
    productionStyle: 'real_world_task',
    defaultCefr: 'B2',
    label: 'Success Creator (Adults)',
    accentToken: 'success',
  },
};

export function getHubConfig(hub: Hub): HubCreatorConfig {
  return HUB_CONFIGS[hub];
}
