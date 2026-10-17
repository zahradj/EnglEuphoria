# French (fr) check of the Academy home-language watch list

Date: 2026-10-17. Scope: the 155 entries of `src/curriculum/academy/l1Watch.ts` whose langs include `fr` (A1-S01 to C1-S18). Read-only check; no other file changed.

## Method and limits

- Extracted every `w([...'fr'...])` line from `l1Watch.ts`, one row per entry.
- Searched the web (about 20 queries: /h/, th, stress, rhythm, vowels, tenses, since/for, adverb order, countability, false friends, articles, relatives, conditionals, reflexives, possessives). Opened with curl: S1 to S6, S7, S8, S9, S10, S11, S15 (read or skimmed). **Not opened, search snippet only:** S12, S13, S14, S16, S17, S18, S19, S21, S22, S24, S25 (S14 and S22 returned 404 / handshake failure). Anything resting on these is marked "snippet" and should be re-checked before it is quoted as a study.
- Not read: Swan and Smith, Learner English (no open copy). Nothing here claims to come from it.
- Wikipedia pages are pointers to language facts, not proof of learner behaviour.
- "supported" = at least one source says the same thing about French speakers. "partly" = the core is sourced but an example, a list item or the scope is not (or a source qualifies it). "contradicted" = the L1 grammar or a study points the other way; for the four grammar cases this is reasoning from French grammar (si + present, si + imparfait), plus one study (S16); no learner-error study was found either way. "no source found" = nothing seen for French speakers (the claim may still be true).
- Only two kinds of French-L1 study were reachable: pronunciation (/h/, dental fricatives, stress, rhythm) and a few grammar items (adverb position, present perfect). Almost every other row rests on contrastive reasoning (K) and stays K.
- Evidence reading: most "supported" grammar rows rest on teaching pages (S1 to S5), so V-weak, not V. V is justified only for /h/ (S6), th (S7, perception), adverb position (S11, S12), plural uncountables (S8).
- Voice note: the owner's audio is standard American English. S4 is a British-target page: its "every written r is pronounced" point is not an error for American English and is not carried over.

## Counts

supported 11 · partly 38 · contradicted 4 · no source found 102 · total 155

## Sources

| ID | Source (URL as seen) | Type / how read |
|---|---|---|
| S1 | https://www.scribendi.com/advice/french_speakers_common_english_errors.en.html | editing-service teaching page; opened, read in full |
| S2 | https://londonschool.com/blog/common-french-speaker-mistakes-in-english-and-how-to-avoid-them-or-fixing-franglais | language-school teaching page (2016); opened, read |
| S3 | https://www.theteflacademy.com/blog/common-problems-for-french-learners-of-english/ | TEFL-training teaching page (2023); opened, read |
| S4 | https://pronunciationstudio.com/french-speakers-english-pronunciation-errors/ | pronunciation-school page (British target); opened, read |
| S5 | https://llexi.com/l1-errors/common-english-errors-french-speakers/ | business-English teaching page; opened, read |
| S6 | https://unilim.fr/espaces-linguistiques/631 (Caplièz 2023, Espaces Linguistiques) | peer-reviewed; abstract opened (full text not read) |
| S7 | https://assta.org/proceedings/ICPhS2019Microsite/pdf/full-paper_543.pdf (Tyler et al., ICPhS 2019) | conference paper, 151 European French listeners (perception); PDF opened, intro + abstract read |
| S8 | https://dictionaryblog.cambridge.org/2014/11/26/countability-grammar-codes | Cambridge Learner Corpus finding reported in a blog; opened; per-language rates are in an interactive graphic I could not see |
| S9 | https://en.wikipedia.org/wiki/French_phonology | pointer only (stress, intonation); opened |
| S10 | https://en.wikipedia.org/wiki/French_articles | pointer only (definite article for general categories); opened |
| S11 | https://halshs.archives-ouvertes.fr/tel-01257640v1/file/Marie_Garnier.pdf (Garnier, thesis, francophone L2-English corpus) | thesis; abstract opened (adverb placement and N+N are two of the six most frequent error types) |
| S12 | https://arch.neicon.ru/xmlui/handle/123456789/3069591 (White 1991, adverb placement, francophone 11-12 year olds) | search snippet only; not opened |
| S13 | https://www.jbe-platform.com/content/journals/10.1075/ijlcr.17007.des (PP / simple past / passe compose in interlanguage) | search snippet only; not opened |
| S14 | https://guarant.cz/icphs2023/43.pdf (Kamiyama and Amand, ICPhS 2023, English stress, 55 learners, 36% errors) | search snippet only; curl returned 404 |
| S15 | https://sites.uclouvain.be/cecl/archives/THEWISSEN_2008_TaLC.pdf (Thewissen 2008, phraseological errors, French/German/Spanish learners) | conference paper; opened, skimmed |
| S16 | https://journals.sagepub.com/doi/pdf/10.1177/02676583231162783 (resumptive pronouns, 52 French-L1 vs 71 Persian-L1 learners) | search snippet only; not opened |
| S17 | https://www.degruyterbrill.com/document/doi/10.1515/cllt-2014-0007/html (Littre, intermediate French-speaking learners and the English present) | search snippet only; not opened |
| S18 | https://www.nomadeducation.fr/revisions/licence-llcer-anglais-2e-annee-lb3c9343/lexpression-du-but-cy963c31 | French university revision page (for vs to); search snippet |
| S19 | https://hal.archives-ouvertes.fr/hal-00471745 (Kamiyama 2010, do French learners simply omit /h/?) | search snippet only |
| S21 | https://halshs.archives-ouvertes.fr/halshs-01428297 (foot duration, two French learners) | search snippet only; 2 speakers |
| S22 | https://icaltefl.com/?p=911 (and https://icaltefl.com/french) | TEFL teaching page; search snippet only (curl handshake failed) |
| S23 | https://en.wikipedia.org/wiki/French_grammar | pointer only (n'est-ce pas as fixed tag) |
| S24 | https://www.connexionfrance.com/practical/8-false-friends-from-my-french-students-that-we-can-learn-from/652190 | magazine, teacher's list; search snippet |
| S25 | https://fastfrench.com.au/verbs/futur-simple-vs-will/ | French-grammar page (future after quand; depuis + present); search snippet |

## Entry check

| Season | Entry (first 60 chars; langs) | Verdict | Sources | Evidence mark and wording fix |
|---|---|---|---|---|
| A1-S01 | Final-syllable stress on country names (Canada, Italy) and f… (fr) | partly | S4 S9 S3 S14 | now V-weak; suggest V-weak. French stress falls on the last full syllable of a phrase group (S9 says scholars disagree whether French has word stress at all); tendency is reported by teaching sources, and a 36% error rate on English stress placement in 55 learners (S14, snippet only). Keep, but say 'may carry the French pattern to long words'. |
| A1-S03 | Every syllable gets equal weight, so key words do not stand … (it, fr) | partly | S22 S21 S4 | now V-weak; suggest V-weak. Syllable-timed vs stress-timed is a teaching commonplace; S21 (two learners, four months) found one kept French-like rhythm. Rhythm is now seen as a continuum, so avoid 'every syllable'. |
| A1-S03 | Drops -ing or says "like play" instead of "like playing". (tr, ar, es, fr, it) | partly | S2 S3 | now K; suggest V-weak. Sources show the reverse pair (infinitive where gerund needed: 'enjoy to watch', 'interested in to learn') which is the same error type. Re-label V-weak and use their examples. |
| A1-S04 | "th" in "thanks" becomes /s/, /t/ or /f/. (fr, tr, it) | partly | S7 S4 S3 | now V-weak; suggest V. S7 (151 European French listeners): /θ/ heard as /f/; production: European French /s,z/, Canadian French /t,d/ (review in S7); S7 also cites that most European speakers produced dental fricatives correctly most of the time in reading/imitation. Add that region differs (France /s,z/; Quebec /t,d/). |
| A1-S05 | Drops /h/ (“’e has”, “’our”) or adds it to "hour". (fr) | supported | S6 S4 S19 S3 | now V-weak; suggest V. S6 (peer-reviewed, word/sentence/spontaneous tasks): 4 speaker profiles incl. dropped /h/ AND intrusive /h/ (hour, honest). Wording fine. |
| A1-S06 | "th" in "mother, father, brother" becomes /z/, /d/ or /t/. (fr, tr, it) | partly | S7 S4 | now V-weak; suggest V. /ð/ -> /z/ (France) or /d/ (Quebec) is sourced; /t/ for /ð/ is not. Drop '/t/'. |
| A1-S06 | Possessive built like the L1 ("the brother of Ana") instead … (es, fr, it, ar) | no source found | - | now K; suggest K. 'le frère d'Ana' pattern is plausible but no learner source. Also see Missing: his/her agree with owner. |
| A1-S08 | Adds "to" or an -s after can ("can to swim", "she cans"). (tr, ar, es, fr, it) | partly | S2 S3 | now K; suggest V-weak. S2/S3 list 'I must to finish', 'We can't to go' for French speakers (teaching sources, no study). 'She cans' / '-s' not sourced. Note: French modals take the bare infinitive, so transfer does not explain it; call it a tendency, not transfer. |
| A1-S09 | "th" at the start of this, these, that, those. (fr, tr, it) | partly | S7 S4 | now V-weak; suggest V. Accept /d, z/ is consistent with S7. Fine. |
| A1-S09 | Stress on the wrong syllable in teens and tens (13 / 30). (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No French-specific source for number stress. TEFL source (S3/S22) says only that English stress is unpredictable for French speakers, esp. in cognates. |
| A1-S10 | No "do/does" in questions in the L1, so "Where you live?"; a… (es, fr, it, tr, ar) | supported | S1 S2 S3 | now K; suggest V-weak. Three teaching sources: French makes questions with intonation/inversion ('You live in London?', 'How often go you there?'). |
| A1-S11 | "Wednesday" said with a /d/ and "Thursday" with /t/ or /s/. (fr, tr, it) | partly | S7 S4 | now V-weak; suggest V-weak. Only the 'Thursday' half (/θ/ -> /s,t/) is sourced; 'Wednesday with a /d/' is a spelling-pronunciation guess with no source. |
| A1-S11 | One preposition for all times ("in Saturday", "at the mornin… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| A1-S11 | Says "want that I go" or "want go" instead of "want to go". (tr, ar, es, fr, it) | no source found | - | now K; suggest K. French vouloir que + subjunctive makes 'want that I go' plausible; no learner source. |
| A1-S12 | Adds -s to irregular plurals ("childs", "peoples"). (tr, ar, es, fr, it) | no source found | - | now K; suggest K. Developmental, not L1-specific; no French source. |
| A1-S12 | Drops /h/ in "him, her". (fr) | partly | S6 | now V-weak; suggest V-weak. Native speakers also reduce unstressed him/her ('er), so dropping /h/ there is not an error; the sourced error is in stressed content words (house, happy). Reword to 'he, have, home, hand'. |
| A2-S01 | Says every -ed as a full syllable (“walk-ed”, “play-ed”) bec… (es, fr, it, tr) | no source found | - | now K; suggest K. No French-specific source (only generic -ed teaching pages). |
| A2-S02 | Regularises irregular verbs: “goed”, “buyed”, “taked”. (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Developmental error for all L1s; no L1-specific source. Consider removing L1 tags. |
| A2-S02 | Puts the past on both verbs: “Did you went?”, “I didn’t went… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Developmental error for all L1s; no L1-specific source. |
| A2-S02 | Uses the present perfect for a finished time: “Yesterday I h… (it, fr, es) | partly | S5 S13 S1 | now V-weak; suggest V-weak. S5 says passé composé covers finished and continuing action so the PP is hard; but a corpus study of French learners' PP/SP/passé composé (S13, snippet) found PC influence 'relatively weak' at upper-intermediate+. Fine for A2-B1, not for B2+. |
| A2-S03 | Doubles the marker: “more bigger”, “more cheaper”; or uses “… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Developmental; no source. |
| A2-S03 | “than” said with /d/ or /t/ (weak /ðən/ lost). (fr, tr, it) | partly | S7 | now V-weak; suggest V-weak. /ð/ -> /d/ (Quebec) or /z/ (France); '/t/' is not sourced, add /z/. Weak-form loss of /ðən/ not sourced. |
| A2-S03 | Stress on the wrong syllable in long adjectives (expenSIVE, … (fr, it) | partly | S4 S22 | now V-weak; suggest V-weak. Same last-syllable tendency; the two examples (expenSIVE, comforTAble) are not in any source. |
| A2-S04 | Often fine (voy a, je vais, vado a): the L1 pattern matches,… (es, fr, it) | no source found | - | now K; suggest K. Statement is about absence of error; no source needed beyond grammar. |
| A2-S04 | Hears “going to” as “gonna” and does not recognise it. (it, fr) | no source found | - | now K; suggest K. No source; applies to all L1s. |
| A2-S05 | Adds “to” or -s after should: “should to go”, “he shoulds”. (tr, ar, es, fr, it) | partly | S2 S3 | now K; suggest V-weak. Same as can/must: 'to' after modals sourced in teaching pages; 'shoulds' no source. |
| A2-S05 | Uses “too” where English says “very”: “It is too good.”; put… (es, fr, it) | no source found | - | now K; suggest K. Doubtful for fr: French distinguishes trop (too) and très (very). 'enough' after adjective is the plausible half (assez grand -> 'enough big'). Suggest dropping fr from the 'too' half. |
| A2-S06 | Treats mustn’t and don’t have to as the same (“You don’t hav… (es, fr, it) | no source found | - | now K; suggest K. No source; French devoir/ne pas devoir ambiguity is plausible. |
| A2-S07 | Uses plural for uncountable nouns: “informations”, “advices”… (fr, it, es) | supported | S8 S1 | now K; suggest V. S8 (Cambridge Learner Corpus): plural of uncountables is the most frequent countability error; 'information' first, 'advice' second; French listed among the L1s with most such errors (per-language rate not seen). S2/S5 do not cover it. |
| A2-S07 | Uses “much” in positive sentences: “I eat much rice.” (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source; plausible (beaucoup works everywhere). |
| A2-S07 | Stress on the last syllable in food words (vegeTABLE, chocoL… (fr) | partly | S4 S9 S3 S14 | now V-weak; suggest V-weak. French stress falls on the last full syllable of a phrase group (S9 says scholars disagree whether French has word stress at all); tendency is reported by teaching sources, and a 36% error rate on English stress placement in 55 learners (S14, snippet only). Keep, but say 'may carry the French pattern to long words'. |
| A2-S08 | Says “for + verb” for purpose: “I go there for study.” (para… (es, fr, it) | partly | S18 | now K; suggest V-weak. S18 (French grammar site) says French pour + infinitive vs English to + infinitive is the confusion; teaching-level only. |
| A2-S08 | Uses the wrong preposition for transport: “in bus”, “with th… (es, fr, it) | no source found | - | now K; suggest K. No source; S5 gives other preposition errors (depend of, interested by) not transport. |
| A2-S09 | Uses the present or “going to” for a decision made now: “I t… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| A2-S09 | Adds “to” after will or an -s: “I will to go”, “she wills”. (tr, ar, es, fr, it) | no source found | - | now K; suggest K. See A2-S09 note: unexpected for French. |
| A2-S10 | The L1 past forms map almost one to one, so “was” + -ing can… (es, fr, it) | no source found | - | now K; suggest K. No source; French has no progressive, so over-use of was+-ing is doubtful; under-use is more likely (S17 snippet: simple/progressive errors persist at intermediate). |
| A2-S10 | Writes “because … so” in one sentence: “Because it rained, s… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| A2-S10 | Misses weak was / were in connected speech and hears one slo… (it, fr) | partly | S22 S21 | now V-weak; suggest V-weak. Only production (not reducing unstressed syllables) is sourced; the perception claim (hears one slow word) has no source. |
| A2-S11 | Uses an adjective for an adverb: “She sings beautiful”, “He … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source (French uses adjective for adverb: 'chanter faux', 'bon' vs 'bien' is the real pair). |
| A2-S11 | Puts the adverb between the verb and the object: “I like ver… (es, fr, it) | supported | S11 S12 S1 S2 S3 | now K; suggest V. Strongest-sourced grammar item: White (1991, classroom study of francophone 11-12 year olds, S12 snippet); Garnier thesis (S11, opened): adverb placement is one of the six most frequent error types in a francophone L2-English corpus; S1/S2/S3 give 'I eat always', 'speaks very well English'. |
| A2-S11 | Final-syllable stress on -ly adverbs (carefulLY). (fr) | partly | S4 S9 S3 S14 | now V-weak; suggest V-weak. French stress falls on the last full syllable of a phrase group (S9 says scholars disagree whether French has word stress at all); tendency is reported by teaching sources, and a 36% error rate on English stress placement in 55 learners (S14, snippet only). Keep, but say 'may carry the French pattern to long words'. |
| A2-S12 | Adds “to” after let’s or shall we: “Let’s to go”; and says “… (tr, ar, es, fr, it) | no source found | S2 | now K; suggest K. No source for 'let's to go'; 'how about go' no source. |
| A2-S12 | “th” in the ordinal numbers (fourth, fifth, sixth): /t/ or /… (fr, tr, it) | partly | S7 S4 | now V-weak; suggest V-weak. The /θ/ half is sourced; add /f/ as perceived substitute (S7). Final cluster /fθ, ksθ/ not sourced. |
| A2-S13 | Translates direct requests: “Give me the menu.” sounds rude … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| A2-S13 | Flat, high intonation on polite questions (Could you…?). (fr) | partly | S4 S9 | now V-weak; suggest V-weak. S4 says French melody is 'flat and high with rising patterns'; S9 describes French rising continuation/yes-no patterns, so 'flat' is too strong. Reword 'little fall, rising patterns'. |
| A2-S13 | Writes “as big than” or “so big as”. (es, fr, it) | no source found | - | now K; suggest K. No source. |
| A2-S14 | Double negatives: “I don’t know nothing”, “Nobody didn’t com… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; French ne...rien is a double-marker pattern, plausible. |
| A2-S14 | Uses the continuous with state verbs: “I am knowing”, “I am … (es, fr, it, ar) | no source found | S17 | now K; suggest K. Doubtful for fr: French has no grammaticalised progressive; the better-documented French error is the present simple for a continuing action (S1, S5) and simple/progressive confusion in S17 (snippet). Consider dropping fr. |
| B1-S01 | Uses the present perfect with a finished time: “Yesterday I … (it, es, fr) | partly | S5 S13 S1 | now V-weak; suggest V-weak. S5 says passé composé covers finished and continuing action so the PP is hard; but a corpus study of French learners' PP/SP/passé composé (S13, snippet) found PC influence 'relatively weak' at upper-intermediate+. Fine for A2-B1, not for B2+. |
| B1-S01 | Wrong or regularised participles: “I have eated”, “I have sa… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Developmental; no source. |
| B1-S02 | Mixes used to + verb with be used to + -ing (“I am used to p… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S02 | Says “I used to going” or keeps the d in the question: “Did … (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S02 | Reads the /s/ in “used to” as /z/ and the weak “to” disappea… (fr, it) | no source found | - | now V-weak; suggest K. No source. |
| B1-S03 | Uses the present simple for “for / since”: “I live here sinc… (it, es, fr) | supported | S1 S5 S25 | now V-weak; suggest V-weak. S1: 'I am cooking since early this morning'; S5: 'I work here since two years'. Teaching sources, no study. French depuis + present is a grammar fact (S25 snippet). |
| B1-S03 | Confuses for and since, or says “How long time?” (es, fr, it, tr, ar) | partly | S5 | now K; suggest V-weak. S5 covers the tense with for/since, not the for/since choice or 'How long time'; no source for those. |
| B1-S04 | Present perfect with a finished-time word in news stories: “… (it, es, fr) | partly | S5 S13 S1 | now V-weak; suggest V-weak. S5 says passé composé covers finished and continuing action so the PP is hard; but a corpus study of French learners' PP/SP/passé composé (S13, snippet) found PC influence 'relatively weak' at upper-intermediate+. Fine for A2-B1, not for B2+. |
| B1-S04 | Wrong participle forms (“said”, “been”, “seen” confused with… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Developmental; no source. |
| B1-S05 | Uses will in the if-clause: “If it will rain, we stay home.” (es, fr, it) | contradicted | S25 | now K; suggest K. By structure: French si + present is the same as English if + present (French puts the future after quand/lorsque, not si). 'If it will rain' is therefore NOT predicted for French; the source-backed version is 'when I will...' (see B2-S07). Drop fr here. |
| B1-S05 | Misses the pause after the if-clause and reads the sentence … (fr, it) | no source found | - | now V-weak; suggest K. Unsourced; consider dropping. |
| B1-S06 | Uses would in the if-clause: “If I would have money, I would… (es, fr, it) | contradicted | - | now K; suggest K. By structure: French si + imparfait = if + past simple, and si + conditionnel is non-standard in French too. No learner data found. The error is common across L1s (developmental); drop fr, or relabel as general. |
| B1-S06 | Says “If I was you” (common in everyday English) or “If I wo… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. Developmental / register; no French source. |
| B1-S06 | Hears and says ’d as “had” or loses it: “I’d go” sounds like… (fr, tr, it) | no source found | - | now V-weak; suggest K. No source. |
| B1-S07 | Uses the L1 impersonal pattern (se / on / si) instead of the… (es, fr, it) | no source found | - | now K; suggest K. Grammar fact (French on) but no learner source. Wording: 'Here speaks English' is the Spanish (se habla) form; for fr the pattern is 'Here one speaks / They speak English'. Split by language. |
| B1-S07 | Says -ed as a full syllable in every participle. (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B1-S08 | Repeats the pronoun: “The man who I saw him”, “The film that… (es, fr, it, tr) | contradicted | S16 | now K; suggest K. S16 (snippet): 52 French-L1 learners of English overwhelmingly preferred a gap to a resumptive pronoun, unlike Persian L1. Drop fr (keep ar, tr). Level of participants not seen. |
| B1-S08 | Uses “what” for “that”: “The thing what I like.” (fr, it) | no source found | - | now K; suggest K. No source; plausible via French ce que/ce qui. |
| B1-S09 | Uses must for every deduction and must not for “can’t be”: “… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S09 | Misses the weak form of modals and hears “can” for “can’t”. (fr, tr, it) | no source found | - | now V-weak; suggest K. No source. |
| B1-S10 | Uses the present simple for a plan: “Tomorrow I meet my frie… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S10 | Uses “will” for a plan already made, or the present continuo… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S10 | Loses the contracted ’ll in “I’ll be there”. (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B1-S11 | Uses the infinitive where English needs -ing (“I enjoy to re… (es, fr, it) | supported | S2 S3 | now K; suggest V-weak. S2: 'I'm thinking about to go', 'interested in to learn'; S3: 'They enjoy to watch movies'. Teaching pages. |
| B1-S11 | Weak “to” disappears or becomes “too”. (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B1-S12 | Keeps the question word order in an indirect question: “Coul… (es, fr, it) | no source found | - | now K; suggest K. No source; French embedded questions mostly use statement order, so partly doubtful for fr (copular 'où est la gare' is the exception). |
| B1-S12 | No backshift: “He said he is tired.” Or says “say me”. (tr, ar, es, fr, it) | no source found | - | now K; suggest K. Doubtful for fr: French has concordance des temps (il a dit qu'il était fatigué), so missing backshift is not predicted. 'say me' unsourced. |
| B1-S12 | Says said as /sed/ vs /sɛd/ incorrectly or adds a vowel to t… (it, fr) | no source found | - | now V-weak; suggest drop. Incoherent: /sed/ and /sɛd/ are the same vowel in IPA; no source for 'told'. Drop or rewrite. |
| B1-S13 | Uses the past simple instead of the past perfect: “When I ar… (es, fr, it) | no source found | - | now K; suggest K. Doubtful for fr: French plus-que-parfait maps onto the past perfect, so the error is not predicted. |
| B1-S13 | Loses the contracted ’d for had in speech. (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B1-S14 | Uses wish + would or wish + the present: “I wish I have more… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S14 | Final /ʃ/ in wish: /s/ or /ʃi/. (fr, tr, it) | no source found | - | now V-weak; suggest drop?. French has /ʃ/ (chat, bouche), so /s/ for /ʃ/ is unexpected; no source for '/ʃi/'. Likely wrong: drop or replace with the real issue (final voiced/unvoiced cluster). |
| B1-S15 | Treats mustn’t and don’t have to as the same (revisits A2-S0… (es, fr, it) | no source found | - | now K; suggest K. No source; French devoir/ne pas devoir ambiguity is plausible. |
| B1-S15 | Uses “although … but” in one sentence: “Although it was late… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source found (unmatched rule: check). |
| B1-S16 | Wrong tag auxiliary: “You like it, isn’t it?”; uses “no?” fo… (tr, ar, es, fr, it) | supported | S2 S3 S23 | now K; suggest V-weak. S2/S3: French n'est-ce pas (one fixed tag) gives 'isn't it?' for every tag. Fix wording: for fr the typical error is 'isn't it?', not 'no?' (that is es/it). |
| B1-S16 | Flat intonation: every tag sounds like a real question. (fr, it) | no source found | - | now V-weak; suggest K. No source on tag intonation for French speakers (tag form itself IS sourced: see B1-S16 first line). |
| B1-S16 | Separates phrasal verbs wrongly: “Turn off it”, “Look for th… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B1-S17 | Leaves out “that” or uses “so… as”: “It was so cold, we stay… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B1-S17 | Uses reflexive pronouns where English does not (“I feel myse… (es, fr, it) | no source found | - | now K; suggest K. No source for French->English (the only paper found, Wakely, is the reverse direction). Plausible: je me lave les mains. |
| B1-S17 | Adds a vowel at the end of -selves /selvz/. (fr, ar) | no source found | - | now V-weak; suggest K. No source. |
| B1-S18 | Puts “enough” before the adjective: “enough big” (L1 order) … (es, fr, it) | partly | S2 | now K; suggest K. 'assez grand' makes 'enough big' structurally plausible but no source; 'too for very' half is doubtful for fr (trop/très). |
| B1-S18 | Mixes few and little: “a little friends”, “a few money.” (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S01 | Present simple for a continuing activity: “I study English s… (it, es, fr) | supported | S1 S5 S25 | now V-weak; suggest V-weak. S1: 'I am cooking since early this morning'; S5: 'I work here since two years'. Teaching sources, no study. French depuis + present is a grammar fact (S25 snippet). |
| B2-S01 | Uses the continuous with state verbs: “I have been knowing h… (es, fr, it, tr, ar) | no source found | S17 | now K; suggest K. Doubtful for fr: French has no grammaticalised progressive; the better-documented French error is the present simple for a continuing action (S1, S5) and simple/progressive confusion in S17 (snippet). Consider dropping fr. |
| B2-S01 | Loses the weak “’ve been” /əv bɪn/ and hears it as “be”. (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B2-S02 | Uses “would have” in the if-clause: “If I would have known, … (es, fr, it, ar, tr) | contradicted | - | now K; suggest K. By structure: French si + plus-que-parfait + conditionnel passé mirrors English. Not L1-predicted; developmental. Drop fr or relabel. |
| B2-S02 | Says “I wish I would have …” for a past regret. (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S02 | Misses weak “have” in “would’ve / could’ve” and writes “woul… (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B2-S03 | Uses the L1 impersonal pattern (se / on / si) instead of the… (es, fr, it) | no source found | - | now K; suggest K. Same: no learner source; separate the examples by language. |
| B2-S03 | Weak forms “been” and “being” are lost in fast speech. (fr, it) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B2-S04 | Keeps question order in a reported question: “He asked me wh… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. Doubtful for fr: embedded questions in French take statement order. Check before keeping. |
| B2-S04 | Says “He told me to not go” or “He told that…” instead of “t… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S05 | Leaves out the commas or uses “that” in a non-defining claus… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B2-S05 | Uses “what” for “which”: “He passed, what surprised me.” (fr, it) | no source found | - | now K; suggest K. No source; plausible via French ce que/ce qui. |
| B2-S06 | Uses should have, must have and might have interchangeably (… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S06 | Wrong participle or “should of” in writing: “She should have… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. General error, not L1-specific. |
| B2-S06 | Loses weak “have” /əv/. (fr, it, tr) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B2-S07 | Uses the future after “when / by the time / as soon as”: “Wh… (es, fr, it) | partly | S25 | now K; suggest K. French uses the future after quand/lorsque/dès que (grammar fact, S25 snippet); no study of the learner error. Mark K+ (grammar fact verified), not V. |
| B2-S07 | Hears “will have” /wɪl əv/ as one word. (fr, it) | partly | S22 S21 | now V-weak; suggest V-weak. Only the production half is supported: French speakers resist vowel reduction in unstressed syllables (S22 snippet; S21: two learners). The perception claims ('hears X as Y') have no source. Reword as 'does not reduce'. |
| B2-S08 | Uses “despite of” or “in spite” without “of”, or “despite th… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B2-S08 | Joins sentences with “however” and a comma: “It was good, ho… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B2-S08 | False friend: “actually” used for “currently”. (fr, it, es) | supported | S2 S5 S24 | now V-weak; suggest V-weak. Three teaching sources (London School of English, LLEXI, Connexion France). The false friend is a dictionary fact; learner frequency is teaching-source only. |
| B2-S09 | Uses the active with a reflexive: “I cut my hair” or “I repa… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S09 | Indirect question order: “Could you tell me where is the ban… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; French embedded questions mostly use statement order, so partly doubtful for fr (copular 'où est la gare' is the exception). |
| B2-S10 | Double negative with unless: “Unless you don’t come, …” (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B2-S10 | Uses will in the condition: “As long as it will be easy, I’l… (es, fr, it) | no source found | - | now K; suggest K. French tant que takes the future, so plausible; no source. |
| B2-S11 | Does not separate “remember to do” (the future task) and “re… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source. |
| B2-S11 | Uses “the” for general ideas: “The life is hard”, “I like th… (es, fr, it) | partly | S10 | now K; suggest K. Language fact verified: French requires the definite article for general categories and abstractions (S10: 'La patience est une vertu'). Learner-error data for French L1 not found. Good K entry; keep. |
| B2-S12 | Uses “what” instead of “that” in a cleft: “It was the key wh… (fr, es, it) | no source found | - | now K; suggest K. No source; plausible via French ce que/ce qui. |
| B2-S13 | Dangling participles: “Walking down the street, the sun was … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; not L1-specific. |
| B2-S14 | Says “as more as” or leaves out the second “the”: “The more … (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S14 | Mixes so and such: “It was so a good film.” (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S15 | Uses the L1 object pattern: “He suggested me to go”, “She ad… (es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S16 | Writes “in the other hand” and overuses “moreover” and “furt… (es, fr, it) | no source found | - | now K; suggest K. No source; collocation/connector errors: only S15 (phraseology, general). |
| B2-S16 | Mixes “at the end” and “in the end”, “besides” and “beside”. (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S17 | Uses “for + verb” for purpose: “I study for pass the exam.” (es, fr, it) | partly | S18 | now K; suggest V-weak. S18 (French grammar site) says French pour + infinitive vs English to + infinitive is the confusion; teaching-level only. |
| B2-S17 | Says “had better to go” or “better go”. (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| B2-S18 | Uses the infinitive after a preposition: “Before to leave”, … (es, fr, it) | supported | S2 | now K; suggest V-weak. S2: 'thinking about to go', 'interested in to learn' (French uses an infinitive after a preposition). |
| B2-S18 | Confuses “be used to + -ing” with “used to + verb”. (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source. |
| C1-S01 | No inversion after a fronted negative: “Rarely we go there.” (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S01 | Over-inverts or puts a main verb before the subject: “Rarely… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S02 | Mixes the tenses in a mixed conditional: “If I studied more,… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S03 | Uses the L1 impersonal pattern: “It says that…” for “It is s… (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S03 | Wrong infinitive: “He is said to has left.” (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S04 | Has a subjunctive in the L1 and so adds -s or “should” or an… (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S05 | Is helped by Latin-based nouns but builds heavy “of … of …” … (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S06 | “Not only … but” without inversion: “Not only he came but …” (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S07 | Dangling perfect participle: “Having finished, the exam was … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; not L1-specific. |
| C1-S07 | Uses the L1 gerund “Habiendo terminado” as a model but loses… (es, fr, it) | partly | - | now K; suggest K. Example is Spanish; French is 'Ayant fini', Italian 'Avendo finito'. Reword per language. |
| C1-S08 | False friends in stance words: “actually” (for currently), “… (es, fr, it) | supported | S2 S5 S24 | now V-weak; suggest V-weak. 'actually' and 'eventually' both confirmed in S2 (eventually/éventuellement) and S5/S24 (actuellement). |
| C1-S08 | Sounds too direct or too certain in discussion; hedges are r… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S09 | Formal in speech or informal in an email (contractions, phra… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S10 | “Although … but” in one sentence, or “much as” misused: “Muc… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source found (unmatched rule: check). |
| C1-S10 | Misses the adjective + as pattern: “Strange as it may seem” … (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S11 | Mixes “needn’t have” and “didn’t need to”: “I needn’t have g… (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S12 | Collocation calques: “make a photo”, “do a mistake”, “say a … (es, fr, it) | partly | S15 | now K; suggest V-weak. S15 (Thewissen 2008, error-tagged corpus of French/German/Spanish learners): French calques exist ('the active life' from la vie active). The listed examples (make a photo, do a mistake, say a lie) are plausible (faire une photo, faire une erreur, dire un mensonge) but not in a source; 'open the light' is not standard French (Belgian/Quebec usage) and may be an es/it/ar item. |
| C1-S13 | Copies the source structure and vocabulary when summarising … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S13 | False friends in summary words: “actually”, “sensible / sens… (es, fr, it) | partly | S2 S5 | now V-weak; suggest V-weak. 'actually' confirmed; 'sensible/sensitive' not re-seen in the pages opened (pronunciation/TEFL pages from the earlier round: not opened this round). |
| C1-S14 | Rhetorical habits differ by language (repetition, indirectne… (tr, ar, es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S14 | Even rhythm and little pause or emphasis in a speech. (fr, it) | partly | S4 S9 | now V-weak; suggest V-weak. S4 says French melody is 'flat and high with rising patterns'; S9 describes French rising continuation/yes-no patterns, so 'flat' is too strong. Reword 'little fall, rising patterns'. |
| C1-S15 | Irony and understatement are signalled by tone and context; … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S15 | Misses British-style understatement (“not bad”, “a bit of a … (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S16 | Overuses the same connector or places it in the wrong positi… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S17 | Mis-orders “However small the change”: “However the change i… (es, fr, it) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S17 | Omits a “the” in “The more … the more” or the verb be. (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S18 | Absolute phrases are rare in the L1, so “Time permitting” or… (es, fr, it, tr, ar) | no source found | - | now K; suggest K. No source; C1 items are plausible contrastive claims but untested here. 'Rhetorical habits' is flagged as contested in the entry itself. |
| C1-S18 | Dangling absolute phrases: the subject differs from the main… (es, fr, it) | no source found | - | now K; suggest K. No source; not L1-specific. |

## Missing difficulties (French speakers, A1-B1, not in the list)

| # | Difficulty | Level | Source | Evidence |
|---|---|---|---|---|
| 1 | Possessive adjective agrees with the thing owned, not the owner: "Chad and her wife", "This is the Karen's dog" (also the + possessive) | A1 | S1 | V-weak |
| 2 | Adjective after the noun: "a car red" | A1-A2 | S1 | V-weak |
| 3 | /ɪ/ vs /iː/ (ship / sheep, fit / feet): French has one close front vowel; best-documented French vowel problem in teaching sources | A1 | S4, S3 | V-weak |
| 4 | /æ/ vs /ɑː/ (hat / heart, had / hard): French [a] used for both | A1-A2 | S4 | V-weak |
| 5 | Flat diphthongs ("go", "show" without glide) and missing /dʒ/ onset (James, job) | A1-A2 | S4 | V-weak |
| 6 | Prepositions copied from French: "depend of", "interested by" (dependre de, interesse par) | A2-B1 | S5 | V-weak |
| 7 | He/she for objects (French grammatical gender): "the report ... he" | A1-A2 | S5 | V-weak |
| 8 | Common false friends beyond actually/eventually: sympathetic (nice), assist (attend), present (introduce), library / bookshop, envy / wish, bra / arm | A2-B1 | S2, S3, S24 | V-weak |

Also reported by sources but not for A1-B1 teaching: phraseological calques at all levels (S15), reduced vowels in unstressed syllables (S22, S21, partly covered by the weak-form rows).

## Entries to fix or drop

Drop `fr` (or relabel as developmental, not L1):
- **B1-S05** "If it will rain": French uses si + present like English; the future is after quand (that is B2-S07, which is fine).
- **B1-S06** "If I would have money" and **B2-S02** "If I would have known": French si + imparfait / plus-que-parfait mirrors English; no data. Keep as a general developmental error.
- **B1-S08** "The man who I saw him": one study (S16, snippet) found French-L1 learners overwhelmingly prefer a gap.
- **A2-S14 and B2-S01** state verbs in -ing: French has no progressive; the sourced French error is the opposite (present simple for a continuing action, S1, S5).
- **A2-S05** "too" for "very": French trop / tres are distinct; keep only the "enough" half.
- **A2-S09** "will to go": French future is a suffix; not predicted.

Rewrite wording:
- **B1-S12** "Says said as /sed/ vs /sɛd/": the two are the same vowel; incoherent. Drop or rewrite.
- **B1-S14** "Final /ʃ/ in wish: /s/ or /ʃi/": French has /ʃ/; unsourced and likely wrong. Drop.
- **B1-S16** tag line: for fr the typical error is "isn't it?" for every tag (n'est-ce pas), not "no?" (es/it).
- **A1-S12** "Drops /h/ in him, her": unstressed him/her lose /h/ in native speech too; target stressed /h/ words (he, have, home).
- **A1-S06 / A2-S03** th: remove "/t/" for /ð/; add /z/ (France) and note Quebec French uses /t, d/ (S7).
- **A1-S11** "Wednesday with a /d/": unsourced; keep only Thursday.
- **A1-S04** add region note: European French /s, z/ (heard as /f/), Quebec /t, d/; S7 says many learners produce them correctly in reading tasks, and school pupils now study English.
- **A1-S01 / A2-S03 / A2-S07 / A2-S11 / C1-S14** stress and flat intonation: sources disagree whether French has word stress; reword to "may place the stress on the last syllable", "less pitch fall".
- **B1-S07 / B2-S03 / C1-S03** impersonal pattern: "Here speaks English" is Spanish (se habla); for fr write "Here one speaks English / They speak English".
- **C1-S07** "Habiendo terminado" is Spanish; French is "Ayant fini".
- **C1-S12** "open the light" is not standard French; check it belongs to es/it/ar.
- **B1-S12 backshift, B1-S13 past perfect, B2-S04 / B1-S12 / B2-S09 question order**: French has sequence of tenses, a plus-que-parfait and statement order in embedded questions, so these are doubtful for fr; no source either way. Keep only if the teacher sees them.
- **A1-S08, A2-S05**: "can/should to" is attested for French in S2/S3 but the cause is not transfer (French modals take the bare infinitive); label as a tendency.
- **Evidence upgrades:** A1-S05 (/h/) to V (S6); A1-S04, A1-S06, A1-S09 th to V (perception study, S7); A2-S11 adverb position to V (S11, S12).

## Could not source

All C1 entries, nearly all K entries (modal + verb forms, because/so, however, connectors, passive "on", reflexives, relative "what", suggest + me, and so on), weak-form perception ("hears X as Y"), tag intonation, number stress, and learner-level data for the present perfect at A2-B1. For these, only a classroom check (the student's own Mistake Bank) can confirm them.
