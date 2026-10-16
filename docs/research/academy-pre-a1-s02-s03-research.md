# Academy Pre-A1 Seasons P2 "First sounds" and P3 "Numbers and age" — research log (2026-10-14)

Owner rule (CLAUDE.md, 2026-10-14): every unit has a research file. **Honest status:** the primary CEFR sources could not be opened (see `academy-curriculum-primary-source-check.md`), so this log relies on earlier Pre-A1 research (`academy-pre-a1-s01-research.md`, `docs/academy-pre-a1-curriculum.md` §6), the open CEFR-J profiles, and general phonics practice. Nothing below is a quotation of a primary source.

| Source | Taken (mechanic/structure, never content) | Quality / limits |
|---|---|---|
| Ladybird Readers Starter, Oxford Phonics World (from earlier research) | phonics page + sight-word page; small steady sound sets; decodable-only reading | built for ages 4-7, method only; verified by search summary in the earlier log |
| Synthetic phonics practice (letter sounds s a t p i n m d first, 3-letter blends) | order of the sound set (satpinmd is the usual first set) | well-known classroom order [K]; not re-checked against a primary page |
| CEFR-J Vocabulary Profile 1.5 (open, TUFS) | numbers, *phone*, *map*, *pin* are A1 words, so Pre-A1 may pre-teach them as pictures | Japanese-learner bias; no Pre-A1 band |
| CEFR-J Grammar Profile | *This is a ...*, *It is ...* A1.1; *Is it ...?* A1; *How old are you?* functional A1 | second-hand EGP/GSE columns |

Design choices: 8 new items per session at most; two different memorising games after each word set; blending is the spine (3-5 min per session); no childish content (phone, lockers, club desk). Reading texts are checked for decodability against `soundsSoFar` + sight words.

**Games (catalogue `docs/academy-games-catalog.md`):** P2 sound-blend slider, listen and match, read and match, odd one out, memory pairs, reader page. P3 locker code, listen and match, read and match, number bingo, speedrun vs own best. **Video-game mechanics (`docs/academy-video-game-mechanics.md`):** P2 loot and crafting (sound tiles → words) with a rhythm lane; P3 escape-room locker code and speedrun against your own best, no leaderboards.

Open: P2/P3 lessons are plans only; no deck is built. Teen-appropriateness and the P3 "thirteen vs thirty" minimal-pair audio need recorded voices (bake via `speak()` pipeline) before a lesson ships.
