# Games that suit the Academy hub — research, 2026-10-05

The Academy is its own hub, not a grown-up Playground:
- **Cast** (`cast_vault_characters`, hub = academy): **Vee**, the mentor (16–19, direct, upbeat, "treats mistakes as normal"); **Ava** (13–15, curious, asks lots of questions), **Theo** (13–15, easygoing, a good listener) and **Mia** (13–15), the recurring conversation leads. Semi-realistic illustrated teens in everyday clothes, **not mascots**.
- **Blueprint** (`supabase/functions/_shared/prompts/academy.ts`, `hubProfiles.ts`): task-based teaching (TBLT), A1 → B1 (optional B2). Every lesson ends in a **real communicative task** done with a peer, with at least one **unscripted speaking turn**. Six phases, 20–25 slides. Component whitelist: `intro`, `vocab_card`, `reading_passage`, `comprehension_mcq`, `fill_blank`, `matching_pairs`, `grammar_form_card`, `controlled_drill`, `roleplay_dialogue`, `info_gap`, `task_outcome`, `homework_task`, `celebration`.
- **Banned**: Pip or any childish mascot voice, tracing and phonics drills, sticker/reward language, nursery chants, essays. Tone: smart, peer-respecting, never childish, never preachy; PG-13 school-safe topics.
- **Curricula in the database**: *A1 Academy — Foundational Teen English* (Personal Identity & Online Profiles, My Room & Gadgets, Free Time & Hobbies, Food & Cafes, Clothes & Shopping …) and *Jungle Survival: Teen Expedition* (B1: storms, rescue and retreat, emergencies …). Lesson types: core, storybook, extra practice, unit review / boss test.

## What the research says about teen game design

| Finding | Source |
|---|---|
| Game-based learning has a **moderate–large effect** on cognitive, motivational and engagement outcomes. Gamification works on average, but results depend on design. | Sailer & Homner, *The Gamification of Learning: a Meta-analysis* (2020); DGBLL meta-analysis (Univ. of Hawaiʻi) |
| Kahoot!/Quizizz-style games raise participation and peer collaboration, but **over-reliance on competition creates anxiety** for some learners. | Systematic review of gamified EFL motivation (2025); Frontiers in Psychology (2022) |
| Adolescents benefit from **competition and peer recognition, clear goals, real-time feedback and adaptive difficulty**. Unlike children, they handle **complex mechanics: quests, group statistics, strategy**. | *One Size Doesn't Fit All: Age-Aware Gamification Mechanics* (arXiv 2512.15630, 2025) |
| **Public leaderboards** can stress adolescents, increase social comparison and discourage lower performers. Points/badges drive short-term participation but can **shift motivation from interest to rewards** unless they also support **autonomy** (self-determination theory). | Systematic review, *Heliyon* (2023); Sailer et al., *Computers in Human Behavior* (2017); meta-analysis on gamification and intrinsic motivation (2024) |
| **Autonomy** (choices, control of pace) increases investment and persistence. | *Exploring Gameful Motivation of Autonomous Learners* (PMC, 2022) |
| High-schoolers prefer **strategy** (Gimkit: earn in-game currency for correct answers, spend it on upgrades; rewards sustained accuracy, not one fast round). Cartoon collectibles (Blooket's "Blooks") read as **"kid stuff" by about 14**. Middle-schoolers are split. | Ditch That Textbook comparison; TriviaMaker; Screenwise; student poll (HHS Journalism, 2025) |
| Games that involve **mystery, creativity and a bit of bluffing** are hits with teens: 20 Questions, mystery role-play with secret roles, escape rooms, Desert-Island ranking (agree on 5 of 20 items and justify), Shark Tank pitches. | Twinkl *35 Speaking Games for ESL Teens*; ESL Info; TEFL Lemon |
| Game worlds teens already know (**Minecraft**, Among Us, Roblox) raise vocabulary scores and lower boredom (a Minecraft group improved about 72% pre→post; 80%+ less bored). | ResearchGate / ERIC studies on Minecraft vocabulary (2021); TESL-EJ |
| Exam formats teens will meet: **A2 Key for Schools** speaking in pairs; **B1 Preliminary for Schools** Speaking Part 3, a collaborative decision task (suggest, agree, disagree politely, justify). | Cambridge English handbooks |

## Design rules for Academy games

1. **Teens, not kids.** Use the Academy cast and teen settings (phones, group chats, profiles, gadgets, sport, cafés, the expedition). No mascots, stickers, cartoon collectibles or sing-song voices.
2. **Strategy and accuracy over reaction speed.** Reward streaks and good decisions; timers are optional and generous, never the core.
3. **Compete in teams or against your own best.** Show personal bests and team or class goals. **No public individual leaderboard by default** (the `leaderboard_event` game should show only the top few teams or a personal rank).
4. **Choice everywhere (autonomy).** Pick a path, a difficulty or a hint ("spend 20 coins for a hint"); optional challenges.
5. **Every game ends in language use (TBLT).** The game sets up the task outcome: a decision, a message, a voice note, a role-play.
6. **Mystery, deduction and a bit of bluffing** beat quizzes in costumes.
7. **Mistakes are normal** (Vee's trait): instant, specific feedback, a retry, no shame.
8. **Peer interaction**: info gaps and pair tasks, because the exam and the blueprint both require it.

## Recommended Academy games (mapped to the whitelist and units)

| Game | How it plays | Whitelist type | Fits |
|---|---|---|---|
| **Profile Detective** | Three fake social profiles (Ava, Theo, Mia). Ask yes/no questions ("Is she 14?", "Does he like gaming?") to find whose profile it is. Deduction, with questions as the language. | `info_gap` + `task_outcome` | A1 U1 Online Profiles |
| **Group-Chat Fix** | A phone-style group chat between Ava and Theo with 4–5 grammar slips; spot and fix them for streak points. | `controlled_drill` / `fill_blank` | any grammar lesson |
| **Choose Your Path episode** | A short branching story with Vee; each choice needs reading or grammar understanding, and choices change the ending. | `reading_passage` + `comprehension_mcq` | storybook lessons, Jungle Survival |
| **Coin Strategy Quiz** (Gimkit-style) | Correct answers earn Academy coins (the existing `academy_coin_ledger`); spend them on a hint, a 50/50 or a shield. Individual, but goal-based or team pot, not a public ranking. | review / `matching_pairs` | unit review / boss test |
| **Survival Ranking** | Pairs choose 5 of 12 items for the expedition and must suggest, agree, disagree politely and justify (B1 Speaking Part 3). | `roleplay_dialogue` → `task_outcome` | Jungle Survival |
| **Two Truths and a Lie (voice note)** | Record 3 sentences about yourself; the partner or class guesses the lie and asks follow-up questions. | `task_outcome` | A1 U1, hobbies, past tense |
| **Café Order Sim** | A menu, a budget and a friend's order; order by voice or text and get the bill right. | `roleplay_dialogue` | A1 Food & Cafes |
| **Escape room (existing `escape_room_slot`)** | Keep it; one puzzle type per door, played as a team, with a generous or optional timer. | review | unit review |
| **Secret Role mystery** | Each student gets a secret role card (for example, "you lost your phone") and talks in character; the others work it out. | `info_gap` | B1 |
| **Daily 5-letter word** (Wordle-like) | A private streak on lesson vocabulary, as homework. | `homework_task` | all units |

## Audit of what the Academy can show today (`src/arcade/gameRegistry.ts`)

- **Good fits**: `roleplay_mission`, `fluency_round`, `story_continuation`, `team_mission`, `coop_challenge`, `grammar_boss`, `sentence_builder`, `timeline_race`, `memory_quest`, `matching_pairs`.
- **Fix**: `leaderboard_event` and `classroom_battle` should rank **teams or personal bests**, not single students. `spelling_race` and the vocab-games `WordRush` should get an **accuracy mode** (no clock).
- **Consider**: `debate_battle` is Success-only today; a **mini-debate** (B1, pairs, two minutes, sentence starters) suits the upper Academy.
- **Already correct**: Playground-only phonics and alphabet games (`phonics_challenge`, `alphabet_*`, `song_chant`) are not offered to the Academy.

## Sources
- [The Gamification of Learning: a Meta-analysis (Springer)](https://link.springer.com/article/10.1007/s10648-019-09498-w)
- [Digital game-based language learning: a meta-analysis (Univ. of Hawaiʻi)](https://scholarspace.manoa.hawaii.edu/server/api/core/bitstreams/df6a3c0d-9f82-40dc-8491-40c5fd2972ab/content)
- [A systematic review of gamified learning motivation for English language (ResearchGate)](https://www.researchgate.net/publication/398317375_A_systematic_review_of_gamified_learning_motivation_for_English_language_among_undergraduates)
- [Frontiers in Psychology (2022) — game-based language learning](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.1030790/full)
- [Exploring Gameful Motivation of Autonomous Learners (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8916124/)
- [One Size Doesn't Fit All: Age-Aware Gamification Mechanics (arXiv)](https://arxiv.org/abs/2512.15630)
- [The role of gamified learning strategies in students' motivation in high school and higher education (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S2405844023062412)
- [How gamification motivates: game design elements and psychological need satisfaction (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S074756321630855X)
- [Gamification enhances intrinsic motivation, autonomy and relatedness: meta-analysis (ResearchGate)](https://www.researchgate.net/publication/377454304_Gamification_enhances_student_intrinsic_motivation_perceptions_of_autonomy_and_relatedness_but_minimal_impact_on_competency_a_meta-analysis_and_systematic_review)
- [Game show classroom: Kahoot, Quizizz, Quizlet Live, Blooket, Gimkit (Ditch That Textbook)](https://ditchthattextbook.com/game-show-classroom-comparing-the-big-5/)
- [Blooket vs Gimkit vs Kahoot (TriviaMaker)](https://triviamaker.com/blooket-vs-gimkit-vs-kahoot/)
- [Blooket alternatives for high schoolers (Screenwise)](https://screenwiseapp.com/guides/best-blooket-alternatives-for-high-schoolers)
- [What do students prefer, Gimkit or Blooket? (HHS Journalism)](https://hhsjournalism.com/community/2025/04/21/what-do-students-and-teachers-prefer-for-classroom-games-gimkit-or-blooket/)
- [35 Speaking Games for ESL Teens (Twinkl)](https://www.twinkl.com/blog/35-speaking-games-for-esl-teens)
- [23 Best ESL Speaking Activities for Teens (ESL Info)](https://eslinfo.com/23-best-esl-speaking-activities-for-teens/)
- [ESL speaking activities for teens and adults (TEFL Lemon)](https://www.tefllemon.com/esl-speaking-activities-for-teens-and-adults)
- [The Effect of Minecraft on Students' English Vocabulary Mastery (ResearchGate)](https://www.researchgate.net/publication/355450420_The_Effect_of_Minecraft_Video_Game_on_Students'_English_Vocabulary_Mastery)
- [Using Minecraft for Learning English (TESL-EJ)](https://tesl-ej.org/wordpress/issues/volume18/ej70/ej70int/)
- [A2 Key for Schools exam format (Cambridge English)](https://www.cambridgeenglish.org/exams-and-tests/qualifications/key/format/)
- [B1 Preliminary for Schools exam format (Cambridge English)](https://www.cambridgeenglish.org/exams-and-tests/qualifications/preliminary/format/)
