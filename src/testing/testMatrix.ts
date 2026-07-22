// Hub × CEFR × LessonKind matrix generator
import type { TestCase, Hub, CEFR, LessonKind } from './types';

const HUB_CEFR: Record<Hub, CEFR[]> = {
  playground: ['pre-a1', 'a1', 'a2', 'b1'],
  academy: ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'],
  success: ['pre-a1', 'a1', 'a2', 'b1', 'b2', 'c1'],
};

const DEFAULT_KINDS: LessonKind[] = [
  'standard',
  'true_beginner',
  'speaking_heavy',
  'phonics',
  'grammar',
  'review',
];

export interface MatrixFilter {
  hubs?: Hub[];
  cefrs?: CEFR[];
  kinds?: LessonKind[];
}

export function buildTestMatrix(filter: MatrixFilter = {}): TestCase[] {
  const hubs = filter.hubs ?? (Object.keys(HUB_CEFR) as Hub[]);
  const kinds = filter.kinds ?? DEFAULT_KINDS;
  const cases: TestCase[] = [];
  for (const hub of hubs) {
    const allowed = HUB_CEFR[hub].filter((c) => !filter.cefrs || filter.cefrs.includes(c));
    for (const cefr of allowed) {
      for (const kind of kinds) {
        // Phonics is gated to Playground only per pronunciation memory
        if (kind === 'phonics' && hub !== 'playground') continue;
        cases.push({ hub, cefr, kind, theme: defaultThemeFor(kind) });
      }
    }
  }
  return cases;
}

function defaultThemeFor(kind: LessonKind): string {
  switch (kind) {
    case 'true_beginner': return 'first words & greetings';
    case 'speaking_heavy': return 'ordering food at a café';
    case 'phonics': return 'short vowel sounds';
    case 'grammar': return 'past simple — regular verbs';
    case 'review': return 'unit review & recycling';
    default: return 'everyday english';
  }
}

export { HUB_CEFR, DEFAULT_KINDS };
