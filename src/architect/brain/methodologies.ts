// Expert Lesson Architect — Methodology Brain
// ----------------------------------------------------------------------------
// A curated knowledge base of ESL/EFL pedagogy mapped to age × CEFR.
// Loaded into the Architect agent's system prompt as targeted slices so it
// reasons like a senior curriculum designer, not a generic LLM.
//
// Sources synthesized from: Cambridge English Profile, CEFR Companion Volume,
// Common European Framework can-do descriptors, Penny Ur (A Course in Language
// Teaching), Jeremy Harmer (ESA), Jane Willis (Task-Based), Michael Lewis
// (Lexical Approach), Asher (TPR), Krashen (Input Hypothesis), Cambridge YLE,
// Cambridge Young Learners pedagogy, Novakid early-learner planner, and the
// Engleuphoria hub identity contract.

import type { Hub, Cefr } from '@/governance/types';

export interface Methodology {
  id: string;
  name: string;
  whenToUse: string;
  microRules: string[]; // concrete moves the architect must encode into the blueprint
}

/**
 * Universal pedagogy — applies to every lesson regardless of hub.
 */
export const UNIVERSAL_PEDAGOGY: Methodology[] = [
  {
    id: 'cefr_can_do',
    name: 'CEFR Can-Do anchoring',
    whenToUse: 'Every lesson, every level.',
    microRules: [
      'Communication goal MUST be a measurable "Can do X" statement aligned with the CEFR level.',
      'Success criteria MUST be observable in production (speaking/writing), not recognition only.',
    ],
  },
  {
    id: 'grr',
    name: 'Gradual Release of Responsibility (I do → We do → You do)',
    whenToUse: 'Every grammar/skill cycle.',
    microRules: [
      'Sequence each new form: exposure (input flooding) → noticing → form study → controlled → semi-controlled → free production.',
      'Never jump from explanation directly to free production.',
    ],
  },
  {
    id: 'vocab_recycling',
    name: 'Spaced & interleaved vocabulary recycling',
    whenToUse: 'Every lesson with target vocab.',
    microRules: [
      'Each target word must be designed for ≥3 exposures in the lesson AND scheduled into the next 3 lessons.',
      'Recycle prior-lesson vocab in warm-up and free-production stages.',
    ],
  },
  {
    id: 'cambridge_pedagogy',
    name: 'Cambridge pedagogy contract',
    whenToUse: 'Every lesson.',
    microRules: [
      'Topic-locking: vocab, reading, grammar, speaking — all bound to one coherent topic/story.',
      'Vocab introduced BEFORE used in reading/listening/production.',
      'Reading comp questions must overlap the passage content.',
      'Each vocab card example MUST contain its headword.',
    ],
  },
];

/**
 * Age-band methodologies. Each hub inherits these.
 */
export const HUB_METHODOLOGIES: Record<Hub, Methodology[]> = {
  playground: [
    {
      id: 'tpr',
      name: 'Total Physical Response (Asher)',
      whenToUse: 'Pre-A1 / A1 / A2 — vocabulary anchoring and command verbs.',
      microRules: [
        'Every new chunk paired with a physical action or mime cue.',
        'Story segments include "Stand up / Touch / Point to" commands.',
      ],
    },
    {
      id: 'songs_chants',
      name: 'Songs, chants & rhythmic drilling',
      whenToUse: 'Every Playground lesson.',
      microRules: [
        'Warm-Up MUST be a song or chant that previews target chunks.',
        'Cool-Off MUST be a singable recap, not a written summary.',
      ],
    },
    {
      id: 'jolly_phonics',
      name: 'Synthetic phonics (Jolly Phonics progression)',
      whenToUse: 'Pre-A1 → B1 in Playground.',
      microRules: [
        'Pre-A1/A1: single-letter phonemes, CVC blending.',
        'A2: common digraphs sh/ch/th, simple vowel teams ee/oa/ai.',
        'B1: blends, magic-e, r-controlled vowels — always via story/play, never abstract drill.',
      ],
    },
    {
      id: 'story_based',
      name: 'Story-based / Narrative-immersion',
      whenToUse: 'Every Playground lesson.',
      microRules: [
        'Every lesson is a chapter of a continuing micro-story with recurring characters.',
        'Grammar/vocab emerges from story events, never from rule explanations.',
      ],
    },
    {
      id: 'multisensory',
      name: 'Multisensory anchoring',
      whenToUse: 'All Playground levels.',
      microRules: [
        'Every concept paired with visual + audio + kinaesthetic cue (drag, trace, tap, sing).',
        'Definitions ≤6 words, concrete, no abstract synonyms.',
      ],
    },
  ],
  academy: [
    {
      id: 'esa',
      name: 'Engage → Study → Activate (Harmer)',
      whenToUse: 'Every Academy lesson, all CEFR.',
      microRules: [
        'Engage hook MUST be identity-relevant (peer culture, tech, music, social topics).',
        'Activate stage MUST be authentic communicative output (post, debate, vlog script, roleplay), not just a drill.',
      ],
    },
    {
      id: 'tblt',
      name: 'Task-Based Language Teaching (Willis)',
      whenToUse: 'A2+ Academy.',
      microRules: [
        'Define a real outcome the learner produces (e.g. "post a 3-line reply to a friend").',
        'Language emerges in service of the task, not as decontextualized rules.',
      ],
    },
    {
      id: 'focus_on_form',
      name: 'Focus on Form (Long)',
      whenToUse: 'B1+ Academy.',
      microRules: [
        'Grammar drawn out from learners noticing patterns in input — not pre-taught.',
        'Form cards always include Positive / Negative / Question / Short-Answer + contractions.',
      ],
    },
    {
      id: 'clil_lite',
      name: 'Content & Language Integrated Learning (lite)',
      whenToUse: 'B1+ Academy.',
      microRules: [
        'Topics drawn from real teen-relevant content domains (science snippets, social issues, gaming, esports, climate).',
        'Vocabulary includes domain lexis appropriate to CEFR — never workplace/corporate.',
      ],
    },
    {
      id: 'peer_interaction',
      name: 'Peer-collaborative interaction',
      whenToUse: 'All Academy.',
      microRules: [
        'At least one speaking task framed as peer-to-peer dialogue, not student-to-teacher.',
        'Identity-aware: avatar choice, opinion, self-expression are first-class.',
      ],
    },
  ],
  success: [
    {
      id: 'tblt_adult',
      name: 'Task-Based Language Teaching (adult)',
      whenToUse: 'Every Success lesson.',
      microRules: [
        'Real-world, high-ROI tasks: phone call, meeting opener, email reply, negotiation turn.',
        'Outcome must be measurable in workplace/life relevance.',
      ],
    },
    {
      id: 'lexical_approach',
      name: 'Lexical Approach (Lewis)',
      whenToUse: 'A2+ Success.',
      microRules: [
        'Teach in chunks/collocations, not isolated words (e.g. "would you mind if…", "let me get back to you").',
        'Target vocab includes ≥40% multi-word chunks.',
      ],
    },
    {
      id: 'dogme_lite',
      name: 'Dogme / Conversation-driven (lite)',
      whenToUse: 'B1+ Success.',
      microRules: [
        'Use learner-generated topics where possible; respond to emergent language in the lesson.',
        'Less scripted, more responsive — fluency over accuracy obsession.',
      ],
    },
    {
      id: 'pragmatics',
      name: 'Pragmatic & register awareness',
      whenToUse: 'All Success.',
      microRules: [
        'Every speaking task tags register (formal / neutral / informal) and audience (peer / client / manager).',
        'Pronunciation work framed as professional clarity, not juvenile phonics.',
      ],
    },
    {
      id: 'business_frameworks',
      name: 'Workplace communication frameworks',
      whenToUse: 'B1+ Success.',
      microRules: [
        'Anchor lessons to real frameworks: STAR for interviews, 4-step email, SBAR for updates, BATNA for negotiation.',
        'Premium tone — never childish, never gamified-for-its-own-sake.',
      ],
    },
  ],
};

/**
 * Returns the relevant methodology slice as a compact markdown block to be
 * injected into the Architect system prompt. Token-economical.
 */
export function buildMethodologyPrompt(hub: Hub, cefr: Cefr): string {
  const lines: string[] = [];
  lines.push('### UNIVERSAL PEDAGOGY (always apply)');
  for (const m of UNIVERSAL_PEDAGOGY) {
    lines.push(`- **${m.name}**: ${m.microRules.join(' ')}`);
  }
  lines.push(`\n### ${hub.toUpperCase()} METHODOLOGY (age-band lens for ${cefr})`);
  for (const m of HUB_METHODOLOGIES[hub]) {
    if (!m.whenToUse.toLowerCase().includes('every') && !m.whenToUse.includes(cefr) && !m.whenToUse.includes('All')) {
      // include only relevant-by-cefr items
      const cefrTokens = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
      const idx = cefrTokens.indexOf(cefr);
      const mentioned = cefrTokens.some((t, i) => m.whenToUse.includes(t) && i <= idx);
      if (!mentioned) continue;
    }
    lines.push(`- **${m.name}** — ${m.microRules.join(' ')}`);
  }
  return lines.join('\n');
}
