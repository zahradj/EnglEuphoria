# Universal Playground Lesson Blueprint

**Audience:** Content creators, teachers, curriculum reviewers
**Hub:** Playground (Kids, ages 4–9)
**Format:** 1-on-1 online · 30 minutes · 22 slides
**Status:** Canonical — every Playground lesson inherits this contract.

---

## 1. Fixed Contract (hard-locked)

| Field | Value |
|---|---|
| Hub | `playground` |
| Duration | 30 minutes |
| Slide count | 22 |
| CEFR range | Pre-A1 → B1 (matrix-enforced) |
| Speaking density floor | ≥ 40% of lesson time |
| Target vocab cap | 6–8 words, each recycled ≥ 4× |
| Grammar | Implicit only — no rule slides, no metalanguage |
| Reading register | Concrete, ≤ 6-word definitions, no abstract nouns |
| Story spine | 1 recurring character + Pip mascot (continuity validator on) |
| Phonics | 1 micro-moment per lesson (Playground-only standalone) |
| Mastery gate | ≥ 80% on key interactive slides → Vault sticker |
| Leaderboards | ❌ Forbidden |
| Visual style | Flat 2.0 + Claymorphism vault stickers |

---

## 2. Pedagogical Principles

1. **TPR first** — movement before speech lowers anxiety.
2. **Story spine** — one character carries every slide (+40% recall).
3. **i+1 input** — only 6 new words, recycled multiple ways.
4. **Multi-sensory loop** — see → hear → mimic → move → speak → play.
5. **Micro-wins every ≤ 90 s** — XP, sticker, Pip cheer.
6. **Speaking > teacher talk** — child speaks more than the teacher.
7. **Exit on a high** — celebration slide, never a quiz.
8. **Compassionate failure** — 2 streak-freeze tokens, no game-over.

---

## 3. Universal 22-Slide Skeleton

```text
#  Stage          Purpose                          Activity type
─────────────────────────────────────────────────────────────────────
1  Hook           Warm-up song (TPR actions)       sing_along
2  Hook           Pip greeting + question          speaking_cued
3  Context        Story opener (character)         story_slide
4  Input          Vocab Vault reveal (6 words)     vocab_cards
5  Input          Echo mimic (mic on)              pronunciation_mimic
6  Discovery      Reveal game (image → word)       listen_and_match
7  Controlled     Drag & match (character helps)   drag_drop
8  Controlled     Implicit grammar model           dialogue_model
9  Controlled     Spinner choice → say sentence    spinning_wheel
10 Communicative  Teacher Q → child A              speaking_guided
11 Communicative  Role-swap (child asks)           speaking_roleplay
12 Game break     Memory match                     matching_pairs
13 Production     Personal choice + sentence       speaking_production
14 Pronunciation  Phonics micro-moment             phonics_drill
15 Recall         Quick-fire flashcards (3 s)      rapid_recall
16 Story          Story payoff (character)         story_slide
17 Cool-down      Sing-back (child leads)          sing_along
18 Reflection     "Show me your favorite"          personalization
19 Achievement    Vault sticker unlock             reward_slide
20 Mission        Home Mission (real-world)        homework_task
21 Celebration    Confetti + XP tally              celebration
22 Closing        Routine goodbye                  closing
```

**Totals:** 9 speaking moments (~41%) · 5 mini-games · 6 words × 5 exposures · grammar implicit.

---

## 4. Built-in Learning Loops

- **Multi-sensory cycle per concept:** see → hear → mimic → move → speak → play
- **SM-2+ recall ladder:** input → drag → spinner → match → production (5 exposures ≥ retention threshold)
- **Spiral hook:** last story beat seeds next lesson's opener (interleaving)
- **Micro-win cadence:** reward signal every ≤ 90 s
- **Pip reactions:** cheer, dance, surprise — never during speaking tasks

---

## 5. Differentiation Knobs (teacher live)

| Learner profile | Adjustment |
|---|---|
| Shy / new | Skip slide 11 role-swap, double slide 7 drag rounds |
| Advanced (A1+) | Unlock bonus *"I like ___ but I don't like ___"* slide |
| Age 4–5 | Drop slides 14 (phonics) + 18 (reflection), extend song |
| Low attention day | Pip offers a 10 s stretch break (no XP loss) |

---

## 6. Engine Routing (enforced by orchestrator)

```text
Planner → Governance → Adaptive → Grammar (implicit profile) →
Pronunciation (PG phonics) → Memory → Speaking (PG floor 40%) →
Gamification (no leaderboard) → Coherence (homework ≤ 10 min) →
Arcade (≤ 3 games / 8 min) → QA → Stabilization → Publish
```

Code contract: `HUB_PLANNING_PROFILES.playground` in `src/planning/hubProfiles.ts`.

---

## 7. Success Criteria (auto-tracked)

- ✅ ≥ 80% accuracy on slides 7 + 12 → Vault sticker unlocks
- ✅ ≥ 3 spontaneous utterances captured in slides 10–13
- ✅ Speaking-time ratio ≥ 40%
- ✅ Exit emotion = 😄 (Pip poll)

---

## 8. Reference Instance — "Leo's Jungle Breakfast"

| Field | Value |
|---|---|
| CEFR | Pre-A1 |
| Character | Leo the Lion + Pip |
| Theme | Jungle breakfast |
| Target vocab (6) | banana, apple, milk, bread, egg, cookie |
| Communication goal | Name 6 foods · *I like / I don't like ___* · *Do you like ___?* |
| Grammar (implicit) | Present simple *like* (+/−/?) |
| Phonics micro | /b/ → banana, bread |
| Home Mission | "Tell mum/dad 3 foods you like in English" |
| Spiral hook → next lesson | Leo's lunchbox → drinks theme |

**To generate this lesson:** open the Unified Lesson Generator at `/content-creator/unified-generator`, select `Hub = Playground`, `CEFR = Pre-A1`, paste the fields above, and run. The orchestrator will produce a draft in `curriculum_lessons` (unpublished) ready for teacher review.
