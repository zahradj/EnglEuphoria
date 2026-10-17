// Home-language watch list per Season (owner plan, 2026-10-16: "put the home-language trouble spots into each Season's blueprint").
// What a teacher should LISTEN FOR in the first sessions of a Season, for the five home languages of our students (ar, es, fr, tr, it).
// These are error TENDENCIES from contrastive analysis and small studies, not what every student does: the student's own Mistake Bank
// overrides them. Evidence and its limits: docs/research/academy-curriculum-teen-sla-and-l1-gaps.md Part 2 (marks below).
// Source-checked 2026-10-17 against docs/research/academy-l1-check-<lang>.md (ar, es, fr, tr, it); marks changed only where a source is named there; ~80 % of entries had no source found and keep their 'K' mark.
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

/** Keyed by Season id. All 80 Seasons written (2026-10-16); the other levels follow in the same shape. */
export const L1_WATCH: Record<string, readonly L1WatchItem[]> = {
  'A1-S01': [
    w(['ar', 'tr'], 'Leaves out "am/is/are": "I student", "She happy" (Arabic has no present-tense copula; Turkish often leaves it out too).', 'State the rule line "every present sentence has am / is / are"; the student restates it in teach-back; nudge with "Say it with am/is/are."', 'V'),
    w(['ar'], 'Letters b and p sound alike in the alphabet game.', 'Letter-name minimal pairs with several recorded voices (b/p); accept the clear one, replay the other.', 'V-weak'),
    w(['fr'], 'May put the stress on the last syllable of long words such as country names (Canada, Italy) and sound flat.', 'Stress dots on the country-name cards; echo the voice, then say it alone.', 'V-weak'),
    w(['es', 'it'], 'Says age with "have": "I have 13 years".', 'Model "I am 13" next to the L1 pattern once; practise the chunk "I am ... years old" on the introduction card.', 'V-weak'),
  ],
  'A1-S02': [
    w(['es', 'tr', 'it', 'ar', 'fr'], 'Often confuses /ɪ/ and /iː/: "it" and "eat", "ship" and "sheep" (the pair is hard to hear and to say).', 'Minimal-pair listening (it / eat) with several voices, then say the pair; aim to be understood, not perfect.', 'V-weak'),
    w(['es', 'ar', 'tr'], 'An extra vowel before an s-cluster ("eschool", "estreet", "iskool"); Arabic speakers may add one inside it ("siplit").', 'Slow the cluster into blocks (s-k-ool), then speed up; listen-and-repeat with a recorded voice.', 'V-weak'),
    w(['tr', 'ar'], 'Wrong preposition of place (in / on / at): Turkish marks place with a case ending, and Arabic fi, bi- and ʿala do not map one to one onto English.', 'Teach each phrase as a whole chunk ("on the table", "in the box") with the picture, not as a rule.', 'V-weak'),
    w(['ar', 'es', 'fr', 'it'], 'Short vowels /æ/ and /ʌ/ sound alike or like "a": "cat" and "cut" (also "hat" and "heart").', 'Minimal-pair listening (cat / cut / cart) with several recorded voices, then say each; aim to be understood, not perfect.', 'V-weak'),
  ],
  'A1-S03': [
    w(['tr'], 'Verb moved to the end of the clause ("I football play").', 'Show the order with coloured blocks (who, do, what) and let the student build the sentence before saying it.', 'V-weak'),
    w(['it', 'fr'], 'Weak syllables get too much weight, so key words do not stand out.', 'Clap the stress on the key words ("I LOVE swimming"); shadow a recorded voice.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Drops -ing or says "like play" instead of "like playing".', 'Keep "like + -ing" as a fixed chunk with one slot; recast once, then nudge.', 'K'),
  ],
  'A1-S04': [
    w(['fr', 'tr', 'it'], '"th" in "thanks" becomes /t/ or /s/ (France: /s/ or /z/; Quebec: /t/ or /d/).', 'Awareness only at A1 (listen first); accept /t/ or /s/ if the word is understood.', 'V'),
    w(['ar'], 'Swaps /p/ and /b/ in "pizza", "pepper".', 'A p/b minimal-pair game with recorded voices.', 'V-weak'),
    w(['tr', 'ar'], 'Uncountable food words get an article: "a water", "a rice".', 'Teach "some + uncountable" as a chunk ("some water"); keep the picture of the food.', 'K'),
  ],
  'A1-S05': [
    w(['fr'], 'Drops /h/ (“’e has”, “’our”) or adds it to "hour".', '"he / has / hour" minimal-pair game; show the breath with a mirror or tissue picture.', 'V'),
    w(['tr', 'ar'], 'Subject-verb agreement: "she like", "he go" (no -s on he / she / it).', 'The rule line "he / she / it + -s" with an example, stated before the games; teach-back at the end.', 'V'),
    w(['es', 'it', 'tr', 'ar'], 'Leaves out the subject pronoun ("Is a teacher", "Go to school at eight").', 'Choral "He / She + verb" sentence frames; nudge with "Who?"', 'V'),
    w(['tr', 'fr'], 'Mixes up he / she / it: Turkish "o" has no gender; French gives objects a gender ("the report ... he").', 'Picture cards: he = boy, she = girl, it = thing; the student says the pronoun for each card, then a full sentence.', 'V-weak'),
  ],
  'A1-S06': [
    w(['fr', 'tr', 'it'], '"th" in "mother, father, brother" becomes /z/, /d/ or /t/.', 'Aim for intelligible, not perfect; a listen-and-repeat game with the family words.', 'V-weak'),
    w(['es', 'fr', 'it', 'ar'], 'Possessive built like the L1 ("the brother of Ana", "the Ana\'s brother", "the my family") instead of "Ana\'s brother".', 'Show "Ana\'s brother" next to the long form once, then practise the short chunk.', 'V-weak'),
    w(['it'], 'False friend: Italian "parenti" means relatives, not parents.', 'Flag it on the Word Card; add to the Mistake Bank if it appears.', 'K'),
    w(['fr', 'it'], 'Makes his / her agree with the thing owned, not the owner: "Peter and her wife".', 'A picture game with a boy and a girl: his / her follows the owner; the student says one sentence per card.', 'V-weak'),
  ],
  'A1-S07': [
    w(['es'], 'An "e" before s-clusters in street words: "estreet", "estation".', 'Cluster blocks (s-t-reet), then the direction phrase "Go along the street."', 'V'),
    w(['tr', 'ar'], 'Wrong preposition of movement (to / into / across).', 'Teach each as a picture + chunk ("go across the road"); a short map game to fix them.', 'V-weak'),
    w(['it'], 'Adds a vowel after a final consonant ("turn-a", "left-e").', 'Clap the last consonant with a clear stop; shadow a recorded voice.', 'V-weak'),
  ],
  'A1-S08': [
    w(['ar'], 'Difficulty with /ŋ/ in "singing, dancing" (may add a /g/) and with the vowel /æ/ in "can".', 'Minimal pairs can / can\'t with several voices: the vowel carries the meaning, so stress "can\'t".', 'V'),
    w(['tr', 'ar', 'fr'], 'Adds "to" or an -s after can ("can to swim", "she cans").', 'The rule line "can + verb, no to, no -s", stated before the games.', 'K'),
  ],
  'A1-S09': [
    w(['es', 'tr', 'it', 'ar'], 'Often confuses "this" and "these" (the vowels /ɪ/ and /iː/).', 'Minimal-pair game this / these with several voices.', 'V-weak'),
    w(['fr', 'tr', 'it'], '"th" at the start of this, these, that, those.', 'Awareness at A1; accept /d, z/ if understood.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Stress on the wrong syllable in teens and tens (13 / 30).', 'Number-stress game with recorded voices: THIRteen / thirTY.', 'K'),
    w(['tr'], 'Leaves the noun singular after a number: "three book", "two dollar" (Turkish adds no plural after numbers).', 'Number + plural chunks on the price cards ("two dollars", "three books"); recast once, then nudge with "How many?"', 'V-weak'),
  ],
  'A1-S10': [
    w(['tr'], 'Question word order from the L1 ("What you are doing?").', 'Word-block builder for wh-questions; the student builds, then says.', 'V-weak'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'No "do/does" in questions in the L1, so "Where you live?"; and "-ing" forgotten.', 'Keep A1-S10 to wh- + be ("What are you doing? Where is he?"); free "Where do you live?" is A2 production (English Grammar Profile check, 2026-10-16).', 'V-weak'),
    w(['es', 'it', 'tr', 'ar'], 'Leaves out the subject: "Is raining".', 'Sentence frames with the pronoun always shown; nudge with "Who?"', 'V'),
    w(['ar'], 'Leaves out the auxiliary in questions and negatives: "What you want?", "He not like".', 'Word blocks for wh- questions (What + are/is + who + doing); the student builds the question, then says it.', 'V-weak'),
  ],
  'A1-S11': [
    w(['fr', 'tr', 'it'], '"th" in "Thursday" becomes /t/ or /s/.', 'Say it as "THURZ-day"; listen first.', 'V-weak'),
    w(['es', 'fr', 'it'], 'One preposition for all times ("in Saturday", "at the morning").', 'Teach the three time chunks with pictures: in the morning, on Saturday, at six o\'clock.', 'V-weak'),
    w(['ar', 'es', 'fr', 'it'], 'Says "want that I go" or "want go" instead of "want to go".', 'The rule line "want / need + to + verb" stated before the games; weak "to" in the recorded model.', 'K'),
    w(['ar', 'es'], 'Says /v/ as /b/ or /f/: "berry" for "very", "seben" for "seven".', 'Minimal-pair game very / berry with recorded voices; the teeth-on-lip picture for /v/; aim to be understood.', 'V-weak'),
  ],
  'A1-S12': [
    w(['tr', 'ar'], 'Articles: often leaves them out (no "a" in the L1) and may overuse "the" for general ideas.', 'Teach a / an / the with the picture of "one thing, any" versus "that one"; recycle each Season.', 'V'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Adds -s to irregular plurals ("childs", "peoples").', 'A short irregular-plural sort game; add misses to the Mistake Bank.', 'K'),
    w(['fr'], 'Drops /h/ in stressed words ("he", "have", "home", "hand").', '"he / have / home" listen-and-repeat; link with the /h/ work from A1-S05.', 'V-weak'),
    w(['ar', 'es', 'fr'], 'Puts the adjective after the noun: "a car red", "a puppy cute".', 'Colour-and-size cards: the student builds "a red car" with blocks (adjective, noun) before saying it.', 'V-weak'),
  ],
  'A2-S01': [
    w(['ar'], 'May still leave out the past of be: “He sick yesterday”, “We at home.”', 'The rule line “was / were in every past sentence”, stated before the games; nudge with “Say it with was or were.”', 'V-weak'),
    w(['es', 'fr', 'it', 'tr'], 'Says every -ed as a full syllable (“walk-ed”, “play-ed”) because the spelling is read as written, or drops the ending.', 'Sort verbs by the three sounds /t/ /d/ /ɪd/ with recorded voices, then say them; this is a listening-first game.', 'V-weak'),
    w(['tr'], 'Pronounces words as they are spelled, so silent letters and endings are wrong.', 'Pair the written form with the recorded voice every time; add 3 to 4 words to the Daily 10 dictation.', 'V'),
    w(['ar'], 'Puts the wrong ending on the verb rather than leaving it out (“walkd”, “playes”).', 'Say the three -ed sounds /t/ /d/ /ɪd/ with recorded voices, then spell them; check the ending with the student.', 'V-weak'),
  ],
  'A2-S02': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Regularises irregular verbs: “goed”, “buyed”, “taked”.', 'Keep the irregular list small and sorted by pattern; every miss goes to the Mistake Bank and returns in the Remember? within days.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Puts the past on both verbs: “Did you went?”, “I didn’t went.”', 'The rule line “did / didn’t + base verb, no -ed, no past form”, stated before the games; teach-back at the end.', 'K'),
    w(['it', 'fr'], 'Uses the present perfect for a finished time: “Yesterday I have bought.” (the L1 compound past)', 'Introduce the time-word rule early: if you say when, use the past simple. Full contrast comes at B1.', 'V-weak'),
  ],
  'A2-S03': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Doubles the marker: “more bigger”, “more cheaper”; or uses “more” for every adjective.', 'Sort adjectives into -er and more + adjective groups; a short rule line with one example each.', 'K'),
    w(['fr', 'tr', 'it'], '“than” said with /d/, /z/ or /t/ (weak /ðən/ lost).', 'Aim for being understood; shadow a recorded voice on a few comparison sentences.', 'V-weak'),
    w(['fr', 'it'], 'May stress the last syllable of long adjectives (expenSIVE, comforTAble).', 'Stress dots on the adjective cards; echo then say alone.', 'V-weak'),
  ],
  'A2-S04': [
    w(['es', 'fr', 'it'], 'Often fine (voy a, je vais, vado a): the L1 pattern matches, so watch for “I go to travel” or a missing “be”.', 'Check am / is / are before going to; use a quick substitution drill.', 'K'),
    w(['ar', 'tr'], 'Uses the present simple or will for every plan, or leaves out “be”: “I going to study.”', 'The rule line “am / is / are + going to + verb”; build it with blocks first.', 'K'),
    w(['it', 'fr'], 'Hears “going to” as “gonna” and does not recognise it.', 'Listening games with both forms and several recorded voices (a listening aim, not a speaking aim).', 'K'),
  ],
  'A2-S05': [
    w(['tr', 'ar', 'fr'], 'Adds “to” or -s after should: “should to go”, “he shoulds”.', 'The rule line “should + base verb, no to, no -s”, stated before the games.', 'K'),
    w(['es'], 'Uses “too” where English says “very”: “It is too good.”', 'A short sorting round: too = more than you want; very = a lot.', 'K'),
    w(['es', 'fr', 'it'], 'Puts “enough” before the adjective: “enough big” (L1 order).', 'The rule: enough comes after the adjective (big enough).', 'K'),
    w(['tr'], 'Reads body words as spelled: “stomach” with /tʃ/, “headache” with an extra sound.', 'Recorded voice on each body word before the student says it; add to the Daily 10 dictation.', 'V-weak'),
  ],
  'A2-S06': [
    w(['es', 'fr', 'it'], 'Treats mustn’t and don’t have to as the same (“You don’t have to smoke here”).', 'A rules-sign sorting game: mustn’t = not allowed, don’t have to = not necessary; the student sorts first, then says one of each.', 'K'),
    w(['ar'], 'May add an extra vowel in the final cluster of “mustn’t”.', 'Say it in blocks (muss-nt) and let the silent t go; accept a clear, short version.', 'K'),
    w(['tr', 'ar'], 'Adds “to” after must: “You must to wear a helmet.”', 'The rule line “must + base verb, no to; have to is different”.', 'K'),
  ],
  'A2-S07': [
    w(['fr', 'it', 'es'], 'Uses plural for uncountable nouns: “informations”, “advices”, “hairs”, “breads”.', 'Sort food words into countable and uncountable with the picture; keep “some” and “a lot of” as chunks.', 'V'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Uses “much” in positive sentences: “I eat much rice.”', 'The rule line “a lot of in positive sentences; much and many in questions and negatives”.', 'K'),
    w(['fr'], 'May stress the last syllable of food words (vegeTABLE, chocoLATE).', 'Stress dots on the cards; echo the recorded voice.', 'V-weak'),
  ],
  'A2-S08': [
    w(['es', 'fr', 'it'], 'Says “for + verb” for purpose: “I go there for study.” (para / pour / per)', 'Show “to + verb” beside the L1 pattern once; practise 4 fixed sentences.', 'K'),
    w(['es', 'fr', 'it'], 'Uses the wrong preposition for transport: “in bus”, “with the bus”.', 'A picture game: by bus, by train, on foot, in a car; teach as chunks.', 'K'),
    w(['tr', 'ar'], 'Wrong prepositions of movement (to / into / across).', 'Short map game with the movement phrases as chunks.', 'V-weak'),
  ],
  'A2-S09': [
    w(['es', 'fr', 'it'], 'Uses the present or “going to” for a decision made now: “I take the red one.”', 'Teach will for decisions with a shop scene: the student decides on the spot; contrast with plans from A2-S04.', 'K'),
    w(['tr', 'ar'], 'Adds “to” after will or an -s: “I will to go”, “she wills”.', 'The rule line “will + base verb”; the contracted ’ll in the recorded model.', 'K'),
    w(['es'], 'won’t and want sound alike (the vowels /əʊ/ and /ɒ/ merge).', 'Minimal-pair game won’t / want with several voices.', 'K'),
  ],
  'A2-S10': [
    w(['es', 'fr', 'it'], 'The L1 past forms map almost one to one, so “was” + -ing can be overused for every past event.', 'Sort scene sentences into “in the middle of it” (was + -ing) and “finished” (past simple) with a picture timeline.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Writes “because … so” in one sentence: “Because it rained, so we stayed.”', 'Show one word per link (because OR so); a sentence-joining game.', 'K'),
    w(['it', 'fr'], 'Gives weak was / were a full vowel in connected speech, so the sentence sounds slow.', 'Listening game on fast speech with several recorded voices.', 'V-weak'),
  ],
  'A2-S11': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Uses an adjective for an adverb: “She sings beautiful”, “He plays good.”', 'A rule line “verb + adverb (-ly); good is for a thing, well is for an action”; a pairing game.', 'K'),
    w(['es', 'fr', 'it'], 'Puts the adverb between the verb and the object: “I like very much football.”', 'Word-block builder: who, do, what, how; the student builds, then says it.', 'V'),
    w(['fr'], 'May stress the last syllable of -ly adverbs (carefulLY).', 'Stress dots; echo a recorded voice.', 'V-weak'),
  ],
  'A2-S12': [
    w(['tr', 'ar', 'es', 'fr'], 'Adds “to” after let’s or shall we: “Let’s to go”; and says “How about go?”', 'The rule line “let’s + base verb”, “how about + -ing”; a suggestion ping-pong with fixed frames.', 'K'),
    w(['fr', 'tr', 'it'], '“th” in the ordinal numbers (fourth, fifth, sixth): /t/ or /s/.', 'Aim for being understood; a dates game with recorded voices.', 'V-weak'),
    w(['ar'], 'May add an extra vowel in clusters of ordinals (fifth, sixth).', 'Say it in blocks; accept a short, clear form.', 'K'),
  ],
  'A2-S13': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Translates direct requests: “Give me the menu.” sounds rude in English.', 'A politeness ladder (Give me → Can I → Could you); the student picks the right level for each scene.', 'K'),
    w(['fr'], 'Little pitch fall on polite questions (Could you…?).', 'Shadow a recorded voice with a rising tone, then say it alone.', 'V-weak'),
    w(['es', 'fr', 'it'], 'Writes “as big than” or “so big as”.', 'The rule line “as + adjective + as”, with the picture of two equal things.', 'K'),
  ],
  'A2-S14': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Double negatives: “I don’t know nothing”, “Nobody didn’t come.”', 'A one-line rule “one negative per sentence: nothing OR don’t…anything”; a quick correct-the-sentence game.', 'K'),
    w(['tr'], 'May use the present continuous for habits: “I am going to school every day.”', 'A habits-versus-now sorting game with time words (every day, now, at the moment).', 'K'),
    w(['es', 'ar'], 'Uses the continuous with state verbs: “I am knowing”, “I am wanting.”', 'List five state verbs on the Word Card; recast once, then nudge.', 'K'),
  ],
  'B1-S01': [
    w(['it', 'fr'], 'Uses the present perfect with a finished time: “Yesterday I have seen it”, “Last year I have been to Rome.”', 'Teach the time-word rule early: if you say when, use the past simple; the rule line plus a sorting game (experience or finished time).', 'V-weak'),
    w(['tr', 'ar'], 'Uses the past simple where English needs the present perfect: “Did you ever eat sushi?”, “I went to Paris” for a life experience.', 'Contrast the two with a timeline picture; “ever / never / been” as fixed cues.', 'V'),
    w(['es', 'it'], 'Mixes up gone and been (“I have gone to Italy” for a finished trip) or uses be as the auxiliary (“I was been”, “I am gone”).', 'A short “been = returned, gone = still there” sorting round with pictures; the rule line “have + participle, never be”.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Wrong or regularised participles: “I have eated”, “I have saw”.', 'Sort the participles by pattern; misses go to the Mistake Bank.', 'K'),
  ],
  'B1-S02': [
    w(['es', 'fr', 'it'], 'Mixes used to + verb with be used to + -ing (“I am used to play”).', 'Keep to used to + verb at this level; show be used to only as a note.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Says “I used to going” or keeps the d in the question: “Did you used to…?”', 'The rule line “used to + base verb; didn’t use to in questions and negatives”.', 'K'),
    w(['fr', 'it'], 'Reads the /s/ in “used to” as /z/ and the weak “to” disappears.', 'Shadow a recorded voice with “used to” in connected speech (understandable is enough).', 'K'),
  ],
  'B1-S03': [
    w(['it', 'es', 'fr'], 'Uses the present simple for “for / since”: “I live here since 2020”, “I study English for three years” (it da, es desde, fr depuis).', 'The rule line “started in the past and still true now: have + participle + for / since”; a timeline sorting game.', 'V-weak'),
    w(['tr', 'ar'], 'Uses the past simple for a situation that continues: “I lived here for five years” (when they still do).', 'Ask “Do you still live here?” to make the contrast; use the timeline picture.', 'V-weak'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Confuses for and since, or says “How long time?”', 'Sort time expressions into a period (for) and a starting point (since); “How long…?” as a chunk.', 'K'),
  ],
  'B1-S04': [
    w(['it', 'es', 'fr'], 'Present perfect with a finished-time word in news stories: “The mayor has said it yesterday.”', 'A news-headline game: headline in the present perfect, details in the past simple; the time-word rule on the board.', 'V-weak'),
    w(['tr', 'ar'], 'Past simple for everything in a news report.', 'Use headline-then-detail: the first sentence gives the news (present perfect), the next ones give the time (past simple).', 'V-weak'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Wrong participle forms (“said”, “been”, “seen” confused with the past simple).', 'Trio sorting (base, past, participle) from B1-S01 recycled in the Remember?', 'K'),
  ],
  'B1-S05': [
    w(['it'], 'Uses will in the if-clause: “If it will rain, we stay home.”', 'The rule line “if + present simple, will + verb”; build the two halves with blocks.', 'K'),
    w(['tr', 'ar'], 'Puts the result first or mixes the order without a comma; clause order from the L1.', 'A card game that swaps the clause order with the comma moving.', 'K'),
    w(['fr', 'it'], 'Misses the pause after the if-clause and reads the sentence flat.', 'Shadow a recorded voice with the pause; clap the comma.', 'K'),
  ],
  'B1-S06': [
    w(['es'], 'Uses would in the if-clause: “If I would have money, I would travel.”', 'The rule line “if + past simple, would + verb”; hand it over as a swap game.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Says “If I was you” (common in everyday English) or “If I would be you”.', 'Accept “was” in speech; teach “If I were you” as a stock phrase for advice, and rule out would in the if-clause.', 'K'),
    w(['fr', 'tr', 'it'], 'Hears and says ’d as “had” or loses it: “I’d go” sounds like “I go”.', 'Minimal-pair listening (I go / I’d go) with several recorded voices.', 'V-weak'),
  ],
  'B1-S07': [
    w(['es', 'fr', 'it'], 'Uses the L1 impersonal pattern (Spanish se, French on, Italian si) instead of the passive: “Here speaks English” (es), “Here one speaks English” (fr).', 'A simple build: object + be + participle (English is spoken here); keep to the present and past simple.', 'K'),
    w(['tr', 'ar'], 'Leaves out be: “English spoken here”; or uses the active.', 'The rule line “be + past participle”; a transform game (active to passive).', 'V'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Says -ed as a full syllable in every participle.', 'Sort the participles by /t/ /d/ /ɪd/ with recorded voices.', 'K'),
  ],
  'B1-S08': [
    w(['ar'], 'Resumptive pronoun in relative clauses (Arabic keeps it): “The book that I read it.”', 'Cross the pronoun out in a merging game; nudge with “Do you need it twice?”', 'V'),
    w(['fr', 'it'], 'Uses “what” for “that”: “The thing what I like.”', 'Sort relative pronouns by what they refer to (person, thing, place).', 'K'),
  ],
  'B1-S09': [
    w(['es', 'fr', 'it'], 'Uses must for every deduction and must not for “can’t be”: “He must not be at home.”', 'A clue-board game: must (sure), might (maybe), can’t (sure not); the student sorts the clues.', 'K'),
    w(['tr', 'ar'], 'Adds “to” after the modal: “He might to be here.”', 'The rule line “must / might / can’t + base verb”.', 'K'),
    w(['fr', 'tr', 'it'], 'Misses the weak form of modals and hears “can” for “can’t”.', 'Minimal-pair listening with several voices; the vowel carries the meaning.', 'V-weak'),
  ],
  'B1-S10': [
    w(['es', 'fr', 'it'], 'Uses the present simple for a plan: “Tomorrow I meet my friends.” (a normal L1 pattern)', 'Check with “Is it arranged?”; teach the present continuous for arrangements with a diary picture.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Uses “will” for a plan already made, or the present continuous for a promise.', 'A two-pile sorting game: arranged (continuing) or promised on the spot (will).', 'K'),
    w(['fr', 'it', 'tr'], 'Loses the contracted ’ll in “I’ll be there”.', 'Shadow a recorded voice with ’ll in promises.', 'V-weak'),
  ],
  'B1-S11': [
    w(['es', 'fr', 'it'], 'Uses the infinitive where English needs -ing (“I enjoy to read”) or the reverse (“I want going”).', 'Group verbs into two boxes (+ -ing / + to) with an anchor example; a sorting race that is a personal best, not a ranking.', 'V-weak'),
    w(['ar'], 'Uses “for” + verb or a that-clause: “I want that you come.”', 'Show “want + object + to + verb” beside the L1 pattern once.', 'K'),
    w(['fr', 'it', 'tr'], 'Weak “to” disappears or becomes “too”.', 'Shadow a recorded voice with “to” in the chain.', 'V-weak'),
  ],
  'B1-S12': [
    w(['es', 'fr', 'it'], 'Keeps the question word order in an indirect question: “Could you tell me where is the station?”', 'The rule line “statement order after Could you tell me…”; a word-block builder.', 'K'),
    w(['tr', 'ar', 'fr'], 'No backshift: “He said he is tired.”', 'Say/tell sorting: say + something, tell + someone; a short backshift timeline (present → past).', 'K'),
    w(['es', 'it'], 'Says “say me” for “tell me”: “Say me your name.” (one verb covers say and tell)', 'Say/tell sorting: say + something, tell + someone; the chunk “tell me your name”.', 'K'),
  ],
  'B1-S13': [
    w(['es', 'fr', 'it'], 'Uses the past simple instead of the past perfect: “When I arrived, he left.” (for “had left”)', 'A timeline game with two past events: which happened first?', 'K'),
    w(['tr', 'ar'], 'Omits had or uses it with the wrong form: “I had went.”', 'The rule line “had + past participle”; participle trio sorting.', 'K'),
    w(['fr', 'it', 'tr'], 'Loses the contracted ’d for had in speech.', 'Listening game with ’d (had) versus ’d (would) from B1-S06.', 'V-weak'),
  ],
  'B1-S14': [
    w(['es', 'fr', 'it'], 'Uses wish + would or wish + the present: “I wish I have more time.”', 'The rule line “wish + past simple (I wish I had …)”; a wish-list builder.', 'K'),
    w(['tr', 'ar'], 'Says “wish” for “want”: “I wish to go” (formal) or confuses it with hope.', 'Sort sentences into real now (want) and not real now (wish) with a picture.', 'K'),
    w(['it'], 'Adds a vowel after the final sound of “wish” (“wishi”).', 'Minimal pair wish / wit / with; stop on the last sound; aim to be understood.', 'V-weak'),
  ],
  'B1-S15': [
    w(['es', 'fr', 'it'], 'Treats mustn’t and don’t have to as the same (revisits A2-S06).', 'A visa-rules sorting game: not allowed or not necessary; return the A2 items in the Remember?', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Uses “although … but” in one sentence: “Although it was late, but we went.”', 'Show one word per link; a sentence-merging game.', 'K'),
    w(['ar', 'tr'], 'Uses “even though” and “although” the wrong way round or leaves out a verb.', 'A short build with blocks; teach-back of the rule.', 'K'),
  ],
  'B1-S16': [
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Wrong tag auxiliary: “You like it, isn’t it?” (French n’est-ce pas) or “no?” for all tags (Spanish, Italian).', 'The rule line “same auxiliary, opposite sign”; a quick-fire tag-matching game.', 'K'),
    w(['fr', 'it'], 'Flat intonation: every tag sounds like a real question.', 'Rising versus falling tags with recorded voices (confirm or ask); shadow, then say.', 'K'),
    w(['es', 'fr', 'it'], 'Separates phrasal verbs wrongly: “Turn off it”, “Look for them up.”', 'Sort separable and inseparable phrasal verbs by whether a pronoun goes in the middle.', 'K'),
  ],
  'B1-S17': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Leaves out “that” or uses “so… as”: “It was so cold, we stayed.”', 'The rule line “so + adjective + that”; blocks for the result.', 'K'),
    w(['es', 'fr', 'it'], 'Uses reflexive pronouns where English does not (“I feel myself good”, “wash myself my hands”).', 'List verbs that take no reflexive in English (feel, relax, get up) on a Word Card.', 'K'),
    w(['fr', 'ar'], 'Adds a vowel at the end of -selves /selvz/.', 'Say it in blocks and shadow a recorded voice.', 'K'),
  ],
  'B1-S18': [
    w(['es', 'fr', 'it'], 'Puts “enough” before the adjective: “enough big” (L1 order).', 'The rule line “adjective + enough; enough + noun”; sort “enough” sentences.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Mixes few and little: “a little friends”, “a few money.”', 'Countable / uncountable sorting with the picture; keep few and little as chunks.', 'K'),
    w(['es', 'it', 'tr'], 'Reads the “gh” in enough as written (/g/ or /gh/) instead of /f/.', 'Pair the written word with the recorded voice; add to the Daily 10 dictation.', 'V-weak'),
  ],
  'B2-S01': [
    w(['it', 'es', 'fr'], 'Present simple for a continuing activity: “I study English since 2020.” (it da, es desde, fr depuis)', 'Recycle B1-S03: timeline sort, then “How long have you been …-ing?” with a diary picture.', 'V-weak'),
    w(['es', 'tr', 'ar'], 'Uses the continuous with state verbs: “I have been knowing him for years.”', 'The Word Card of state verbs; sort “activity” and “state” verbs.', 'K'),
    w(['fr', 'it', 'tr'], 'Loses the weak “’ve been” /əv bɪn/ and hears it as “be”.', 'Minimal-pair listening with several recorded voices.', 'V-weak'),
  ],
  'B2-S02': [
    w(['es', 'ar', 'tr'], 'Uses “would have” in the if-clause: “If I would have known, I would have gone.”', 'The rule line “if + past perfect, would have + participle”; swap-the-half builder.', 'K'),
    w(['es', 'fr', 'it'], 'Says “I wish I would have …” for a past regret.', 'The rule line “wish + past perfect”; a regrets board (what I wish I had done).', 'K'),
    w(['fr', 'it', 'tr'], 'Misses weak “have” in “would’ve / could’ve” and writes “would of”.', 'Listening game with the contracted forms and a spelling check.', 'V-weak'),
  ],
  'B2-S03': [
    w(['es', 'fr', 'it'], 'Uses the L1 impersonal pattern (Spanish se, French on, Italian si) instead of the passive, or the active with “people”.', 'Active-to-passive transform game for all tenses; keep the agent “by” only when it adds information.', 'K'),
    w(['tr', 'ar'], 'Leaves out be or uses the wrong form of be: “It built in 1990”, “It is being built” missed.', 'Build the passive with blocks: object + be (tense) + participle; the Mistake Bank for forms of be.', 'V'),
    w(['fr', 'it'], 'Weak forms “been” and “being” are lost in fast speech.', 'Listening and shadowing with several voices.', 'V-weak'),
  ],
  'B2-S04': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Keeps question order in a reported question: “He asked me where was I.”; leaves out if/whether.', 'The rule line “statement order after asked”; word blocks; if / whether in a coloured block.', 'K'),
    w(['es', 'fr', 'it'], 'Says “He told me to not go” or “He told that…” instead of “told me not to go”, “said that”.', 'Sort say / tell / ask patterns; a short matching game.', 'K'),
  ],
  'B2-S05': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Leaves out the commas or uses “that” in a non-defining clause: “My brother, that lives in Rome …”.', 'The rule line “who / which, with commas; no that”; a comma-and-pause shadowing game.', 'K'),
    w(['fr', 'it'], 'Uses “what” for “which”: “He passed, what surprised me.”', 'Sort which (the whole clause) and what (a thing); short corrections in the Mistake Bank.', 'K'),
  ],
  'B2-S06': [
    w(['es', 'fr', 'it'], 'Uses should have, must have and might have interchangeably (the L1 conditional perfect covers all of them): “He should have been at home” for a deduction.', 'Three-level scale: must have (sure), might have (maybe), can’t have (sure not); criticism uses should have; a clue-board game.', 'K'),
    w(['tr', 'ar', 'fr', 'it'], 'Wrong participle or “should of” in writing: “She should have went.”', 'Participle trio sorting recycled from B1-S01; a quick spelling check.', 'K'),
    w(['fr', 'it', 'tr'], 'Loses weak “have” /əv/.', 'Shadow a recorded voice with “should’ve / could’ve”.', 'V-weak'),
  ],
  'B2-S07': [
    w(['fr', 'it'], 'Uses the future after “when / by the time / as soon as”: “When I will graduate, I will travel.”', 'The rule line “time clause = present, main clause = will”; a clause-order builder.', 'K'),
    w(['tr', 'ar'], 'Uses the simple future for something in progress at a future time, or leaves out “have” in “will have finished”.', 'Timeline pictures: will be -ing (in progress at 5 pm) versus will have -ed (done by 5 pm).', 'K'),
    w(['fr', 'it'], 'Hears “will have” /wɪl əv/ as one word.', 'Listening game with several recorded voices.', 'V-weak'),
  ],
  'B2-S08': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Uses “despite of” or “in spite” without “of”, or “despite that”.', 'A fixed-chunk card: despite + noun / -ing; in spite of + noun / -ing.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Joins sentences with “however” and a comma: “It was good, however it was long.”', 'Punctuation sort: however starts a new sentence or follows a semicolon.', 'K'),
    w(['fr', 'it', 'es'], 'False friend: “actually” used for “currently”.', 'Word Card flag; Mistake Bank if it appears.', 'V-weak'),
  ],
  'B2-S09': [
    w(['es', 'fr', 'it'], 'Uses the active with a reflexive: “I cut my hair” or “I repaired my car” when someone else did it.', 'A photo game: who did it? I had my car repaired / I repaired it myself.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Indirect question order: “Could you tell me where is the bank?”', 'Recycle B1-S12: statement order after “Could you tell me”; a polite-request builder.', 'K'),
  ],
  'B2-S10': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Double negative with unless: “Unless you don’t come, …”', 'The rule line “unless = if not, so no second negative”; swap-the-sentence game.', 'K'),
    w(['fr', 'it'], 'Uses will in the condition: “As long as it will be easy, I’ll do it.”', 'Recycle B1-S05: present in the condition clause, will in the result.', 'K'),
  ],
  'B2-S11': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Does not separate “remember to do” (the future task) and “remember doing” (the memory); “stop to” and “stop -ing”.', 'A picture pair for each verb (remember, stop, try); the student picks the meaning before the form.', 'K'),
    w(['es', 'fr', 'it', 'ar'], 'Uses “the” for general ideas: “The life is hard”, “I like the music.” (the L1 uses the definite article here)', 'Sort sentences into general (no article) and specific (the); keep it to five examples.', 'V'),
    w(['tr', 'ar'], 'Leaves out articles or uses “a” everywhere.', 'Recycle A1-S12: a / an / the sorting; a short article quiz in the Daily 10.', 'V'),
  ],
  'B2-S12': [
    w(['ar'], 'Keeps a resumptive pronoun in the cleft: “What I need, it is a rest.”', 'The rule line “What I need is …” with blocks; remove the extra pronoun.', 'K'),
    w(['fr', 'es', 'it'], 'Uses “what” instead of “that” in a cleft: “It was the key what I needed.”', 'A clefting game: person (who), thing (that), place (where).', 'K'),
  ],
  'B2-S13': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Dangling participles: “Walking down the street, the sun was hot.”', 'Ask “Who is walking?”; a match-the-subject game.', 'K'),
    w(['es', 'it', 'tr'], 'Drops the subject in the main clause after an ellipsis (a pro-drop transfer): “Went to the shop and bought bread.”', 'Subject-checking in the Mistake Bank; speak in two clear clauses.', 'V-weak'),
  ],
  'B2-S14': [
    w(['es', 'fr', 'it'], 'Says “as more as” or leaves out the second “the”: “The more you practise, more you learn.”', 'The rule line “the + comparative, the + comparative”; a paired-sentences builder.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Mixes so and such: “It was so a good film.”', 'The rule line “so + adjective, such + (a) + noun”; sort sentences.', 'K'),
  ],
  'B2-S15': [
    w(['es', 'fr', 'it'], 'Uses the L1 object pattern: “He suggested me to go”, “She admitted to do it.”', 'A pattern table (suggest + -ing / that, admit + -ing, insist on, deny + -ing); sort 8 verbs.', 'K'),
    w(['tr', 'ar'], 'Uses a to-infinitive after every reporting verb.', 'The same pattern table with one example per verb; the Mistake Bank returns it.', 'K'),
  ],
  'B2-S16': [
    w(['es', 'fr', 'it'], 'Writes “in the other hand” and overuses “moreover” and “furthermore”.', 'A connector menu: on the one hand / on the other hand; vary the markers (one use each per paragraph).', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Mixes “at the end” and “in the end”, “besides” and “beside”.', 'A pair-picking game with example sentences.', 'K'),
  ],
  'B2-S17': [
    w(['es', 'fr', 'it'], 'Uses “for + verb” for purpose: “I study for pass the exam.”', 'The rule line “to / in order to / so as to + verb”; “so that” + a full clause.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Says “had better to go” or “better go”.', 'The rule line “had better + base verb”; a warning-sign game.', 'K'),
  ],
  'B2-S18': [
    w(['es', 'fr', 'it'], 'Uses the infinitive after a preposition: “Before to leave”, “instead to go”, “look forward to meet you”.', 'The rule line “preposition + -ing”; a gap-fill sort of look forward to, instead of, apart from.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Confuses “be used to + -ing” with “used to + verb”.', 'A sort game recycling B1-S02: habit in the past (used to) versus familiar now (be used to).', 'K'),
  ],
  'C1-S01': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'No inversion after a fronted negative: “Rarely we go there.”', 'The rule line “negative adverbial first, then auxiliary + subject”; a fronting builder.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Over-inverts or puts a main verb before the subject: “Rarely go we there.”', 'Auxiliary-only practice: do / have / can before the subject.', 'K'),
  ],
  'C1-S02': [
    w(['es', 'it'], 'Is helped by the L1 inverted conditional (de haber sabido, se avessi saputo), but copies the order literally.', 'Contrast L1 and English once, then drill “Had I known…”.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Mixes the tenses in a mixed conditional: “If I studied more, I would have passed.”', 'A two-timeline picture (past cause, present result); sort sentences.', 'K'),
  ],
  'C1-S03': [
    w(['es', 'fr', 'it'], 'Uses the L1 impersonal pattern: “It says that…” for “It is said that…”.', 'A reporting-structure builder: it is said that / he is said to / he is thought to have.', 'K'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Wrong infinitive: “He is said to has left.”', 'The rule line “to + base / to have + participle”; a timeline match.', 'K'),
  ],
  'C1-S04': [
    w(['es', 'fr', 'it'], 'Has a subjunctive in the L1 and builds a que / che clause: “I want that he comes”; after “suggest”, both “that he go” and “that he should go” are formal English.', 'Show the base form “I suggest that he go” and accept “should go”; teach “want him to come” as the chunk; a formal-advice builder.', 'K'),
    w(['tr', 'ar'], 'Uses “would rather” with the wrong form: “I would rather to stay.”', 'The rule line “would rather + base verb (+ past simple for another person)”.', 'K'),
  ],
  'C1-S05': [
    w(['es', 'fr', 'it'], 'Is helped by Latin-based nouns but builds heavy “of … of …” chains, or uses a noun where English prefers a verb.', 'A transform game: verb phrase to noun phrase and back; keep each noun phrase to two “of”s.', 'K'),
    w(['ar'], 'Places the modifier after the noun or leaves out articles in long noun phrases.', 'A blocks builder for noun phrases (determiner, adjectives, noun, of-phrase).', 'K'),
    w(['tr'], 'Leaves out articles in long noun phrases.', 'A blocks builder for noun phrases (determiner, adjectives, noun, of-phrase).', 'K'),
  ],
  'C1-S06': [
    w(['es', 'fr', 'it', 'tr', 'ar'], '“Not only … but” without inversion: “Not only he came but …”', 'The rule line “Not only + auxiliary + subject”; a fronting builder.', 'K'),
    w(['es', 'it', 'tr'], 'Misses the stress on the fronted word and speaks in an even rhythm.', 'Clap the stress and shadow a recorded voice.', 'V-weak'),
  ],
  'C1-S07': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Dangling perfect participle: “Having finished, the exam was easy.”', 'Ask “Who finished?”; a match-the-subject game recycled from B2-S13.', 'K'),
    w(['es', 'fr', 'it'], 'Uses the L1 perfect gerund (Spanish “habiendo terminado”, French “ayant fini”, Italian “avendo finito”) as a model but loses the perfect: “Finishing yesterday, I …”', 'A timeline: first event (having + participle), second event (main clause).', 'K'),
  ],
  'C1-S08': [
    w(['es', 'fr', 'it'], 'False friends in stance words: “actually” (for currently), “eventually” (for possibly).', 'Word Card with the false friends; add to the Mistake Bank if they appear.', 'V-weak'),
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Sounds too direct or too certain in discussion; hedges are rare in the L1 style.', 'A hedging ladder: it is clear / it seems / arguably; the student restates a claim at three levels.', 'K'),
  ],
  'C1-S09': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Formal in speech or informal in an email (contractions, phrasal verbs, “Hi” to an unknown person).', 'A register sort: formal, neutral, informal; the student rewrites one message both ways.', 'K'),
    w(['tr', 'ar'], 'Politeness norms may differ (titles, indirect requests); English formality is signalled mostly by vocabulary and structure.', 'Scenario cards (a teacher, a manager, a friend); pick the right register, then say why.', 'K'),
  ],
  'C1-S10': [
    w(['es', 'fr', 'it', 'tr', 'ar'], '“Although … but” in one sentence, or “much as” misused: “Much as I like it but …”.', 'The rule line “one concession word per clause”; a clause-merging game.', 'K'),
    w(['es', 'fr', 'it'], 'Misses the adjective + as pattern: “Strange as it may seem” (as is not “because”).', 'Five fixed models to shadow; a short paraphrase game.', 'K'),
  ],
  'C1-S11': [
    w(['es', 'fr', 'it'], 'Mixes “needn’t have” and “didn’t need to”: “I needn’t have gone” (I went but it was not necessary) versus “I didn’t need to go” (no need).', 'A two-picture game (went or not); the student chooses and says it.', 'K'),
    w(['tr', 'ar'], 'Uses must for every obligation and past obligation.', 'A modal-nuance ladder (must, have to, need to, needn’t, be bound to); sort 10 sentences.', 'K'),
  ],
  'C1-S12': [
    w(['es', 'fr', 'it'], 'Collocation calques: “make a photo”, “do a mistake”, “say a lie”.', 'A collocation matcher (make / do / take / have); keep each miss in the Mistake Bank.', 'V-weak'),
    w(['tr', 'ar'], 'Calques of idioms and fixed phrases translated word for word.', 'Learn idioms as whole chunks with a picture; the student says what the L1 idiom means in English.', 'K'),
  ],
  'C1-S13': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Copies the source structure and vocabulary when summarising (little real reformulation).', 'A summary ladder: paraphrase one sentence, then two; the student changes the structure.', 'K'),
    w(['es', 'fr', 'it'], 'False friends in summary words: “actually”, “sensible / sensitive”.', 'Word Card flag; the Mistake Bank.', 'V-weak'),
  ],
  'C1-S14': [
    w(['tr', 'ar', 'es', 'fr', 'it'], 'Rhetorical habits differ by language (repetition, indirectness); this is a contested area, so listen without judging.', 'Model a rule of three; the student tries two and three and compares the effect.', 'K'),
    w(['fr', 'it'], 'Little pitch fall and equal weight on weak syllables, so pauses and emphasis are missing in a speech.', 'Mark pauses and emphasis in the text; shadow a recorded voice.', 'V-weak'),
  ],
  'C1-S15': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Irony and understatement are signalled by tone and context; literal reading is common.', 'A short listening game: sincere or ironic? with several recorded voices; the student explains the clue.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Misses British-style understatement (“not bad”, “a bit of a problem”).', 'A meaning-in-context sort: what did the speaker really mean?', 'K'),
  ],
  'C1-S16': [
    w(['es', 'it', 'tr'], 'Omits subjects and loses track of who is meant (a pro-drop habit), so reference chains become unclear.', 'A reference-checking pass in the portfolio: underline each “it / they / this” and say what it points to.', 'V-weak'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Overuses the same connector or places it in the wrong position.', 'A connector menu (adding, contrast, result); vary one per paragraph.', 'K'),
  ],
  'C1-S17': [
    w(['es', 'fr', 'it'], 'Mis-orders “However small the change”: “However the change is small”.', 'The rule line “however + adjective + subject + verb”; a word-block builder.', 'K'),
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Omits a “the” in “The more … the more” or the verb be.', 'A paired-sentences builder with both “the”s marked.', 'K'),
  ],
  'C1-S18': [
    w(['es', 'fr', 'it', 'tr', 'ar'], 'Absolute phrases are rare in the L1, so “Time permitting” or “Weather allowing” sound unnatural when invented.', 'Teach six fixed phrases with a picture; let the student replace the subject in each.', 'K'),
    w(['es', 'fr', 'it'], 'Dangling absolute phrases: the subject differs from the main clause but is not stated.', 'Ask “Who or what is …?”; a subject-matching game.', 'K'),
  ],
};

/** The watch list for a Season ([] when none is written yet). */
export function l1WatchFor(seasonId: string): readonly L1WatchItem[] {
  return L1_WATCH[seasonId] ?? [];
}

/** Levels whose Seasons all have a list (used by the test; extend as each level is written). */
export const L1_WATCH_LEVELS: readonly AcademyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
