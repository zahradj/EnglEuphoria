// B1 structures added with the 2026-10-14 Season expansion. Merged into STRUCTURES by structureLevels.ts.
import type { StructureInfo } from '../structureLevels';

export const B1_NEW_STRUCTURES: Record<string, StructureInfo> = {
  'so-such-that': { label: 'so + adjective + that / such (a) + noun + that (result)', floor: 'B1', confidence: 'known', note: 'CEFR-J: so ADJ that B1, such B1; the wider "comparison-extended" set (as ... as, the more ... the more) stays B2' },
  'reflexive-pronouns': { label: 'reflexive pronouns (myself, yourself, themselves; by myself)', floor: 'B1', confidence: 'known', note: 'CEFR-J B1.1; the pronouns themselves appear earlier as vocabulary (A2), productive use incl. emphasis and by + self at B1' },
  'enough-too-to': { label: 'enough (adjective + enough, enough + noun) and too + adjective + to', floor: 'B1', confidence: 'known', note: 'CEFR-J enough with adjectives B2.1 / EGP B1-C1; too ... to GSE A2-B1. Resolves the too-enough note: A2 keeps "not big enough" as a chunk, full use with infinitive here' },
  'few-little': { label: '(a) few / (a) little (small quantities, with and without a)', floor: 'B1', confidence: 'unverified', note: 'EGP B1-B2 per the quantifiers note; CEFR-J not checked. Contrast "a few" (some) vs "few" (not many) is taught as chunks first' },
};
