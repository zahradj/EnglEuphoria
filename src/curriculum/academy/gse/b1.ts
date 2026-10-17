import type { StructureGseEntry } from '../structureGse';

/** B1 structures against the Pearson GSE adult grammar objectives (see structureGse.ts for the source and method). */
export const B1_STRUCTURE_GSE: Record<string, StructureGseEntry> = {
  'present-perfect-experience': { gse: [41, 47], from: "present perfect for personal experiences (41); 'ever' in questions (41); 'been' vs 'gone' (47)" },
  'used-to': { gse: [45, 45], from: "'used to' + infinitive for past habits (45)" },
  'present-perfect-for-since': { gse: [44, 44], from: "'since/for' + noun phrase (44); present perfect with 'for/since' clauses (44)" },
  'present-perfect-vs-past-simple': { gse: [44, 44], from: 'present perfect vs past simple (44)' },
  'zero-first-conditional': { gse: [46, 47], from: "first conditional 'if' + present + 'will' and for offers (46); 'if' + present simple + present simple, zero (47)" },
  'second-conditional': { gse: [48, 48], from: 'second conditional, hypothetical results of a current situation (48)' },
  'passive-simple': { gse: [45, 48], from: "'by' + agent (45); objective as subject of passive (46); past simple passive (48); present simple passive (48)" },
  'defining-relative-clauses': { gse: [48, 48], from: "'who/that/which' in basic defining relative clauses (48); 'when/where' in relative clauses (48)" },
  'modals-deduction': { gse: [46, 49], from: "speculate with 'may/might/could' + infinitive (46); 'must' and 'can't' for inferences (49)" },
  'present-continuous-future': { gse: [42, 42], from: 'present continuous with future reference (42); contrast of future forms (41)' },
  'will-promises-predictions': { gse: [38, 38], from: "'will' + infinitive for predictions (38); 'll for offers and decisions (38); no separate objective for promises" },
  'gerund-infinitive': { gse: [31, 51], from: "'like/love/hate' + -ing (31); 'want to' (31); remember to/doing (49); -ing vs to + infinitive after verbs (51)" },
  'reported-statements': { gse: [42, 56], from: "'tell/say' + present/future (42); present-to-past tense change in reported speech (56)" },
  'past-perfect': { gse: [54, 63], from: 'past perfect in common situations (54); with adverbial clauses of time (63)', chunkFirst: "'by the time I got there she had gone' and 'after I had left' as whole phrases in stories; past perfect with time-clause rules and passive deferred to B2" },
  'wish-past-simple': { gse: [54, 54], from: "'I wish / If only' + past simple for present or future wishes (54)" },
  'obligation-contrast': { gse: [43, 46], from: "'don't/doesn't have to' for absence (43); 'mustn't' for prohibition (46); 'have to' (37)" },
  'linking-although': { gse: [56, 59], from: "'though/although' for concession (56); 'while/whilst/whereas' for contrast (59)" },
  'question-tags': { gse: [49, 51], from: 'positive/negative tag combinations (49); negative question tags, all tenses (50); positive question tags (51)' },
  'phrasal-verbs-separable': { gse: [46, 51], from: 'phrasal verbs with separated object (46); verb + NP + preposition (48); separable vs inseparable (50); two particles (51)' },
  'so-such-that': { gse: [51, 53], from: "'so' + adjective/quantifier + 'that' (51); 'such (a)' + noun (52); 'such a/an' + adjective + noun + 'that' (53)" },
  'reflexive-pronouns': { gse: [44, 51], from: 'reflexive pronouns as object/complement (44); for emphasis, e.g. I made it myself (51); themselves vs each other (51)' },
  'enough-too-to': { gse: [39, 46], from: "'enough/too much/too many' + noun (39); 'too/enough' + adverbs (45); adjective + 'to' + infinitive (46)" },
  'few-little': { gse: [41, 52], from: "'a bit/a little' + mass nouns (41); 'a few' + count nouns (44); 'little/a little' vs 'few/a few' (52)" },
};
