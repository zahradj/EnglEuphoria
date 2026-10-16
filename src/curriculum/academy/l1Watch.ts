// Home-language watch list per Season (owner plan, 2026-10-16: "put the home-language trouble spots into each Season's blueprint").
// What a teacher should LISTEN FOR in the first sessions of a Season, for the five home languages of our students (ar, es, fr, tr, it).
// These are error TENDENCIES from contrastive analysis and small studies, not what every student does: the student's own Mistake Bank
// overrides them. Evidence and its limits: docs/research/academy-curriculum-teen-sla-and-l1-gaps.md Part 2 (marks below).
// Self-contained: imports only from inside src/curriculum/academy/.
import type { AcademyLevel } from './types';

export type HomeLanguage = 'ar' | 'es' | 'fr' | 'tr' | 'it';
/** V = seen in a study or thesis abstract (small samples) · V-weak = teaching or tutor sources only · K = standard contrastive linguistics, not re-checked in a source this round */
export type L1Evidence = 'V' | 'V-weak' | 'K';

export interface L1WatchItem {
  langs: readonly HomeLanguage[];
  /** what the teacher may hear or see */
  watch: string;
  /** what to do: a nudge, a minimal-pair game, a rule line, a Daily 10 item */
  teach: string;
  evidence: L1Evidence;
}

const w = (langs: HomeLanguage[], watch: string, teach: string, evidence: L1Evidence): L1WatchItem => ({ langs, watch, teach, evidence });

/** Keyed by Season id. A1 and A2 written (2026-10-16); the other levels follow in the same shape. */
export const L1_WATCH: Record<string, readonly L1WatchItem[]> = {
  'A1-S01': [
    w(['ar'], 'Leaves out "am/is/are": "I student", "She happy" (Arabic has no present-tense copula).', 'State the rule line "every present sentence has am / is / are"; the student restates it in teach-back; nudge with "Say it with am/is/are."', 'V'),
    w(['ar'], 'Letters b and p sound alike in the alphabet game.', 'Letter-name minimal pairs with several recorded voices (b/p); accept the clear one, replay the other.', 'V-weak'),
    w(['fr'], 'Final-syllable stress on country names (Canada, Italy) and flat intonation.', 'Stress dots on the country-name cards; echo the voice, then say it alone.', 'V-weak'),
  ],
  'A1-S02': [
    w(['es', 'tr', 'it', 'ar'], '/ɪ/ and /iː/ merge: "it" and "eat", "ship" and "sheep".', 'Minimal-pair listening (it / eat) with several voices, then say the pair; aim to be understood, not perfect.', 'V'),
    w(['es', 'ar'], 'An extra vowel before or inside s-clusters: "eschool", "siplit", "estreet".', 'Slow the cluster into blocks (s-k-ool), then speed up; listen-and-repeat with a recorded voice.', 'V-weak'),
    w(['tr', 'ar'], 'Wrong preposition of place (in / on / at): one English word where the L1 uses a case ending or a different preposition.', 'Teach each phrase as a whole chunk ("on the table", "in the box") with the picture, not as a rule.', 'V-weak'),
  ],
  'A1-S03': [
    w(['tr'], 'Verb moved to the end of the clause ("I football play").', 'Show the order with coloured blocks (who, do, what) and let the student build the sentence before saying it.', 'V-weak'),
    w(['it', 'fr'], 'Every syllable gets equal weight, so key words do not stand out.', 'Clap the stress on the key words ("I LOVE swimming"); shadow a recorded voice.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Drops -ing or says "like play" instead of "like playing".', 'Keep "like + -ing" as a fixed chunk with one slot; recast once, then nudge.', 'K'),
  ],
  'A1-S04': [
    w(['fr', 'tr', 'it'], '"th" in "thanks" becomes /s/, /t/ or /f/.', 'Awareness only at A1 (listen first); accept /s, t, f/ if the word is understood.', 'V-weak'),
    w(['ar'], 'An extra vowel in "thanks" and "text"; /p/ and /b/ swapped in "pizza", "pepper".', 'Cluster blocks and a p/b minimal-pair game with recorded voices.', 'V-weak'),
    w(['tr', 'ar'], 'Articles and uncountable nouns: "a water", "a rice", or no article at all.', 'Teach "some + uncountable" as a chunk ("some water"); keep the picture of the food.', 'K'),
  ],
  'A1-S05': [
    w(['fr'], 'Drops /h/ (“’e has”, “’our”) or adds it to "hour".', '"he / has / hour" minimal-pair game; show the breath with a mirror or tissue picture.', 'V-weak'),
    w(['tr'], 'Subject-verb agreement: "she like", "he go".', 'The rule line "he / she / it + -s" with an example, stated before the games; teach-back at the end.', 'V-weak'),
    w(['es', 'it', 'tr', 'ar'], 'Leaves out the subject pronoun ("Is a teacher", "Go to school at eight").', 'Choral "He / She + verb" sentence frames; nudge with "Who?"', 'K'),
  ],
  'A1-S06': [
    w(['fr', 'tr', 'it'], '"th" in "mother, father, brother" becomes /z/, /d/ or /t/.', 'Aim for intelligible, not perfect; a listen-and-repeat game with the family words.', 'V-weak'),
    w(['es', 'fr', 'it', 'ar'], 'Possessive built like the L1 ("the brother of Ana") instead of "Ana\'s brother".', 'Show "Ana\'s brother" next to the long form once, then practise the short chunk.', 'K'),
    w(['it'], 'False friend: Italian "parenti" means relatives, not parents.', 'Flag it on the Word Card; add to the Mistake Bank if it appears.', 'K'),
  ],
  'A1-S07': [
    w(['es'], 'An "e" before s-clusters in street words: "estreet", "estation".', 'Cluster blocks (s-t-reet), then the direction phrase "Go along the street."', 'V-weak'),
    w(['tr', 'ar'], 'Wrong preposition of movement (to / into / across).', 'Teach each as a picture + chunk ("go across the road"); a short map game to fix them.', 'V-weak'),
    w(['it', 'ar'], 'Adds a vowel after a final consonant ("turn-a", "left-e").', 'Clap the last consonant with a clear stop; shadow a recorded voice.', 'V-weak'),
  ],
  'A1-S08': [
    w(['ar'], 'Difficulty with /ŋ/ in "singing, dancing" and the vowel in "can" and "can\'t".', 'Minimal pairs can / can\'t with several voices: the vowel carries the meaning, so stress "can\'t".', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds "to" or an -s after can ("can to swim", "she cans").', 'The rule line "can + verb, no to, no -s", stated before the games.', 'K'),
  ],
  'A1-S09': [
    w(['es', 'tr', 'it', 'ar'], '"this" and "these" sound the same (/ɪ/ and /iː/).', 'Minimal-pair game this / these with several voices.', 'V'),
    w(['fr', 'tr', 'it'], '"th" at the start of this, these, that, those.', 'Awareness at A1; accept /d, z/ if understood.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Stress on the wrong syllable in teens and tens (13 / 30).', 'Number-stress game with recorded voices: THIRteen / thirTY.', 'K'),
  ],
  'A1-S10': [
    w(['tr'], 'Question word order from the L1 ("What you are doing?").', 'Word-block builder for wh-questions; the student builds, then says.', 'V-weak'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'No "do/does" in questions in the L1, so "Where you live?"; and "-ing" forgotten.', 'Keep A1-S10 to wh- + be ("What are you doing? Where is he?"); free "Where do you live?" is A2 production (English Grammar Profile check, 2026-10-16).', 'K'),
    w(['es', 'it', 'tr', 'ar'], 'Leaves out the subject: "Is raining".', 'Sentence frames with the pronoun always shown; nudge with "Who?"', 'K'),
  ],
  'A1-S11': [
    w(['fr', 'tr', 'it'], '"Wednesday" said with a /d/ and "Thursday" with /t/ or /s/.', 'Say it as "WENZ-day", "THURZ-day"; listen first.', 'V-weak'),
    w(['es', 'fr', 'it'], 'One preposition for all times ("in Saturday", "at the morning").', 'Teach the three time chunks with pictures: in the morning, on Saturday, at six o\'clock.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Says "want that I go" or "want go" instead of "want to go".', 'The rule line "want / need + to + verb" stated before the games; weak "to" in the recorded model.', 'K'),
  ],
  'A1-S12': [
    w(['tr', 'ar'], 'Articles: leaves them out or uses "the" for everything.', 'Teach a / an / the with the picture of "one thing, any" versus "that one"; recycle each Season.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds -s to irregular plurals ("childs", "peoples").', 'A short irregular-plural sort game; add misses to the Mistake Bank.', 'K'),
    w(['fr'], 'Drops /h/ in "him, her".', '"him / her / them" listen-and-repeat; link with the /h/ work from A1-S05.', 'V-weak'),
  ],
  'A2-S01': [
    w(['ar'], 'Still leaves out the past of be: “He sick yesterday”, “We at home.”', 'The rule line “was / were in every past sentence”, stated before the games; nudge with “Say it with was or were.”', 'V'),
    w(['es', 'fr', 'it', 'tr'], 'Says every -ed as a full syllable (“walk-ed”, “play-ed”) because the spelling is read as written.', 'Sort verbs by the three sounds /t/ /d/ /ɪd/ with recorded voices, then say them; this is a listening-first game.', 'K'),
    w(['tr'], 'Pronounces words as they are spelled, so silent letters and endings are wrong.', 'Pair the written form with the recorded voice every time; add 3 to 4 words to the Daily 10 dictation.', 'V-weak'),
  ],
  'A2-S02': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Regularises irregular verbs: “goed”, “buyed”, “taked”.', 'Keep the irregular list small and sorted by pattern; every miss goes to the Mistake Bank and returns in the Remember? within days.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Puts the past on both verbs: “Did you went?”, “I didn’t went.”', 'The rule line “did / didn’t + base verb, no -ed, no past form”, stated before the games; teach-back at the end.', 'K'),
    w(['it', 'fr', 'es'], 'Uses the present perfect for a finished time: “Yesterday I have bought.” (the L1 compound past)', 'Introduce the time-word rule early: if you say when, use the past simple. Full contrast comes at B1.', 'V-weak'),
  ],
  'A2-S03': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Doubles the marker: “more bigger”, “more cheaper”; or uses “more” for every adjective.', 'Sort adjectives into -er and more + adjective groups; a short rule line with one example each.', 'K'),
    w(['fr', 'tr', 'it'], '“than” said with /d/ or /t/ (weak /ðən/ lost).', 'Aim for being understood; shadow a recorded voice on a few comparison sentences.', 'V-weak'),
    w(['fr', 'it'], 'Stress on the wrong syllable in long adjectives (expenSIVE, comforTAble).', 'Stress dots on the adjective cards; echo then say alone.', 'V-weak'),
  ],
  'A2-S04': [
    w(['es', 'fr', 'it'], 'Often fine (voy a, je vais, vado a): the L1 pattern matches, so watch for “I go to travel” or a missing “be”.', 'Check am / is / are before going to; use a quick substitution drill.', 'K'),
    w(['ar', 'tr'], 'Uses the present simple or will for every plan, or leaves out “be”: “I going to study.”', 'The rule line “am / is / are + going to + verb”; build it with blocks first.', 'K'),
    w(['it', 'fr'], 'Hears “going to” as “gonna” and does not recognise it.', 'Listening games with both forms and several recorded voices (a listening aim, not a speaking aim).', 'K'),
  ],
  'A2-S05': [
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds “to” or -s after should: “should to go”, “he shoulds”.', 'The rule line “should + base verb, no to, no -s”, stated before the games.', 'K'),
    w(['es', 'fr', 'it'], 'Uses “too” where English says “very”: “It is too good.”; puts “enough” before the adjective.', 'Two short sorting rounds: too = more than you want; enough comes after the adjective (big enough).', 'K'),
    w(['tr'], 'Reads body words as spelled: “stomach” with /tʃ/, “headache” with an extra sound.', 'Recorded voice on each body word before the student says it; add to the Daily 10 dictation.', 'V-weak'),
  ],
  'A2-S06': [
    w(['es', 'fr', 'it'], 'Treats mustn’t and don’t have to as the same (“You don’t have to smoke here”).', 'A rules-sign sorting game: mustn’t = not allowed, don’t have to = not necessary; the student sorts first, then says one of each.', 'K'),
    w(['ar'], 'An extra vowel in the final cluster of “mustn’t”.', 'Say it in blocks (muss-nt) and let the silent t go; accept a clear, short version.', 'V-weak'),
    w(['tr', 'ar'], 'Adds “to” after must: “You must to wear a helmet.”', 'The rule line “must + base verb, no to; have to is different”.', 'K'),
  ],
  'A2-S07': [
    w(['fr', 'it', 'es'], 'Uses plural for uncountable nouns: “informations”, “advices”, “breads”.', 'Sort food words into countable and uncountable with the picture; keep “some” and “a lot of” as chunks.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Uses “much” in positive sentences: “I eat much rice.”', 'The rule line “a lot of in positive sentences; much and many in questions and negatives”.', 'K'),
    w(['fr'], 'Stress on the last syllable in food words (vegeTABLE, chocoLATE).', 'Stress dots on the cards; echo the recorded voice.', 'V-weak'),
  ],
  'A2-S08': [
    w(['es', 'fr', 'it'], 'Says “for + verb” for purpose: “I go there for study.” (para / pour / per)', 'Show “to + verb” beside the L1 pattern once; practise 4 fixed sentences.', 'K'),
    w(['es', 'fr', 'it'], 'Uses the wrong preposition for transport: “in bus”, “with the bus”.', 'A picture game: by bus, by train, on foot, in a car; teach as chunks.', 'K'),
    w(['tr', 'ar'], 'Wrong prepositions of movement (to / into / across).', 'Short map game with the movement phrases as chunks.', 'V-weak'),
  ],
  'A2-S09': [
    w(['es', 'fr', 'it'], 'Uses the present or “going to” for a decision made now: “I take the red one.”', 'Teach will for decisions with a shop scene: the student decides on the spot; contrast with plans from A2-S04.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds “to” after will or an -s: “I will to go”, “she wills”.', 'The rule line “will + base verb”; the contracted ’ll in the recorded model.', 'K'),
    w(['es'], 'won’t and want sound alike (the vowels /əʊ/ and /ɒ/ merge).', 'Minimal-pair game won’t / want with several voices.', 'V-weak'),
  ],
  'A2-S10': [
    w(['es', 'fr', 'it'], 'The L1 past forms map almost one to one, so “was” + -ing can be overused for every past event.', 'Sort scene sentences into “in the middle of it” (was + -ing) and “finished” (past simple) with a picture timeline.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Writes “because … so” in one sentence: “Because it rained, so we stayed.”', 'Show one word per link (because OR so); a sentence-joining game.', 'K'),
    w(['it', 'fr'], 'Misses weak was / were in connected speech and hears one slow word.', 'Listening game on fast speech with several recorded voices.', 'V-weak'),
  ],
  'A2-S11': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Uses an adjective for an adverb: “She sings beautiful”, “He plays good.”', 'A rule line “verb + adverb (-ly); good is for a thing, well is for an action”; a pairing game.', 'K'),
    w(['es', 'fr', 'it'], 'Puts the adverb between the verb and the object: “I like very much football.”', 'Word-block builder: who, do, what, how; the student builds, then says it.', 'K'),
    w(['fr'], 'Final-syllable stress on -ly adverbs (carefulLY).', 'Stress dots; echo a recorded voice.', 'V-weak'),
  ],
  'A2-S12': [
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds “to” after let’s or shall we: “Let’s to go”; and says “How about go?”', 'The rule line “let’s + base verb”, “how about + -ing”; a suggestion ping-pong with fixed frames.', 'K'),
    w(['fr', 'tr', 'it'], '“th” in the ordinal numbers (fourth, fifth, sixth): /t/ or /s/.', 'Aim for being understood; a dates game with recorded voices.', 'V-weak'),
    w(['ar'], 'An extra vowel in clusters of ordinals (fifth, sixth).', 'Say it in blocks; accept a short, clear form.', 'V-weak'),
  ],
  'A2-S13': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Translates direct requests: “Give me the menu.” sounds rude in English.', 'A politeness ladder (Give me → Can I → Could you); the student picks the right level for each scene.', 'K'),
    w(['fr'], 'Flat, high intonation on polite questions (Could you…?).', 'Shadow a recorded voice with a rising tone, then say it alone.', 'V-weak'),
    w(['es', 'fr', 'it'], 'Writes “as big than” or “so big as”.', 'The rule line “as + adjective + as”, with the picture of two equal things.', 'K'),
  ],
  'A2-S14': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Double negatives: “I don’t know nothing”, “Nobody didn’t come.”', 'A one-line rule “one negative per sentence: nothing OR don’t…anything”; a quick correct-the-sentence game.', 'K'),
    w(['tr'], 'Uses the present continuous for habits (the Turkish -yor covers both): “I am going to school every day.”', 'A habits-versus-now sorting game with time words (every day, now, at the moment).', 'K'),
    w(['es', 'fr', 'it', 'ar'], 'Uses the continuous with state verbs: “I am knowing”, “I am wanting.”', 'List five state verbs on the Word Card; recast once, then nudge.', 'K'),
  ],
};

/** The watch list for a Season ([] when none is written yet). */
export function l1WatchFor(seasonId: string): readonly L1WatchItem[] {
  return L1_WATCH[seasonId] ?? [];
}

/** Levels whose Seasons all have a list (used by the test; extend as each level is written). */
export const L1_WATCH_LEVELS: readonly AcademyLevel[] = ['A1', 'A2'];
