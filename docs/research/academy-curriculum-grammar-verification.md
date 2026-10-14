# Academy curriculum: grammar placement verification (2026-10-14)

Scope: research only. Nothing in `src/` was edited. Structure ids and "our level + season" come from
`src/curriculum/academy/structureLevels.ts` and `src/curriculum/academy/levels/{a1,a2,b1,b2,c1}.ts`.
Season numbers are the order of entries in each level file (A1 = 10 Seasons, A2 = 12, B1 = 16, B2 = 16, C1 = 16).

## 0. Honest status: the primary sources could NOT be opened

| Source | What happened | Status |
|---|---|---|
| English Grammar Profile (englishprofile.org, EGP Online) | WebFetch `getaddrinfo ENOTFOUND`; curl through the agent proxy gives `CONNECT tunnel failed, response 403`. WebSearch never returned an EGP page. | **unverified** |
| Pearson GSE learning objectives (pearson.com/english/about/gse/...) | WebFetch ENOTFOUND. WebSearch returned no Pearson page. | **unverified** |
| British Council LearnEnglish grammar (A1, A2, B1-B2, C1 index pages) | WebFetch ENOTFOUND on all four; curl 403. | **unverified** |
| Cambridge English (cambridgeenglish.org), Empower A2 TOC PDF (assets.cambridge.org) | WebFetch ENOTFOUND; curl 403 for cambridgeenglish.org. Search found the PDF URL only, content not readable. | **unverified** |
| Cambridge Prepare! scope and sequence | No scope-and-sequence document found by search. | **unverified** |
| test-english.com contents pages | WebFetch ENOTFOUND (only search snippets read). | secondary, snippet only |

Consequence: **no placement below has been confirmed against EGP, GSE, British Council or Cambridge text.**
The sandbox blocks these hosts (DNS or proxy 403), so a human or a session with open egress must repeat the check.
What I did get is search-result snippets from secondary sites (listed in section 6). They are weak evidence and
are used only to flag disagreement, never to confirm a level. Where a cell says "recall" it is my own unsourced
memory of how courses and the EGP generally behave, exactly as unsourced as the repo's own `known` flags.
**The word "ok" in the table therefore means "no contrary evidence found", not "verified".**

## 1. Placement table

Legend. Level found: `snippet` = a secondary-site snippet (URL in section 6); `recall` = my memory, not sourced;
`n/a` = nothing found. Verdict: ok / move earlier / move later / split by sub-use, always provisional (see section 0).

### A1 (10 Seasons)

| structure id | ours | level found | verdict | source |
|---|---|---|---|---|
| be-present | A1 S1 | recall A1 | ok | unverified (EGP) |
| possessive-adjectives | A1 S1 | recall A1 | ok | unverified |
| there-is-are | A1 S2 | recall A1 | ok | unverified |
| prepositions-place | A1 S2 | recall A1 | ok | unverified |
| present-simple | A1 S3 | recall A1 | ok | unverified |
| like-ing | A1 S3 | recall A1 | ok | unverified |
| some-any | A1 S4 | recall A1 (any in questions/negatives A1-A2) | ok | unverified |
| would-like | A1 S4 | snippet: one guide A2, another A1 exercise set (inconsistent) | ok as a chunk at A1; productive use "Would you like to + verb" = A2 | https://test-english.com/grammar-points/a1/ (snippet only) |
| present-simple-3rd | A1 S5 | recall A1 | ok | unverified |
| frequency-adverbs | A1 S5 | recall A1 | ok | unverified |
| have-got | A1 S6 | recall A1 | ok | unverified |
| possessive-s | A1 S6 | recall A1 | ok | unverified |
| imperatives | A1 S7 | recall A1 (but needed from lesson 1, see 3.1) | move earlier (receptive classroom use) | unverified |
| prepositions-movement-basic | A1 S7 | recall A1 (to/into/along); "across/out of" A2 | split by sub-use | unverified |
| can-ability | A1 S8 | recall A1 | ok | unverified |
| linking-and-but | A1 S8 | recall A1 (and/but); because A2 | split: and/but A1, because A2 (label says because) | unverified |
| demonstratives | A1 S9 | recall A1 | ok | unverified |
| how-much-many | A1 S9 | recall A1 (how much price, how many) | ok | unverified |
| present-continuous-now | A1 S10 | recall A1-A2 border | ok | unverified |
| wh-questions | A1 S10 | recall A1 (what/where/who from lesson 1) | **move earlier** (split: what/where/who A1 S1, how/why/when later) | unverified |

### A2 (12 Seasons)

| structure id | ours | level found | verdict | source |
|---|---|---|---|---|
| past-be | A2 S1 | snippet: was/were placed A1 by an elementary resource; repo note says A1 late / A2 early | ok (borderline A1 late) | https://www.elllo.org/english/grammar/index-level2.htm (snippet) |
| past-simple-regular | A2 S1 | snippet: A2 | ok | https://www.lenguia.com/grammar/english/a2 (snippet) |
| past-simple-irregular | A2 S2 | recall A2 (common irregulars); questions/negatives with did A2 | ok | unverified |
| comparatives-superlatives | A2 S3 | recall A2 (short adjectives; long ones A2) | ok | unverified |
| going-to | A2 S4 | snippet: "going to" for plans = GSE 35, A2; near-future plans GSE 38, A2+ (third-party school page, not Pearson) | ok | https://www.scribd.com/document/876419164/Lesson-Plan (snippet; low reliability) |
| should | A2 S5 | recall A2 | ok | unverified |
| too-enough | A2 S5 | recall A2-B1 | ok (low risk) | unverified |
| must-mustnt | A2 S6 | recall A2 (rules/signs) | ok | unverified |
| have-to | A2 S6 | recall A2 | ok; keep don't-have-to for B1 | unverified |
| quantifiers-much-many | A2 S7 | recall A2 | ok; overlaps how-much-many (A1 S9) and some-any (A1 S4) | unverified |
| infinitive-purpose | A2 S8 | recall A2 | ok | unverified |
| prepositions-movement | A2 S8 | recall A2 | ok (merge with A1 S7 sub-uses) | unverified |
| will-decisions-predictions | A2 S9 | recall A2 (offers, decisions, simple predictions) | ok | unverified |
| past-continuous | A2 S10 | recall A2 late / B1 | ok | unverified |
| linking-so-because | A2 S10 | recall A2 | ok (but "because" already in A1 S8 label) | unverified |
| adverbs-manner | A2 S11 | recall A2 | ok | unverified |
| suggestions | A2 S12 | recall A2 ("Let's", "shall we", "how about") | ok; "How about + -ing" is more B1, but chunk use is A2 | unverified |

### B1 (16 Seasons)

| structure id | ours | level found | verdict | source |
|---|---|---|---|---|
| present-perfect-experience | B1 S1 | snippets: A2 / pre-intermediate (one lesson plan), A2-B1 (another), B1-B2 (an LMS page) | **move earlier or split**: receptive/short "Have you ever...?" at late A2; productive B1 | https://eslbrains.com/lesson_topic/present-perfect/ , https://test-english.com/explanation/a2/present-perfect/ (the A2 page title says present perfect is an A2 explanation) |
| used-to | B1 S2 | snippets: B1+ syllabus lists "would and used to: past habits" under B1+; Exam English lists it among B2 topics | ok at B1, risk of **move later** (B1+); positive/negative used to can be late A2 | https://test-english.com/level-b1-b2/grammar-level-b1plus/ , https://www.examenglish.com/grammar/used_to_would.htm (snippets) |
| present-perfect-for-since | B1 S3 | recall B1 | ok | unverified |
| present-perfect-vs-past-simple | B1 S4 | snippet: test-english lists it at B1 | ok | https://test-english.com/grammar-points/b1/past-simple-present-perfect/ (snippet) |
| zero-first-conditional | B1 S5 | recall: zero A2 late, first B1 | **split**: zero conditional to A2 (with `should`/rules), first conditional B1 | unverified |
| second-conditional | B1 S6 | snippet: a B1+ syllabus lists second and third conditionals under "unreal conditionals" | ok (B1 / B1+) | https://test-english.com/level-b1-b2/grammar-level-b1plus/ (snippet) |
| passive-simple | B1 S7 | recall B1 (present/past passive; A2 receptive "is made in") | ok | unverified |
| defining-relative-clauses | B1 S8 | recall: who/which/that A2-B1 | ok; who/where could appear at A2 as chunks | unverified |
| modals-deduction | B1 S9 | recall: must/can't B1-B2; might for possibility B1 | split: might/may possibility to A2-B1; must/can't deduction B1-B2 | unverified |
| present-continuous-future | B1 S10 | recall: usually A2 in coursebooks (Empower/Prepare A2 teach arrangements); repo note itself says "possibly A2 in EGP" | **move earlier** (A2 right after going to) | unverified |
| will-promises-predictions | B1 S10 | recall A2-B1 | **duplicate** of A2 S9 will; merge, keep promises/offers as the B1 sub-use | unverified |
| gerund-infinitive | B1 S11 | recall B1 (verb + -ing / to) | ok, but "want/need/would like + to" must come at A1 (see 3.2) | unverified |
| reported-statements | B1 S12 | recall B1 late / B2 | ok at B1 late; **taught before past perfect (S13), see 3.3** | unverified |
| past-perfect | B1 S13 | recall B1 late; repo note: not required for production in Preliminary for Schools | ok (could move to B1 S11-S12, before reported speech) | unverified |
| wish-past-simple | B1 S14 | recall B1 | ok | unverified |
| obligation-contrast | B1 S15 | recall B1 | ok | unverified |
| linking-although | B1 S15 | recall B1 | ok | unverified |
| question-tags | B1 S16 | recall B1-B2 | ok | unverified |
| phrasal-verbs-separable | B1 S16 | recall: common phrasal verbs from A2 | **move earlier** as a vocabulary strand (A1-A2 chunks: get up, turn on, look for) | unverified |

### B2 (16 Seasons)

| structure id | ours | level found | verdict | source |
|---|---|---|---|---|
| present-perfect-continuous | B2 S1 | snippets: a B1 list groups it with present perfect simple; a B1+ list has "present perfect simple or continuous" | **move earlier** (late B1) | https://test-english.com/grammar-points/b1/contents-b1/ , https://test-english.com/?p=13035 (snippets) |
| third-conditional | B2 S2 | snippet: B1+ syllabus lists second and third together | **move earlier** possible (B1+/B2 border); keep B2 for production | https://test-english.com/level-b1-b2/grammar-level-b1plus/ (snippet) |
| wish-past-perfect | B2 S2 | recall B2 | ok | unverified |
| passive-extended | B2 S3 | recall B2 (modal passives B2; present perfect passive B1 late) | split | unverified |
| reported-questions-commands | B2 S4 | recall B1 late-B2 | ok, but needs embedded-questions order first (3.4) | unverified |
| non-defining-relatives | B2 S5 | recall B2 | ok | unverified |
| perfect-modals | B2 S6 | recall B2 (should have: B1 late) | ok; "should have" alone could be B1 | unverified |
| future-continuous-perfect | B2 S7 | recall B2; future perfect often C1 for production | ok / possibly later for perfect | unverified |
| hedging-stance | B2 S8 | recall B2-C1 | ok | unverified |
| linking-however-despite | B2 S8 | recall: however B1-B2, despite B2 | ok | unverified |
| causative-have-get | B2 S9 | repo note B1/B2; recall B2 | ok | unverified |
| embedded-questions | B2 S9 | recall B1 ("Could you tell me where...") | **move earlier**, before reported questions (S4) | unverified |
| conditionals-extended | B2 S10 | recall B2 | ok | unverified |
| gerund-infinitive-meaning | B2 S11 | recall B2 (remember/stop/try) | ok | unverified |
| articles-nuance | B2 S11 | recall: basic a/the A1-A2; generic/zero B2 | split by sub-use (see 3.2) | unverified |
| cleft-sentences | B2 S12 | recall B2 (What I need is...); It-clefts B2-C1 | ok | unverified |
| participle-clauses | B2 S13 | recall B2-C1 | ok | unverified |
| ellipsis | B2 S13 | recall B2 | ok | unverified |
| comparison-extended | B2 S14 | recall: "as ... as" A2, "the more... the more" B2 | **split**: as...as to A2, rest B2 | unverified |
| reporting-verb-patterns | B2 S15 | recall B2 | ok | unverified |
| cohesion-devices | B2 S16 | recall B2 | ok | unverified |

### C1 (16 Seasons)

| structure id | ours | level found | verdict | source |
|---|---|---|---|---|
| inversion-negative | C1 S1 | recall C1 | ok | unverified |
| inverted-conditionals | C1 S2 | recall C1 | ok | unverified |
| mixed-conditionals | C1 S2 | repo note B2 late / C1; recall B2-C1 | ok (both OK) | unverified |
| passive-reporting | C1 S3 | recall C1 | ok | unverified |
| subjunctive-mandative | C1 S4 | recall C1 | ok | unverified |
| nominalisation | C1 S5 | recall C1 | ok | unverified |
| fronting-emphasis | C1 S6 | recall C1 | ok | unverified |
| perfect-participle | C1 S7 | recall C1 | ok | unverified |
| stance-adverbials | C1 S8 | recall C1 | ok | unverified |
| register-shift | C1 S9 | CEFR descriptors, not grammar profile | ok (pragmatic) | unverified |
| concession-advanced | C1 S10 | recall C1 | ok | unverified |
| modal-nuance | C1 S11 | recall C1 (needn't have: B2) | split: needn't have at B2 | unverified |
| ellipsis-advanced | C1 S12 | n/a | unverified | n/a |
| discourse-markers-advanced | C1 S13 | n/a | unverified | n/a |
| rhetorical-devices | C1 S14 | not in grammar profiles (repo note agrees) | out of scope for EGP/GSE check | n/a |
| irony-understatement | C1 S15 | CEFR Companion Volume pragmatics, not opened | unverified | n/a |
| text-cohesion | C1 S16 | n/a | unverified | n/a |

## 2. Where the sources disagree with the repo's own "unverified" flags

The repo marks these `unverified`: would-like, past-be, will-decisions-predictions, present-perfect-experience,
used-to, zero-first-conditional, second-conditional, modals-deduction, present-continuous-future,
will-promises-predictions, reported-statements, past-perfect, wish-past-simple, present-perfect-continuous,
mixed-conditionals, and the five C1 pragmatic items. This run did **not** resolve any of them. Snippets only
add direction:

- present-perfect-experience: three snippets point at A2 or A2-B1 rather than B1.
- present-perfect-continuous: two B1 and B1+ list pages include it, so B2 S1 looks late.
- third-conditional: a B1+ syllabus groups it with the second conditional.
- used-to: points the other way (B1+ or B2), so B1 S2 is early, not late.
- would-like: sources contradict each other (A1 vs A2); the "chunk first" plan already handles this.

## 3. Ordering problems (a structure used before it is taught)

These are logical, derived from the repo's own Season order. They do not depend on external sources, so they are
the most reliable findings in this document.

1. **wh-questions taught at A1 S10 but required from S1.** Every "Who are you?" Season needs what/where/who/how old.
   Put a first wh-question chunk set in S1 and keep S10 for question word order and the wider set (why, when, whose).
   Likewise `imperatives` (S7) are needed for classroom instructions from lesson 1 (receptive).
2. **Infinitive after want/need/would like is never placed before B1.** `like-ing` is A1 S3, `infinitive-purpose` is
   A2 S8, but "I want to ...", "I need to ...", "Would you like to ..." are used from A1 S4 (cafe) onward. The
   `gerund-infinitive` Season (B1 S11) then teaches the contrast. Add "want/need/would like + to + verb" as a chunk to A1 S4.
3. **reported-statements (B1 S12) before past-perfect (B1 S13).** Backshift of present perfect and past simple gives
   past perfect ("She said she had finished"). Either swap S12 and S13, or limit S12 to present-to-past backshift.
4. **reported-questions-commands (B2 S4) before embedded-questions (B2 S9).** Reported questions use embedded word
   order ("He asked where I lived"). Teach embedded questions first (it is B1 by my recall, "Could you tell me where...").
5. **will appears twice** (A2 S9 and B1 S10) and **going-to / present-continuous-future** are split 6 Seasons apart
   across the level boundary; learners meet "I'm meeting Mia at six" long before B1 S10 in any ordinary text.
6. **because** is in the label of `linking-and-but` (A1 S8) and again as `linking-so-because` (A2 S10).
7. **how-much-many** (A1 S9) and **quantifiers-much-many** (A2 S7) and **some-any** (A1 S4): one countable/uncountable
   strand is taught three times; define one sub-use per Season so it is spiral, not repeated.
8. **Past participles**: the passive (B1 S7) and present perfect (B1 S1) need irregular past participles; A2 S2
   teaches past forms only. Add a participle-list task to B1 S1 (not a gap in order, but a missing sub-skill).
9. **first conditional** (B1 S5) uses will; fine. **second conditional** (S6) uses past simple; fine.
   **past-perfect** (S13) is placed before **wish-past-perfect / third conditional** (B2 S2); fine.

## 4. Gaps: structures courses commonly teach that the roadmap does not list

Source for "commonly teach": my recall of typical A1-C1 coursebook syllabi plus the test-english B1 and B1+
contents pages (snippets). Not confirmed against Empower or Prepare. Treat each as "check, then decide".

### A1
- Articles a/an/the and plurals (regular and irregular) are not a structure id anywhere before `articles-nuance` (B2).
- Subject and object pronouns (I/me, he/him) and `possessive pronouns` (mine, yours); whose.
- Countable and uncountable nouns as an explicit strand (only inside some-any).
- Prepositions of time (at/in/on), time expressions and telling time; ordinal numbers and dates.
- Adjectives and word order (adjective before noun); very/really intensifiers.
- Do/does questions with I/you/we/they (S5 label covers only "does").
- `can` for requests and permission ("Can I ...?"), `there was/were`, `want/need + to`.
- Short answers (Yes, I do / No, I don't).

### A2
- `might/may` for possibility; `could` for ability in the past and requests; `will` vs `going to` contrast.
- `present perfect` with just/already/yet and ever/never (late A2 in many series, snippet evidence above).
- Reflexive pronouns, indefinite pronouns (something, anyone, nobody), `one/ones`.
- `as ... as`, `a lot more than` degree modifiers, `used to` (positive), `there was/were`.
- First conditional (if + present, will) and zero conditional (snippet and recall: A2 late / B1).
- Count/uncount quantifiers `enough`, `too much/too many`; `whose`; `so/such`.
- Possessive pronouns, `have to` questions and negatives (don't have to) sub-use, `how long/how often`.

### B1
- Present perfect with just/already/yet (no explicit id), `be used to / get used to`.
- Passive of the present perfect and with modals (currently pushed to B2 S3).
- `so / such ... that`, `too/enough + infinitive`, `both/either/neither`, `would` for habits.
- Reported questions, `if/whether`, say vs tell (partly B1 S12).
- `wish + would`, `should have`, gerunds as subjects, `make/let/allow`.
- Comparatives with less/fewer, `the same as / different from`.

### B2
- Mixed use of articles and determiners, `so/such`, `used to` vs `would` vs `be used to`.
- `would` for hypothetical past, `I'd rather / had better`, inversion for emphasis (partly C1).
- Word formation and prefixes/suffixes (lexical, not grammar, but present in B2 exam syllabi).
- Past perfect continuous, `will have been`, `had been` (the roadmap has no past perfect continuous).

### C1
- Past perfect continuous nuance, `would` for typical behaviour, `get`-passive, `ought to`.
- `so as to / in order to`, subject-verb agreement with collectives, dummy `it` and existential `there` in formal prose.
- Dependent prepositions and verb-noun collocation are in `ellipsis-advanced` only.

## 5. Recommended fixes, ranked by impact

1. **Add a "first wh-questions, `want/need/would like + to`, `do/does` questions, and articles/plurals" strand at A1 S1-S4** (section 3.1, 3.2, section 4 A1). The strongest finding; it needs no external source.
2. **Swap B1 S12 (reported statements) and S13 (past perfect)**, or restrict S12 backshift (3.3).
3. **Move embedded-questions before reported questions** (B2 S9 to B1 late, or at least before B2 S4) (3.4).
4. **Present continuous for future to A2** (right after `going-to`, A2 S4/S5) and merge the duplicate `will` Seasons (3.5). Repo note also doubts the B1 placement.
5. **Present perfect experience: introduce receptively at A2 late; keep productive use at B1 S1** (snippets A2 to B1).
6. **Present perfect continuous: B2 S1 to B1 late** (B1 and B1+ list pages include it).
7. **Zero conditional to A2; split first conditional (B1)**; `used to` stays B1 but flagged B1+ by snippets.
8. **Split by sub-use**: `comparison-extended` (as...as to A2), `modal-nuance` (needn't have to B2), `linking-and-but` (because to A2), `articles-nuance` (basic a/the to A1).

## 6. Sources actually read (search-result snippets only; none opened in full)

- https://test-english.com/grammar-points/a1/ (A1 list, would like vs was/were)
- https://test-english.com/explanation/a2/present-perfect/ (A2 present perfect explanation)
- https://test-english.com/grammar-points/b1/past-simple-present-perfect/ (B1 past simple vs present perfect)
- https://test-english.com/grammar-points/b1/contents-b1/ (B1 contents; present perfect simple and continuous)
- https://test-english.com/level-b1-b2/grammar-level-b1plus/ (B1+ list: unreal conditionals, would and used to)
- https://www.examenglish.com/grammar/used_to_would.htm (used to / would at B2 per this site)
- https://eslbrains.com/lesson_topic/present-perfect/ (life-experience present perfect labelled A2/pre-intermediate)
- https://www.lenguia.com/grammar/english/a2 (A2 past simple)
- https://www.elllo.org/english/grammar/index-level2.htm (beginner grammar list)
- https://www.scribd.com/document/876419164/Lesson-Plan (going to labelled GSE 35 / A2; third-party, low reliability)
- https://www.cambridge.org/empower (Empower informed by Cambridge corpus and English Profile; no scope and sequence found)

Next step for a human or an open-egress session: open EGP Online (filter by structure and level), the GSE
Grammar learning-objectives PDF, the British Council LearnEnglish grammar index pages, and the Empower A2/B1 and
Prepare 3/4 tables of contents, then re-run the verdict column. Until then keep every placement above flagged
`unverified` in `structureLevels.ts`.
