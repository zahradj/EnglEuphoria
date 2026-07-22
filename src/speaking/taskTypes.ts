// Catalog of speaking task types with rung suitability + register.

import type { SpeakingTaskType, SpeakingRung } from './types';
import type { Hub } from '@/governance/types';

export interface TaskMeta {
  type: SpeakingTaskType;
  suitable_rungs: SpeakingRung[];
  hubs: Hub[];
  duration_s: number;
  description: string;
}

export const TASK_CATALOG: Record<SpeakingTaskType, TaskMeta> = {
  chant: {
    type: 'chant',
    suitable_rungs: ['repetition'],
    hubs: ['playground'],
    duration_s: 45,
    description: 'Group chant of a target chunk with rhythm.',
  },
  repetition_drill: {
    type: 'repetition_drill',
    suitable_rungs: ['repetition', 'cued'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 40,
    description: 'Listen-and-repeat with model audio.',
  },
  shadowing: {
    type: 'shadowing',
    suitable_rungs: ['cued', 'guided'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 60,
    description: 'Shadow a short native audio clip in real time.',
  },
  sentence_completion: {
    type: 'sentence_completion',
    suitable_rungs: ['cued', 'guided'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 60,
    description: 'Complete sentences with target structure.',
  },
  picture_talk: {
    type: 'picture_talk',
    suitable_rungs: ['cued', 'guided', 'free'],
    hubs: ['playground', 'academy'],
    duration_s: 90,
    description: 'Describe what you see in 3–5 sentences.',
  },
  roleplay: {
    type: 'roleplay',
    suitable_rungs: ['guided', 'free'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 120,
    description: 'Play a scenario role with a partner / AI.',
  },
  opinion_exchange: {
    type: 'opinion_exchange',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['academy', 'success'],
    duration_s: 90,
    description: 'Share opinion with a reason and example.',
  },
  storytelling: {
    type: 'storytelling',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['academy'],
    duration_s: 120,
    description: 'Tell a short story using target language.',
  },
  discussion: {
    type: 'discussion',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['academy', 'success'],
    duration_s: 150,
    description: 'Discuss a prompt with agree/disagree turns.',
  },
  meeting_sim: {
    type: 'meeting_sim',
    suitable_rungs: ['guided', 'free', 'spontaneous'],
    hubs: ['success'],
    duration_s: 180,
    description: 'Simulate a workplace meeting turn.',
  },
  presentation_chunk: {
    type: 'presentation_chunk',
    suitable_rungs: ['guided', 'free'],
    hubs: ['success'],
    duration_s: 90,
    description: 'Deliver a 60–90s presentation segment.',
  },
  professional_smalltalk: {
    type: 'professional_smalltalk',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['success'],
    duration_s: 60,
    description: 'Initiate workplace small talk.',
  },
  // ── Phase 4 speaking-first output additions ──
  echo_repetition: {
    type: 'echo_repetition',
    suitable_rungs: ['repetition', 'cued'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 30,
    description: 'Listen to a model and echo it back immediately.',
  },
  self_record: {
    type: 'self_record',
    suitable_rungs: ['cued', 'guided', 'free'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 60,
    description: 'Record yourself answering a prompt; replay and self-assess.',
  },
  pronunciation_attempt: {
    type: 'pronunciation_attempt',
    suitable_rungs: ['repetition', 'cued'],
    hubs: ['playground', 'academy', 'success'],
    duration_s: 30,
    description: 'Single-target pronunciation attempt graded by mimic engine.',
  },
  timed_fluency_round: {
    type: 'timed_fluency_round',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['academy', 'success'],
    duration_s: 60,
    description: '60s timed monologue on a familiar topic — fluency over accuracy.',
  },
  storytelling_chain: {
    type: 'storytelling_chain',
    suitable_rungs: ['guided', 'free'],
    hubs: ['playground', 'academy'],
    duration_s: 90,
    description: 'Add one sentence to a growing story chain using target language.',
  },
  interview_mode: {
    type: 'interview_mode',
    suitable_rungs: ['guided', 'free', 'spontaneous'],
    hubs: ['academy', 'success'],
    duration_s: 120,
    description: 'Interview Q&A with role + objective; responses must justify.',
  },
  debate_battle: {
    type: 'debate_battle',
    suitable_rungs: ['free', 'spontaneous'],
    hubs: ['academy', 'success'],
    duration_s: 150,
    description: 'Take a side on a motion; rebut opponent with one example.',
  },
};

export function tasksForHubAndRung(hub: Hub, rung: SpeakingRung): TaskMeta[] {
  return Object.values(TASK_CATALOG).filter(
    (t) => t.hubs.includes(hub) && t.suitable_rungs.includes(rung),
  );
}
