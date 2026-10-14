// B2 structures added with the 2026-10-14 Season expansion. Merged into STRUCTURES by structureLevels.ts.
import type { StructureInfo } from '../structureLevels';

export const B2_NEW_STRUCTURES: Record<string, StructureInfo> = {
  'purpose-clauses': { label: 'purpose clauses: so that, in order to / not to, so as (not) to', floor: 'B2', confidence: 'known', note: 'CEFR-J: in order to DO B2.2, so that B2.1 (EGP B2 / B1); the plain infinitive of purpose is A2 (see infinitive-purpose), the clause forms are B2' },
  'had-better-ought-to': { label: 'had better / ought to (strong advice and warning)', floor: 'B2', confidence: 'unverified', note: 'CEFR-J grammar profile: had better EGP B2; ought to Core Inventory/EGP B1-B2, GSE B1; chosen as the second structure only for advice to a friend, not as a Season core' },
  'preposition-gerund': { label: 'preposition + -ing (look forward to, be/get used to, instead of, apart from, not + -ing)', floor: 'B2', confidence: 'unverified', note: 'Simple preposition + -ing is early (CEFR-J A1.3), but the fixed set with to as a preposition, not + -ing (CEFR-J B2.1) and possessive + -ing (EGP B2) is B2 productive; web search of learner sources only confirmed usage, not level' },
};
