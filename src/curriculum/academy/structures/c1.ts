// C1 structures added with the 2026-10-14 Season expansion. Merged into STRUCTURES by structureLevels.ts.
import type { StructureInfo } from '../structureLevels';

export const C1_NEW_STRUCTURES: Record<string, StructureInfo> = {
  'concessive-wh-ever': {
    label: 'concessive whatever / however + adjective / wherever (However small the change, ...; Whatever you decide, ...)',
    floor: 'C1',
    confidence: 'unverified',
    note: 'CEFR-J grammar row 188 (WH-EVER): CEFR-J B2.1, Core Inventory B2, English Grammar Profile C1-C2 (the dataset notes the adverb however is excluded). Receptive use from B2; productive concessive use with however + adjective is placed at C1 on the EGP range only. Second-hand via the open dataset; the EGP online search was not opened.',
  },
  'the-more-extended': {
    label: 'extended comparative correlatives (The more ..., the more ...; The sooner, the better; all the more)',
    floor: 'C1',
    confidence: 'unverified',
    note: 'The basic pattern is B2 in CEFR-J (row 50 COMP.the_the: Core Inventory B2, EGP B2; the dataset limits it to 0-8 words between the parts). Used here only as the extended sub-use (ellipsis, all the more, long subjects), which has no checked C1 row. Never the main structure of a Season.',
  },
  'participle-absolute': {
    label: 'absolute and participle phrases with their own subject (Time permitting, ...; All things considered, ...; with + noun + participle)',
    floor: 'C1',
    confidence: 'unverified',
    note: 'No row in the CEFR-J grammar list (checked 2026-10-14). Reference grammars call absolutes rare and mostly written or fixed (weather permitting); placement at C1 is a judgement from formal-register use in applications, not a verified EGP level. Perfect-participle clauses already sit at C1 (perfect-participle); this adds the own-subject and fixed-phrase uses.',
  },
};
