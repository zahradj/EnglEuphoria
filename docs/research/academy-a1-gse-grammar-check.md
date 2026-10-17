# A1 roadmap — source check against the Pearson GSE adult grammar objectives (2026-10-17)

Owner request (2026-10-17): check the curriculum roadmap level by level against sources, A1 first. **Method:** I downloaded the Pearson document *GSE Learning Objectives: Grammar, Adult Learners* (February 2023, Pearson Education) with `curl` through the session proxy and read its A1 and A2 tables directly (earlier checks could only reach the GSE second-hand through CEFR-J). Mechanics and ordering only; no content copied. Marks: **[V]** read in the source this round · **[S]** secondary or search summary · **[U]** not verified.

## Source status

| Source | Result |
|---|---|
| **Pearson GSE Grammar, Adult Learners (2023) PDF** | **Opened and read [V].** 457 learning objectives with GSE values; A1 = GSE 22-29, A2 = 30-42. Link in `structureGse.ts`. |
| English Grammar Profile / English Vocabulary Profile (englishprofile.org) | **Still not reachable** (404 shell, JavaScript app). EGP and EVP placements stay unverified [U]; the earlier CEFR-J cross-check in `academy-curriculum-primary-source-check.md` still stands. |
| L1 difficulties (ar, es, fr, tr, it) | Search summaries only [S]: Arabic (no /p/ vs /b/ in some sources, third-person -s, article use), Spanish (his/her confusion, "I have 15 years", b/v); French, Italian, Turkish **not found**. The standard reference (*Learner English*, Swan & Smith, Cambridge) was not opened [U]. |
| Vocabulary size A1 | No official English Vocabulary Profile figure found; secondary sources say about 500-800 words [S]. Our A1 budget (940 new words and chunks over 12 Seasons) is not checked against it [U]. |

## What the GSE says about how to place a structure (document p. 6) [V]
The GSE value of a structure is the point where a learner has a **50 % chance of using it correctly**. Pearson says a structure should be introduced **about 10 GSE points before its value**. For A1 (top of band = 29) that means structures up to about **GSE 39** can be introduced as chunks in A1.

## A1 Seasons against the GSE (values are the lowest and highest GSE of the matching sub-uses; code: `src/curriculum/academy/structureGse.ts`)

| Season | E3 / E6 structures | GSE | Reading |
|---|---|---|---|
| S01 Who Are You? | be; possessive adjectives | 24-25; 25 | **In band, earliest rung.** Good first Season. |
| S02 My Room | there is/are; prepositions of place | 27; 26-30 | In band. |
| S03 Free Time Club | present simple; like + -ing | 26-27; 27-31 | present simple in band; **like + -ing is GSE 31 (low A2)**: fine as a chunk ("I like swimming") before the rule. |
| S04 Café Night | some/any; would like | 32-37; 29-33 | **Highest in A1: some/any are GSE 36-37 (mid A2).** Within the 10-point lead but the riskiest A1 placement; keep "some" in requests as a chunk and treat "any" as recognition only. "I'd like / I want" + noun is GSE 29: in band. |
| S05 A Day in My Life | present simple he/she (-s) and questions; frequency adverbs | 24-26; 32-36 | -s in band; **frequency adverbs 32-36** (position 36): teach the words, not the position rule. |
| S06 Family | have got; possessive 's | 25-28; 28-30 | In band. |
| S07 Treasure Map Town | imperatives; prepositions of movement | 27; **35** | imperatives in band; **movement prepositions GSE 35**: chunk-first ("go along... turn left") is right. |
| S08 Can Do! | can (ability); and/but/because | 29; 25-35 | can in band; because is 35: chunk. |
| S09 Market Day | this/that/these/those; how much/many | 25-39; 27-30 | "this is" 25, determiners 30, **pronoun use 39**: keep to "this/that + noun" and "How much is this?". |
| S10 Right Now | present continuous; wh-questions | 30; 25-27 | continuous GSE 30: low A2 but within lead. |
| S11 Plan the Weekend | want to / need to; prepositions of time | 31; 30-32 | within lead; "need to" has no separate A1/A2-low objective found [V], so teach it as a chunk. |
| S12 Lost and Found | articles and plurals; object pronouns | 24-32; 27 | **Plurals (24-25), a/an (26) and object pronouns (27) are the EARLIEST GSE rungs but come last.** They are already met earlier (plurals in S02 fields, object pronouns in S06); S12 should state that they are being consolidated, not introduced. |

## Verdict
- **Nothing in A1 is outside Pearson's "10 points ahead" lead** (lowest sub-use of every structure is <= 36; the test `structureGse.test.ts` enforces <= 39). No structure has to move.
- **The order inside A1 is not monotonic in GSE** (S04 some/any 36 comes before S06 have got 28 and S08 can 29). Pearson's guidance supports early chunks, not early rules, so the fix is in the lessons: S04, S05, S07 and S09 teach the GSE >= 32 items as chunks or recognition, with the rule only for the in-band part.
- **No Season is missing a GSE A1 objective** from the adult list that we do not cover: ages ("I'm 25", "How old...?"), "what's your...?", "it's + time/weather", dates (28), and "this is" introductions all sit in S01, S05, S10, S11 [S: by reading the Season fields; not checked lesson by lesson].

## Recommended changes (not applied; need the owner)
1. In the A1 Season spec, mark each GSE >= 32 structure as **chunk first, rule later**: some/any (S04), frequency adverbs (S05), movement prepositions (S07), demonstratives as pronouns (S09).
2. Reword S12's objective as consolidation of plurals, a/an and object pronouns.
3. Check L1 transfer with the real reference (*Learner English*) before locking the pronunciation and error priorities in the A1 level frame.

## Next levels
Same method for A2 (GSE 30-42), then B1-C1 (the PDF covers all levels). EGP and EVP need access from a person's browser.
