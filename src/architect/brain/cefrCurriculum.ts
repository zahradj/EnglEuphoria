// Expert Lesson Architect — CEFR Curriculum Brain
// ----------------------------------------------------------------------------
// Per-level canonical grammar, vocabulary domains, functions, and lesson
// archetypes. Hub-aware variants enforce the "same CEFR MUST diverge by hub"
// rule. Derived from Cambridge English Profile + CEFR Companion Volume + the
// project's Hub × CEFR Matrix memory.
//
// NOTE: Project rules cap CEFR at C1 (C2 is not supported). The "C2" key is
// intentionally absent and the architect treats requests above C1 as C1.

import type { Hub, Cefr } from '@/governance/types';

export interface CefrSpec {
  level: Cefr;
  canDoCore: string[];          // Cambridge can-do anchors
  grammarArc: string[];          // canonical grammar progression
  vocabDomains: string[];        // recommended vocab themes
  functions: string[];           // communicative functions
  lessonArchetype: string;       // typical lesson shape at this level
  vocabPerLesson: [number, number]; // [min, max] new target words per lesson
}

const PRE_A1: CefrSpec = {
  level: 'Pre-A1',
  canDoCore: [
    'Greet and introduce oneself with basic words.',
    'Recognise and say single concrete words from immediate surroundings.',
    'Respond to single-word commands with action or pointing.',
  ],
  grammarArc: [
    'be (am/is/are) — affirmative only',
    'subject pronouns I/you/it',
    'this/that for naming',
    'plural -s (regular only)',
    'have got — affirmative',
  ],
  vocabDomains: ['greetings', 'colors', 'numbers 1–10', 'animals', 'family', 'toys', 'body parts', 'food basics'],
  functions: ['greet', 'name', 'point and identify', 'count'],
  lessonArchetype: 'Song warm-up → picture vocab → TPR action chant → simple matching/drag → song cool-off',
  vocabPerLesson: [4, 6],
};

const A1: CefrSpec = {
  level: 'A1',
  canDoCore: [
    'Ask and answer simple personal questions.',
    'Describe people, places and things in short sentences.',
    'Understand short, simple texts on familiar topics.',
  ],
  grammarArc: [
    'present simple — affirmative/negative/question',
    'have got — negative/question',
    'there is / there are',
    'can for ability',
    'prepositions of place (in/on/under)',
    'possessive adjectives my/your/his/her',
    'wh-questions (what/where/who)',
  ],
  vocabDomains: ['daily routines', 'school', 'house & rooms', 'clothes', 'weather', 'jobs', 'hobbies', 'food & drink', 'numbers 1–100'],
  functions: ['describe self/family', 'ask for info', 'express ability/possession', 'locate things'],
  lessonArchetype: 'Engage hook → vocab set (6–8) → form pattern → guided practice → semi-controlled mini-dialogue → free 30-second speaking',
  vocabPerLesson: [6, 10],
};

const A2: CefrSpec = {
  level: 'A2',
  canDoCore: [
    'Communicate in simple, routine tasks on familiar topics.',
    'Describe past experiences and immediate plans.',
    'Understand main points of clear standard speech on familiar matters.',
  ],
  grammarArc: [
    'past simple — regular & common irregular',
    'present continuous — now & future arrangements',
    'going to — plans/predictions',
    'comparatives & superlatives',
    'countable/uncountable + much/many/some/any',
    'frequency adverbs',
    'modal verbs: should / must / have to',
    'object pronouns',
  ],
  vocabDomains: ['travel', 'shopping', 'health', 'free time', 'experiences', 'feelings', 'directions', 'food ordering'],
  functions: ['narrate past events', 'compare', 'give advice', 'make plans', 'order in a café'],
  lessonArchetype: 'Engage (real-world hook) → input (text/dialogue) → focus on form → controlled drill → task (roleplay/short writing) → reflect',
  vocabPerLesson: [8, 12],
};

const B1: CefrSpec = {
  level: 'B1',
  canDoCore: [
    'Deal with most situations likely to arise while travelling.',
    'Produce connected text on familiar/personal topics.',
    'Describe experiences, dreams, hopes, ambitions, give reasons and opinions.',
  ],
  grammarArc: [
    'present perfect vs past simple',
    'past continuous & past simple contrast',
    'first conditional',
    'second conditional (intro)',
    'used to',
    'reported speech (statements)',
    'passive voice (present/past simple)',
    'relative clauses (who/which/that)',
    'modals of deduction (must/might/can\'t)',
  ],
  vocabDomains: ['work & study', 'environment', 'technology', 'media', 'relationships', 'travel stories', 'opinions & feelings'],
  functions: ['narrate connected events', 'hypothesise', 'agree/disagree politely', 'report what others said', 'explain reasons'],
  lessonArchetype: 'Engage (provocative prompt) → reading/listening for gist+detail → grammar discovery → controlled→free progression → output task (debate/post/email)',
  vocabPerLesson: [10, 14],
};

const B2: CefrSpec = {
  level: 'B2',
  canDoCore: [
    'Interact with fluency and spontaneity; regular interaction with native speakers.',
    'Produce clear, detailed text on a wide range of subjects.',
    'Explain a viewpoint on a topical issue, giving advantages and disadvantages.',
  ],
  grammarArc: [
    'third conditional & mixed conditionals',
    'wish / if only',
    'reported speech (full backshift + questions/commands)',
    'passive (all tenses, passive reporting structures)',
    'modal perfects (must have / might have / should have)',
    'cleft sentences (it was X who…)',
    'inversion after negative adverbials',
    'phrasal verbs (transitive/intransitive distinction)',
    'gerunds & infinitives — meaning change pairs',
  ],
  vocabDomains: ['current affairs', 'science & tech', 'culture & arts', 'workplace dynamics', 'ethics & society', 'abstract emotion'],
  functions: ['argue a position', 'speculate about the past', 'discuss abstract topics', 'negotiate', 'critique'],
  lessonArchetype: 'Provocation → authentic input (article/podcast clip) → language focus (lexis + form) → discussion → extended production with self-assessment',
  vocabPerLesson: [12, 16],
};

const C1: CefrSpec = {
  level: 'C1',
  canDoCore: [
    'Express ideas fluently and spontaneously without much obvious searching.',
    'Use language flexibly and effectively for social, academic and professional purposes.',
    'Produce clear, well-structured, detailed text on complex subjects.',
  ],
  grammarArc: [
    'all conditional types incl. mixed',
    'advanced inversion & emphasis',
    'subjunctive (formal contexts)',
    'discourse markers (notwithstanding, albeit, conversely)',
    'nominalisation',
    'hedging & cautious language',
    'advanced reported structures',
    'register-shifting (formal ↔ neutral ↔ informal)',
  ],
  vocabDomains: ['academic discourse', 'professional negotiation', 'idiomatic precision', 'register awareness', 'figurative language'],
  functions: ['structure extended argument', 'persuade', 'hedge', 'negotiate complex outcomes', 'analyse and synthesise'],
  lessonArchetype: 'Complex authentic input → critical-analysis task → focus on lexical precision + register → extended discourse production → peer/self critique',
  vocabPerLesson: [12, 18],
};

export const CEFR_CURRICULUM: Record<Cefr, CefrSpec> = {
  'Pre-A1': PRE_A1,
  A1,
  A2,
  B1,
  B2,
  C1,
};

/**
 * Hub-specific identity overrides applied ON TOP of the CEFR spec.
 * Same CEFR MUST diverge by hub — this object encodes how.
 */
export const HUB_IDENTITY_OVERLAY: Record<Hub, { register: string; topicLens: string; forbidden: string[]; example: string }> = {
  playground: {
    register: 'concrete, playful, story-first, ≤10-word sentences, no abstract synonyms',
    topicLens: 'animals, magic, toys, family, friendship, adventures, simple stories',
    forbidden: ['workplace', 'corporate', 'exam-prep tone', 'abstract academic discussion', 'teen/adult slang'],
    example: 'B1 Playground: "The dragon has visited three islands. Tell the story!" (present perfect via narrative)',
  },
  academy: {
    register: 'identity-aware, slightly informal, peer-relevant, modern',
    topicLens: 'tech, social media, school life, music, pop culture, identity, sport, future careers, debate',
    forbidden: ['nursery themes', 'corporate framing', 'boardroom/KPI vocab', 'cartoonish baby talk'],
    example: 'B1 Academy: "Your friend posted something unfair. Write a reply that disagrees politely." (modals + opinion)',
  },
  success: {
    register: 'premium, adult, respectful, confidence-oriented, professional',
    topicLens: 'workplace fluency, travel, networking, negotiation, career, IELTS prep, real-world life admin',
    forbidden: ['childish framing', 'cartoon metaphors', 'teen slang', 'school-drama topics'],
    example: 'B1 Success: "Your client changed the deadline. Roleplay the negotiation call." (modals + reported speech)',
  },
};

export function buildCefrPrompt(hub: Hub, cefr: Cefr): string {
  // Treat unsupported C2 as C1.
  const effective: Cefr = cefr === ('C2' as any) ? 'C1' : cefr;
  const spec = CEFR_CURRICULUM[effective];
  const overlay = HUB_IDENTITY_OVERLAY[hub];
  if (!spec) return '';
  const lines: string[] = [];
  lines.push(`### CEFR ${spec.level} — canonical curriculum`);
  lines.push(`- Can-do anchors: ${spec.canDoCore.join(' / ')}`);
  lines.push(`- Grammar arc (pick FROM this list only): ${spec.grammarArc.join('; ')}`);
  lines.push(`- Vocab domains: ${spec.vocabDomains.join(', ')}`);
  lines.push(`- Functions: ${spec.functions.join(', ')}`);
  lines.push(`- Lesson archetype: ${spec.lessonArchetype}`);
  lines.push(`- New target vocab per lesson: ${spec.vocabPerLesson[0]}–${spec.vocabPerLesson[1]} items`);
  lines.push('');
  lines.push(`### HUB IDENTITY OVERLAY — ${hub.toUpperCase()} @ ${effective}`);
  lines.push(`- Register: ${overlay.register}`);
  lines.push(`- Topic lens: ${overlay.topicLens}`);
  lines.push(`- FORBIDDEN at this hub: ${overlay.forbidden.join(' · ')}`);
  lines.push(`- Identity example: ${overlay.example}`);
  return lines.join('\n');
}
