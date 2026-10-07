# Success Hub placement bank - Rater 1 summary (Business English trainer view)

Items evaluated: 74. Verdicts: KEEP 49, FIX 22, REPLACE 3. Key problems: 1 (su-42, two defensible American-English answers) plus 2 arguable keys (su-35 unresolved condition, su-79 colloquial "told"). Level tag disagreements: 31 items, nearly all in the direction "tag too hard" for A2-B2 grammar and vocabulary. Full per-item detail is in success_rater1.json. Level calls for the CEFR grammar/vocab layer rest on my professional knowledge: the English Grammar Profile site was unreachable, so I am unsure about borderline calls (wish + past, third conditional, would rather) and give them as bands (B1/B2).

## Overall assessment

The bank is competent, clean and mostly fair. Stems are natural, keys are almost always unique, and the workplace layer is light and sensible. Its weaknesses are coverage and calibration, not individual-item errors.

1. Balance of levels: A1 3, A2 13, B1 23, B2 24, C1 11 (74 total). Fine for a bank, but adaptive tests of 20-36 items will exhaust the pool quickly in the A2-B2 band: only about 3-6 items per skill per level. Aim for 8-10 per skill/level band before launch, or learners will see the same items on retakes.
2. Balance of skills: grammar 29, vocabulary 19, reading 10, listening 9, business writing 3, functional/fluency 4. Receptive skills are under-represented relative to the stated purpose (workplace English). Listening has no A1 item, only 2 at A2, 3 at B1, 3 at B2 and a single C1. Every listening item is a one-speaker voicemail/announcement: there is no two-speaker dialogue and no meeting talk, which is where Latin and Arabic learners usually struggle.
3. Redundancy:
   - send/sent appears in 6 items (su-02, 05, 07, 19, 40, 47).
   - Third conditional appears 4 times (su-39, 46, 66, 65-inverted), plus wish in su-21 and su-79. That is 6 items on one cluster.
   - Remote/hybrid/four-day work appears 4 times (su-13, 31, 54, 73).
   - "Polite vs rude" MC appears 6 times (su-36, 37, 38, 62, 63, 60); four of them have three crudely rude distractors and can be answered with no English.
   - Look-alike-word distractor sets (p-words, re-words, -ations, pl-words) appear in su-28, 49, 71, 72.
   - Inversion appears 3 times at C1 (su-64, 65, 67).
4. Gaps in coverage for A2-C1 working adults (no items at all): articles (a/an/the/zero), prepositions of time/place (in/on/at), dependent prepositions beyond "look forward to", comparatives, question formation/indirect questions ("Could you tell me where..."), present perfect vs past simple contrast, modal verbs of deduction, passive at B2, quantifiers beyond "enough", linking words beyond "despite", word formation, spelling/collocation of numbers/dates, phone-call language, meeting language (interrupting, clarifying, agreeing), email register (greetings/closings beyond su-15 and su-60), small talk/social function, reported speech beyond one item, and "used to/get used to". I propose adding at least 12 items across these.
5. Workplace layer: about right and slightly light below B2, which is correct. Most A1-B1 items are general-adult and need no office experience. Jargon appears only at B2+ (targets/quarter in su-48 and su-57; tender in su-55; scope in su-62; board/investors in su-65/74; quote in su-35); the one real offender is su-62 ("adjust the scope"), which I would remove. Business items at B2+ rely on a "corporate" schema (boards, quarterly figures, investors) that a strong English speaker who is, say, a nurse, teacher or engineer may lack. Keep the C1 items topic-neutral (analysis, evidence, policy) rather than corporate.
6. American English: several British items would sound foreign to US-English test-takers: "car park" and "1 March" (su-32), "take a decision" (su-65), "shall I send her up" (su-33), "weigh up" (su-51), "revise" (su-49). su-42 has a second correct answer in AmE ("I'd rather you not mention"), and su-79 "told" is colloquially acceptable. All are fixed in the JSON.
7. Cognate/L1 fairness: Romance speakers get a free pass on calendar (su-14), computer (su-02), postponed (su-28), revise (su-49), valid (su-52), contradict (su-69), validity (su-70), implications (su-71), lucid (su-68). Several of these are tagged B2/C1 but are guessable by a Spanish/French/Italian A2 learner, which will over-place Romance-L1 users on vocabulary and under-discriminate for Arabic/Turkish. Use fewer Latinate keys, or balance with Germanic/phrasal keys (su-51, 53 are good models). Grammar items such as "to seeing" (su-20), "take an appointment" (su-29), "for/since" (su-16), "advice" (su-25 fixed) usefully hit real L1 transfer errors.
8. Guessability patterns:
   - The key is the longest or only complex option in su-33, 55, 59, 62, 73.
   - Absurd distractors ("kitchen", "garden", "uniform", "fill on/off", "difficultest", "No company has tried remote work", "written by the investors").
   - Extreme-word distractors (everyone, all week, perfect) in reading items.
   - Several vocabulary items can be solved by the gap-fill frame ("so ... that nobody had any questions" for lucid; the colon clause for contradict).
9. Difficulty calibration: A2/B1 grammar is tagged 0.1-0.2 too hard in many cases (su-22 superlative 0.50; su-41 which 0.66; su-43 suggest+gerund 0.76; su-39 third conditional 0.74; su-66 0.82). For an adaptive engine, mis-calibrated items near the middle of the scale hurt placement more than weak distractors. B2-tagged vocabulary containing cognates (su-52, 69, 70) should come down 0.05-0.1.

### Per level

- A1 (3 items): fine as floor checks; add 2-3 more (articles, prepositions, a listening item).
- A2 (13): good everyday stems; weak (silly) distractors in su-14, 15, 37; su-08 and su-15 need fixes.
- B1 (23): the best-written part of the bank (su-20, 29, 30, 31 are model items). Heavy on vocabulary (5) and reading; light on listening dialogues and writing.
- B2 (24): good receptive items (su-54, 56, 57, 58). Grammar over-represents third-conditional/wish; vocabulary is mostly phrasal/collocation (good). Two fluency items too easy and guessable.
- C1 (11): reading/listening items are appropriately demanding; vocabulary items are cognate-heavy and sometimes B2; three inversion items are redundant.

### Per skill

- Grammar: accurate but needs articles, prepositions, comparatives, questions, modals, present perfect vs past, passive at B2.
- Vocabulary: mostly sound; fix guessable sets and cognate-heavy keys.
- Reading: good paraphrase keys, honest traps; texts are short (28-85 words), so add 1-2 longer B1/B2 texts (email chains, a notice plus reply) to test workplace reading.
- Listening: scripts are natural and mostly well-built; fix key length (su-33, 59) and the unresolved condition (su-35); add dialogues and a meeting scene.
- Business writing/fluency: pragmatic items are guessable and similar; replace the rude-vs-polite pattern with polite-vs-less-polite pairs.

## The 10 most urgent fixes

1. su-42: two correct answers in AmE ("didn't mention" and "not mention"). Replace distractor "not mention" with "haven't mentioned".
2. su-35: unresolved condition in the audio means the key is arguable. Add "We need the equipment by the end of the month."
3. su-66 and su-46 (and su-39 retag): four third-conditional items. Replace su-66 with the article item and su-46 with "comply with" to reclaim two slots.
4. Remove British-only forms from an American test: su-32 (car park, date order), su-65 (take a decision), su-33 (shall I), su-51 (weigh up, acceptable but note).
5. su-79: "I wish you told me" is acceptable to many Americans; replace with "tell".
6. su-33, su-59, su-73, su-62: key is the longest or only complex option and distractors are rude or absurd; equalise length and make wrong answers plausible.
7. su-67: pronoun "they" without antecedent; rewrite stem.
8. su-62 and su-63: remove the jargon ("scope") and make all options polite-sounding so tone alone does not give the answer.
9. Re-calibrate difficulty for the ~31 items where the tag is off (su-22, 39, 41, 43, 69, 70 first), otherwise the adaptive engine will mis-place A2-B1 learners.
10. Add coverage: articles, prepositions of time/place, indirect questions, present perfect vs past simple, and two-speaker listening (phone call, short meeting). Suggested new items:
    - "We have a meeting ___ Tuesday ___ 3 p.m." (on ... at) A2.
    - "Could you tell me where ___?" (the restroom is / is the restroom / does the restroom be / the restroom) B1.
    - "I ___ in Boston for five years before I moved to Denver." (had lived / have lived / lived-vs-lived) B1/B2.
    - Two-speaker listening: A2 phone call changing an appointment; B1 short meeting about a schedule; B2 colleague disagreeing politely.

## Notes on replacement items proposed

- su-46 becomes "comply ___ the new safety rules" (with/to/for/by), B2, dependent preposition; "comply to" is a common Arabic/French error.
- su-66 becomes "There was ___ accident ... ___ traffic was terrible" (an ... the), A2/B1, articles; distractors test a/an and first-mention vs generic.
- su-68 becomes "noncommittal" (C1) with four plausible adjectives for an answer; no cognate shortcut.
