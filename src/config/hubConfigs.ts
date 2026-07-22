/**
 * Hub Configuration Dictionary
 * ---------------------------------------------------------------
 * Single source of truth for age-locked UI + AI persona rules.
 * Consumed by the generation pipeline (useUnifiedLessonGenerator)
 * AND by Creator wrapper components to instantly re-skin the UI.
 */

export type HubType = 'playground' | 'academy' | 'success';

export interface HubConfig {
  /** Tailwind class string applied to wrapper containers */
  ui_theme: string;
  /** Strict prompt fragment injected into the Gemini system prompt */
  ai_persona: string;
  /** Human-readable label */
  label: string;
  /** Default CEFR floor/ceiling for sanity checks */
  cefrRange: { min: string; max: string };
  /** Default lesson duration (minutes) */
  defaultDuration: number;
  /** Hub-specific phonics/pronunciation progression rule injected into the AI prompt */
  phonics_rule: string;
}

export const HUB_CONFIGS: Record<HubType, HubConfig> = {
  playground: {
    label: 'Playground',
    ui_theme: 'rounded-3xl shadow-soft font-comic bg-pastel-green',
    ai_persona:
      'Target audience: Kids aged 4-9. Tone must be highly enthusiastic, magical, and playful. ' +
      'Allowed CEFR range: Pre-A1 to B1. Even at A2 and B1, KEEP the playful identity — content must remain ' +
      'story-driven, visually rich, and interaction-heavy. Sentences max 10 words. ' +
      'Grammar must stay implicit/contextualized — never present grammar rules abstractly. ' +
      'Topics: Animals, magic, toys, family, adventures, friendship, simple stories. ' +
      'STRICTLY FORBIDDEN: business themes, corporate language, exam-prep tone, abstract academic discussion, ' +
      'and any teen/adult register. Advanced young learners should feel challenged through richer stories and ' +
      'longer interactive play, never through formal grammar drills.',
    cefrRange: { min: 'Pre-A1', max: 'B1' },
    defaultDuration: 30,
    phonics_rule:
      'Focus on single-letter phonemes and CVC blending at Pre-A1/A1. Progressively introduce common digraphs ' +
      '(sh, ch, th) and simple vowel teams (ee, oa, ai) at A2/B1 — always via songs, stories and games, never drills.',
  },
  academy: {
    label: 'Academy',
    ui_theme: 'rounded-xl shadow-md font-sans bg-cyan-50',
    ai_persona:
      'Target audience: Teenagers aged 10-17. Tone must be engaging, modern, identity-aware, and slightly informal. ' +
      'Allowed CEFR range: Pre-A1 to C1. ' +
      'Topics: Technology, sports, school life, pop culture, social media, identity, future careers, debate, ' +
      'academic writing, IELTS/TOEFL prep at upper levels. ' +
      'At C1 specifically: focus on argumentation, analysis, persuasion, advanced expression and academic discourse — ' +
      'NOT corporate negotiation or workplace politics. ' +
      'STRICTLY FORBIDDEN: babyish themes (toys, nursery rhymes), and adult/corporate register (boardrooms, ' +
      'KPIs, executive meetings).',
    cefrRange: { min: 'Pre-A1', max: 'C1' },
    defaultDuration: 60,
    phonics_rule:
      'Pre-A1/A1: alphabet sounds and CVC. A2/B1: consonant clusters, digraphs, vowel teams, minimal pairs ' +
      '(ship vs sheep). B2/C1: stress patterns, intonation for nuance, connected speech in informal teen registers.',
  },
  success: {
    label: 'Success',
    ui_theme: 'rounded-sm shadow-sm font-serif bg-slate-50 border border-slate-200',
    ai_persona:
      'Target audience: Adult professionals (18+). Tone must be premium, professional, sophisticated, and confidence-oriented. ' +
      'Allowed CEFR range: Pre-A1 to C1. ' +
      'Topics: Practical real-world communication, workplace fluency, corporate negotiation, global travel, ' +
      'IELTS prep, networking, career advancement, lexical refinement. ' +
      'Even at Pre-A1/A1 keep the register adult and respectful — no cartoonish or childish framing. ' +
      'At C1 focus on lexical fluency, idiomatic precision, register control, and high-stakes professional communication. ' +
      'STRICTLY FORBIDDEN: childish themes, cartoon metaphors, teen slang, school-drama framing.',
    cefrRange: { min: 'Pre-A1', max: 'C1' },
    defaultDuration: 60,
    phonics_rule:
      'Adult-appropriate pronunciation at every level: connected speech (elision, assimilation), word/sentence stress, ' +
      'and rising/falling intonation. Avoid juvenile phonics drills — always frame as professional clarity training.',
  },
};

export const getHubConfig = (hub: HubType | string | undefined | null): HubConfig => {
  const key = (hub ?? 'academy').toLowerCase() as HubType;
  return HUB_CONFIGS[key] ?? HUB_CONFIGS.academy;
};
