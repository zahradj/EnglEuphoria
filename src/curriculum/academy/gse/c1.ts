import type { StructureGseEntry } from '../structureGse';

/**
 * C1 structures against the Pearson GSE adult grammar objectives (see structureGse.ts for the source and method).
 * Read directly from "GSE Learning Objectives: Grammar, Adult Learners" (Pearson, February 2023) on 2026-10-17.
 * The list has only three C1 rows (76 appended participle clauses, 77 'but for', 80 'Would you be so kind as to'),
 * so most C1 structures match B1+/B2/B2+ rows (53-74): the GSE rates the form earlier than the Academy teaches it for control.
 */
export const C1_STRUCTURE_GSE: Record<string, StructureGseEntry> = {
  'inversion-negative': { gse: [71, 74], from: "inversion after initial negative adverbials (74); 'Only if' + inversion (71)" },
  'inverted-conditionals': { gse: [70, 70], from: "'Should you wish ...' inversion with omission of 'if' (70); no row for 'Had I known'" },
  'mixed-conditionals': { gse: [67, 67], from: "third conditional with 'would' + present result (If I'd worked harder, I'd have a better job now) (67); present-to-past type not listed" },
  'passive-reporting': { gse: [59, 73], from: "'It's thought/believed that' (59, 61 past, 67); 'He's thought to be' (69); 'thought/believed to ...' (73)" },
  'subjunctive-mandative': { gse: [52, 66], from: "'would rather' + infinitive (52); 'would rather/it's time' + past (66); 'suggested that we come' (62); no separate subjunctive row" },
  nominalisation: { gse: [64, 64], from: 'noun phrases in place of verb phrases in formal written language (nominalisation) (64)' },
  'fronting-emphasis': { gse: [59, 74], from: "'It is ... that' and 'What ...' clefts (59); 'do/did' emphasis (61); clefts (71); 'not only ... but also' (71); negative inversion (74)" },
  'perfect-participle': { gse: [56, 76], from: "reduced relatives with -ing (56); 'having' + past participle (71); appended passive participles (76)" },
  'stance-adverbials': { gse: [66, 66], from: "adverbial phrases for comment (Practically speaking) (66); admittedly/arguably/ostensibly and hedging not listed" },
  'register-shift': { gse: null, from: "no matching objective in the adult grammar list (checked: register, formal, informal, polite, softening; only structure rows like nominalisation 64 and 'would you be so kind as to' 80)" },
  'concession-advanced': { gse: null, from: "no matching objective in the adult grammar list (checked: concession, granted, much as, adjective + as; only despite 56, although 56, whereas 60, however/on the other hand 61)" },
  'modal-nuance': { gse: [52, 66], from: "'would rather' (52, 66); '(not) meant/supposed to' (60); needn't have, was to, be bound to not listed" },
  'ellipsis-advanced': { gse: [57, 66], from: "omission in parallel structures (57); omitting subject + 'be' after 'if' (if necessary) (66); substitution and collocation not listed" },
  'discourse-markers-advanced': { gse: null, from: "no matching objective in the adult grammar list (checked: in essence, by contrast, with regard to, discourse marker, summary; only basic 'so/therefore' 56 and 'however' 61)" },
  'rhetorical-devices': { gse: null, from: 'no matching objective in the adult grammar list (checked: rhetorical, rule of three, parallelism, question as device)' },
  'irony-understatement': { gse: null, from: 'no matching objective in the adult grammar list (checked: irony, understatement, pragmatic, sarcasm)' },
  'text-cohesion': { gse: null, from: 'no matching objective in the adult grammar list (checked: cohesion, signposting, text-level, referencing; list is sentence-level)' },
  'concessive-wh-ever': { gse: [68, 68], from: "initial 'No matter' + relative pronoun (No matter how much it costs) (68); whatever/however/wherever forms not listed" },
  'the-more-extended': { gse: [53, 53], from: "parallel comparatives 'the faster ..., the more ...' (53); repeated comparative (53); 'all the more' and ellipsis (The sooner, the better) not listed" },
  'participle-absolute': { gse: [76, 76], from: "appended passive participle clauses (Given enough time, ...) (76); clauses with their own subject (Time permitting, with + noun + participle) not listed" },
};
