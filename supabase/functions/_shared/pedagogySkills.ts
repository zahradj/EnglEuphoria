// PEDAGOGY SKILLS BRAIN
// ─────────────────────────────────────────────────────────────────────────────
// Curated, evidence-based pedagogical playbook fed to the AI teacher agent.
//
// Distilled from two open references the user provided:
//   • GarethManning/education-agent-skills (165 evidence-based teacher skills,
//     CC BY-SA 4.0) — we adopt the EAL, Explicit-Instruction, Memory-Science,
//     Questioning, Wellbeing, and Student-Learning domains most relevant to
//     ESL kids/teens/adults.
//   • atilaymemis/English-Tutor-AI (MIT) — we adopt its five ESL tutor
//     personas (grammar / pronunciation / conversation / vocabulary / fluency)
//     as the agent's voice when teaching live.
//
// This block is prepended to every lesson-generation prompt right after the
// Expert Teacher Preamble. It gives the agent a SHORT, dense menu of named
// teaching moves it should reach for — not a 165-skill encyclopedia.

export type HubKind = 'playground' | 'academy' | 'success';

interface SkillEntry {
  /** kebab-case skill id from the reference library */
  id: string;
  /** when the AI agent should reach for this skill */
  when: string;
  /** one-line move the agent must execute */
  move: string;
}

// ── Core teaching playbook ────────────────────────────────────────────────────
const PLAYBOOK: SkillEntry[] = [
  // Explicit Instruction (Rosenshine, Archer & Hughes, Hattie 0.59)
  { id: 'explicit-instruction-sequence-builder',
    when: 'introducing any new structure / chunk',
    move: 'Author I-Do (model + think-aloud) → We-Do (guided) → You-Do (independent). Never skip We-Do.' },
  { id: 'think-aloud-script-generator',
    when: 'modelling a sentence frame or strategy',
    move: 'Verbalise the invisible expert reasoning step-by-step before the learner attempts it.' },
  { id: 'checking-for-understanding-protocol-designer',
    when: 'between I-Do/We-Do/You-Do transitions',
    move: 'Insert a 10-second CFU (cold-call, thumbs, mini-whiteboard) — never advance on silence.' },
  { id: 'practice-problem-sequence-designer',
    when: 'designing controlled practice',
    move: 'Order items minimum-different → variant → application; fade scaffolds across the set.' },

  // EAL / ESL — Gibbons, Zwiers, Kinsella
  { id: 'academic-language-sentence-frame-generator',
    when: 'any production task',
    move: 'Provide tiered frames (heavily-scaffolded → light) that encode the THINKING pattern, not gap-fills.' },
  { id: 'vocabulary-tiering-tool',
    when: 'choosing target vocab',
    move: 'Tier-2 ("mortar") words travel across topics — prefer them over Tier-1 throwaway nouns.' },
  { id: 'language-demand-analyser',
    when: 'before locking an activity',
    move: 'Audit receptive + productive language demand; if it exceeds CEFR, scaffold or replace.' },
  { id: 'scaffolded-task-modifier',
    when: 'a task feels too hard for the band',
    move: 'Add a model, a frame, a word bank, or chunk the task — never lower the cognitive goal.' },

  // Memory & Learning Science — Karpicke, Bjork, Sweller, Paivio
  { id: 'retrieval-practice-generator',
    when: 'recycling prior vocab/grammar',
    move: 'Use low-stakes retrieval (brain dump, cued recall) BEFORE re-teaching — testing > rereading.' },
  { id: 'spaced-practice-scheduler',
    when: 'planning across lessons in a unit',
    move: 'Revisit L1 words in L2/L3/L5 at expanding intervals (1-day, 3-day, 7-day analog).' },
  { id: 'interleaving-unit-planner',
    when: 'designing review/booster lessons',
    move: 'Mix item types within practice (vocab + grammar + phonics) instead of blocking by skill.' },
  { id: 'cognitive-load-analyser',
    when: 'a slide combines image + text + audio + activity',
    move: 'Cut extraneous load; keep ONE focal channel per slide for early CEFR.' },
  { id: 'dual-coding-designer',
    when: 'introducing a concrete vocab item',
    move: 'Pair the word with an unambiguous image AND an audio model — never word-alone.' },
  { id: 'worked-example-fading-designer',
    when: 'moving from controlled to free practice',
    move: 'Fully-worked → partial → blank, in 3 fading steps. Reverse if accuracy drops.' },
  { id: 'feedback-quality-analyser',
    when: 'writing answer keys / teacher notes',
    move: 'Feedback must be SPECIFIC, TIMELY, and ACTIONABLE — never just "Good job".' },

  // Questioning & Discussion — Alexander, Mercer, Black & Wiliam
  { id: 'hinge-question-designer',
    when: 'gating progression to the next stage',
    move: 'Design ONE diagnostic question whose answer reveals the misconception, not just recall.' },
  { id: 'dialogic-teaching-move-generator',
    when: 'communicative / production slides',
    move: 'Use Probe → Build → Challenge moves to extend learner turns beyond one-word answers.' },

  // Wellbeing, Motivation & Agency — Yeager, Csikszentmihalyi, Brackett
  { id: 'flow-state-condition-designer',
    when: 'pacing the lesson',
    move: 'Match challenge to skill (+1, never +3); micro-wins every ≤90s to keep flow.' },
  { id: 'self-efficacy-builder-sequence',
    when: 'a learner shows hesitation',
    move: 'Stack quick mastery experiences first; reward BRAVERY > correctness on speaking.' },
  { id: 'belonging-classroom-culture-designer',
    when: 'lesson opener and closer',
    move: 'Greet by name, use the recurring cast (Pip, Bella…), end on a celebration — never a quiz.' },

  // Student-Learning (Domain 20 — live AI interaction patterns)
  { id: 'retrieve-first-gate',
    when: 'learner asks for the answer',
    move: 'Make them attempt retrieval first; only then scaffold or reveal.' },
  { id: 'progressive-hint-ladder',
    when: 'learner is stuck',
    move: 'Offer hints in rungs: orient → narrow → near-answer; never jump straight to the answer.' },
  { id: 'teach-back-evaluator',
    when: 'closing a concept',
    move: 'Ask the learner to teach the rule back in their own words — that is the mastery signal.' },
  { id: 'productive-failure-protocol',
    when: 'introducing a tricky pattern',
    move: 'Let the learner struggle briefly BEFORE you reveal the rule — struggle primes encoding.' },
];

// ── ESL Tutor Voices (from English-Tutor-AI) ──────────────────────────────────
// These shape HOW the agent speaks inside teacher notes and dialogue, not WHAT
// it generates. Hub-brain picks the right voice for the slide phase.
const TUTOR_VOICES = {
  grammar_tutor:
    'Identify errors, give a clear correction + a simple rule, then ONE example. Tag your output [FEEDBACK] / [RULE] / [EXAMPLE].',
  pronunciation_coach:
    'Diagnose the sound, give a mouth-position cue, break the word into syllables, then a 3-rep drill. Tag [SOUND] / [CUE] / [DRILL].',
  conversation_partner:
    'Keep turns natural, ask one follow-up, recast errors instead of stopping the flow, introduce ONE new word per turn in context.',
  vocabulary_builder:
    'New word → child-friendly definition → example in a sentence the learner could say → 1 collocation. Tag [WORD] / [MEAN] / [USE].',
  fluency_coach:
    'Reduce hesitation: pre-teach linking words, run 30-sec speaking sprints, celebrate flow over accuracy.',
} as const;

// Hub → preferred voice rotation
const HUB_VOICES: Record<HubKind, (keyof typeof TUTOR_VOICES)[]> = {
  playground: ['conversation_partner', 'vocabulary_builder', 'pronunciation_coach'],
  academy:    ['conversation_partner', 'grammar_tutor', 'vocabulary_builder', 'fluency_coach'],
  success:    ['fluency_coach', 'grammar_tutor', 'conversation_partner'],
};

// ── Public builder ────────────────────────────────────────────────────────────
export function buildPedagogySkillsBlock(hub: HubKind, cefr: string): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════════════════════════════');
  lines.push('🧠  PEDAGOGY SKILLS BRAIN — evidence-based teaching playbook (binding menu)');
  lines.push('═══════════════════════════════════════════════════════════════════════════');
  lines.push(
    `You have an internal library of named teaching moves. When you design a slide,`,
    `you MUST reach for the right move from this menu — do not invent generic activities.`,
    `Each move below cites a real skill id from the open Education Agent Skills library`,
    `(GarethManning/education-agent-skills, CC BY-SA 4.0).`,
    '',
    `Hub: ${hub} · CEFR: ${cefr}`,
    '',
    `── Teaching moves ──`,
  );
  for (const s of PLAYBOOK) {
    lines.push(`• [${s.id}]  WHEN ${s.when}  →  ${s.move}`);
  }
  lines.push('');
  lines.push(`── Tutor voices (use the matching voice inside teacher_notes & dialogue) ──`);
  for (const v of HUB_VOICES[hub]) {
    lines.push(`• ${v}: ${TUTOR_VOICES[v]}`);
  }
  lines.push('');
  lines.push(
    `Binding rules:`,
    `  1. Every NEW structure/chunk slide MUST execute I-Do → We-Do → You-Do.`,
    `  2. Every production slide MUST ship at least one tiered sentence frame.`,
    `  3. Every review slide MUST start with retrieval (not re-presentation).`,
    `  4. Every "stuck" path MUST climb the progressive-hint-ladder, never reveal the answer.`,
    `  5. Speaking BRAVERY is rewarded independently of correctness (self-efficacy-builder).`,
    `  6. Never end a lesson on a quiz — belonging-classroom-culture closer = celebration.`,
  );
  return lines.join('\n');
}

export const PEDAGOGY_SKILLS_VERSION = 'v1-2026-06-27';
