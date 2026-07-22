/**
 * Regional curriculum overlays.
 *
 * Each entry maps a local framework (MEB, MCER, DELF, IGCSE, ONEFD…) to:
 *   - the equivalent CEFR band it satisfies
 *   - the local school grade or exam target it prepares for
 *   - extra prep-slide hooks injected into lessons when the learner has chosen
 *     `learning_mode = 'local'` and `curriculum_framework = <id>`.
 *
 * The overlay does NOT replace CEFR-bound generation — it adds a thin layer of
 * localised context (exam-style item, named grade, local example) on top of
 * the existing Cambridge/CEFR engine. CEFR remains tier-1 hard.
 */

import type { MarketRegion } from '@/lib/marketRegion';

export type CEFR = 'PreA1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface FrameworkOverlay {
  id: string;
  label: string;
  region: MarketRegion;
  /** CEFR bands this framework maps to (lowest → highest). */
  cefrRange: CEFR[];
  /** Local grade / exam strings to surface on dashboards. */
  gradeBands: string[];
  /** Prompt hint appended to generation when this overlay is active. */
  promptHint: string;
  /** UI badge label for the lesson player. */
  badge: string;
}

export const FRAMEWORK_OVERLAYS: Record<string, FrameworkOverlay> = {
  cefr: {
    id: 'cefr', label: 'CEFR (Council of Europe)', region: 'INTL',
    cefrRange: ['PreA1', 'A1', 'A2', 'B1', 'B2', 'C1'],
    gradeBands: ['Beginner', 'Elementary', 'Intermediate', 'Upper', 'Advanced'],
    promptHint:
      'Use globally-neutral cultural references. No local exam framing.',
    badge: 'CEFR-aligned',
  },
  cambridge: {
    id: 'cambridge', label: 'Cambridge English', region: 'INTL',
    cefrRange: ['A1', 'A2', 'B1', 'B2', 'C1'],
    gradeBands: ['Starters', 'Movers', 'Flyers', 'KET', 'PET', 'FCE', 'CAE'],
    promptHint:
      'Mirror Cambridge YLE / Main Suite item shapes (gapped sentence, ' +
      'matching, short answer). Keep the topic-locking contract.',
    badge: 'Cambridge-aligned',
  },
  meb: {
    id: 'meb', label: 'MEB (Türkiye Millî Eğitim)', region: 'TR',
    cefrRange: ['PreA1', 'A1', 'A2', 'B1'],
    gradeBands: ['2. sınıf', '3. sınıf', '5. sınıf', '8. sınıf', '12. sınıf'],
    promptHint:
      'Map vocabulary themes to current MEB English curriculum units when the ' +
      'unit topic overlaps (e.g. Health, Friendship, Environment). Add ONE ' +
      'Turkish hint line per new word in the slide notes. Speaking tasks may ' +
      'reference Turkish daily-life scenarios (çay, simit, market) but the ' +
      'production stays 100% English.',
    badge: 'MEB uyumlu',
  },
  yds: {
    id: 'yds', label: 'YDS / YÖKDİL', region: 'TR',
    cefrRange: ['B1', 'B2', 'C1'],
    gradeBands: ['Üniversite', 'Akademik'],
    promptHint:
      'For Success hub only: include one academic-register reading shape per ' +
      'lesson resembling YDS paragraph-completion items.',
    badge: 'YDS prep',
  },
  mcer: {
    id: 'mcer', label: 'MCER (Marco Común Europeo)', region: 'ES',
    cefrRange: ['PreA1', 'A1', 'A2', 'B1', 'B2', 'C1'],
    gradeBands: ['Primaria', 'ESO', 'Bachillerato'],
    promptHint:
      'Use peninsular Spanish phonemic comparisons in pronunciation slides ' +
      '(b/v, j/h, vowel length). Cultural examples drawn from Iberian + ' +
      'LatAm contexts (futbol, paella, mate).',
    badge: 'MCER',
  },
  delf: {
    id: 'delf', label: 'DELF / DALF prep', region: 'FR',
    cefrRange: ['A1', 'A2', 'B1', 'B2', 'C1'],
    gradeBands: ['Collège', 'Lycée'],
    promptHint:
      'Map task shapes to DELF production types (production écrite courte, ' +
      'production orale dialoguée). Speaking scenarios from francophone life.',
    badge: 'CECRL',
  },
  cecrl: {
    id: 'cecrl', label: 'CECRL', region: 'FR',
    cefrRange: ['PreA1', 'A1', 'A2', 'B1', 'B2', 'C1'],
    gradeBands: ['Primaire', 'Collège', 'Lycée'],
    promptHint:
      'Use l\'Éducation nationale grade vocabulary (CP, CE1, 6ème…) on the ' +
      'student dashboard. Keep examples Hexagone-neutral.',
    badge: 'CECRL',
  },
  igcse: {
    id: 'igcse', label: 'Cambridge IGCSE English', region: 'AR',
    cefrRange: ['B1', 'B2', 'C1'],
    gradeBands: ['Grade 9', 'Grade 10', 'Grade 11'],
    promptHint:
      'Frame reading passages around IGCSE-style global-issue topics. Avoid ' +
      'pork, alcohol, gambling, dating examples. Cultural references skew ' +
      'toward Gulf + global. RTL layout for student-facing scaffolds.',
    badge: 'IGCSE prep',
  },
  onefd: {
    id: 'onefd', label: 'ONEFD (Algérie)', region: 'DZ',
    cefrRange: ['A1', 'A2', 'B1', 'B2'],
    gradeBands: ['Moyen', 'Secondaire', 'BAC'],
    promptHint:
      'Use francophone bridge vocabulary (cognates) in early lessons. ' +
      'Examples from Algerian daily life (couscous, le BAC, le bus).',
    badge: 'ONEFD',
  },
};

export function overlaysForRegion(region: MarketRegion): FrameworkOverlay[] {
  return Object.values(FRAMEWORK_OVERLAYS).filter(
    (o) => o.region === region || o.region === 'INTL',
  );
}

export function getOverlay(id: string | null | undefined): FrameworkOverlay | null {
  if (!id) return null;
  return FRAMEWORK_OVERLAYS[id] ?? null;
}

/** Prompt-chain hint to prepend in `runLessonGeneration()` when local-mode. */
export function buildRegionalOverlayPrompt(
  region: MarketRegion,
  frameworkId: string | null,
): string {
  const overlay = getOverlay(frameworkId);
  if (!overlay) return '';
  return [
    `=== REGIONAL OVERLAY — ${overlay.label} (${region}) ===`,
    overlay.promptHint,
    `Display the badge "${overlay.badge}" on lesson chrome.`,
    `Local grade bands recognised here: ${overlay.gradeBands.join(', ')}.`,
    'CEFR contract still wins on conflict.',
    '',
  ].join('\n');
}
