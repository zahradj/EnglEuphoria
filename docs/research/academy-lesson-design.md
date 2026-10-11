# Academy lesson design — structure, progression, games, progress (research, 2026-10-08)

Scope: Academy hub, ages 11–18, CEFR A1 → B2, digital lesson player (`PlayAcademyLesson`). Builds on `docs/research/academy-teen-games.md` (game design for teens), which is not repeated here.

**Evidence labels.** [V] = seen in a source during this research. [K] = established literature, quoted from memory, re-check before citing publicly. [RT] = rule of thumb, no direct study. [U] = unverified.
**Limits of this research.** Web fetching was largely blocked, so most findings come from search summaries. Coursebook unit structures are partly unverified (Headway and Oxford Project could not be found at all). Every app "efficacy study" found was vendor-funded, on adults, mostly Spanish. Treat the numbers as design guidance, not proof.

---

## 1. What the evidence says (the 8 things that matter)

1. **Explicit teaching + meaningful use beats either alone.** Explicit instruction beats implicit on tests (Norris & Ortega 2000; Spada & Tomita 2010) [K]; tasks plus a focus-on-form step is the defensible middle. TBLT's headline effect is contested (d = 0.93 in Bryfonski & McKay, g = 0.61 on re-analysis; Boers & Faez 2023 say the field is "not ripe" to compare methods) [V]. **Conclusion: do not pick PPP *or* TBLT.** Use "PPP with noticing" at A1–A2, and "task → focus on form → repeat task" at B1–B2.
2. **Retrieval beats re-reading.** Testing effect (Roediger & Karpicke 2006) [K]. Production (type / say) beats recognition (pick) for memory (generation effect) [V].
3. **Spacing is the most robust effect we have.** The best gap is ~20–40 % of the time you want to remember the item at a 1-week horizon, shrinking to ~5–10 % at 1 year (Cepeda 2008) [V]. The exact schedule below is a rule of thumb [RT]: same session → +1 d → +3 d → +7 d → +21 d → +60 d; a miss drops back to +1 d.
4. **A word needs many varied meetings.** Gains rise with frequency with no sharp threshold; ~10+ encounters is an order of magnitude, not a law [K, unverified]. Meetings must be in different skills (read, hear, say, write) to count.
5. **Balance the four strands over a unit** (Nation): meaning-focused input, meaning-focused output, language-focused learning, fluency — roughly a quarter each, with more language-focus at A1–A2 and more output/fluency at B1–B2 [K/RT].
6. **Feedback is the biggest lever and type matters.** Hattie & Timperley: mean d = 0.79 [V, Hattie's numbers are methodologically criticised]. Prompts that make the learner self-correct beat bare recasts (Lyster & Saito 2010) [K]. Elaborated "why" feedback is what AI explain-my-answer features sell, but there is no outcome data yet [V].
7. **Speaking anxiety is real and measurable** (r ≈ −0.36 with achievement, Teimouri 2019) [K]. Private, replayable, retryable speaking is the fix; AI chat improved oral performance but did **not** reduce anxiety in one 8-week study (n = 48) [V].
8. **Gamification helps modestly** (g ≈ 0.46, mostly non-language samples; larger effects in weaker studies) [V]. Badges/leaderboards raised interest but not performance in an HK secondary study [V]. Streaks/XP/leagues sustain attendance; they are not evidence of learning.

## 2. Recommended structure

### 2.1 Unit = 6 lessons + a task (fits the existing 6-slot blueprint)

Coursebooks converge on 6–8 content lessons per unit, a productive task at the end, a review per unit, and a cumulative review every 2 units (Solutions: after units 1, 3, 5, 7, 9) [V]. Empower opens every unit with "can do" statements; Roadmap has GSE-based objectives per lesson [V].

| Slot | Role | Skill focus | Notes |
|---|---|---|---|
| L1 | **Hook + context text** | Listening/Reading input | Short story/dialogue (~80 words at A1), tappable new words, gist check. Receptive only (rule 12b). |
| L2 | **Vocabulary + pronunciation** | Vocabulary, Pronunciation | Small sets (≤ 14 words, hub cap), meaning→image/audio→recycle→combine. |
| L3 | **Grammar in context** | Grammar | Notice in L1's text → find the pattern → ≤ 3-line rule → controlled practice. |
| L4 | **Functional language** | Speaking/Listening | "Everyday English": a real exchange (ordering, asking directions, giving an opinion) with a model dialogue. |
| L5 | **Skills + story/culture** | Reading/Writing | Longer text (graded, 95–98 % known words) + one short writing task with instant feedback and a rewrite step. |
| L6 | **Unit task + checkpoint** | Speaking + all | Pair/peer task (existing TBLT rule: ≥ 1 unscripted turn), then a mixed, interleaved checkpoint. Every 2nd unit: a cumulative "boss" review. |

Open question for the owner: the DB slot types are core / storybook / extra practice / unit review. Supabase was unreachable in this session so I did not check the real Academy slot titles — verify before renaming anything.

### 2.2 Lesson = 6 chunks (what the learner sees)

Mapped to the 7 existing blocks in `PlayAcademyLesson` (warmup, vocab, reading, grammar, practice, interactive, speaking). Keep the order fixed so learners always know where they are; vary the *mechanics* inside (Variety Rule: ≤ 2 same kind in a row).

| # | Chunk | Time | Block | Rule |
|---|---|---|---|---|
| 0 | **Remember?** retrieval warm-up of last lesson + any "due" items | 3–4 min | warmup | **New for Academy.** Production first (type/say), recognition second. Show the score. Playground already has this; Academy does not. |
| 1 | **Hook + input** | 5 min | warmup/reading | Receptive only; the student can answer with no new language. |
| 2 | **Vocab or Notice** | 5–7 min | vocab/grammar | Small sets; find-the-pattern before the rule. |
| 3 | **Controlled practice** (2–3 different mechanics) | 7–10 min | practice | ≥ 60 % items need typing/speaking with the answer hidden [RT]. |
| 4 | **Freer task** with a push | 7–10 min | interactive/speaking | ≥ 2 sentences or ≥ 30 s speech; ≥ 1 choice of 2+ tasks (autonomy). |
| 5 | **Exit** | 2 min | celebration | "I can…" tick-off, mistake bank count, what comes back tomorrow. |

Player session ≈ 30–35 min, resumable in 5–8 min chunks (no peer-reviewed optimum exists; A/B test this) [RT]. Live 60-min class uses the same chunks with more peer time.

### 2.3 Four skills + grammar + vocabulary: how to guarantee coverage

Give every lesson a **skill ledger** in `LessonBlueprint` (new field), and have the validator check it:
- Every lesson: ≥ 1 input (read or listen) and ≥ 1 production (speak or write).
- Every unit: all four Nation strands present, each 15–35 % of activity time.
- Every target word: ≥ 3 different skills touched within the unit, and it returns in the next 2 lessons' "Remember?".
- One **fluency repeat** per unit: the L6 task done twice, second time with a shorter limit (4/3/2) [K].

## 3. Games and mechanics per skill (what to build / reuse)

Choose by *what the learner must retrieve*, then by teen appeal. Existing kinds in `PlayAcademyLesson` / arcade are in **bold**.

| Skill | Mechanic (benchmark) | Why it helps memory | Reuse / build |
|---|---|---|---|
| **Vocabulary** | Type the word from picture/audio (Quizlet Learn, Lingvist) | Generation + retrieval | Build (type-answer mode of **vocab_image_match**) |
| | Timed team match / quiz (Quizlet Match, Kahoot, Gimkit) | Retrieval under light pressure | **matching**, **memory_quest**; add accuracy mode (no clock) |
| | Spaced review queue ("Remember?") | Spacing | `srs.ts` / MemoryBank exist — wire into player |
| **Grammar** | Fix-the-mistake chat (group chat with 4–5 slips) | Retrieval in context | **conversation_fill** / **fill_blank** |
| | Sentence tile-building with link words | Chunk generation | **sentence_builder**, **expedition_game** pattern |
| | Notice → rule → substitution table (EMTAS) | Pattern inference | **canvas_game** |
| **Reading** | Branching story with comprehension gates | Dual coding, narrative | **story_page** + MCQ |
| | Tap-for-gloss graded reader | Contextual retrieval | tappable words in **story_page** |
| **Listening** | Dictation / listen & type | Decoding + retrieval | Build; **audio must use `speak()` recorded voices, never browser TTS (CLAUDE.md)** |
| | Audio clue-chain escape room | Retrieval with purpose | **escape_room_slot** |
| **Speaking** | Voice-note task (2 truths & a lie; Café order) | Output, private, replayable | **role_play**, **speaking_task** |
| | Collaborative decision (Cambridge B1 Speaking Part 3) | Functional language under pressure | **speaking_task** (already used) |
| | Mini-debate with sentence starters (B1+) | Opinion + justification | Build (upper Academy) |
| **Writing** | Short message/caption with instant feedback + "rewrite to fix" | Generation + corrective feedback | Build |
| **Pronunciation** | Shadowing with a model clip + self-compare | Repetition + feedback | **sound_challenge_game**; scoring is unproven for this age [V] — start with listen-and-compare |

Teen rules that stay: no public individual leaderboard, team/personal-best goals, choice, mistakes are normal (see `academy-teen-games.md`).

## 4. Making progress felt *and* honest

Principle: **tie every progress signal to a can-do or a skill, never to time or XP alone.** Today the player's stars come from per-block answer ratio and XP from clicks — those are engagement, not evidence.

| # | Feature | Signal to learner | Evidence |
|---|---|---|---|
| 1 | **Per-skill levels**: Attempted → Familiar → Proficient → Mastered. *Mastered* only after a later mixed check; levels can fall. | Honest growth per skill | Khan Academy model [V]; the "3 in a row over 2 sessions" threshold is a design choice [RT] |
| 2 | **Can-do checklist** per unit; self-rate before/after, system adds its own evidence beside it | "I can…" lines turning green | CEFR self-assessment grid / ELP [V]; CEFR Companion Volume has Pre-A1 [V] |
| 3 | **"Remember?" warm-up with a retention score** ("You kept 7/9 words from last week") | Proof learning stuck | Testing effect, spacing [K/V] |
| 4 | **Mistake bank** with a "fixed" counter; misses return at the end of the lesson and in a review mode | Weakness → strength | Duolingo Mistakes mode; half-life regression [V, company-reported] |
| 5 | **Fading-skill indicator** + due-review prompt | Honest decay, clear next step | Settles & Meeder 2016 [V]; Anki maturity [V] |
| 6 | **Unit checkpoint**: mixed, interleaved, not the practice items | Credible "unit passed" | Interleaving, delayed testing [K] |
| 7 | **Before/after recording**: one speaking + one writing sample at unit start, replayed at the end | Audible/visible growth | Rationale only, **no outcome study found** [V] |
| 8 | **Segmented path bar + step counter** | Distance left shrinks | Goal-gradient (Kivetz 2006) [V] — reward programmes, not education |
| 9 | **Naming the win** after each chunk ("You can now ask for directions") | Meaningful small win | Progress principle (Amabile & Kramer) [V] — workplace data |
| 10 | **Real head start only** ("you already know 3 of these words" from a quick check) | Starts visibly ahead | Endowed progress (Nunes & Drèze 2006) — fades if arbitrary [V] |

**Level claims stay separate.** Never say "you are B1" from in-app activity. Use a distinct placement / external-style test; Busuu and Duolingo both gate certificates behind a test, not XP [V]. Duolingo's reported claim (5 units ≈ 4 university semesters on external tests, 2022) is company-reported [V].

**Streaks.** Keep them optional and forgiving: Duolingo's own tests found separating the daily goal from the streak (+3.3 % D14 retention) and a second freeze helped [V, relative changes]. A qualitative study documents misuse of XP/leaderboards [V]. For teens: daily goal + freezes + team quests, not rank.

## 5. What the repo needs (gaps found, not yet changed)

1. `src/curriculum/roadmap/cefrRoadmap.ts` returns an **empty scaffold** for every Academy level — there is no machine-readable Academy progression (words, grammar, can-dos per unit) to validate against. This is the blocker for "accurate progression".
2. `LessonBlueprint` has no skill ledger, no can-do list, no `review_targets` enforcement in the Academy player.
3. `supabase/functions/_shared/prompts/academy.ts` says ages **10–17**, a **13-type whitelist** (`intro … celebration`) that does not match what the player really renders (`canvas_game`, `escape_room_slot`, `expedition_game`, …), and forbids essay/writing prompts. Align it with this document and with the "Vary every lesson" rule.
4. No "Remember?" step in the Academy player (only Playground, enforced by `recallWarmup.test.ts`). `MemoryBank` / `srs.ts` exist on the dashboard but the player does not feed or read them.
5. Stars (`PlayAcademyLesson`, block ratio) and XP (+5 per first slide visit) reward clicking. Compute stars from first-attempt accuracy and delayed retention instead.
6. Pronunciation scoring and AI writing feedback have no existing component.

## 6. Proposed next steps (order matters)

1. **Write the Academy roadmap** for A1 (units, can-dos, words ≤ 14/lesson, grammar, review targets) — approve before any lesson is built.
2. Add `skills` + `can_do` fields and a validator to `LessonBlueprint` (gate: strands, input + production per lesson).
3. Add the Academy **Remember?** step (reuse `srs.ts`), mistake bank, per-skill levels, and unit checkpoint to the player.
4. Align `academy.ts` prompt with the real kinds, ages 11–18, and this structure.
5. Rebuild **one** lesson (A1 U1) fully on the new shape, play-test with real 11–18 learners, then scale. Update the `lesson-quality-gate` and `smart-lesson-architect` skills with the final shape.

## Sources (search-surfaced; many not opened)

- Cepeda et al. 2008 — scholarcommons.usf.edu/psy_facpub/1766 ; 2006 review — yorku.ca/ncepeda/publications/CPVWR2006.html
- Bryfonski & McKay (LTR 23(5)) and critiques — todoele.net/bibliografia/tblt-implementation-and-evaluation-meta-analysis
- Uchihara, Webb & Yanagisawa 2019 — cambridge.org/core (Language Learning 69(3))
- Settles & Meeder 2016 (half-life regression) — aclanthology.org/P16-1174
- Duolingo blogs: results-duolingo-efficacy-studies, spaced-repetition-for-learning, guide-to-duolingo-practice-hub, how-duolingo-streak-builds-habit
- "When Gamification Spoils Your Learning" — arxiv.org/pdf/2203.16175
- Gamification meta-analyses — pmc.ncbi.nlm.nih.gov/articles/PMC8037535 ; hub.hku.hk/handle/10722/363824
- Khan Academy mastery levels — support.khanacademy.org/hc/es/articles/5548760867853
- CEFR self-assessment grid — coe.int/en/web/portfolio/self-assessment-grid ; Companion Volume — coe.int (CEFR descriptors)
- Busuu certification — busuu.com/en/languages/certification ; Duolingo English Test CEFR alignment — ciol.org.uk DET-CEFR-Alignment
- Nunes & Drèze 2006 — ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html ; Kivetz et al. 2006 — business.columbia.edu goalgradient.pdf
- Hattie & Timperley 2007 — findanexpert.unimelb.edu.au/scholarlywork/334554
- Coursebooks: Pearson Roadmap, Cambridge Empower/Think, Oxford Solutions 3e Teacher's Book listing, NGL Keynote (JALT review)
- EEF Teaching & Learning Toolkit — educationendowmentfoundation.org.uk (not re-fetched)
