// A1 structures added with the 2026-10-14 Season expansion. Merged into STRUCTURES by structureLevels.ts.
import type { StructureInfo } from '../structureLevels';

export const A1_NEW_STRUCTURES: Record<string, StructureInfo> = {
  'want-need-to': { label: 'want / need + to-infinitive', floor: 'A1', confidence: 'known', note: 'CEFR-J Grammar Profile: verb + to-infinitive at A1.2; Core Inventory lists want to / need to at A2. Taught first as chunks (I want to go, I need to study), then as a pattern' },
  'prepositions-time': { label: 'prepositions of time (in / on / at)', floor: 'A1', confidence: 'unverified', note: 'CEFR-J lists at + clock time and on + day at A1; in + month/season/part of day at A1-A2. Keep to the three core sets (at six, on Monday, in the morning); other uses stay chunks' },
  'articles-plurals': { label: 'articles a / an / the and regular and irregular plural nouns', floor: 'A1', confidence: 'known', note: 'CEFR-J: indefinite/definite article A1.1; plural -s/-es A1.1. Irregular plurals limited to child/children, man/men, woman/women, person/people' },
  'object-pronouns': { label: 'object pronouns (me / you / him / her / it / us / them)', floor: 'A1', confidence: 'known', note: 'CEFR-J: personal pronouns, object case, A1.1 (the earlier possessive-s Season only used him / her / them as chunks)' },
};
