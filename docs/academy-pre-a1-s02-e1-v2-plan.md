# Pre-A1 S2 L1 "First sounds · The Phone" — version 2 plan (concept, design, 60-minute fill)

Status: **approved and built (2026-10-15).** The owner gave full authority over concept, layout and design ("you are free to decide… make it look like a video game, make it fun, student comfort first, and learning too"). What was built differs from the first draft in the ways listed in §10. The approved v1 plan stays in `docs/academy-pre-a1-s02-spec.md`; the v1 story scenario stays in `docs/scenarios/academy-pa1s02e1-the-phone.md`. v2 changes the concept, the look and the length; the **objective, the new items, the cast and the Season theme (The Phone) do not change**.

## 1. Why change (owner, 2026-10-15: "change the concept and the design of the game, and it doesn't seem like one hour")

| Problem in v1 | Evidence | Fix in v2 |
|---|---|---|
| Not an hour | 33 pages, 83 interactions. A click-through shows most pages are a few rounds of a quick game. At about 0.6 min per response (teacher model + feedback included) that is about 50 min, and the per-page minutes in the test were estimates, never timed. | 46 pages, about 120 responses, a **minute budget per page** (§5), and a **lesson clock** in the teacher view so the hour is visible (§6). |
| Concept feels like a worksheet with a story in front | The story is told, then the same kinds of mini-games follow with no stake. "Restore the message" is only a label on the pages. | One goal the student can see and feel: **unlock a lost phone**. Every game earns a key. (§2) |
| Look | Same panel on a plate on every page. | **Lock-screen design system** (§3): one frame, five lock doors, a key HUD, a vault transition between locks. |

## 2. New concept — "Unlock the Lost Phone"

- **Story frame:** Theo finds a lost phone at the night bus stop. Its lock screen shows five empty key slots and a message that cannot be read. Vee and Theo cannot open it; **the student can, with English sounds.** Ava arrives at the end: the phone is hers.
- **Five locks = five skills** (the learning goal and the game goal are the same thing):

| Lock | Student does (English) | Skill | Mechanic borrowed from games | Responses |
|---|---|---|---|---|
| 1 Ears | hears /i/ vs /n/ and the Season-1 sounds in tiles | listening, sound discrimination | **lock-pick rhythm lane**: tap the right tile on the beat of the tone (no timer pressure, no fail state; slow default) | 18 |
| 2 Blend | slides i + n → in, then in, it, pin, tin | decoding | **crafting / loot**: collect sound tiles, craft a word on the bench, the word lights the key | 22 |
| 3 Read | reads two lines and a lock-screen notification | reading | **escape-room puzzle**: the read line is the clue to the next drawer | 16 |
| 4 Say | says "This is a ___." for phone, pin, tin, map | speaking | **boss duel** (step forward on a correct answer, a step back on a miss; the boss never "wins": three misses just repeat the lesson) | 24 |
| 5 Message | blends and reads the unlocked message; teaches back the rule to Vee | exit task, teach-back | **final unlock** | 10 |

- **Video-game mechanics named (CLAUDE.md):** lock-pick rhythm, crafting/loot, escape room, boss duel (FlashBoss-style forward/back steps), key HUD. The signature game is **the Boss duel at Lock 4** ("Say it to open it").
- **Games from the catalogue** (`docs/academy-games-catalog.md`): listen-and-click, sound-blend slider, memory pairs, listen-and-match, reader page, build-and-spell, plus the classic games added 2026-10-14. No game three times in a row; `lessonVariety.test.ts` stays green.
- **Comfort:** no timers, no fail states, "I need a minute" and Hint stay on every page, private rehearsal before any speaking take, type-instead-of-speak.

## 3. New design system (aesthetic pass, CLAUDE.md)

- **Frame:** a slim lock-screen bezel on every page (a notch, the time, a row of five key slots at the top that fill as the student earns keys). The page is still a full-bleed scene plate; the bezel is small and glass.
- **Palette:** about 25 % purple (owner, 2026-10-15) with blue/teal, warm cream and wood tones. Keys: gold. Wrong answers: soft, never red.
- **Transitions:** a vault-door slide (cross-fade between plates, no zoom, no pan) when a lock opens; a key "click" UI sound (a recorded sound effect, never browser voices).
- **Pieces:** sound tiles as painted tokens with depth; the keypad pad tiles are glass; no flat white boxes. Pieces over busy plates use `CalmBg`.
- **Game feel:** pop-in, burst and "+key" on a right answer, a gentle wrong, Vee/Theo react, a reward moment at every lock.
- **New plates needed** (Canva, ~25 % purple, no text in pictures, owner sees each one first; one picture at a time because of Canva limits):
  1. `vault-corridor` — a long neon corridor with five round doors, the first lit (the hub plate between locks)
  2. `lockscreen-closeup` — the phone lock screen, five empty key slots, bus-stop bokeh behind it
  3. `bus-stop-dawn` — the same bus stop at first light for the finale (Ava gets her phone back)
  Reused as they are: `bus-stop-night`, `phone-screen-glow`, the three story plates, the four cards.

## 4. Objective, exit task, success criteria (unchanged from v1, built backwards)

- **Objective (I can…):** meet the phone screen, hear and say the sounds /i/ and /n/, blend *in, it, pin, tin*, and say "This is a pin." for a picture.
- **Exit task (Lock 5):** blend and read *pin, tin, it* and say "This is a ___." for two pictures, with at most one hint.
- **New items (≤ 8):** *phone, pin, tin, map*, "This is a ___." + sounds /i/, /n/. Nothing else is new. Remember? comes from `recallPlan` (s, a, t, p and "My name is ___"), spaced.

## 5. Minute budget — one-to-one, exactly 60 minutes

The test counted 0.35–0.7 min per response. v2 budgets **~0.5 min per student response** (listen, respond, a short teacher reaction) **plus the teacher-led steps**; the lesson clock (§6) checks it live.

| Min | Part | Teacher | Student | Responses |
|---|---|---|---|---|
| 0–4 | **Check-in** | greets, feeling card, shows the locked phone | feeling card; "Hello"; badge | 4 |
| 4–14 | **Remember?** (spaced, 10) | by ear; hands over the keypad | match, memory, blend, recall of s a t p | 20 |
| 14–22 | **The Drop** (8) | tells the 3 story plates; **models** "This is a pin / a tin" | listens; match the 4 cards; chooses what to say | 14 |
| 22–23 | **Rule** (1) | states the rule in ≤ 3 lines, student repeats | repeats | 2 |
| 23–33 | **Lock 1 Ears + Lock 2 Blend** (10) | I do / we do / you do for /i/ and /n/ | rhythm lane; craft *in, it, pin, tin* | 36 |
| 33–41 | **Lock 3 Read** (8) | reads the first line aloud | reads two lines + the notification | 16 |
| 41–51 | **Lock 4 Say — boss duel** (10) | models the Mission; feedback after Take 1 | Take 1, feedback, Take 2 (private rehearsal first) | 24 |
| 51–57 | **Lock 5 Message** (6) | listens | blends and reads the message | 10 |
| 57–60 | **Wrap** (3) | shows can-dos and the next clue | **teaches back the rule** to Vee; voice-note homework | 2 |

Total: **about 130 student responses in 60 minutes**, pages about 46. Teacher-led share is about 25 %; student speech is the largest share (speaking target for Pre-A1 in `speaking.ts`: three of five locks include saying or reading aloud).

## 6. Lesson clock (new player feature, teacher view only)

- Shows the current part's target minutes and the running time ("Remember? 6:10 of 10:00"), never in front of the student by default (no visible timers for the student — comfort rule).
- A "behind / on time / ahead" hint at each part change, with a suggestion ("skip the memory game, go to Lock 2").
- Reads the part budget from `PRE_A1_PARTS` and §5 so the rule that a lesson fills the hour is enforced in code, not in an estimate.

## 7. Traceability (every activity serves the objective or a need)

| Activity | Serves |
|---|---|
| Lock 1 rhythm lane | Objective: hear /i/ and /n/; need: /i/–/iː/ and /n/ difficulty for ar, es, it, fr speakers |
| Lock 2 craft | Objective: blend *in, it, pin, tin* |
| Lock 3 read | Objective: read two short lines (need: real reading on a phone) |
| Lock 4 boss duel | Objective: say "This is a ___."; speaking ladder shadow → repeat → controlled → guided |
| Lock 5 message | Exit task and teach-back |
| Remember? | Spaced recall of s, a, t, p and "My name is ___" |
| Story plates | Context and the model of the target sentence (hear before asked) |
| Lesson clock | The hour (owner: "it doesn't seem like one hour") |

An activity not in this table is cut.

## 8. What changes in the repo if approved

`src/academy-deck/lessons/pa1s02e1.ts` (46 pages, five locks), a lock-screen frame and key HUD in `Deck.tsx`/`deck.css` (new `lockFrame` option on `DeckScript`), a rhythm-lane and a boss-duel slide kind (Academy files only), the lesson clock in the teacher view, three new plates, the sound effect (one recorded "key click"), voice lines for the new lines, tests (`pa1s02e1.test.tsx` reads this plan's budget), the `lessonProfiles.ts` entry (signature game: the boss duel; look: lock screen), `docs/research/academy-pa1s02e1-v2-research.md`.

## 9. Open questions for the owner (none block the plan)

1. Approve v2 as written? (One word is enough.)
2. /i/ and /n/ sound clips (separate approval; they stay silent until then).

## 10. As built (2026-10-15)

- **41 pages** (36 required + 5 optional), not 46: the project's own timing estimate said the first draft (45 pages, about 73 minutes) was too long for an hour, so the lesson was trimmed until the REQUIRED pages total about 61 minutes by that estimate (`pa1s02e1.test.tsx` TIME). The 5 optional pages (dashed in the teacher's strip) add about 11 minutes of extra practice the teacher can add or skip.
- **Part minutes for this lesson** (`partMinutes`, adding to 60): Check-in 5, Remember? 9, The Drop 8, Learn 10, Read 8, Learn more 6, Mission 10, Wrap 4. Lock 5 (the message) sits at the end of the Mission; the Wrap is the teach-back and the can-dos.
- **Lock 1** is a lock-pick lane on minimal pairs (in/an/at, it, tin/tan/tip, pin/pan/pit, sit/sat/sip) heard as words: the /i/ and /n/ sound clips are not approved yet, so the lane uses recorded words. **Lock 4** is the boss duel, four pictures.
- **Sound:** the "key" and "pin" sounds are synthesized by the player (no files, no voices), off in Calm mode and with Sounds off.
- **Responses:** 110+ by the test's count, with the speaking checks (Say it on every duel picture, Take 1, Take 2, teach-back).
- **Art:** three new plates (`vault-corridor`, `lockscreen-closeup`, `bus-stop-dawn`), reused story plates and the four cut-out cards.
