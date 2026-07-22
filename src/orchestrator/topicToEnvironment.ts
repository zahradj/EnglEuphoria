// Deterministic topic → mascot environment mapper.
// The lesson maker AI often forgets to bind `mascot.environment` to the
// lesson theme — this table gives the runtime a sensible default and lets
// the prompt chain hint the AI toward the right backdrop.

import type { Environment } from '@/components/lesson-player/SceneBackdrop';

const RULES: Array<{ match: RegExp; env: Environment }> = [
  { match: /\bfamily|home|house|mom|dad|parent|sibling|baby|grand/i,        env: 'bedroom' },
  { match: /\bfood|market|fruit|vegetable|cook|kitchen|breakfast|dinner|meal/i, env: 'kitchen' },
  { match: /\bschool|classroom|teacher|study|lesson|numbers|alphabet|abc/i, env: 'classroom' },
  { match: /\bpark|play|playground|garden|outdoor|picnic/i,                  env: 'park' },
  { match: /\banimal|jungle|forest|wood|tree|farm|zoo|pet/i,                 env: 'forest' },
  { match: /\bbeach|sea|ocean|swim|sand|island|water/i,                     env: 'beach' },
  { match: /\bspace|planet|star|astronaut|rocket|moon|galaxy/i,             env: 'space' },
  { match: /\bstory|book|read|library|fairy|tale/i,                          env: 'library' },
  { match: /\bbedroom|sleep|dream|night|routine|morning/i,                   env: 'bedroom' },
  { match: /\bweather|rain|snow|sun|cloud|sky/i,                             env: 'park' },
  { match: /\bbody|health|doctor|clothes|dress/i,                            env: 'bedroom' },
];

export function topicToEnvironment(topic?: string | null): Environment {
  if (!topic) return 'classroom';
  for (const r of RULES) if (r.match.test(topic)) return r.env;
  return 'classroom';
}

/** Which vocab-image style token to hint at the visual architect. */
export function topicToVocabScene(topic?: string | null): string {
  const env = topicToEnvironment(topic);
  switch (env) {
    case 'kitchen':   return 'warm kitchen counter with wooden props';
    case 'bedroom':   return 'cozy living room with soft pastel walls';
    case 'classroom': return 'bright classroom with a chalkboard hint';
    case 'park':      return 'sunny park with grass and light foliage';
    case 'forest':    return 'lush kawaii forest clearing';
    case 'beach':     return 'sandy beach with gentle waves';
    case 'space':     return 'deep-space scene with soft nebula';
    case 'library':   return 'quiet library with warm shelves';
  }
}
