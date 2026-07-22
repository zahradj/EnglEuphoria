// Drill catalog — 10 drill types with prompt templates.

import type { DrillSpec, DrillType, GrammarTarget } from '../types';

interface DrillTemplate {
  type: DrillType;
  stage: 'controlled' | 'semi_controlled' | 'free';
  prompt: (label: string) => string;
  itemCount: number;
}

export const DRILL_TEMPLATES: Record<DrillType, DrillTemplate> = {
  repetition: {
    type: 'repetition',
    stage: 'controlled',
    prompt: (l) => `Listen and repeat each ${l} sentence. Match the rhythm.`,
    itemCount: 6,
  },
  transformation: {
    type: 'transformation',
    stage: 'controlled',
    prompt: (l) => `Transform each cue into the correct ${l} form.`,
    itemCount: 6,
  },
  negative_conversion: {
    type: 'negative_conversion',
    stage: 'controlled',
    prompt: (l) => `Make each ${l} sentence negative.`,
    itemCount: 5,
  },
  question_conversion: {
    type: 'question_conversion',
    stage: 'controlled',
    prompt: (l) => `Turn each ${l} statement into a yes/no question.`,
    itemCount: 5,
  },
  substitution: {
    type: 'substitution',
    stage: 'controlled',
    prompt: (l) => `Swap the underlined word, keeping the ${l} structure.`,
    itemCount: 6,
  },
  completion: {
    type: 'completion',
    stage: 'semi_controlled',
    prompt: (l) => `Complete each gap with the correct ${l} form.`,
    itemCount: 6,
  },
  error_correction: {
    type: 'error_correction',
    stage: 'semi_controlled',
    prompt: (l) => `Find and fix the ${l} mistake in each sentence.`,
    itemCount: 5,
  },
  fast_recognition: {
    type: 'fast_recognition',
    stage: 'controlled',
    prompt: (l) => `Tap CORRECT or WRONG quickly — ${l} accuracy under 3 seconds.`,
    itemCount: 8,
  },
  speaking: {
    type: 'speaking',
    stage: 'semi_controlled',
    prompt: (l) => `Answer aloud using ${l}. Record your voice.`,
    itemCount: 4,
  },
  pron_linked: {
    type: 'pron_linked',
    stage: 'controlled',
    prompt: (l) => `Repeat each ${l} sentence — focus on the highlighted sound.`,
    itemCount: 5,
  },
};

export function buildDrill(type: DrillType, target: GrammarTarget, idx: number): DrillSpec {
  const tpl = DRILL_TEMPLATES[type];
  return {
    id: `drill_${type}_${idx}`,
    type,
    stage: tpl.stage,
    prompt: tpl.prompt(target.label),
    grammarTarget: target.id,
    items: Array.from({ length: tpl.itemCount }, (_, i) => ({
      cue: `${target.label} cue ${i + 1}`,
      audioRequired: type === 'speaking' || type === 'pron_linked' || type === 'repetition',
    })),
  };
}
