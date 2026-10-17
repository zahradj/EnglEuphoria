import type { StructureGseEntry } from '../structureGse';

/** A2 structures against the Pearson GSE adult grammar objectives (see structureGse.ts for the source and method). */
export const A2_STRUCTURE_GSE: Record<string, StructureGseEntry> = {
  'past-be': { gse: [32, 32], from: "'was/were' + complement phrases (32)" },
  'past-simple-regular': { gse: [29, 31], from: 'past negative (29); regular affirmative (30); yes/no questions (30); wh- questions (31)' },
  'past-simple-irregular': { gse: [29, 31], from: 'past negative (29); irregular affirmative (30); yes/no questions (30); wh- questions (31)' },
  'comparatives-superlatives': { gse: [36, 40], from: "'more'/'most' + long adjective, '-est' (36); '-er', best/worst (38); better/worse (39); all forms (40)" },
  'going-to': { gse: [35, 35], from: "plans and intentions with 'going to' (35); predictions with 'going to' are a later objective (44), not taught here" },
  should: { gse: [36, 36], from: "'should(n't)' for advice or suggestions (36)" },
  'too-enough': { gse: [39, 45], from: "'(not) enough / too much / too many' + noun (39); 'too / enough' + adverbs (45)" },
  'must-mustnt': { gse: [37, 46], from: "'must' for obligation (37); 'mustn't' for prohibition (46)", chunkFirst: "mustn't as a whole rule phrase for signs and rules (You mustn't run; No phones: you mustn't use them); the contrast mustn't / don't have to is deferred" },
  'have-to': { gse: [37, 43], from: "'have to' for present and near-future obligation (37); 'don't have to' for no obligation (43)" },
  'quantifiers-much-many': { gse: [35, 46], from: "'(not) much/many' (35); 'a lot of' (36); basic quantifiers (37); 'a bit/a little' (41); 'a few' (44); correct a little vs a few (46)", chunkFirst: "much / many / a lot of with the count versus uncountable rule; a few and a little as whole phrases (a few friends, a little time); the a-few-versus-a-little contrast is deferred" },
  'infinitive-purpose': { gse: [52, 52], from: "'(in order) to' + infinitive for purpose and intention (52)", chunkFirst: "whole answers to 'Why ...?' (I went to the shop to buy bread; I use it to listen to music); no rule about purpose clauses or 'in order to'" },
  'prepositions-movement': { gse: [35, 38], from: 'adverbs of movement and direction (35); prepositions of movement (35); go by bus/train with a means noun (38)' },
  'will-decisions-predictions': { gse: [35, 38], from: "'will' questions about the future (35); 'will' for predictions (38); 'll for spontaneous offers and decisions (38)" },
  'past-continuous': { gse: [40, 46], from: "past simple vs past continuous (40); 'when' + past continuous + past simple (46); temporary past situations (51) not taught", chunkFirst: "I was eating when the phone rang as a whole story pattern (a background action that is interrupted); the rule for linking the two tenses with when / while is deferred" },
  'linking-so-because': { gse: [35, 45], from: "'because' (35); 'so' for results (38, 41); sequencing words such as next, finally (45)" },
  'adverbs-manner': { gse: [36, 37], from: "adverbs with '-ly' (37); irregular adverbs good-well, fast, hard (37); position of manner adverbs (36)" },
  suggestions: { gse: [34, 46], from: "'Let's' (34); 'Shall we' (45); 'Yes, let's' (45); 'What about / How about' + -ing (46)", chunkFirst: "Let's + verb as the rule; Shall we ...? and How about + -ing as whole phrases to say and answer; no rule about the gerund after about" },
  'polite-requests': { gse: [33, 41], from: "'can' for permission (33); 'could' for polite requests (33); 'can' for requests (34); 'May I/we' (41)" },
  'as-as-comparison': { gse: [44, 44], from: "comparisons with '(not) as ... as' (44)" },
  'indefinite-pronouns': { gse: [40, 45], from: "singular verb with every/any/no/some + body/one/thing (40); some- (41); every- (43); no- (44); any- (45)" },
  'present-simple-vs-continuous': { gse: [29, 30], from: 'present simple vs present continuous (29); present continuous for the time of speaking (30); temporary use (38) not taught' },
};
