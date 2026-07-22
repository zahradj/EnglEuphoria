// Master System Prompt Specification — Pre-A1 deep-dive + A1–C1 hub deltas.
//
// This module exports a single composable directive that can be PREPENDED to
// any Gemini lesson/slide prompt. It encodes the 5 SLA-grounded pillars and
// the 3-hub register, then layers CEFR-level deltas on top.
//
// Chain order (when used inside runLessonGeneration):
//   buildPlannerSystemPrompt → buildPreA1MasterPrompt (THIS) →
//   buildGovernanceSystemPrompt → adaptive → grammar → memory → pronunciation
//   → speaking → gamification → narrative → activity.
//
// Outside the orchestrator (e.g. copy/paste into an LLM dashboard) the
// MASTER_SYSTEM_PROMPT_DOC string is the full human-readable directive.

import type { Hub } from './types';

export type CEFR = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

// ──────────────────────────────────────────────────────────────────────────
// 5 architectural pillars (immutable, apply at every level + hub)
// ──────────────────────────────────────────────────────────────────────────
export const CORE_PILLARS = [
  {
    id: 'P1_RECEPTIVE_FIRST',
    title: 'Receptive-First Input ("Silent Period" Filter)',
    rule:
      'For Pre-A1 in ANY hub, the first 2 activities of each lesson MUST be input-based (pointing, matching, drag, listen-and-do). Speaking is OPTIONAL, never required. Forced oral production at Pre-A1 = HARD reject.',
  },
  {
    id: 'P2_LEXICAL_CHUNKS',
    title: 'Formulaic Lexical Chunking',
    rule:
      'NEVER teach isolated nouns/verbs at Pre-A1/A1. Every target word ships inside a high-utility chunk (e.g. "Look! A ___", "Can I have a ___, please?"). Chunks are the cognitive unit.',
  },
  {
    id: 'P3_SUBSTITUTION_TABLES',
    title: 'Visual Scaffolding (Substitution Tables)',
    rule:
      'Grammar + sentence-building default UI is a substitution table (columns: Subject / Verb / Object / Time…). Output explicit `substitution_table: { columns: [...] }` JSON so the renderer can show interactive blocks.',
  },
  {
    id: 'P4_SSP_PHONICS',
    title: 'Systematic Synthetic Phonics (Jolly progression)',
    rule:
      'Teach pure sounds, not letter names. Follow Group 1 /s,a,t,p/ → /i,n,m,d/ → /g,o,c,k/ … Bind each sound to a TPR action and a tracing task before any reading task. Standalone phonics = Playground only.',
  },
  {
    id: 'P5_SPACED_RETRIEVAL',
    title: 'Spaced Retrieval & Affective Adaptation',
    rule:
      'Review intervals expand 1d → 2d → 4d → 8d. Monitor anxiety: trace deviation > 9.0px OR speech volume < -40dB OR > 3s silence → swap to a low-pressure game. Never publicly correct a Pre-A1/Playground learner.',
  },
] as const;

// ──────────────────────────────────────────────────────────────────────────
// Hub register at Pre-A1 (the deep-dive)
// ──────────────────────────────────────────────────────────────────────────
export const HUB_PREA1_PROFILES: Record<Hub, {
  age: string;
  goal: string;
  output_policy: '100%_receptive' | 'guided_output' | 'task_simulation';
  framework: string;
  mandatory: string[];
  banned: string[];
}> = {
  playground: {
    age: '4–9',
    goal: 'Positive emotional bond to English + sound-symbol awareness via formulaic chunks. No conscious grammar.',
    output_policy: '100%_receptive',
    framework: 'Here-and-Now + Jolly Phonics + TPR + Substitution Tables (with picture icons).',
    mandatory: [
      'Lessons 1–2 of every unit: 100% non-verbal outcomes.',
      'Every target word lives inside a lexical chunk.',
      'Pure-sound phonics with TPR action.',
      'Fine-motor tracing ladder: straight → curves → letter strokes.',
    ],
    banned: [
      'Isolated word lists.',
      'Letter NAMES taught before letter SOUNDS.',
      'Forced speaking at Pre-A1.',
      'Abstract grammar metalanguage ("subject", "auxiliary", "tense").',
      'Public correction or red-X failure states.',
    ],
  },
  academy: {
    age: '10–17',
    goal: 'Leverage analytical capacity via guided discovery + Focus-on-Form, while shielding peer-judgment anxiety.',
    output_policy: 'guided_output',
    framework: 'Noticing Hypothesis + Information-Gap tasks + competitive games + identity-safe framing.',
    mandatory: [
      'Authentic-style media (chat threads, micro-stories) used to NOTICE patterns before any rule is named.',
      'At least one information-gap pair task per lesson.',
      'Substitution tables ship with editable input fields, not picture icons.',
      'Fast-paced competitive game element to raise WTC.',
    ],
    banned: [
      'Childish framing ("Yay! Star!", crying mascots, sticker spam).',
      'Drawing prompts as primary production.',
      'Global/public leaderboards (cooperative class-scoped only).',
      'Dry grammar-sheet drills with no context.',
    ],
  },
  success: {
    age: '18+',
    goal: 'High-ROI task-based simulations of real adult transactions; explicit declarative rules convert to procedural fluency.',
    output_policy: 'task_simulation',
    framework: 'Boomerang ESA (Engage → Study → Activate) + Dual-Track (General + ESP) + PEE writing grid.',
    mandatory: [
      'Every lesson opens with a simulated real-world transaction (check-in, ordering, intro at meeting).',
      'Study phase uses explicit timelines / form cards with metalanguage allowed.',
      'Activate phase = SAME transaction, repeated with the new structure.',
      'Writing tasks scaffolded by a Point–Evidence–Explain substitution grid.',
    ],
    banned: [
      'Cartoon mascots, stickers, collectible badges, childish copy.',
      'Topics with no professional/adult-life utility.',
      'Pure decoding/phonics drills (intelligibility-only at this hub).',
    ],
  },
};

// ──────────────────────────────────────────────────────────────────────────
// CEFR deltas — what changes per level inside each hub (compact)
// ──────────────────────────────────────────────────────────────────────────
export const CEFR_HUB_DELTAS: Partial<Record<CEFR, Partial<Record<Hub, string>>>> = {
  'A1': {
    playground: 'Lift receptive-only rule: short cued speaking allowed (1–3 word answers from a chunk frame). Phonics digraphs (sh, ch, th).',
    academy:    'Add structured pair dialogues (5–8 turns). Introduce explicit form cards (Positive/Negative/Question) but always after a noticing slide.',
    success:    'Survival transactions broaden (booking, directions, basic email). Grammar timelines + PEE for 3-sentence paragraphs.',
  },
  'A2': {
    playground: 'Guided storytelling with picture-supported substitution tables. Phonics blends + early CVC reading. Speaking ladder max = guided.',
    academy:    'Information-gap tasks scale to 3 variables. Light error-correction drills allowed; competitive vocabulary games central.',
    success:    'Workplace micro-simulations (small talk, polite requests, scheduling). ESP track introduced (industry-flavoured vocab).',
  },
  'B1': {
    playground: 'Project-based storytelling cycle; explicit grammar still implicit via patterns. Cap on cognitive load: ≤ 1 high-load activity in a row.',
    academy:    'Debate-lite, opinion + reason structures, roleplay missions. Substitution tables shift to discourse markers.',
    success:    'Meeting roleplay, email rewrite, negotiation primers. Fluency-over-accuracy in speaking; PEE expands to full paragraphs.',
  },
  'B2': {
    academy:    'Authentic media analysis, structured debate, longer collaborative tasks. Metalanguage fully open.',
    success:    'Presentations, interview simulations, business news analysis, passive voice / hedging for reports.',
  },
  'C1': {
    academy:    'Discourse-level work: cohesion, register shift, persuasive writing. Substitution tables become outline scaffolds, not sentence frames.',
    success:    'Executive-level scenarios (negotiation, strategic comms), nuanced register, idiomatic precision. Minimal scaffold density.',
  },
};

// ──────────────────────────────────────────────────────────────────────────
// Composer — prepend to any Gemini prompt
// ──────────────────────────────────────────────────────────────────────────
export interface PreA1MasterPromptArgs {
  hub: Hub;
  cefr: CEFR;
}

export function buildPreA1MasterPrompt(args: PreA1MasterPromptArgs): string {
  const hub = HUB_PREA1_PROFILES[args.hub];
  const delta = CEFR_HUB_DELTAS[args.cefr]?.[args.hub];

  const pillars = CORE_PILLARS.map(
    (p, i) => `${i + 1}. ${p.title}\n   RULE: ${p.rule}`,
  ).join('\n');

  return [
    '=== MASTER PEDAGOGICAL DIRECTIVE (Engleuphoria) ===',
    `Hub: ${args.hub.toUpperCase()} (${hub.age}) — CEFR ${args.cefr}`,
    `Goal: ${hub.goal}`,
    `Output policy: ${hub.output_policy}`,
    `Framework: ${hub.framework}`,
    '',
    '— FIVE CORE PILLARS (immutable) —',
    pillars,
    '',
    '— HUB MANDATORY RULES —',
    ...hub.mandatory.map((r) => `• ${r}`),
    '',
    '— HUB BANNED PATTERNS (HARD reject if produced) —',
    ...hub.banned.map((r) => `✗ ${r}`),
    '',
    delta ? `— CEFR ${args.cefr} DELTA for ${args.hub} —\n${delta}` : '',
    '',
    'HARD CONTRACT:',
    '- These rules override stylistic preferences. They DO NOT override CEFR/curriculum/age/safety contracts higher in the chain.',
    '- No placeholders, no "as an AI", no meta commentary.',
    '- All output must be valid JSON conforming to the activity schemas downstream.',
    '=== END MASTER DIRECTIVE ===',
  ]
    .filter(Boolean)
    .join('\n');
}

// Full human-readable spec mirror, useful for /docs and copy/paste use.
export const MASTER_SYSTEM_PROMPT_DOC = `# Master System Prompt Specification
See docs/MASTER_SYSTEM_PROMPT_PREA1.md for the formatted version.`;
