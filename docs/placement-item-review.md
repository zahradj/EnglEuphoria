# Academy placement bank: expert item review (October 2026)

**What this is.** The 79 Academy placement questions were reviewed item by item by two independent reviewers who
each read the same research notes first (item-writing rules, CEFR level references, learner errors and fairness,
reading/listening quality; all in `docs/placement-review/notes-*.md`). Each reviewer judged every item on: is the key the
only defensible answer in American English, the real CEFR level, stem clarity, distractor quality, fairness (L1
cognates, topics), test-wiseness, and for reading/listening the text itself. The decisions below were then made by
comparing the two reports. The raw reviews are in `docs/placement-review/reviewer*-items.json` and `reviewer*-summary.md`.

**Important honesty note.** Both reviewers were AI reviewers briefed as expert teachers; they are not human
teachers. The English Grammar Profile and English Vocabulary Profile sites could not be read, so level judgments rest on
the reviewers' professional knowledge, not on a level lookup. Treat this as a thorough first review. It does **not**
replace the two-human-teacher check (and later real-student data) that the build plan calls for.

## How well the two reviewers agreed

| Measure | Result |
|---|---|
| Same CEFR level for an item | 65 of 79 (82%) |
| Level within one step | 79 of 79 (100%) |
| Both said KEEP | 25 items |
| One or both said FIX/REPLACE | 54 items |
| Key not the only defensible answer (at least one reviewer) | 9 items (A02, A07, A08, A16, A39, A59, A65, A72, A74) |

## What was wrong with the bank (the main findings)

1. **Second defensible answers** (9 items): e.g. "ate" fitted "every Friday"; "in/at the desk" both natural;
   "I'm liking this song" is acceptable informal American English; "look for" worked without a dictionary cue; "is raining"
   fitted the first conditional; "was worrying", "already started" and "retain" were all arguable. Fixed by changing the
   stem or the distractor so only one answer works.
2. **Wrong levels** (18+ items): second conditional, simple passive, "so/but/because" and "look up" were all tagged B2
   but are A2-B1; "begin/start" was tagged B1 but is A2; "meticulous" is C1 for non-Romance learners; and so on.
   Re-levelled; two items whose difficulty sat outside their level band were corrected.
3. **Answerable without the language** (test-wiseness): the key was the longest option in 31 of 79 items, many
   distractors were silly (a listening item whose three wrong answers never appear in the audio; "between the desk"),
   and several vocabulary items had one positive word among three negatives. Rewritten with plausible, parallel options.
4. **Key position**: the right answer was never in the fourth position and in the second position 58% of the time.
   Options are now shuffled on screen (except times/numbers, which keep their order).
5. **Lifting**: several reading keys copied the passage word for word. Keys are now paraphrased.
6. **Fairness**: cognates that make items easy for Romance-language speakers (enormous, meticulous, maintain/retain/obtain),
   an idiom with military origin ("bite the bullet"), a pet dog in a listening item (replaced by a cat), a committee/budget
   passage with no teen relevance, British words (cinema, match, grey, film, Hiya).
7. **Redundancy**: five weather items, seven movie items, four "be" items, three inversion items, three phone-in-school items.
   Diversified. Topics reduced to one per theme where possible.
8. **Missing coverage** (added or noted): articles (added), possessives (added), "can" (added), a real B2 linker
   ("Despite", added), "wish" (added), real-world texts (a library sign, a trip notice).
9. **Mislabelled skills**: six "writing/speaking" items were really error-recognition. Kept only where they test a real
   convention (email greeting and punctuation = writing; polite refusals and requests, answering "How old are you?" = spoken
   functions) and noted that real writing/speaking samples are a later stage.

## What changed in the bank

79 items revised or kept; two items added (81 now). Counts after revision: see `academyBank.ts` (every item has a stable id).
Five listening scripts were rewritten (A12, A17, A33, A55, A67) so every wrong option is audible or plausible, the
vocabulary is American, and numbers/times create a fair trap; their audio was re-recorded.

## Still needs human work

- Two human teachers should read all 81 items against this review before the bank is trusted (key, level, and
  any wording a real teenager in your markets would find odd).
- The 2-3 items flagged "unsure of level" by the reviewers (A09, A60, A12, A71, cognate words) deserve a second look.
- Item difficulties are still expert estimates. Real answers (the log is now saved) will replace them.
- Five listening clips are recorded with the school's approved AI voice: listen to them once, especially the numbers and times.
