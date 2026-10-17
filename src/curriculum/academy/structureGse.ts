// Pearson GSE Learning Objectives: Grammar, Adult Learners (February 2023), read directly from the PDF on 2026-10-17
// (https://www.pearsoncanadaschool.com/content/dam/websites/pearson-canada-school/assets/documents/literacy/gse/gse-grammar-guide-adult-framework.pdf).
// Each value is the GSE number of that structure's learning objective (A1 = 22-29, A2 = 30-42). The GSE value is the point where a learner has a
// 50 % chance of using the structure correctly; Pearson says to introduce a structure about 10 GSE points BEFORE its value (same document, p. 6),
// so an A1 Season may introduce structures up to about GSE 39 (chunks first). Writing is by id of src/curriculum/academy/structureLevels.ts.
// Only A1 structures are mapped so far (owner 2026-10-17: roadmap source check, A1 first); A2-C1 are still to do.
// Findings and recommendations: docs/research/academy-a1-gse-grammar-check.md.
export interface StructureGse {
  /** the lowest and highest GSE of the learning objectives that match the structure's sub-uses */
  gse: [number, number];
  /** which learning objectives the numbers come from (short) */
  from: string;
  /** present when a sub-use is GSE >= 33 (about A2 and above): what is taught as a CHUNK or for recognition only, with the rule left for later (Pearson: introduce ahead, not as a rule) */
  chunkFirst?: string;
}

/** A structure the Pearson adult grammar list has no objective for (checked: say so in `from`). */
export interface StructureGseNone { gse: null; from: string; chunkFirst?: string }
export type StructureGseEntry = StructureGse | StructureGseNone;

export const A1_STRUCTURE_GSE: Record<string, StructureGse> = {
  'be-present': { gse: [24, 25], from: "agreement of 'be' with nouns (24); subject pronouns + be + adjective (24); 'be' + adjective (25)" },
  'possessive-adjectives': { gse: [25, 25], from: "possessive adjectives my/your/his/her (25)" },
  'there-is-are': { gse: [27, 27], from: "'there is(n't)/are(n't)' for presence (27)" },
  'prepositions-place': { gse: [26, 30], from: 'basic prepositions of place (26); a range of prepositions of place (30)' },
  'present-simple': { gse: [26, 27], from: 'present simple affirmative, negative, yes/no and wh- questions (26); opinions, likes and dislikes (27)' },
  'like-ing': { gse: [27, 31], from: "present simple for likes with a noun (27); 'like/hate/love' + -ing (31)" },
  'some-any': { gse: [32, 37], from: "uncountable nouns with determiners (32); 'some' in affirmative statements (36); 'some' and 'any' in questions and negatives (37)", chunkFirst: "some in requests and offers as a chunk (I'd like some water; Would you like some?); 'any' for recognition only, no negative or question rule yet" },
  'would-like': { gse: [29, 33], from: "'I'd like / I want' + noun (29); requests and offers with 'would like' + noun (33)", chunkFirst: "I'd like ... / Would you like ...? as whole phrases; no grammar of would" },
  'present-simple-3rd': { gse: [24, 26], from: "statements with he/she verbs such as 'She drinks coffee' (24); present simple forms and questions (26)" },
  'frequency-adverbs': { gse: [32, 36], from: "'How often' questions (32); a range of adverbs of frequency (33); their position (36)", chunkFirst: "the words always / usually / sometimes / never and How often ...?; no rule about their position in the sentence" },
  'have-got': { gse: [25, 28], from: "forms of 'have' (25); 'have got' (28)" },
  'possessive-s': { gse: [28, 30], from: "'s for possession (28); s' for possession (30)" },
  imperatives: { gse: [27, 27], from: 'imperatives and negative imperatives (27)' },
  'prepositions-movement-basic': { gse: [35, 35], from: 'a range of prepositions of movement (35)', chunkFirst: "direction phrases as wholes (go along ..., turn left, across the road); no contrast between prepositions of movement" },
  'can-ability': { gse: [29, 29], from: "'can' for ability (29)" },
  'linking-and-but': { gse: [25, 35], from: "'and' (25); 'but' (28); 'because' for causes and reasons (35)", chunkFirst: "and / but as the rule; because only as a chunk (because I like it); no because-clause rule" },
  demonstratives: { gse: [25, 39], from: "'this is' for an introduction (25); this/that as determiners (30); as pronouns (39)", chunkFirst: "this / that / these / those + noun and How much is this?; this and that used alone as pronouns are not taught" },
  'how-much-many': { gse: [27, 30], from: "'How much is/are' for price (27); 'how much/many' with count and mass nouns (30)" },
  'present-continuous-now': { gse: [30, 30], from: 'present continuous for the time of speaking (30)' },
  'wh-questions': { gse: [25, 27], from: "'what/who', 'where' and 'how old' questions (25); a range of wh- questions (27)" },
  'want-need-to': { gse: [31, 31], from: "'want to' + infinitive for intentions (31); no separate 'need to' objective found at A1/A2-low" },
  'prepositions-time': { gse: [30, 32], from: "'at' as a preposition of time (30); 'after' (32); 'in' for future time (38)" },
  'articles-plurals': { gse: [24, 32], from: "regular plurals (24); irregular plurals (25); 'a/an' with countable nouns (26); the definite article (32)" },
  'object-pronouns': { gse: [27, 27], from: 'personal pronouns as objects (27)' },
};

/** The A1 band of the GSE (22-29) and the lead Pearson recommends for introducing a structure before its value. */
export const GSE_A1_BAND: [number, number] = [22, 29];
export const GSE_INTRODUCE_AHEAD = 10;

/** GSE band top by Academy level (A1 22-29, A2 30-42, B1 43-58, B2 59-75, C1 76-84) and the margin above it that requires a `chunkFirst` note. */
export const GSE_BAND_TOP = { A1: 29, A2: 42, B1: 58, B2: 75, C1: 84 } as const;
export const GSE_CHUNK_FIRST_MARGIN = 4;
