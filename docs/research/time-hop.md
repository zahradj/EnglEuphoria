# Time Hop (Academy game) — design note

Owner request (2026-10-11): a game for the Academy Game Library about verbs in the **present form and past form**, built so students memorise them.

## Method
1. **Pairs, not lists.** Present and past are learned as one unit (go – went), matched in both directions (Twin Match).
2. **Rules for regular verbs.** Four spelling rules (+ed, +d, y→ied, double the last letter) taught once, then tested (Past Rules).
3. **The cue decides the form.** Time words (every day, usually / yesterday, last week, two days ago) are shown in the sentence and named after the answer (Time Gate). Subjects are I / we / you / they, so third-person -s is not needed yet.
4. **Retrieval in both directions, spaced.** Typed recall present→past and past→present, with a Leitner Memory Vault per verb and direction (`eg.timeHop.vault.v1`, this device only; intervals 0/0/1/3/7/14 days).

## Voice
Every word and every signal sentence is a pre-baked static clip (teacher voice). A test fails if a spoken line has no clip on disk. No browser voice, no live voice, no AI.

## Not covered (on purpose)
Past participle (see Verb Forge), third-person -s, the pronunciation of -ed (t / d / id), be (was / were), read, lead, wind, get.
