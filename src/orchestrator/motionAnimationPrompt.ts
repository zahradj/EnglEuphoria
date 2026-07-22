// Motion & Mascot Animation Directive
// Injects the `motion-design` + `rive-interactive` skill contracts into the
// lesson maker prompt chain. Purpose: every generated slide MUST include
// deterministic mascot state + motion metadata that the runtime (PipRive /
// Framer Motion) can consume without a second AI pass.

import type { LessonContext } from './types';
import { topicToEnvironment, topicToVocabScene } from './topicToEnvironment';

const RIVE_STATES = [
  'idle', 'blink', 'wave', 'point_left', 'point_right',
  'celebrate', 'thinking', 'listening', 'speaking', 'sad',
] as const;

const MOTION_PERSONALITY: Record<string, string> = {
  playground: 'Playful — 150–300ms, ease-out-back, 10–20% overshoot, bouncy arcs',
  academy:    'Corporate — 200–400ms, cubic-bezier(0.2,0,0,1), 0–3% overshoot, clean',
  success:    'Premium — 350–600ms, cubic-bezier(0.4,0,0.2,1), 0% overshoot, elegant',
};

export function buildMotionAnimationPrompt(
  ctx: Pick<LessonContext, 'hub'> & { theme?: string | null },
): string {
  const personality = MOTION_PERSONALITY[ctx.hub] ?? MOTION_PERSONALITY.playground;
  const theme = ctx.theme ?? '';
  const defaultEnv = topicToEnvironment(theme);
  const vocabScene = topicToVocabScene(theme);

  return [
    '## MOTION & MASCOT ANIMATION CONTRACT (hard)',
    '',
    'Every slide/activity you emit MUST carry a `mascot` object AND a `motion` object so the runtime can animate deterministically with Rive + Framer Motion. Do NOT emit static-only slides.',
    '',
    `Hub motion personality — ${ctx.hub}: ${personality}.`,
    '',
    '### 1. Mascot (Rive state machine)',
    'Attach to every slide:',
    '```json',
    '"mascot": {',
    `  "state": "<one of: ${RIVE_STATES.join(' | ')}>",`,
    '  "environment": "<classroom|park|kitchen|space|beach|library|forest|bedroom>",',
    '  "speech": "<≤12 words spoken by the mascot, bound to lesson vocab/character>"',
    '}',
    '```',
    'Rules:',
    '- `state` MUST match the pedagogical beat: warm-up=`wave`/`cheering`, noticing=`thinking`, listening tasks=`listening`, speaking tasks=`speaking`, celebration=`celebrate`, cool-off=`idle`, error nudge=`sad`.',
    '- Never repeat the same `state` on two consecutive slides — rotate for variety.',
    '- Never repeat the same `environment` on two consecutive slides.',
    `- **Theme binding (hard):** the lesson theme is "${theme || 'general'}". Default \`environment\` for topic-anchor slides (intro, warm-up, vocab, review) MUST be \`"${defaultEnv}"\`. Only diverge to another environment when the slide's own content justifies it (e.g. a beach vignette inside a Family lesson). Never pick a random environment.`,
    `- Vocab card \`image_prompt\` MUST place the headword in a **${vocabScene}** so the illustrated background matches the mascot backdrop and creates a coherent world.`,
    '- `speech` MUST reference lesson vocab or the active character — never generic filler.',
    '',
    '### 2. Motion (Framer Motion metadata)',
    'Attach to every slide:',
    '```json',
    '"motion": {',
    '  "entrance": "fade_up | scale_in | slide_in_right | slide_in_left | pop",',
    '  "duration_ms": <80..600>,',
    '  "easing": "ease-out | ease-out-back | ease-in-out | cubic-bezier(...)",',
    '  "stagger_ms": <0..100>,',
    '  "emphasis": "none | pulse | shake | bounce"',
    '}',
    '```',
    'Rules (motion-design skill):',
    '- Entrances decelerate (ease-out family). Exits accelerate (ease-in).',
    '- Duration MUST match the personality band above for the current hub.',
    '- Never linear for spatial movement (linear only for progress bars/spinners).',
    '- Celebration slides use `emphasis: "bounce"` + `entrance: "pop"`.',
    '- Error/repair slides use `emphasis: "shake"`, 300–400ms, no overshoot.',
    '- Stagger MUST stay ≤100ms per child; total scene stagger budget ≤500ms.',
    '- Apply the 1/3 rule: no more than 1/3 of on-screen elements animate simultaneously.',
    '',
    '### 3. Fail-closed',
    'If a slide has no meaningful animation intent, still emit `mascot.state: "idle"` and `motion.entrance: "fade_up"` with `emphasis: "none"`. Missing fields = validator hard-block.',
  ].join('\n');
}
