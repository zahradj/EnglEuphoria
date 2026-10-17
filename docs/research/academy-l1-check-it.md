# Italian (it) home-language watch list: source check

Date: 2026-10-17. Scope: every entry in `src/curriculum/academy/l1Watch.ts` whose langs include `it` (161 entries, A1-S02 to C1-S18). Academy hub only; no other file changed.

## Method note

- Extracted the 161 entries with awk/regex from `l1Watch.ts`. Sources were found with web search (US-only, "standard" mode) and then opened with curl.
- **Opened and read in full (text extracted):**
  - Flash Academy "Learner profile: Italian", a 4-page PDF (2025): https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949 (FA below). Practitioner guidance, publisher not stated in the file.
  - Pronunciation Studio, "Italian speakers' English pronunciation errors": https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/ (PS; top-10 list from teaching experience).
  - BoldVoice, English pronunciation for Italian speakers: https://boldvoice.com/blog/english-pronunciation-italian-speakers (BV; blog).
  - Editor World, common English mistakes Italian writers make: https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make (EW; editing-service article, written English).
  - Cambridge Dictionary blog on countability errors: https://dictionaryblog.cambridge.org/2014/11/26/countability-grammar-codes/ (CAM; names Italian among the ten L1s that most often make plural-of-uncountable errors, from the Cambridge Learner Corpus).
- **Seen only as a search-result summary or abstract page; the full text was not read:**
  - Uni Roma Tre record (RM3): https://iris.uniroma3.it/handle/11590/348974 ("Italians are notorious for extending the Present Perfect to preterit contexts"; the record is a research description, no findings seen).
  - Turin thesis on the Italian subcorpus of ICLE (TO): https://unitesi.unito.it/handle/20.500.14240/12260 (subject omission and word order).
  - Utrecht student thesis, young Italian learners, LEONIDE corpus (UU): https://studenttheses.uu.nl/handle/20.500.12932/46306 (overuse of "the" and "must", "make" for "do" attributed to transfer; -s omission and do-support attributed to general learner difficulty; the page did not load in curl).
  - Università Cattolica article on vowel mistakes (UC): https://publires.unicatt.it/en/publications/common-mistakes-made-by-italian-speakers-of-english-focus-on-vowe-7/ (abstract too short to confirm which vowels).
  - Wheelock, TESOL working paper (error analysis of 27 Italian learners reading aloud; /ɑ/ as [ə]): https://aws1.hpu.edu/research-publications/tesol-working-papers/2016/04AnneWheelock.pdf (curl failed; not used for any verdict).
  - TeachingEnglish article ("Yesterday, I have bought a new computer"): https://www.teachingenglish.org.uk/article/producing-your-own-grammar-activities (TE; search summary only).
  - Rhythm study (LO): https://repozytorium.uni.lodz.pl/handle/11089/45247 (Italian and English rhythm in early bilinguals; says Italian sits on a continuum, not cleanly "syllable-timed").
  - Italian-side grammar pages (used only to confirm the L1 pattern, not learner errors): UNC https://learnitalian.web.unc.edu/home/verbs/future-conditional/future/ (UNC), https://elon.io/grammar/italian/errors/presente-in-future-temporal (ELF), https://elon.io/grammar/italian/errors/presente-with-da (ELD); false friends: https://fastitalianlearning.com/learn/b2/false-amiche-b2 (FIF).
- **Not opened:** Swan & Smith, *Learner English* (Italian chapter). Only bookseller listings were seen; nothing in this file claims its content. Peer-reviewed learner-English studies on Italian speakers were hard to reach: almost every "supported" row rests on practitioner pages (V-weak). Wikipedia was not used.
- Verdicts: supported = a source I read states it; partly = part of the entry is stated or the L1 side is verified but the learner error or detail is not; no source found = nothing found (not the same as wrong). Where I add L1 reasoning (for example "Italian modals take a bare infinitive") it is my own linguistic knowledge, not a cited source, and is labelled as doubtful, not as a verdict.
- Result: 161 entries: 18 supported, 42 partly, 101 no source found, 0 contradicted outright (several are flagged doubtful on L1 grounds; see the last section). The no-source count is large because most grammar entries are K (standard contrastive linguistics) and no Italian-specific learner source was reachable.

## Entry check

Mark column: "keep X" = no change; "X -> Y" = suggested mark. Sources in angle brackets; "-" = none.

| Season | Entry (first 60 chars) | Verdict | Source URL(s) | Suggested mark and fix |
|---|---|---|---|---|
| A1-S02 | /ɪ/ and /iː/ merge: "it" and "eat", "ship" and "sheep". | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://publires.unicatt.it/en/publications/common-mistakes-made-by-italian-speakers-of-english-focus-on-vowe-7/> | V -> V-weak. Sources are teaching pages; the research hit (UC) was seen as a short abstract only. Wording fix: "long/short vowel contrast is not used in Italian; it/eat, live/leave". |
| A1-S03 | Every syllable gets equal weight, so key words do not stand  | supported | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://repozytorium.uni.lodz.pl/handle/11089/45247> | keep V-weak. LO (rhythm study) says Italian is not cleanly syllable-timed: soften to "weak syllables get too much weight". |
| A1-S03 | Drops -ing or says "like play" instead of "like playing". | no source found | - | keep K. Italian (mi piace nuotare) uses the infinitive, so the mix-up is plausible but unsourced. |
| A1-S04 | "th" in "thanks" becomes /s/, /t/ or /f/. | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://boldvoice.com/blog/english-pronunciation-italian-speakers> | keep V-weak. Sources say dental /t/ or /d/; /s/ and /f/ are not in them. Lead with /t d/. |
| A1-S05 | Leaves out the subject pronoun ("Is a teacher", "Go to schoo | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V. Written pro-drop (TO abstract: ICLE Italian subcorpus; EW: "Is necessary to..."). FA instead gives the article error "Is he teacher?". Add that example. |
| A1-S06 | "th" in "mother, father, brother" becomes /z/, /d/ or /t/. | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://boldvoice.com/blog/english-pronunciation-italian-speakers> | keep V-weak. /t/ and /d/ supported; /z/ has no source. |
| A1-S06 | Possessive built like the L1 ("the brother of Ana") instead  | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. FA: "the pen of my brother"; also gender-agreeing possessives (FA: "Peter and her wife"). |
| A1-S06 | False friend: Italian "parenti" means relatives, not parents | no source found | - | keep K. Dictionary fact (parenti = relatives); no source opened. Same for the false friends in FA: brave, fame, libreria, divertente. |
| A1-S07 | Adds a vowel after a final consonant ("turn-a", "left-e"). | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. Both say a little "a"/vowel added after a final consonant. |
| A1-S08 | Adds "to" or an -s after can ("can to swim", "she cans"). | no source found | - | keep K. Italian modals take a bare infinitive (posso nuotare), so "can to" is not predicted by Italian; drop "it" or rewrite as -s only. |
| A1-S09 | "this" and "these" sound the same (/ɪ/ and /iː/). | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | V -> V-weak. Minimal pairs it/eat, live/leave in FA. "this/these" itself not named. |
| A1-S09 | "th" at the start of this, these, that, those. | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://boldvoice.com/blog/english-pronunciation-italian-speakers> | keep V-weak. as row 4. |
| A1-S09 | Stress on the wrong syllable in teens and tens (13 / 30). | no source found | - | keep K.  |
| A1-S10 | No "do/does" in questions in the L1, so "Where you live?"; a | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. FA: no negative auxiliaries ("I no know"). Do-support absence in beginners judged general, not L1 (UU). "-ing forgotten" no source. |
| A1-S10 | Leaves out the subject: "Is raining". | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V. Weather "it" fits pro-drop (Piove). Sources show impersonal subjects dropped. |
| A1-S11 | "Wednesday" said with a /d/ and "Thursday" with /t/ or /s/. | no source found | - | V-weak -> K. General spelling-to-sound habit supported (PS #6), this word not named anywhere. |
| A1-S11 | One preposition for all times ("in Saturday", "at the mornin | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> | K -> V-weak. Sources say prepositions are mixed up; time prepositions not specifically named. |
| A1-S11 | Says "want that I go" or "want go" instead of "want to go". | no source found | - | keep K. "want that I go" fits Italian voglio che; plausible, unsourced. |
| A1-S12 | Adds -s to irregular plurals ("childs", "peoples"). | no source found | - | keep K. Overgeneralisation is not L1-specific; consider removing the L1 label. |
| A2-S01 | Says every -ed as a full syllable (“walk-ed”, “play-ed”) bec | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. FA names "ed" endings (happened, played). |
| A2-S02 | Regularises irregular verbs: “goed”, “buyed”, “taked”. | no source found | - | keep K. Universal overgeneralisation, not L1-specific. |
| A2-S02 | Puts the past on both verbs: “Did you went?”, “I didn’t went | no source found | - | keep K. Universal, not L1-specific. |
| A2-S02 | Uses the present perfect for a finished time: “Yesterday I h | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://iris.uniroma3.it/handle/11590/348974> <https://www.teachingenglish.org.uk/article/producing-your-own-grammar-activities> | keep V-weak. Three sources (RM3 is a research-proposal record). TE example: "Yesterday, I have bought a new computer". FA: Italian past is formed like the English present perfect. |
| A2-S03 | Doubles the marker: “more bigger”, “more cheaper”; or uses “ | no source found | - | keep K. Universal. |
| A2-S03 | “than” said with /d/ or /t/ (weak /ðən/ lost). | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. th supported; the weak form /ðən/ has no source. |
| A2-S03 | Stress on the wrong syllable in long adjectives (expenSIVE,  | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. PS #6 spelling to sound (particular); long adjectives not named. |
| A2-S04 | Often fine (voy a, je vais, vado a): the L1 pattern matches, | no source found | - | keep K.  |
| A2-S04 | Hears “going to” as “gonna” and does not recognise it. | no source found | - | keep K.  |
| A2-S05 | Adds “to” or -s after should: “should to go”, “he shoulds”. | no source found | - | keep K. as row 10: Italian devrei + bare infinitive does not predict "to". |
| A2-S05 | Uses “too” where English says “very”: “It is too good.”; put | partly | - | keep K. No source. Italian abbastanza goes before the adjective (supports "enough big"); but molto = very, so "too" for "very" is NOT predicted by Italian (troppo = too much). Split the entry. |
| A2-S06 | Treats mustn’t and don’t have to as the same (“You don’t hav | partly | <https://studenttheses.uu.nl/handle/20.500.12932/46306> | K -> V-weak. UU: overuse of "must" in young Italian writers attributed to transfer; the don't have to / mustn't mix-up itself unsourced. |
| A2-S07 | Uses plural for uncountable nouns: “informations”, “advices” | supported | <https://dictionaryblog.cambridge.org/2014/11/26/countability-grammar-codes/> <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V. CAM: Italian among top-10 L1s making plural-of-uncountable errors (information, advice). FA: "informations", "hairs". Italian informazione is countable. |
| A2-S07 | Uses “much” in positive sentences: “I eat much rice.” | no source found | - | keep K.  |
| A2-S08 | Says “for + verb” for purpose: “I go there for study.” (para | no source found | - | keep K.  |
| A2-S08 | Uses the wrong preposition for transport: “in bus”, “with th | no source found | - | keep K.  |
| A2-S09 | Uses the present or “going to” for a decision made now: “I t | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. FA: Italian present used for the future ("I go tomorrow"). |
| A2-S09 | Adds “to” after will or an -s: “I will to go”, “she wills”. | no source found | - | keep K. as row 10. |
| A2-S10 | The L1 past forms map almost one to one, so “was” + -ing can | no source found | - | keep K. Doubtful: FA says Italian leans on the simple present; an over-use of was + -ing is not reported. Reword or drop "it". |
| A2-S10 | Writes “because … so” in one sentence: “Because it rained, s | no source found | - | keep K.  |
| A2-S10 | Misses weak was / were in connected speech and hears one slo | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. PS #5 sentence stress / weak syllables; was/were not named. |
| A2-S11 | Uses an adjective for an adverb: “She sings beautiful”, “He  | no source found | - | keep K.  |
| A2-S11 | Puts the adverb between the verb and the object: “I like ver | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V-weak. FA: verb/word order is mobile in Italian; TO: word-order transfer in ICLE. This adverb position not named. |
| A2-S12 | Adds “to” after let’s or shall we: “Let’s to go”; and says “ | no source found | - | keep K.  |
| A2-S12 | “th” in the ordinal numbers (fourth, fifth, sixth): /t/ or / | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. th supported; ordinals not named. |
| A2-S13 | Translates direct requests: “Give me the menu.” sounds rude  | no source found | - | keep K.  |
| A2-S13 | Writes “as big than” or “so big as”. | no source found | - | keep K. Doubtful: Italian "più grande di" predicts "bigger of", not "as big than". Check before keeping "it". |
| A2-S14 | Double negatives: “I don’t know nothing”, “Nobody didn’t com | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> | K -> V-weak. FA: "I don't know nothing", "she does not work never". EW has a section on negation. |
| A2-S14 | Uses the continuous with state verbs: “I am knowing”, “I am  | no source found | - | keep K. Doubtful for it: FA says Italian uses the simple present more. Opposite error (present simple for continuous) is more likely. Drop "it". |
| B1-S01 | Uses the present perfect with a finished time: “Yesterday I  | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://iris.uniroma3.it/handle/11590/348974> <https://www.teachingenglish.org.uk/article/producing-your-own-grammar-activities> | keep V-weak. as row 23. |
| B1-S01 | Mixes up gone and been: “I have gone to Italy” for a finishe | no source found | - | keep K. Doubtful: Italian separates stato (been) and andato (gone). FA reports "I was been" (essere as auxiliary). Replace with that. |
| B1-S01 | Wrong or regularised participles: “I have eated”, “I have sa | no source found | - | keep K. Universal. |
| B1-S02 | Mixes used to + verb with be used to + -ing (“I am used to p | no source found | - | keep K.  |
| B1-S02 | Says “I used to going” or keeps the d in the question: “Did  | no source found | - | keep K.  |
| B1-S02 | Reads the /s/ in “used to” as /z/ and the weak “to” disappea | no source found | - | V-weak -> K.  |
| B1-S03 | Uses the present simple for “for / since”: “I live here sinc | partly | <https://elon.io/grammar/italian/errors/presente-with-da> | V-weak -> K. Italian side verified: present + da for ongoing time (ELD). No learner-error study found for English. Mark K, source ELD for the L1 pattern. |
| B1-S03 | Confuses for and since, or says “How long time?” | partly | <https://elon.io/grammar/italian/errors/presente-with-da> | keep K. Italian da covers both for and since (ELD). |
| B1-S04 | Present perfect with a finished-time word in news stories: “ | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://iris.uniroma3.it/handle/11590/348974> <https://www.teachingenglish.org.uk/article/producing-your-own-grammar-activities> | keep V-weak. General pattern supported; news-story context not. |
| B1-S04 | Wrong participle forms (“said”, “been”, “seen” confused with | no source found | - | keep K. Universal. |
| B1-S05 | Uses will in the if-clause: “If it will rain, we stay home.” | partly | <https://learnitalian.web.unc.edu/home/verbs/future-conditional/future/> <https://elon.io/grammar/italian/errors/presente-in-future-temporal> | keep K. Italian side verified: future after se/quando (UNC, ELF). Note colloquial Italian often uses the present in se-clauses, so not universal. |
| B1-S05 | Misses the pause after the if-clause and reads the sentence  | no source found | - | V-weak -> K. Source was not found; drop V-weak or move to K. |
| B1-S06 | Uses would in the if-clause: “If I would have money, I would | no source found | - | keep K. Doubtful for it: standard Italian is se + imperfect subjunctive (se avessi), which maps to "if I had". Transfer does not predict "would" in the if-clause. Drop "it". |
| B1-S06 | Says “If I was you” (common in everyday English) or “If I wo | no source found | - | keep K. Wording fine ("If I was you" is acceptable informal English). |
| B1-S06 | Hears and says ’d as “had” or loses it: “I’d go” sounds like | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. Weak-form difficulty in general (PS #5). |
| B1-S07 | Uses the L1 impersonal pattern (se / on / si) instead of the | no source found | - | keep K. No source. EW and TextRanch (https://textranch.com/common-mistakes-by-country/italy/) report Italian writers OVERuse the passive. |
| B1-S07 | Says -ed as a full syllable in every participle. | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. as row 20. |
| B1-S08 | Repeats the pronoun: “The man who I saw him”, “The film that | no source found | - | keep K. Doubtful for it: Italian has no resumptive pronoun in standard relatives (l'uomo che ho visto). More typical of ar/tr. Drop "it". |
| B1-S08 | Uses “what” for “that”: “The thing what I like.” | no source found | - | keep K.  |
| B1-S09 | Uses must for every deduction and must not for “can’t be”: “ | partly | <https://studenttheses.uu.nl/handle/20.500.12932/46306> | K -> V-weak. UU: "must" over-used, linked to Italian (young learners, student thesis). |
| B1-S09 | Misses the weak form of modals and hears “can” for “can’t”. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B1-S10 | Uses the present simple for a plan: “Tomorrow I meet my frie | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | K -> V-weak. FA: simple present for the future. |
| B1-S10 | Uses “will” for a plan already made, or the present continuo | no source found | - | keep K.  |
| B1-S10 | Loses the contracted ’ll in “I’ll be there”. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B1-S11 | Uses the infinitive where English needs -ing (“I enjoy to re | no source found | - | keep K.  |
| B1-S11 | Weak “to” disappears or becomes “too”. | no source found | - | V-weak -> K. No source; move to K. |
| B1-S12 | Keeps the question word order in an indirect question: “Coul | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V-weak. Word order mobile in Italian (FA); indirect-question order not named. |
| B1-S12 | No backshift: “He said he is tired.” Or says “say me”. | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | keep K. "say me" supported (FA: tell/say confusion, "Say me your name"). Italian backshifts too (disse che era), so "He said he is tired" is NOT predicted by Italian: split the entry. |
| B1-S12 | Says said as /sed/ vs /sɛd/ incorrectly or adds a vowel to t | no source found | - | V-weak -> K. Wording unclear (/sed/ vs /sɛd/). Drop or rewrite; no source. |
| B1-S13 | Uses the past simple instead of the past perfect: “When I ar | no source found | - | keep K. Italian has a trapassato, so transfer does not predict this; overuse of passato prossimo (FA) could. Reword. |
| B1-S13 | Loses the contracted ’d for had in speech. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B1-S14 | Uses wish + would or wish + the present: “I wish I have more | no source found | - | keep K.  |
| B1-S14 | Final /ʃ/ in wish: /s/ or /ʃi/. | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. Added final vowel (/ʃi/) fits FA/PS epenthesis; /s/ no source. |
| B1-S15 | Treats mustn’t and don’t have to as the same (revisits A2-S0 | partly | <https://studenttheses.uu.nl/handle/20.500.12932/46306> | K -> V-weak. as row 31. |
| B1-S15 | Uses “although … but” in one sentence: “Although it was late | no source found | - | keep K.  |
| B1-S16 | Wrong tag auxiliary: “You like it, isn’t it?”; uses “no?” fo | no source found | - | keep K.  |
| B1-S16 | Flat intonation: every tag sounds like a real question. | no source found | - | V-weak -> K. No source; move to K. |
| B1-S16 | Separates phrasal verbs wrongly: “Turn off it”, “Look for th | no source found | - | keep K.  |
| B1-S17 | Leaves out “that” or uses “so… as”: “It was so cold, we stay | no source found | - | keep K.  |
| B1-S17 | Uses reflexive pronouns where English does not (“I feel myse | no source found | - | keep K.  |
| B1-S18 | Puts “enough” before the adjective: “enough big” (L1 order)  | partly | - | keep K. as row 30: "enough big" plausible (abbastanza), "too for very" not. |
| B1-S18 | Mixes few and little: “a little friends”, “a few money.” | no source found | - | keep K.  |
| B1-S18 | Reads the “gh” in enough as written (/g/ or /gh/) instead of | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | keep V-weak. Spelling-to-sound habit (PS #6; FA: shallow orthography, silent letters). "enough" not named. |
| B2-S01 | Present simple for a continuing activity: “I study English s | partly | <https://elon.io/grammar/italian/errors/presente-with-da> | V-weak -> K. as row 55. |
| B2-S01 | Uses the continuous with state verbs: “I have been knowing h | no source found | - | keep K. Doubtful for it: see row 48. Drop "it". |
| B2-S01 | Loses the weak “’ve been” /əv bɪn/ and hears it as “be”. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B2-S02 | Uses “would have” in the if-clause: “If I would have known,  | no source found | - | keep K. Doubtful for it: see row 61. |
| B2-S02 | Says “I wish I would have …” for a past regret. | no source found | - | keep K.  |
| B2-S02 | Misses weak “have” in “would’ve / could’ve” and writes “woul | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. "would of" is a native-speaker spelling error; weak-form difficulty only in general. |
| B2-S03 | Uses the L1 impersonal pattern (se / on / si) instead of the | no source found | - | keep K. as row 64. |
| B2-S03 | Weak forms “been” and “being” are lost in fast speech. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B2-S04 | Keeps question order in a reported question: “He asked me wh | no source found | - | keep K.  |
| B2-S04 | Says “He told me to not go” or “He told that…” instead of “t | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> | keep K. tell/say confusion (FA); "to not go" no source. |
| B2-S05 | Leaves out the commas or uses “that” in a non-defining claus | no source found | - | keep K.  |
| B2-S05 | Uses “what” for “which”: “He passed, what surprised me.” | no source found | - | keep K.  |
| B2-S06 | Uses should have, must have and might have interchangeably ( | no source found | - | keep K.  |
| B2-S06 | Wrong participle or “should of” in writing: “She should have | no source found | - | keep K. Universal. |
| B2-S06 | Loses weak “have” /əv/. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B2-S07 | Uses the future after “when / by the time / as soon as”: “Wh | partly | <https://learnitalian.web.unc.edu/home/verbs/future-conditional/future/> <https://elon.io/grammar/italian/errors/presente-in-future-temporal> | keep K. Italian future after quando (UNC, ELF); same limit as row 59. |
| B2-S07 | Hears “will have” /wɪl əv/ as one word. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> | keep V-weak. General weak-form point. |
| B2-S08 | Uses “despite of” or “in spite” without “of”, or “despite th | no source found | - | keep K.  |
| B2-S08 | Joins sentences with “however” and a comma: “It was good, ho | no source found | - | keep K.  |
| B2-S08 | False friend: “actually” used for “currently”. | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://fastitalianlearning.com/learn/b2/false-amiche-b2> | keep V-weak. EW: attuale = current, not actual; FIF lists attualmente = currently, not actually. |
| B2-S09 | Uses the active with a reflexive: “I cut my hair” or “I repa | no source found | - | keep K.  |
| B2-S09 | Indirect question order: “Could you tell me where is the ban | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V-weak. as row 75. |
| B2-S10 | Double negative with unless: “Unless you don’t come, …” | no source found | - | keep K. Plausible: Italian a meno che non takes an expletive "non". |
| B2-S10 | Uses will in the condition: “As long as it will be easy, I’l | partly | <https://learnitalian.web.unc.edu/home/verbs/future-conditional/future/> | keep K. as row 59. |
| B2-S11 | Does not separate “remember to do” (the future task) and “re | no source found | - | keep K.  |
| B2-S11 | Uses “the” for general ideas: “The life is hard”, “I like th | supported | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://studenttheses.uu.nl/handle/20.500.12932/46306> | K -> V. FA: "the health is important in the life"; EW: abstract nouns take "the"; UU: overuse of "the" in young Italian writers. |
| B2-S12 | Keeps a resumptive pronoun in the cleft: “What I need, it is | no source found | - | keep K. Doubtful for it: see row 66. |
| B2-S12 | Uses “what” instead of “that” in a cleft: “It was the key wh | no source found | - | keep K.  |
| B2-S13 | Dangling participles: “Walking down the street, the sun was  | no source found | - | keep K. Universal. |
| B2-S13 | Drops the subject in the main clause after an ellipsis (a pr | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V-weak. Written pro-drop. Not "after ellipsis" specifically. |
| B2-S14 | Says “as more as” or leaves out the second “the”: “The more  | no source found | - | keep K.  |
| B2-S14 | Mixes so and such: “It was so a good film.” | no source found | - | keep K.  |
| B2-S15 | Uses the L1 object pattern: “He suggested me to go”, “She ad | no source found | - | keep K.  |
| B2-S16 | Writes “in the other hand” and overuses “moreover” and “furt | no source found | - | keep K.  |
| B2-S16 | Mixes “at the end” and “in the end”, “besides” and “beside”. | no source found | - | keep K.  |
| B2-S17 | Uses “for + verb” for purpose: “I study for pass the exam.” | no source found | - | keep K.  |
| B2-S17 | Says “had better to go” or “better go”. | no source found | - | keep K.  |
| B2-S18 | Uses the infinitive after a preposition: “Before to leave”,  | no source found | - | keep K. Italian uses the infinitive after prepositions (prima di partire): L1 side plausible, unsourced. |
| B2-S18 | Confuses “be used to + -ing” with “used to + verb”. | no source found | - | keep K.  |
| C1-S01 | No inversion after a fronted negative: “Rarely we go there.” | no source found | - | keep K.  |
| C1-S01 | Over-inverts or puts a main verb before the subject: “Rarely | no source found | - | keep K.  |
| C1-S02 | Is helped by the L1 inverted conditional (de haber sabido, s | no source found | - | keep K. Italian inverted conditional (avessi saputo) is real; no learner source. |
| C1-S02 | Mixes the tenses in a mixed conditional: “If I studied more, | no source found | - | keep K.  |
| C1-S03 | Uses the L1 impersonal pattern: “It says that…” for “It is s | no source found | - | keep K.  |
| C1-S03 | Wrong infinitive: “He is said to has left.” | no source found | - | keep K.  |
| C1-S04 | Has a subjunctive in the L1 and so adds -s or “should” or an | no source found | - | keep K. Misleading: "I suggest that he goes" is acceptable British English; Italian does have a subjunctive. Reword. |
| C1-S05 | Is helped by Latin-based nouns but builds heavy “of … of …”  | no source found | - | keep K.  |
| C1-S06 | “Not only … but” without inversion: “Not only he came but …” | no source found | - | keep K.  |
| C1-S06 | Misses the stress on the fronted word and speaks in an even  | no source found | - | V-weak -> K. No source; move to K. |
| C1-S07 | Dangling perfect participle: “Having finished, the exam was  | no source found | - | keep K.  |
| C1-S07 | Uses the L1 gerund “Habiendo terminado” as a model but loses | no source found | - | keep K.  |
| C1-S08 | False friends in stance words: “actually” (for currently), “ | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://fastitalianlearning.com/learn/b2/false-amiche-b2> | keep V-weak. eventuale = possible (EW, FIF). "actually" as row 111. |
| C1-S08 | Sounds too direct or too certain in discussion; hedges are r | no source found | - | keep K.  |
| C1-S09 | Formal in speech or informal in an email (contractions, phra | no source found | - | keep K.  |
| C1-S10 | “Although … but” in one sentence, or “much as” misused: “Muc | no source found | - | keep K.  |
| C1-S10 | Misses the adjective + as pattern: “Strange as it may seem”  | no source found | - | keep K.  |
| C1-S11 | Mixes “needn’t have” and “didn’t need to”: “I needn’t have g | no source found | - | keep K.  |
| C1-S12 | Collocation calques: “make a photo”, “do a mistake”, “say a  | partly | <https://support.flashacademy.com/hc/en-gb/article_attachments/32424702353949> <https://studenttheses.uu.nl/handle/20.500.12932/46306> | K -> V-weak. FA/UU: fare = do and make ("I make my homework"). "open the light" is not an Italian calque (Italian: accendere); remove it. |
| C1-S13 | Copies the source structure and vocabulary when summarising  | no source found | - | keep K.  |
| C1-S13 | False friends in summary words: “actually”, “sensible / sens | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> | keep V-weak. sensibile = sensitive (EW). "actually" as row 111. |
| C1-S14 | Rhetorical habits differ by language (repetition, indirectne | no source found | - | keep K.  |
| C1-S14 | Even rhythm and little pause or emphasis in a speech. | partly | <https://pronunciationstudio.com/italian-speakers-english-pronunciation-errors/> <https://repozytorium.uni.lodz.pl/handle/11089/45247> | keep V-weak. PS #5; LO says Italian is not purely syllable-timed. |
| C1-S15 | Irony and understatement are signalled by tone and context;  | no source found | - | keep K.  |
| C1-S15 | Misses British-style understatement (“not bad”, “a bit of a  | no source found | - | keep K.  |
| C1-S16 | Omits subjects and loses track of who is meant (a pro-drop h | supported | <https://www.editorworld.com/article/common-english-writing-mistakes-italian-writers-make> <https://unitesi.unito.it/handle/20.500.14240/12260> | K -> V-weak. Written pro-drop. |
| C1-S16 | Overuses the same connector or places it in the wrong positi | no source found | - | keep K.  |
| C1-S17 | Mis-orders “However small the change”: “However the change i | no source found | - | keep K.  |
| C1-S17 | Omits a “the” in “The more … the more” or the verb be. | no source found | - | keep K.  |
| C1-S18 | Absolute phrases are rare in the L1, so “Time permitting” or | no source found | - | keep K.  |
| C1-S18 | Dangling absolute phrases: the subject differs from the main | no source found | - | keep K.  |
## Missing difficulties (Italian speakers, A1-B1, not in the list)

All sourced to FA unless stated (practitioner PDF; V-weak).

| Difficulty | What the teacher hears | Source | Suggested Season | Mark |
|---|---|---|---|---|
| Silent /h/ and wrong /h/ | "ouse", "ow"; and an /h/ added: "go hawa(y)" | PS #1, BV, FA | A1-S01/S02 | V-weak |
| Open vowels /æ/ /ʌ/ /ɑː/ all become Italian a | cat / cut / cart all sound alike; "mag" for "mug" | PS #3, FA | A1-S02 | V-weak |
| /əʊ/ said as a single "o" | "no", "go", "don't" with a short pure vowel | PS #9 | A1 | V-weak |
| Age, hunger, thirst use "have" | "I have 12 years", "I have hungry" | FA | A1-S01 (introductions), A1-S04 | V-weak |
| "Say" and "tell" are one verb; no "to" | "Say me your name" (in the list only at B1-S12 as "say me") | FA | A1-S05 | V-weak |
| Missing indefinite article | "Is he teacher?", "I am student" | FA | A1-S01 | V-weak |
| Definite article added before possessives and abstract nouns | "the my family", "the health" (A1 start, not only B2-S11) | FA, EW, UU | A1-S06 | V-weak |
| "w" said as "v"; unaspirated /p t k/; rolled /r/; r said after a vowel | "vater", flat "pass", rolled r, "caR" | FA (w), PS #8 #10, BV | A1-S02, A1-S03 | V-weak |
| "Brave", "fame", "libreria", "divertente" false friends | "Library" for bookshop, "fun" and "funny" mixed | FA | A1-A2 | K (dictionary facts) |
| Days, months, nationalities written lower case; silent letters spelled as heard | "monday", "italian" | FA | A1-S11 | V-weak |
| Preposition calques with fixed verbs | "depend of", "marry with", "interested on" | FA, EW | A2 | V-weak |
| Countable nouns in Italian that are uncountable in English | "informations", "advices", "hairs", "furnitures" (row for A2-S07 exists; "hairs" and "news" are new) | CAM, FA | A2-S07 | V |

## Entries to fix or drop

These are my reasoning from Italian grammar; none is a published contradiction. Check with an Italian-speaking teacher before changing.

1. **Modal + "to" / -s (A1-S08, A2-S05, A2-S09, A2-S12 and others).** Italian modals and "andiamo" patterns: potere, dovere, volere take a bare infinitive, so "can to", "should to" is not an Italian transfer. Keep `it` only for the -s on third person, or drop it.
2. **Continuous with state verbs (A2-S14, B2-S01 "I am knowing").** FA says Italian uses the simple present more than English; the opposite error is more likely. Drop `it`.
3. **"If I would have..." (B1-S06, B2-S02).** Standard Italian is se + imperfect/past-perfect subjunctive (se avessi, se avessi saputo), which maps cleanly to "had". Transfer does not predict "would" in the if-clause. Drop `it` or mark as generic.
4. **Resumptive pronoun in relative or cleft (B1-S08, B2-S12).** Standard Italian has none; this fits ar/tr, not it/es/fr. Drop `it`.
5. **Gone vs been (B1-S01).** Italian keeps stato and andato apart. Replace with FA's "I was been / I am gone" (essere as auxiliary).
6. **Backshift (B1-S12).** Italian backshifts after "disse che". Keep only "say me" (supported); drop "He said he is tired" for `it`.
7. **"Too" for "very" (A2-S05, B1-S18).** Italian troppo means "too much" and molto means "very", so it is not predicted. "enough before the adjective" is plausible (abbastanza + adjective). Split.
8. **"Open the light" (C1-S12).** Italian says accendere la luce; remove from the `it` list. "make a photo", "do a mistake" are supported (FA/UU: fare covers do and make).
9. **Subjunctive "I suggest that he goes" (C1-S04).** Acceptable British English; do not present as an error. Reword.
10. **Syllable-timed claim (A1-S03, C1-S14).** Soften: LO places Italian on a continuum. Say "full vowels and equal weight on weak syllables" (PS #5).
11. **Universal errors tagged with L1 (A1-S12 "childs", A2-S02 "goed", A2-S03 "more bigger", B1-S01 "eated").** Not L1-specific; consider a generic list.
12. **Unclear wording:** B1-S12 "said as /sed/ vs /sɛd/"; B1-S05 and B1-S16 "flat intonation" (no source; move to K).
13. **Mark changes (summary):** V -> V-weak for rows 1 and 11 (A1-S02, A1-S09; sources are teaching pages, one short abstract). V-weak -> V is not justified for any row except where a corpus source exists (rows for informations, "the" overuse, subject omission; I suggest V there). Rows marked V-weak with no source found (B1-S05, B1-S11, B1-S12, B1-S16, C1-S06) should become K.
14. **Wording fix for A2-S02 "present perfect for a finished time":** the best-supported item for `it`; add the example "Yesterday I have bought" (TE) and keep V-weak.
