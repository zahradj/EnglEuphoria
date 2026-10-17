import type { StructureGseEntry } from '../structureGse';

/** B2 structures against the Pearson GSE adult grammar objectives (see structureGse.ts for the source and method). */
export const B2_STRUCTURE_GSE: Record<string, StructureGseEntry> = {
  'embedded-questions': { gse: [38, 51], from: "'know' + wh-clause (38); 'would like to know' + wh- (49) / if, whether (50); wh- + to + infinitive (51)" },
  'present-perfect-continuous': { gse: [47, 48], from: 'present perfect continuous with for/since and with present results (47); general use (48); simple vs continuous (47)' },
  'third-conditional': { gse: [58, 67], from: "third (past) conditional (58); 'if' + past perfect with 'would' for present results (67)" },
  'wish-past-perfect': { gse: [54, 62], from: "'I wish / If only' + past simple (54); past regrets with 'I wish / if only' + past perfect (62)" },
  'passive-extended': { gse: [46, 67], from: 'present/past simple passive (46-48); present perfect passive (52); present continuous passive (55); modals + passive (59); past perfect (64) and future perfect passive (67)' },
  'reported-questions-commands': { gse: [48, 60], from: "told/asked + to (48); reported wh- questions (50); reporting verbs + that (53); yes/no (55); tense changes (56); orders, requests, advice (60)" },
  'non-defining-relatives': { gse: [57, 61], from: 'non-defining relative clauses (57); defining vs non-defining (60); non-defining clause as a comment (61)' },
  'perfect-modals': { gse: [52, 58], from: "may/might have (52); must have (53); could(n't) have (54); should(n't) have for regrets (58)" },
  'future-continuous-perfect': { gse: [60, 66], from: 'future continuous (60); future perfect for actions finished by a time (66)' },
  'hedging-stance': { gse: [66, 66], from: "only 'adverbial phrases for comment' (66); no objective for arguably, I'd suggest, to some extent (checked: hedging, softening, stance, comment, perhaps)" },
  'linking-however-despite': { gse: [56, 61], from: "'despite/in spite of' (56); 'while/whereas' for contrast (60); 'however, on the other hand' concessive adverbials (61)" },
  'causative-have-get': { gse: [56, 56], from: "'have/get' + NP + past participle (56); 'get/make' + person + to for indirect causation (56)" },
  'conditionals-extended': { gse: [55, 64], from: "'unless' + first/second conditional (55); 'on condition that / as long as / providing / provided that' (64); no row for 'suppose'" },
  'gerund-infinitive-meaning': { gse: [49, 51], from: 'remember/stop/forget + to or -ing, change of meaning (49); verb + -ing vs + to (51)' },
  'articles-nuance': { gse: [48, 49], from: "'the' + adjective for groups (48); abstract nouns without an article (49); no row for fixed uses or generic plurals (checked: article, generic)" },
  'cleft-sentences': { gse: [59, 71], from: "cleft sentences with 'It + be' (59) and 'What ...' (59); a range of cleft sentences (71)" },
  'participle-clauses': { gse: [56, 76], from: "reduced relative clauses with -ing (56); reduced adverbial clauses with present/perfect participle (71); appended participle clauses with being/passive (76)", chunkFirst: "-ing participle clauses of sequence and reduced relatives (Walking in, I met ...; the man driving the car) as models; -ed/passive appended clauses (Given time, ...) for recognition only, no rule yet" },
  ellipsis: { gse: [48, 58], from: "one/ones (48); 'do/did' as a placeholder (51); omission of words and phrases (57); 'so' as a placeholder (58)" },
  'comparison-extended': { gse: [44, 66], from: "(not) as ... as (44); 'so ... that' (51); 'such (a)' (52-53); repeated and parallel comparatives (53); complex comparisons between clauses (62, 66)" },
  'reporting-verb-patterns': { gse: [53, 62], from: "reporting verbs + that (53, 62); verbs of advice + NP + to + infinitive (57); no row for admit/deny + -ing (checked: admit, deny, insist)" },
  'cohesion-devices': { gse: [44, 61], from: "'as well as, also, too' for addition (44); 'so/therefore' (56); beforehand/afterwards (56); concessive adverbials (61); no row for moreover, consequently, as for" },
  'purpose-clauses': { gse: [52, 66], from: "(in order) to (52); 'so as/in order not to' (60); 'so as to' (66); no row for 'so that' (checked: so that, in order that)" },
  'had-better-ought-to': { gse: [56, 62], from: "'had better (not)' for strong advice (56); 'ought(n't) to' for advice (62)" },
  'preposition-gerund': { gse: [47, 55], from: "after/before + -ing (47); by + -ing (48); verbs taking -ing, look forward to (51); thinking of + -ing (54); not + -ing (55); apart from + NP (52); none for be/get used to, instead of" },
};
