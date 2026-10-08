---
name: academy-player-ux
description: >
  Layout, visual style, comfort controls and live-mode behaviour for the Academy lesson player (one-on-one live, 60 min) and
  the gamified Daily 10: screen anatomy for laptop and phone, Explorer (11-13) / Studio (14-18) theme tokens, the comfort
  dock, teacher vs student roles and sync rules, accessibility, safety/consent, and how to implement in this repo. Use when
  building or restyling any Academy screen or reviewing it for teen taste and comfort.
---

# Academy Player UX — comfortable, teen-tasteful, one-on-one

Evidence is mostly vendor docs and design principles; labelled [V] (seen), [U] (unverified). Nothing here has been tested with real 11-18 learners yet - pilot it.
Comfort first: a student must SEE every word, REACH every control and ENJOY the interaction on a laptop AND a phone. Also run the repo's comfort audit (`scripts/academy-comfort-audit.mjs`, `lesson-quality-gate` Engine 5).

## Reality in the repo (2026-10-08)

`src/pages/academy-scene/PlayAcademyLesson.tsx` is solo-only (props `roomId`/`role` inert), with a quest layer (`src/components/academy/game/QuestUi.tsx`, `src/lib/academy/questLevels.ts`, `sfx.ts`),
7 blocks, XP/streak/stars, resume, coins. Classroom infrastructure exists for Playground (video, `TalkTimeMeter`, `useSyncedState`/`activitySync`, `classroom-sync-robustness`). Live mode must be built; follow that skill.

## Screen anatomy

**Laptop (landscape)**: top bar 48-56 px (title, segmented run-of-show strip, quiet elapsed clock; **no countdown**) · **stage 72-75 % width, one task at a time** ·
right rail 280-360 px: teacher video (16:9/4:3, large enough to read the face), self-view (hideable), chat/reaction strip · bottom dock 64-72 px (comfort controls + mic/camera) ·
teacher-only drawer (plan, notes, error log) - the student never sees the plan.
**Phone portrait**: sticky teacher video ~25-30 % height (collapse to a 72 px pill / PiP) · stage fills the rest · thumb-zone dock with 4-5 targets >= 48 px honouring `env(safe-area-inset-bottom)` · thin segmented progress under the status bar.
**Phone landscape**: stage ~65 % + slim rail; dock as vertical strip. **Tablet**: portrait = phone layout, landscape = laptop layout. Keep audio when bandwidth drops; collapse video first.

## Look (two themes on one layout)

Dark-first with a light option; one saturated accent + one reward colour; rounded 12-16 px cards; Lexend or Atkinson Hyperlegible body (don't claim dyslexia benefits - weak evidence).
**Explorer (11-13)**: more colour and illustration, 18-20 px body, labelled icons, explicit "quest" language. **Studio (14-18)**: muted Spotify/Discord-like palette, 16-18 px body, icon-first with tooltips,
subtle XP, "playlist" outline. Implement as **theme tokens** (colour, radius, type scale, illustration density); learner can switch. No evidence supports a hard 13/14 split.
Tokens live with the existing Academy theme (`themeMap` in `AcademyDemo.tsx`, hub theme in `src/utils/hubTheme.ts`); do not fork per-lesson styles.

## 12 layout rules

1 One task on stage. 2 Labels/feedback beside their object. 3 Signal what matters (highlight the current target). 4 Don't read-aloud the same text shown (short captions or audio + image).
5 Teacher face visible by default, never covered by the canvas. 6 Touch targets >= 44 px (WCAG 2.2 AA floor 24 px). 7 Body >= 16 px (18 at A1-A2/11-13), 45-70 char lines, contrast >= 4.5:1 text / 3:1 UI.
8 Respect reduced-motion, colour-scheme, safe-area; no flashing. 9 No visible timers by default; opt-in only on non-speaking games. 10 Every sound has a visual equivalent and a mute toggle.
11 Feedback wording "Not yet - try again"/"Almost - check the ending"; never red-X buzzers; never colour alone. 12 No hover-only controls; fully usable on phone.

## Comfort dock (student, always visible)

Hint (tiered: picture -> first letter -> answer) · Slow down / Repeat · **"I need a minute"** (pauses, tells teacher, calm message) · **Private rehearsal** (record -> listen -> send/retry) ·
Type instead of speak · Emoji reactions · Camera off / hide self-view / mute / blur · **Easier / Same / Harder** dial · Choose next from 2 · "I'm confused" and a private "I'd like to stop" · L1 hint toggle.
**Teacher cues**: soft flag when minute/hint > 3 in a session; talk-time ratio; 5-7 s wait prompt; "switch to Chill track" suggestion.

## Live-mode behaviour (to build)

- Roles: teacher = authority for stage navigation; student acts inside activities. Use `useSyncedState` with ONE combined state object per activity; only the authority computes randomness (shuffles, picks).
  Gate self-driving timed sequences on `!isRemoteMirror`. Register new kinds in the player's `REAL_SYNC_KINDS`. Read `classroom-sync-robustness` before adding any kind.
- Private things stay local: self-view, mic state, rehearsal recordings (until the student sends).
- Join checks (mic/camera test) before class; clear recording indicator; connection loss -> auto-resume at the same segment (`playerSafety.ts` resume exists).
- Teacher-only plan drawer, error-log taps (category chips), Chill-track switch, dial display, Last Time card launcher.

## Gamification presentation (Daily 10 and live)

Use `game-animation` for juice (anticipation, squash/stretch, hit-stop, particles within reason, living background, reward moments, kid-safe feedback - adapt "kid" to teen tone).
Studio: tight, confident motion and sound; Explorer: bouncier. Required moments: level splash with goal and "I can ...", cleared screen with honest stars (from first-attempt accuracy), **retention ring** on Remember?,
Word Card reveal for Secure items, Season map (8 nodes with the clue collected), Highlights screen. No public leaderboards; no loot-box animation; no streak-loss shame.

## Safety and privacy

Recording only with guardian consent and a visible indicator; stored audio deletable; chat limited to the lesson, logged and filtered; no public profiles or location;
age-appropriate design (UK ICO Code) and COPPA (<13, US) / GDPR-K (13-16 by country) reviewed with counsel [U]. TalkTimeMeter reports seconds only, never audio.

## Implementation checklist

Tokens in the hub theme · segmented strip component · comfort dock component (a11y labelled, keyboard reachable) · tiered hint component · private-rehearsal recorder · dial · Last Time card ·
Remember? screen with retention ring · Season map · Highlights · teacher drawer · sync registration · tests (render at 360 px and 1440 px; contrast; reduced motion) · `academy-comfort-audit.mjs` passes.

## Don't

Mascots or stickers; childish confetti for 14-18; cluttered stage with chat+video+instructions competing; forced camera/voice; hover-only controls; red/green only; auto-playing audio/video; browser TTS.
