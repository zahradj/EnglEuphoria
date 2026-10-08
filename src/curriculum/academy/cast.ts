// Academy cast — the recurring characters of the Academy hub. Lessons use ONLY these characters (owner rule, 2026-10-08).
//
// SOURCE OF TRUTH: the cast vault (table `cast_vault_characters`, hub = 'academy'; service src/services/castVault.ts).
// This file is a SNAPSHOT taken from the vault on 2026-10-08 so blueprints stay static and testable. If the vault changes,
// refresh this snapshot; never invent a character here that the vault does not hold.
//
// Open items found in the vault on 2026-10-08 (ask the owner):
//  - Mia has no personality traits or signature traits yet (empty), and is not marked shared.
//  - No cast member has a voice_id. Voices must come from the approved recorded American voices (CLAUDE.md voice rule).
// Self-contained: imports only from inside src/curriculum/academy/.
import type { EpisodeType } from './types';

export type AcademyCastName = 'Vee' | 'Ava' | 'Theo' | 'Mia';
export const ACADEMY_CAST_NAMES: readonly AcademyCastName[] = ['Vee', 'Ava', 'Theo', 'Mia'] as const;
export const ACADEMY_CAST_SNAPSHOT_DATE = '2026-10-08';

export interface AcademyCastMember {
  name: AcademyCastName;
  role: string;
  /** traits as stored in the vault (empty = not defined yet) */
  traits: string[];
  tone: string;
  ageRange: string;
  /** short identity line copied from the vault's visual blueprint; art must follow the vault's visual_blueprint */
  look: string;
  voiceId: string | null;
  openIssues: string[];
}

export const ACADEMY_CAST: Record<AcademyCastName, AcademyCastMember> = {
  Vee: {
    name: 'Vee',
    role: 'Academy mentor',
    traits: ['direct', 'upbeat', 'treats mistakes as normal'],
    tone: 'direct, upbeat peer-mentor',
    ageRange: '16-19 presenting',
    look: 'illustrated, semi-realistic; casual contemporary streetwear-adjacent; blue palette; not a talking animal',
    voiceId: null,
    openIssues: ['no voice_id in the vault'],
  },
  Ava: {
    name: 'Ava',
    role: 'Academy student, recurring conversation lead',
    traits: ['curious', 'outgoing', 'asks lots of questions'],
    tone: 'warm and curious',
    ageRange: '13-15 presenting',
    look: 'teen girl, wavy shoulder-length brown hair, warm brown eyes; heather-grey Academy t-shirt, dark denim jeans',
    voiceId: null,
    openIssues: ['no voice_id in the vault'],
  },
  Theo: {
    name: 'Theo',
    role: 'Academy student, recurring conversation lead',
    traits: ['easygoing', 'friendly', 'a good listener'],
    tone: 'easygoing and friendly',
    ageRange: '13-15 presenting',
    look: 'teen boy, short curly dark hair, warm brown skin; light denim button-up jacket over a white t-shirt, khaki pants',
    voiceId: null,
    openIssues: ['no voice_id in the vault'],
  },
  Mia: {
    name: 'Mia',
    role: 'Academy student, recurring conversation lead',
    traits: [],
    tone: 'not defined in the vault yet; until the owner defines it she is a friendly, capable student',
    ageRange: '13-15 presenting',
    look: 'teen girl, straight dark hair in a high ponytail, glasses, olive skin; orange zip-up hoodie over a teal t-shirt, dark backpack',
    voiceId: null,
    openIssues: ['personality and signature traits are empty in the vault', 'not marked shared in the vault', 'no voice_id in the vault'],
  },
};

/** Cast names that appear in a text, in order of first appearance. */
export function castIn(text: string): AcademyCastName[] {
  const found: { n: AcademyCastName; i: number }[] = [];
  for (const n of ACADEMY_CAST_NAMES) {
    const m = new RegExp(`\\b${n}\\b`).exec(text);
    if (m) found.push({ n, i: m.index });
  }
  return found.sort((a, b) => a.i - b.i).map((f) => f.n);
}

/** Who plays which part in each kind of lesson, following each character's vault traits. */
export const CAST_ROLES: Record<EpisodeType, { helper: AcademyCastName; vee: string; lead: string; helperRole: string }> = {
  'cold-open': { helper: 'Ava', vee: 'drops the clue message that starts the story', lead: 'is at the centre of the story event', helperRole: 'asks the curious question the student answers (gist)' },
  'word-lab': { helper: 'Ava', vee: 'sets the word challenge', lead: 'uses the new words in the story', helperRole: 'asks "what is this?" and "how do you say...?" questions' },
  'pattern-lab': { helper: 'Theo', vee: 'shows the pattern is normal and mistakes are part of finding it', lead: 'says the example sentences', helperRole: 'listens, repeats what he heard, and lets the student spot the pattern' },
  'on-air': { helper: 'Theo', vee: 'briefs the real-life situation', lead: 'plays the situation in the model dialogue', helperRole: 'role-play partner (the listener who answers calmly)' },
  'deep-dive': { helper: 'Ava', vee: 'introduces the longer text', lead: 'is the subject or narrator of the text', helperRole: 'asks follow-up questions about the text' },
  'side-quest': { helper: 'Mia', vee: 'offers the choice of two tasks', lead: 'shows her or his own choice first', helperRole: 'a peer who shares her own interest and invites the student to share theirs' },
  remix: { helper: 'Mia', vee: 'runs the boss round and treats every miss as normal', lead: 'appears as a clue-holder in the round', helperRole: 'teams up with the student against the boss' },
  finale: { helper: 'Theo', vee: 'hands over the final clue and celebrates the Release', lead: 'pays off the story using the student\'s Release', helperRole: 'the first listener of the student\'s Release' },
};

/** Generic part for a helper student when the usual helper of a lesson is the Season lead; follows each character's vault traits. */
export const GENERIC_HELPER_PART: Record<'Ava' | 'Theo' | 'Mia', string> = {
  Ava: 'curious: asks the student questions and invites the answers',
  Theo: 'easygoing listener: answers calmly and is the role-play partner',
  Mia: 'friendly peer (traits not defined in the vault yet): shares her view and invites the student to share theirs',
};
