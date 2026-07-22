/**
 * Pedagogical framework routing — mirrors the backend logic in
 * supabase/functions/generate-lesson-content/index.ts so the UI can label
 * generated lessons with the methodology the AI applied.
 */

export type MethodologyKey = 'TPR' | 'CLT' | 'TBLT';

export interface Methodology {
  key: MethodologyKey;
  label: string;
  emoji: string;
  blurb: string;
}

export const METHODOLOGIES: Record<MethodologyKey, Methodology> = {
  TPR: {
    key: 'TPR',
    label: 'Total Physical Response',
    emoji: '🧒',
    blurb:
      'Short sentences, sight words, visual matching and phonics games for young or absolute-beginner learners.',
  },
  CLT: {
    key: 'CLT',
    label: 'Communicative Language Teaching',
    emoji: '🗣️',
    blurb:
      'Functional, real-life conversations, roleplays, and gamified error detection to build everyday fluency.',
  },
  TBLT: {
    key: 'TBLT',
    label: 'Task-Based Language Teaching',
    emoji: '🧠',
    blurb:
      'Complex case-study scenarios, critical thinking and advanced lexis modelled on Harvard-style business cases.',
  },
};

export function methodologyForLevel(rawLevel?: string | null): Methodology {
  const lvl = String(rawLevel || '').trim().toUpperCase().replace(/\s+/g, '');
  if (lvl.includes('PRE-A1') || lvl === 'PREA1' || lvl === 'A0') return METHODOLOGIES.TPR;
  if (lvl.startsWith('A1')) return METHODOLOGIES.TPR;
  if (lvl.startsWith('A2') || lvl.startsWith('B1')) return METHODOLOGIES.CLT;
  if (lvl.startsWith('B2') || lvl.startsWith('C1') || lvl.startsWith('C2')) return METHODOLOGIES.TBLT;
  if (lvl.includes('B2') || lvl.includes('C1') || lvl.includes('C2')) return METHODOLOGIES.TBLT;
  if (lvl.includes('A2') || lvl.includes('B1')) return METHODOLOGIES.CLT;
  if (lvl.includes('A1')) return METHODOLOGIES.TPR;
  return METHODOLOGIES.CLT;
}
