// A2 structures added with the 2026-10-14 Season expansion. Merged into STRUCTURES by structureLevels.ts.
import type { StructureInfo } from '../structureLevels';

export const A2_NEW_STRUCTURES: Record<string, StructureInfo> = {
  'polite-requests': {
    label: 'polite requests and permission: Can I / Could you / May I ...?',
    floor: 'A2',
    confidence: 'known',
    note: 'CEFR-J functional questions at A2 (Can I ...? A1 as a chunk; Could you / May I ...? A2); taught as chunks first, then the pattern. Sources: docs/research/academy-a2-new-seasons-research.md',
  },
  'as-as-comparison': {
    label: 'as ... as / not as ... as (basic comparison of equality)',
    floor: 'A2',
    confidence: 'unverified',
    note: 'GSE A2 for basic use; CEFR-J B2.1 for the full pattern (as much as, twice as ...). Teach only "as + adjective + as" and "not as ... as". Placement second-hand from CEFR-J, check on englishprofile.org when reachable',
  },
  'indefinite-pronouns': {
    label: 'indefinite pronouns: somebody / anything / nothing / nobody / everyone',
    floor: 'A2',
    confidence: 'known',
    note: 'CEFR-J A1.2 for something/anything, EGP A1-C1 across the set; the full set with some/any/no rules is productive at A2. Sources: docs/research/academy-a2-new-seasons-research.md',
  },
  'present-simple-vs-continuous': {
    label: 'present simple vs present continuous (habits vs now)',
    floor: 'A2',
    confidence: 'known',
    note: 'Both forms met separately from A1 (present-simple, present-continuous-now); contrasting them is a classic A2 target (GSE A2, Cambridge KET/A2 Key). Sources: docs/research/academy-a2-new-seasons-research.md',
  },
};
