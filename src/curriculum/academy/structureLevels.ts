// Academy roadmap v2 — grammar structure catalogue with the earliest level for PRODUCTIVE use.
//
// STATUS: placements are recalled from the English Grammar Profile (Cambridge), Pearson GSE Grammar objectives and
// Cambridge exam lists, NOT re-checked against the sources on 2026-10-08 (they could not be opened that day).
// 'known'      = established, recalled from memory.
// 'unverified' = one of the least certain placements; check in the EGP online search and the GSE Grammar PDF before locking.
// Sources to check: englishprofile.org/english-grammar-profile · pearson.com/english/about/gse/learning-objectives.html
//
// Ordering rules taken from teen-course practice (recalled, not sourced):
//  - present continuous for the future only after "now" use is automatic;
//  - going to and will are introduced in different Seasons, each with its own use;
//  - mustn't vs don't have to are NOT taught in the same lesson at A2;
//  - the present perfect is split by sub-use (experience / for-since / vs past simple);
//  - past perfect only after past simple and past continuous are secure;
//  - phrasal verbs are taught as recycled vocabulary, not as a grammar unit.
import type { AcademyLevel, Confidence } from './types';

export interface StructureInfo {
  label: string;
  floor: AcademyLevel;
  confidence: Confidence;
  note?: string;
}

export const STRUCTURES: Record<string, StructureInfo> = {
  // ---------------------------------------------------------------- A1
  'be-present': { label: 'be (am/is/are): statements, questions, negatives', floor: 'A1', confidence: 'known' },
  'possessive-adjectives': { label: 'possessive adjectives (my/your/his/her/our/their)', floor: 'A1', confidence: 'known' },
  'there-is-are': { label: 'there is / there are', floor: 'A1', confidence: 'known' },
  'prepositions-place': { label: 'prepositions of place (in/on/under/next to/behind)', floor: 'A1', confidence: 'known' },
  'present-simple': { label: 'present simple (I/you/we/they): statements and negatives', floor: 'A1', confidence: 'known' },
  'like-ing': { label: 'like/love/hate + -ing', floor: 'A1', confidence: 'known' },
  'some-any': { label: 'some / any with countable and uncountable nouns', floor: 'A1', confidence: 'known' },
  'would-like': { label: "I'd like ... / Would you like ...? (as a chunk first)", floor: 'A1', confidence: 'unverified', note: 'A1 late / A2 per sources; teach as a chunk' },
  'present-simple-3rd': { label: 'present simple he/she/it (-s) and questions with does', floor: 'A1', confidence: 'known' },
  'frequency-adverbs': { label: 'adverbs of frequency (always/usually/sometimes/never)', floor: 'A1', confidence: 'known' },
  'have-got': { label: 'have got / has got', floor: 'A1', confidence: 'known' },
  'possessive-s': { label: "possessive 's", floor: 'A1', confidence: 'known' },
  'imperatives': { label: 'imperatives (instructions, directions)', floor: 'A1', confidence: 'known' },
  'prepositions-movement-basic': { label: 'prepositions of movement (to/into/out of/along/across)', floor: 'A1', confidence: 'known' },
  'can-ability': { label: "can / can't for ability", floor: 'A1', confidence: 'known' },
  'linking-and-but': { label: 'and / but / because (simple linking)', floor: 'A1', confidence: 'known' },
  'demonstratives': { label: 'this / that / these / those', floor: 'A1', confidence: 'known' },
  'how-much-many': { label: 'how much / how many and prices', floor: 'A1', confidence: 'known' },
  'present-continuous-now': { label: 'present continuous for actions happening now', floor: 'A1', confidence: 'known' },
  'wh-questions': { label: 'wh-questions and question word order', floor: 'A1', confidence: 'known' },
  // ---------------------------------------------------------------- A2
  'past-be': { label: 'past simple of be (was/were)', floor: 'A2', confidence: 'unverified', note: 'A1 late / A2 early in some sources' },
  'past-simple-regular': { label: 'past simple: regular verbs (-ed)', floor: 'A2', confidence: 'known' },
  'past-simple-irregular': { label: 'past simple: irregular verbs, questions and negatives', floor: 'A2', confidence: 'known' },
  'comparatives-superlatives': { label: 'comparatives and superlatives', floor: 'A2', confidence: 'known' },
  'going-to': { label: 'be going to (plans and intentions)', floor: 'A2', confidence: 'known' },
  'should': { label: 'should / shouldn\'t for advice', floor: 'A2', confidence: 'known' },
  'too-enough': { label: 'too / enough', floor: 'A2', confidence: 'known' },
  'must-mustnt': { label: "must / mustn't (rules)", floor: 'A2', confidence: 'known' },
  'have-to': { label: 'have to (obligation)', floor: 'A2', confidence: 'known', note: "don't have to vs mustn't contrast is B1" },
  'quantifiers-much-many': { label: 'much / many / a few / a little / a lot of', floor: 'A2', confidence: 'known' },
  'infinitive-purpose': { label: 'infinitive of purpose (to + verb)', floor: 'A2', confidence: 'known' },
  'prepositions-movement': { label: 'prepositions of movement and transport phrases', floor: 'A2', confidence: 'known' },
  'will-decisions-predictions': { label: 'will for decisions, offers and simple predictions', floor: 'A2', confidence: 'unverified', note: 'sequence with going to differs by source' },
  'past-continuous': { label: 'past continuous (was/were + -ing)', floor: 'A2', confidence: 'known' },
  'linking-so-because': { label: 'so / because / then (linking sentences)', floor: 'A2', confidence: 'known' },
  'adverbs-manner': { label: 'adverbs of manner (-ly)', floor: 'A2', confidence: 'known' },
  'suggestions': { label: "let's / shall we / how about + -ing (suggestions)", floor: 'A2', confidence: 'known' },
  // ---------------------------------------------------------------- B1
  'present-perfect-experience': { label: 'present perfect: experience (ever/never/been)', floor: 'B1', confidence: 'unverified', note: 'A2 late / B1; teach for production at B1' },
  'used-to': { label: 'used to', floor: 'B1', confidence: 'unverified' },
  'present-perfect-for-since': { label: 'present perfect: for / since / how long', floor: 'B1', confidence: 'known' },
  'present-perfect-vs-past-simple': { label: 'present perfect vs past simple', floor: 'B1', confidence: 'known' },
  'zero-first-conditional': { label: 'zero and first conditional', floor: 'B1', confidence: 'unverified', note: 'zero conditional A2 late / B1' },
  'second-conditional': { label: 'second conditional', floor: 'B1', confidence: 'unverified' },
  'passive-simple': { label: 'passive: present and past simple', floor: 'B1', confidence: 'known' },
  'defining-relative-clauses': { label: 'defining relative clauses (who/which/that/where)', floor: 'B1', confidence: 'known' },
  'question-tags': { label: 'question tags', floor: 'B1', confidence: 'known' },
  'modals-deduction': { label: 'modals of deduction (must / might / can\'t)', floor: 'B1', confidence: 'unverified', note: 'might for deduction: B1 or B2' },
  'present-continuous-future': { label: 'present continuous for future arrangements', floor: 'B1', confidence: 'unverified', note: 'possibly A2 in EGP; taught at B1 after "now" use is automatic' },
  'will-promises-predictions': { label: 'will for promises and predictions', floor: 'B1', confidence: 'unverified' },
  'gerund-infinitive': { label: 'verb patterns: gerund vs infinitive (common verbs)', floor: 'B1', confidence: 'known' },
  'reported-statements': { label: 'reported speech: statements (say/tell, basic backshift)', floor: 'B1', confidence: 'unverified', note: 'B1 late / B2' },
  'past-perfect': { label: 'past perfect', floor: 'B1', confidence: 'unverified', note: 'B1 late; not required for production in Preliminary for Schools [U]' },
  'wish-past-simple': { label: 'wish + past simple', floor: 'B1', confidence: 'unverified' },
  'obligation-contrast': { label: "mustn't vs don't have to (contrast)", floor: 'B1', confidence: 'known' },
  'linking-although': { label: 'although / even though / while (contrast)', floor: 'B1', confidence: 'known' },
  'phrasal-verbs-separable': { label: 'common phrasal verbs (separable / inseparable) as vocabulary', floor: 'B1', confidence: 'known' },
  // ---------------------------------------------------------------- B2
  'present-perfect-continuous': { label: 'present perfect continuous', floor: 'B2', confidence: 'unverified', note: 'B1 late / B2' },
  'third-conditional': { label: 'third conditional', floor: 'B2', confidence: 'known' },
  'wish-past-perfect': { label: 'wish / if only + past perfect', floor: 'B2', confidence: 'known' },
  'passive-extended': { label: 'passive: all tenses and modal passives', floor: 'B2', confidence: 'known' },
  'reported-questions-commands': { label: 'reported questions, commands, reporting verbs', floor: 'B2', confidence: 'known' },
  'perfect-modals': { label: 'perfect modals (should/could/might/must have + past participle)', floor: 'B2', confidence: 'known' },
  'non-defining-relatives': { label: 'non-defining relative clauses', floor: 'B2', confidence: 'known' },
  'future-continuous-perfect': { label: 'future continuous and future perfect', floor: 'B2', confidence: 'known' },
  'hedging-stance': { label: 'hedging and stance (arguably, I\'d suggest, to some extent)', floor: 'B2', confidence: 'known' },
  'linking-however-despite': { label: 'however / despite / in spite of / whereas', floor: 'B2', confidence: 'known' },
  'causative-have-get': { label: 'have / get something done', floor: 'B2', confidence: 'known', note: 'B1/B2' },
  'embedded-questions': { label: 'embedded (indirect) questions', floor: 'B2', confidence: 'known', note: 'B1/B2' },
  'conditionals-extended': { label: 'unless / as long as / provided that / suppose', floor: 'B2', confidence: 'known' },
  'gerund-infinitive-meaning': { label: 'verbs that change meaning (remember/stop/try + -ing or to)', floor: 'B2', confidence: 'known' },
  'articles-nuance': { label: 'articles: generic reference, zero article, fixed uses', floor: 'B2', confidence: 'known' },
  'cleft-sentences': { label: 'cleft sentences (It was ... that / What I need is ...)', floor: 'B2', confidence: 'known' },
  'participle-clauses': { label: 'participle clauses (-ing / -ed)', floor: 'B2', confidence: 'known' },
  'ellipsis': { label: 'ellipsis and substitution', floor: 'B2', confidence: 'known' },
  'comparison-extended': { label: 'as ... as, the more ... the more, so/such ... that', floor: 'B2', confidence: 'known' },
  'reporting-verb-patterns': { label: 'reporting verbs + -ing / that / to (admit, deny, suggest, insist)', floor: 'B2', confidence: 'known' },
  'cohesion-devices': { label: 'cohesion: addition, result, sequence markers (moreover, consequently, as for)', floor: 'B2', confidence: 'known' },
  // ---------------------------------------------------------------- C1
  'inversion-negative': { label: 'inversion after negative / restrictive adverbials (Rarely do we ...)', floor: 'C1', confidence: 'known' },
  'inverted-conditionals': { label: 'inverted conditionals (Had I known ..., Should you ...)', floor: 'C1', confidence: 'known' },
  'mixed-conditionals': { label: 'mixed conditionals', floor: 'C1', confidence: 'unverified', note: 'B2 late / C1' },
  'passive-reporting': { label: 'passive reporting structures (It is said that ... / He is believed to ...)', floor: 'C1', confidence: 'known' },
  'subjunctive-mandative': { label: 'subjunctive / mandative (I suggest that he go) and would rather', floor: 'C1', confidence: 'known' },
  'nominalisation': { label: 'nominalisation and complex noun phrases', floor: 'C1', confidence: 'known' },
  'fronting-emphasis': { label: 'fronting and emphasis (What matters is ..., Not only ... but)', floor: 'C1', confidence: 'known' },
  'perfect-participle': { label: 'perfect participle clauses and reduced relatives (Having done ...)', floor: 'C1', confidence: 'known' },
  'stance-adverbials': { label: 'stance adverbials and advanced hedging (admittedly, arguably, ostensibly)', floor: 'C1', confidence: 'known' },
  'register-shift': { label: 'register control: formal vs informal transformation', floor: 'C1', confidence: 'known' },
  'concession-advanced': { label: 'advanced concession (granted, much as, be that as it may, adjective + as)', floor: 'C1', confidence: 'known' },
  'modal-nuance': { label: "modal nuance (needn't have, was to, be bound to, would rather)", floor: 'C1', confidence: 'known' },
  'ellipsis-advanced': { label: 'advanced ellipsis, substitution and collocation precision', floor: 'C1', confidence: 'unverified' },
  'discourse-markers-advanced': { label: 'discourse markers for mediation and summary (in essence, by contrast, with regard to)', floor: 'C1', confidence: 'unverified' },
  'rhetorical-devices': { label: 'rhetorical devices (rule of three, rhetorical question, parallelism)', floor: 'C1', confidence: 'unverified', note: 'pragmatic, not in grammar profiles' },
  'irony-understatement': { label: 'irony, understatement and pragmatic markers', floor: 'C1', confidence: 'unverified', note: 'pragmatic competence, descriptors in CEFR CV C1/C2' },
  'text-cohesion': { label: 'text-level cohesion and signposting in long texts', floor: 'C1', confidence: 'unverified' },
};

export const STRUCTURE_FLOOR: Record<string, AcademyLevel> = Object.fromEntries(Object.entries(STRUCTURES).map(([k, v]) => [k, v.floor]));
