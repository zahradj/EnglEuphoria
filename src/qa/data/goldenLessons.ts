/**
 * Golden Reference Lessons — hand-curated exemplars per CEFR × Hub.
 * Used as few-shot anchors in the Hub Brain prompt (consistency > novelty).
 *
 * Keep each entry COMPACT (≤ ~2KB serialized): structure, beat order, and 1-line
 * descriptors per slide — NOT full content. The model imitates shape, not copy.
 *
 * Populate one entry per (cefr, hub). Until populated, generation falls back
 * to the default Hub Brain skeleton (no regression).
 */

export type Hub = 'playground' | 'academy' | 'success';
export type Cefr = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1';

export interface GoldenLesson {
  id: string;
  cefr: Cefr;
  hub: Hub;
  title: string;
  objective: string;
  beats: Array<{ slide: number; phase: string; activity: string; note: string }>;
}

export const GOLDEN_LESSONS: GoldenLesson[] = [
  {
    id: 'pg-a1-greetings-l1',
    cefr: 'a1',
    hub: 'playground',
    title: 'Hello, I am Pip',
    objective: 'Introduce self with name; greet a friend.',
    beats: [
      { slide: 1, phase: 'warm_up', activity: 'song', note: 'Hello song with Pip + Bella waving.' },
      { slide: 2, phase: 'warm_up_review', activity: 'memory_match', note: 'Recycle previous unit (skip in L1).' },
      { slide: 3, phase: 'discover', activity: 'scene_dialogue', note: 'Pip + Bella meet. Bubbles: "Hi!" "Hello!"' },
      { slide: 4, phase: 'learn', activity: 'vocab_card', note: 'hello (1 word).' },
      { slide: 5, phase: 'learn', activity: 'vocab_card', note: 'name.' },
      { slide: 6, phase: 'model', activity: 'story_beat', note: 'Beat 1: meet.' },
      { slide: 7, phase: 'model', activity: 'story_beat', note: 'Beat 2: try ("My name is…").' },
      { slide: 8, phase: 'model', activity: 'story_beat', note: 'Beat 3: win (friends wave).' },
      { slide: 9, phase: 'practice', activity: 'drag_drop', note: 'Match greeting to character.' },
      { slide: 10, phase: 'apply', activity: 'speaking_repeat', note: 'Repeat after Pip.' },
      { slide: 11, phase: 'challenge', activity: 'cued_speaking', note: '"My name is ___".' },
      { slide: 12, phase: 'review', activity: 'chant', note: 'ElevenLabs chant in cast voice.' },
      { slide: 13, phase: 'mastery', activity: 'celebration', note: 'Confetti + Pip thumbs-up.' },
    ],
  },
  // TODO: add pre-a1, a2, b1 (Playground) and full Academy/Success grids.
];

export function findGoldenLesson(cefr: Cefr, hub: Hub): GoldenLesson | null {
  // User-pinned goldens win over the static seed list.
  try {
    // Lazy require to avoid circular import in non-browser contexts.
    const { getPinnedGolden } = require('./pinnedGoldens') as typeof import('./pinnedGoldens');
    const pinned = getPinnedGolden(cefr, hub);
    if (pinned) return pinned;
  } catch {
    /* no-op in edge/server */
  }
  return GOLDEN_LESSONS.find((g) => g.cefr === cefr && g.hub === hub) ?? null;
}

/** Compact few-shot block to prepend to the Hub Brain system prompt. */
export function buildGoldenAnchorPrompt(cefr: Cefr, hub: Hub): string {
  const g = findGoldenLesson(cefr, hub);
  if (!g) return '';
  return [
    '## GOLDEN REFERENCE (imitate structure, NOT copy content)',
    `Title: ${g.title} | Objective: ${g.objective}`,
    'Beat order:',
    ...g.beats.map((b) => `  ${b.slide}. [${b.phase}] ${b.activity} — ${b.note}`),
    'Match this BEAT ORDER and ACTIVITY MIX. Generate fresh content for the requested topic.',
    '',
  ].join('\n');
}
