# Pre-A1 Season P2 "First sounds" — Season plan and E1 lesson plan (2026-10-14)

Status: **draft for owner approval.** No picture, recording or deck is made until the owner approves this scenario in writing (CLAUDE.md: scenario first). The Season data lives in `src/curriculum/academy/preA1.ts` (`PA1_S02`, shown in the creator's Academy Library). Research: `docs/research/academy-pre-a1-s02-s03-research.md` (limits stated there). Ages 13–18, zero English, blending and reading first; nothing childish.

## 1. Season at a glance
| | |
|---|---|
| Theme / place | **The Phone**: a teen's messages and photo album. New plates: a night-time bus-stop with the phone screen glowing, and a close-up phone screen. Not the P1 club lobby or Name Wall, not the A1 S1 desk. |
| Cast | Vee (messages), Theo (sends photos), Ava (reads the album at the end) |
| Hook | Messages arrive with their first letters missing. Each sound you learn restores one. |
| Sounds | i, n (E1), m, d (E2) on top of s, a, t, p from P1: eight sounds, 25 decodable words (see `decodable`) |
| Sight words | I, am, is, the, my (P1) + a, this, you |
| Chunk | "This is a ___." / "Is it a ___? Yes, it is. / No, it is not." (chunks first, no grammar talk) |
| Release | **My phone-screen album**: six labelled things, each read and said |
| Video-game mechanic | loot and crafting (collect sound tiles, craft words), a rhythm lane for tapping sounds in order |

## 2. E1 "Cold Open" — I can meet the phone screen, hear i and n, and blend in, it, pin, tin
New items (≤ 8): phone, pin, tin, map, "This is a ___." (5) + sounds i, n (2). Letter names I, N.

Run of show (Pre-A1: 5 / 10 / 8 / 10 / 8 / 8 / 6 / 5 minutes):
| Part | Min | What happens | Game / mechanic (no game three times in a row) |
|---|---|---|---|
| Check-in | 5 | feeling, goal, no new language | — |
| Remember? | 10 | the eight P1 sounds-and-words: s a t p, sat, tap, "My name is" with Vee | listen-and-click (look: click) |
| The Drop | 8 | story plate 1–3 (bus stop, phone, message with missing letters), meaning first, recorded voices, subtitles | story plates, cross-fade only |
| Learn set 1 | 10 | sounds i, n: hear, say, blend in, it, pin | **sound-blend slider**, then **loot-and-craft** (collect tiles, craft "pin") |
| Read | 8 | decodable reader page: "It is a pin. It is a tin." with tap-to-hear | reader page (picture match) |
| Learn set 2 | 8 | words phone, map, tin as pictures; "This is a ___." | **listen and match** (design rotated by unit + lesson), then **memory pairs** |
| Mission | 6 | Take 1: say "This is a pin." for two photos; feedback; Take 2 | speak with Theo, private rehearsal on |
| Wrap | 5 | can-dos, Daily 10, next clue (a message arrives with its first letters missing) | — |

Fun hook / signature game: **"Restore the message"** — each correct blend lights a missing letter in a message from Vee until it reads "It is a pin." Rhythm lane (tap the sounds /i/ /n/ in order) as the optional bonus.

## 3. What has to exist before the deck
1. Owner approval of this plan and a **story scenario** in `docs/scenarios/` (3 plates: bus stop, phone in hand, message).
2. Art (Canva only, ~35 % purple, cut-out stickers on transparent backgrounds): bus-stop plate, phone-screen plate, picture cards phone, pin, tin, map, letter tiles in the Season's style.
3. Audio: sounds /i/ and /n/ recorded and approved (never browser TTS; `speechPolicy.ts` voices), plus the words and chunks above via the manifest.
4. Decodability test: all reader text is blendable from s a t p i n or a taught sight word; the Season data test (`preA1.test.ts`) already checks the decodable list.
5. Library hand-off after build (no Supabase connector in this session, so the `curriculum_lessons` row step is manual).

## 4. Decisions for the owner
1. Approve theme "The Phone", the two new plates and the cast?
2. Approve the signature game "Restore the message" and loot-and-craft as the Season's video-game mechanic?
3. Approve building E1 next (then E2–E8)?
