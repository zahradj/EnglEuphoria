---
name: lesson-variety-engine
description: >
  REQUIRED for EVERY new or rebuilt lesson in any hub (Playground first): research the top kids' learning apps and schools
  (Khan Academy Kids, Lingokids, LingoAce, VIPKid, Novakid, Duolingo ABC, ABCmouse, Oxford, Cambridge, Wordwall…) for the
  lesson's skill, take the best mechanic, make it BETTER, and vary the games, the look, the scenes and the theme so no
  lesson feels like the last one. Owns the code check `src/content/playground-library/lessonVariety.ts`
  (+ lessonVariety.test.ts in the deploy gate). Use at the START of a lesson (research + plan) and at the END (check).
---

# Lesson Variety Engine — never the same lesson twice

Owner's standing rule (2026-10-04): *"In every next lesson vary the activities, the look, the scenes and the themes.
Search the internet — Khan Academy, Oxford, Cambridge, LingoAce, Lingokids, VIPKid and the top apps and online schools —
and create better than them. Avoid boring the student."*

Boredom comes from sameness at four levels. This engine checks all four, every lesson:

| Level | Rule | Checked by |
|---|---|---|
| **Activities** | ≥ 4 different games besides the routine spine; no game from the lesson right before; ≤ 50 % of games repeated from the same slot of the previous unit; never 3 of a kind in a row | `checkLessonVariety` |
| **Look** | each lesson has its own palette / light / mood (`LESSON_PROFILE.look`); new pictures, none reused from the previous lesson | `checkLessonVariety` (pictures) + lesson-quality-gate eye check |
| **Scenes (settings)** | the lesson happens somewhere new: no setting shared with the previous lesson (`LESSON_PROFILE.settings`) | `checkLessonVariety` |
| **Theme / story frame** | a new mission or story frame (show and tell, tidy-up, treasure hunt, rescue, party, journey…), never the same plot shape as the previous 2 lessons | this skill, step 2 |

## The procedure (every lesson)

### 1. Research (before designing) — ≥ 3 benchmarks, rotate them
Search the web for how the best products teach THIS lesson's skill (e.g. "prepositions in on under kids app game").
Benchmark list (`BENCHMARKS` in lessonVariety.ts): Khan Academy Kids · Lingokids · LingoAce · VIPKid · Novakid ·
Duolingo ABC · ABCmouse · Oxford (Owl, Discover, Phonics World) · Cambridge (Pre A1 Starters tasks, ELT blog) · Wordwall ·
Kahoot · Sesame Workshop research. Use different ones from the last lesson. Some sites block the container: search
snippets, app-store pages, reviews and teacher blogs are fine. Take the **mechanic**, never the content or art.

### 2. Design better than them
For each borrowed mechanic write one "better than" line. Proven ways we beat apps:
- **The language is the game:** the child wins only by understanding/saying the target word (e.g. the same toy peeks from
  two places, so the PLACE word matters; apps usually check only the noun).
- **Permanence and a visible world change:** what the child does stays (the room gets tidier, the bridge gets built).
- **Real story continuity:** the games happen inside the lesson's story world, with the same characters reacting.
- **Live-class design:** the teacher can drive, the student mirrors; tap-tap alternative to every drag; no timers on
  first exposure; gentle wrong answers (game-animation skill).
- **Juice:** every game passes the game-animation 10-point juice audit.
Pick a story frame/theme unlike the previous two lessons, a new setting, and a look (light, palette, time of day).
**Each lesson adds or upgrades at least one mechanic** — new kind (add it to `SLOT_GAMES` for its slot, scene type,
renderer, REAL_SYNC_KINDS, voice-cache extractor, activity-pattern-library table) or a real upgrade of an old one.

### 3. Register (code)
In `src/content/playground-library/lessonVariety.ts`:
```ts
LESSON_PROFILE['3-5'] = { settings: ['bedroom'], look: 'cozy bedroom, warm afternoon light; tidy-up mission' };
RESEARCH_LOG['3-5'] = { sources: ['Lingokids', 'Cambridge …', 'Khan Academy Kids'], mechanics: ['…'], betterThan: ['…'] };
```
Cite the sources in the new scene component's header comment too (precedent: TidyUpScene.tsx, PeekPopScene.tsx).

### 4. Check (before calling the lesson done)
`npx vitest run src/content/playground-library/lessonVariety.test.ts` — part of the deploy gate. If it fails, change the
lesson (swap a game, paint a new setting); never loosen the check. Older lessons are `GRANDFATHERED`; bring them up to
the rule when they are next rebuilt and remove them from that list.

### 5. Report
Tell the owner which apps were researched, what was taken, and what we did better (with source links).

## Research log so far (keep adding)
| Lesson | Researched | Taken | Better |
|---|---|---|---|
| U2L2 Green, Orange, Purple (rebuild 2) | Lingokids Mixing Colors, Khan Academy Kids sorting, Cambridge Starters picture tasks, 7ESL/TinyTap Feed the colour monster | Colour Monsters (new), Catch it at the market, Magic Paint Pots in a story | colour only heard, wrong food named back, food stays on the plate; labelled story film |
| U3L4 My Favorite Toy | Cambridge Starters, Wordwall, Lingokids | Guess Who info-gap; magnet fishing | toys bob in a living pool; big/small pairs force the size word |
| U3L5 Tidy Up Time | Lingokids (Toy Story "pack the box", clean-up activities, prepositions), Cambridge Starters Listening Part 4, Khan Academy Kids, VIPKid/Novakid live classes | Tidy Up (put it in/on/under); Peekaboo Toys (hide-and-seek "where is it?") | same toy in two places → listen for the place word; tidied toys stay; drag or tap-tap, no timer |
| U3L6 The Toy Fair | toy-grabber apps (Yateland Claw Machine), Wordwall review templates, Khan Academy Kids / Duolingo ABC review loops | Toy Grabber (claw machine), Ring Toss (+ Sound Toss for D T K P O) | claw never slips — only the right words win; two balls / two cars so the colour decides; rings stay on pegs, prizes pile up |

## Related skills
smart-lesson-architect (purpose of each activity) → **lesson-variety-engine (research + variety)** →
activity-pattern-library (real kinds) → game-animation (juice) → lesson-quality-gate (final pass, includes this check).
