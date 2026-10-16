# Academy curriculum benchmarks (2026-10-14)

Research only. Rule: take mechanics and structure, never content (CLAUDE.md). Nothing in `src/` was changed.

## 0. How this was verified (read first)

- **Page fetching was blocked.** Every `WebFetch` to cambridge.org, oup.com, pearson.com, britishcouncil.org, wikipedia.org failed (`getaddrinfo ENOTFOUND`; `curl` gets `CONNECT 403` from the egress proxy). So **no page was verified by fetching it**, which is what the brief asked for.
- **What was done instead:** `WebSearch` returned result lists with publisher/retailer titles and URLs plus a summary of what the engine saw. Marks used below:
  - **[S]** = supported by a search result from an official publisher or exam-board page (title and URL seen, summary read). Not a fetched page. Re-check before quoting.
  - **[S-3rd]** = supported only by retailer, review or comparison sites (some affiliate). Weak.
  - **[U]** = not found; the search said so, or it is from our own docs or memory.
- Where a figure is missing, it says "not found" and is not guessed.
- To upgrade to verified: open the URL in a browser and read the scope and sequence of one level of each course. Owner action, about 1 hour.

## 1. Benchmark table (10 programmes)

| # | Programme (audience) | Unit / lesson length | Units per level | Teen topics | Skills balance | Review cadence | Assessment cadence | Mechanic worth adapting | Mark |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cambridge Empower 2nd ed.** (adult and young adult; A1-C1, 6 levels) | Each unit = 4 lessons A, B, C, D; **C = "everyday English"** (functional speaking); each unit ends with a consolidation of core language | B1 book lists 12 units; B2 book lists 10; not uniform; no all-level source found | Adult/young-adult, general | Four skills plus a separate functional-language lesson | Consolidation at the end of every unit | End-of-unit tests, mid- and end-of-course tests, **personalised CEFR test report** | Dedicated "everyday English" lesson per unit that turns the unit grammar into real exchanges | [S] [Cambridge catalogue](https://www.cambridge.org/us/cambridgeenglish/catalog/adult-courses/empower-2nd-edition), [Cambridge Spain page](https://www.cambridge.es/en/catalogue/adults/courses/empower2ed) |
| 2 | **Cambridge Prepare! 2nd ed.** (teens; 9 levels A1-C1; exam path) | Unit length not found | Brochure: 9 levels, "20 units" (unclear if per level), **70-160 hours** per level | Teen / school | Four skills plus exam skills (Speaking, Writing) | Practice Extra, Test & Train banks | **Two books per exam**: levels 2, 4, 6, 8 are "towards the exam" and add real exam tasks gradually | **Gradual exam on-ramp**: exam task types introduced a few at a time, then a full "towards" level | [S] [Prepare page](https://www.cambridge.org/prepare), [brochure](https://www.cambridge.org/sites/default/files/media/documents/Prepare_brochure_update_Dec_2021_web.pdf) |
| 3 | **Oxford Solutions 3rd ed.** (teens; Elementary-Advanced) | Intermediate SB: intro unit plus **9 topic units of 8 lessons each** | 9 units plus an intro revision unit (Intermediate) | Teen, with **9 Culture lessons** | Four skills, Culture lesson per unit, exam skills | Workbook: 9 Unit Reviews with "I can..." lines and **cumulative reviews after units 1, 3, 5, 7, 9** | **Exam Skills Trainer sections (5 plus 2 B2 trainers)** inside the Student's Book | Cumulative review **every 2 units**, a Culture lesson linked to the unit topic, and "I can" self-checks | [S] [OUP catalogue](https://elt.oup.com/catalogue/items/global/teenagers/solutions_third_edition/), [Intermediate WB](https://elt.oup.com/catalogue/items/global/teenagers/solutions_third_edition/solutions_third_edition_intermediate/9780194504522?cc=global&selLanguage=en&mode=hub) |
| 4 | **NatGeo Life 2nd ed.** (young adult/adult; 6 levels) | Unit lesson count not found | Probably 12 per level (split editions A: units 1-6, B: units 7-12) | General, "My Life" personalisation, critical thinking syllabus | Integrated four skills; critical thinking | "Memory Booster" activities | Not found | **"My Life" personalisation spot** and a Memory Booster retrieval task per unit | [S-3rd] [publisher sample PDF](https://www.eltngl.com:443/assets/downloads/life2e_pro0000009032/ame/LFE_SMP_AmE-2E_9781305986275_web.pdf), [Cornelsen](https://cornelsen.de/reihen/life-550001290000/second-edition-550001290002) |
| 5 | **Pearson Speakout 3rd ed.** (adult; A1-B2+, 8 levels, GSE-based) | Unit and lesson length not found | Not found | General, employability from A2 | Strong pronunciation strand with recording tool; **A1 has separate Sounds and Spelling lessons**; **mediation / employability skills from A2** | A motivating spread at the end of each unit (type not confirmed) | Not found | **Sounds and Spelling lesson** at A1; recording tool for pronunciation | [S-3rd] [A1 SB listing](https://nyelvkonyvbolt.hu/en/shop/books-for-language-learning/language-learning/speakout-3rd-edition-a1-students-book-and-ebook-with-online-practice), [A2+ listing](https://nyelvkonyvbolt.hu/en/shop/books-for-language-learning/language-learning/speakout-3rd-editon-a2-students-book-and-ebook-with-online-practice) |
| 6 | **Pearson GSE / GSE Teacher Toolkit** (framework and database) | n/a | n/a | Filters for young learners (6-14), adults, academic, professional; **no teen set listed** | Scale 10-90 per skill (listening, reading, speaking, writing); mediation not listed | n/a | Psychometric scale aligned to CEFR | **Per-skill numeric level**: a student can be 35 in speaking and 28 in writing. Launch counts (2016): >1,600 learning objectives, >300 grammar objectives, 36,000 vocabulary items | [S] [GSE educators](https://www.pearson.com/english/about/gse/learning-objectives.html), [Toolkit](https://www.pearsoncanadaschool.com/literacy/products/the-global-scale-of-english/gse-teacher-toolkit.html), [Pearson note](https://www.pearson.com.hk/en_GB/about-us/news/20161129.html) |
| 7 | **British Council LearnEnglish Teens** (free, self-study, 13-17) | Short standalone items (not a sequenced course) | No levels as units; content tagged by CEFR | Magazine topics (fashion, brain, finance and banking, old age...), a `topics/` index | Separate Listening / Reading / Writing / Speaking sections | Vocabulary games, level test | **Online level test**; **Exams section** with reading, writing, listening, speaking, grammar and vocabulary exam pages and exam study tips | Topic **magazine** layer on top of a skills layer; exam study tips as a short lesson type | [S] [Teens site](https://learnenglishteens.britishcouncil.org/grammar/be/term) (nav pages seen in search) |
| 8 | **Duolingo (English course)** (self-study app) | Short lessons (length not found) | Sections map roughly to CEFR; Units within; one fan wiki says 4 sections, 175 units (**unverified**) | General | Mostly reading/listening/translation-free tasks; blog says B1-B2 units use no translation | Built-in repetition ("Daily Refresh") | Section-end checks (details not found) | Section -> Unit hierarchy with CEFR band per section and **no L1 translation at B1-B2** | [S] [Duolingo blog](https://blog.duolingo.com/how-duolingo-teaches-english); [S-3rd] [fan wiki](https://duolingo.fandom.com/wiki/Intermediate_English) |
| 9 | **Busuu** (self-study app, CEFR A1-B2) | Not found | Not found | Everyday topics (groceries, transport) | Sequence: vocabulary intro, grammar explanation, practice, then a **speaking or writing task** | **Smart Review** resurfaces weak words (sorted weak / medium / strong) | CEFR level tests (not detailed) | Speaking/writing task at the end of each unit, **with community feedback** | [S-3rd] [learnenglish.life review](https://learnenglish.life/reviews/busuu/), [comparison](https://www.learnenglish.life/compare/duolingo-vs-busuu/) |
| 10 | **Preply / italki / Cambly** (one-to-one marketplaces) | Cambly lessons 15-60 min (competitor-hosted source) | No fixed units | Tutor's choice: conversation, grammar, business, **exam prep (TOEFL, IELTS)** | Tutor-led; Cambly = conversational fluency | Not defined (tutor decides) | Preply: assessment-based personalised curriculum; italki: none standard | **Goal-picked track at sign-up** (conversation / grammar / exam) and an initial assessment that sets the plan. No standard lesson template found, which is **our edge** | [S-3rd] [comparison](https://learnenglish.life/compare/cambly-vs-italki-vs-preply/) |
| 11 | **Kinnu** (general-knowledge microlearning, not English) | ~10 min "Orb" (few paragraphs plus questions) | 30-session courses | n/a | Read then multiple-choice | **Memory Shield** spaced repetition returns weak cards a few sessions later | Question after every Orb, cannot be skipped | **One small unit a day** (about 10 min) plus automatic spaced return of weak cards: the Daily 10 pattern | [S-3rd] [WhistleOut](https://www.whistleout.ca/CellPhones/Guides/kinnu-learning-app), [Legal Cheek](https://www.legalcheek.com/?p=231265) |
| ref | **Cambridge English guided learning hours** | n/a | n/a | n/a | n/a | n/a | n/a | Cumulative from zero: **C1 700-800, B2 500-600, B1 350-400** seen in the table via search; A2 180-200 from secondary sites; "guideline only", depends on background, intensity, age, out-of-class exposure | [S] [Cambridge English helpdesk](https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours) |

Not found for any programme (state this plainly to the owner): lesson length in minutes for the coursebooks (they assume a ~45-90 min class slot, not stated in sources seen), mediation as a named strand in Empower / Solutions / Life, and the exact unit count for Prepare, Speakout and Life.

## 2. Patterns across the benchmarks

1. **A unit has 4-8 lessons and one productive end-task.** Empower 4 lessons plus consolidation; Solutions 8 lessons. Our Season = 8 sessions plus a Release matches Solutions' length. [S]
2. **Cumulative review every 2 units** (Solutions units 1, 3, 5, 7, 9). We already do "Big Remix every 2nd Season". Match confirmed. [S]
3. **Functional-language lesson in every unit** (Empower lesson C "everyday English"). Our E4 On Air does this. Match. [S]
4. **Teen courses carry an exam on-ramp** (Prepare "towards the exam" levels; Solutions Exam Skills Trainers; LearnEnglish Teens Exams section; italki exam prep). We have none. **Gap.** [S]
5. **A culture or "school world" lesson per unit** (Solutions 9 Culture lessons). We have Side Quest (E6) "cultural" as an option only. Partial. [S]
6. **Self-assessment "I can" at the end of every unit** (Solutions Unit Review). We have it in Wrap. Match. [S]
7. **Per-skill levels** (GSE 10-90 per skill, Empower personalised CEFR report). We plan "per-skill levels" in diagnostics but the roadmap is one linear ladder. Partial. [S]
8. **Pronunciation as its own strand** (Speakout recording tool; A1 Sounds and Spelling lessons). We have a pronunciation focus per Season. Partial: no dedicated Sound lesson or recording-based check. [S-3rd]
9. **Mediation appears from A2** in Speakout's employability skills; CEFR Companion Volume treats it as a mode. We place it at B2 (S15) and C1 (S13) only. Late. [S-3rd]
10. **Self-study apps use a spaced-return of weak items** (Busuu Smart Review, Kinnu Memory Shield). We have Remember? plus Daily 10. Match. [S-3rd]

## 3. Our design today (from `docs/academy-lesson-system.md` and `docs/academy-roadmap-v2.md`)

- Level -> Season (= unit, 8 sessions) -> Episode (= 60-min Live Session). E1 Cold Open, E2 Word Lab, E3 Pattern Lab, E4 On Air, E5 Deep Dive, E6 Side Quest, E7 Remix (zero new language), E8 Finale (zero new language, Release, checkpoint).
- 70 Seasons / 560 sessions: A1 10 (80), A2 12 (96), B1 16 (128), B2 16 (128), C1 16 (128).
- Cumulative live hours by level: A1 80, A2 176, B1 304, B2 432, C1 560.

## 4. Hours versus Cambridge guided learning hours

Cambridge figures are cumulative from zero, [S] for B1, B2, C1; A2 from secondary sources; A1 ~90-100 is our own **[U]** figure (not seen).

| Level | Our cumulative live hours | Cambridge cumulative | Shortfall of live hours | With Daily 10 at ~10 min x 5 days per week x 8 sessions/4 weeks |
|---|---|---|---|---|
| A1 | 80 | ~90-100 [U] | 10-20 | Daily 10 closes it |
| A2 | 176 | 180-200 | 4-24 | closes it |
| B1 | 304 | 350-400 | 46-96 | roughly closes |
| B2 | 432 | 500-600 | 68-168 | **does not clearly close** |
| C1 | 560 | 700-800 | 140-240 | **does not close** |

Notes:
- Our own doc already admits it relies on "~120 h" of Daily 10 and calls this an **assumption** (`academy-lesson-system.md` §4.1). Daily 10 is solo and light, and Cambridge's guided hours count teacher-guided time, so a straight swap is generous.
- One-to-one gives far more speaking per hour than a class of 15-25, which is a real offset, but no source seen quantifies it. Keep it labelled as an assumption.
- Per-level sizing is fine at A1-B1. The problem is the top: B2 is ~14-30% short and C1 is ~20-30% short of the Cambridge guide.
- Vocabulary check: our cumulative budget of 5,452 items at C1 versus Oxford 5000 distinct headwords of 4,979 (our own doc, 2026-10-08) is consistent.

## 5. Concrete gaps and recommendations

Ordered by impact. None change the 8-episode shape.

### G1. No exam preparation or "school English" bridge (highest)
- Every teen course seen has it (Prepare, Solutions Exam Skills Trainers, LearnEnglish Teens Exams, italki exam prep). A parent of a 13-18 student will ask: "Will this help at school and for Cambridge or IELTS?" Our roadmap has zero mention (`grep` of "exam|IELTS|KET|PET" in the lesson-system finds only a level check).
- Recommend: an **Exam Lane** as optional E6 Side Quests (not new Seasons): at A2 (A2 Key for Schools tasks), B1 (B1 Preliminary for Schools), B2 (B2 First for Schools), C1 (C1 Advanced). Use Prepare's pattern: introduce task types a few at a time, then a "towards the exam" Season at the end of the level. Write original task types in our own words (task formats are public; content is not copied).
- Add a **"School English" bridge** at A1-B1: reading a textbook instruction line, understanding a teacher's classroom language, writing a short school email, presentations in class. Our A1 doc says Academy students "already met hello, numbers and countries at school", so name what school did **not** teach and what school **does** test (spelling, reading comprehension, written grammar).

### G2. Hours at B2 and C1 fall short of Cambridge
- Options (owner choice): (a) add 1 Season per level at B2 and C1 (+8 sessions each, to 440 and 136 per level); (b) publish a Season 17+ "Extension" bank; (c) keep 128 and state honestly to families that B2/C1 need extra independent study. Option (c) is cheapest and already half-said in our doc.
- Whatever is chosen, **say it on the parent page**: the "guideline only" caveat is part of Cambridge's own text.

### G3. Topics teens expect that the Seasons do not name
- Seen in LearnEnglish Teens topics: **fashion, brain, finance and banking, old age** [S]. Compare our B1-C1 titles: they are mostly grammar-led ("Passive Power", "Cut the Words", "Rarely Do We...") with a thin topic story.
- Missing or weak (check each against the cast and "My World" skins before adding): **money and part-time work / first job** (A2 has Dream Jobs only), **social media, privacy and online safety** (A1-S01 profiles, B1-S11 Learning Machines only), **mental health, stress and sleep** (A2-S05 is illness only), **environment and climate**, **friendship, dating and peer pressure**, **identity, belonging and cultural difference** (B1-S15 only), **exams, study skills and future plans (university, gap year)**, **sport and e-sports as spectator culture** (skins only), **news literacy and fake news** (C1-S03 sources), **volunteering and community**.
- Recommend: use the **skins** and Side Quests as the topic carrier at B2/C1, and add a "topic gaps" check to `academy-quality-gate` so each level covers at least 8 of these 10 areas somewhere in a Season or Side Quest bank. Safety rules still apply (no sensitive personal disclosure in a Mission).

### G4. Mediation starts too late
- CEFR Companion Volume (2020) makes mediation a mode alongside reception, production and interaction (from memory **[U]**, not re-checked). Speakout brings it in at A2 [S-3rd]. We schedule it first at B2 (B2-S15) and C1 (S13).
- Recommend: add a **tiny mediation task** from A2 (relay a short message, "tell Theo what Ava said") as a Mission variant in E4 or E6. This is cheap and already named in our support ladder (B2 "relay/summarise").

### G5. Pronunciation has a focus per Season but no dedicated Sound lesson or recorded check
- Speakout A1 has separate Sounds and Spelling lessons and a recording tool [S-3rd].
- Recommend: a recurring 5-minute **Sound Lab** inside E2 (already "Pronunciation") with a **record-and-compare** step, and a **mid-level pronunciation checkpoint** (accent policy: intelligible, standard American voice models only, per CLAUDE.md voice rules).

### G6. Single linear ladder versus per-skill levels
- GSE gives each skill its own number [S]. Our roadmap is one linear ladder. Diagnostics already plan per-skill levels (skill `academy-learner-diagnostics`).
- Recommend: placement returns **four numbers** (listening, reading, speaking, writing) and the Season recommendation uses the lowest two. Needed so a student strong in listening (gamers) but weak in writing is not bored or lost.

### G7. Assessment cadence is thinner than coursebooks
- Coursebooks: end-of-unit tests, mid- and end-of-course tests, a personalised CEFR report [S]. Ours: E8 checkpoint per Season plus a **level check** at only the last Season of each level.
- Recommend: keep E8 checkpoint (low stakes), add a **mid-level check** (after Season 8 at B1-C1) and a **parent-facing CEFR progress report** each level (Empower pattern).

### G8. Culture strand
- Solutions has a Culture lesson per unit [S]. We have none required.
- Recommend: one **Culture Clip** per Season as a E5/E6 option (original script, our cast; no third-party content).

### Already matching (keep)
- Big Remix every 2nd Season (Solutions cumulative reviews) [S].
- Zero-new-language review and finale sessions (E7, E8) with a make-something Release.
- "I can" self-check in Wrap (Solutions) [S].
- Daily 10 spaced return (Kinnu / Busuu patterns) [S-3rd].
- Goal-led personalisation through skins (marketplace goal tracks) [S-3rd].

## 6. Top 5 mechanics to adapt (our wording, not their content)

1. **Exam on-ramp in steps** (Prepare): 2 or 3 task types per Season, a "towards" Season at level end. Gap G1.
2. **Cumulative "I can" review every 2 units** (Solutions): we already have the shape; add the printable "I can" list for parents.
3. **Everyday-English lesson per unit** (Empower lesson C): E4 On Air stays; check it ends in a real exchange, not a drill.
4. **Per-skill numbers** (GSE): placement and the parent report. Gap G6.
5. **One tiny unit a day with automatic return of weak items** (Kinnu): Daily 10 already; make the "return" visible to the student ("3 words came back today").

## 7. Open checks for the owner (not done in this pass)

- Fetch and read the scope and sequence of one level of Empower, Solutions and Prepare (blocked here).
- Re-check the CEFR Companion Volume mediation scales at coe.int and the A2 and A1 guided-hour figures (A1 ~90-100 is **[U]**).
- Decide G2 (hours) and G1 (exam lane) first: both change what the parent page may promise.

## 8. Source list

- https://www.cambridge.org/us/cambridgeenglish/catalog/adult-courses/empower-2nd-edition [S]
- https://www.cambridge.es/en/catalogue/adults/courses/empower2ed [S]
- https://www.cambridge.org/prepare [S]
- https://www.cambridge.org/sites/default/files/media/documents/Prepare_brochure_update_Dec_2021_web.pdf [S]
- https://elt.oup.com/catalogue/items/global/teenagers/solutions_third_edition/ [S]
- https://elt.oup.com/catalogue/items/global/teenagers/solutions_third_edition/solutions_third_edition_intermediate/9780194504522?cc=global&selLanguage=en&mode=hub [S]
- https://www.eltngl.com:443/assets/downloads/life2e_pro0000009032/ame/LFE_SMP_AmE-2E_9781305986275_web.pdf [S-3rd]
- https://cornelsen.de/reihen/life-550001290000/second-edition-550001290002 [S-3rd]
- https://nyelvkonyvbolt.hu/en/shop/books-for-language-learning/language-learning/speakout-3rd-edition-a1-students-book-and-ebook-with-online-practice [S-3rd]
- https://www.pearson.com/english/about/gse/learning-objectives.html [S]
- https://www.pearsoncanadaschool.com/literacy/products/the-global-scale-of-english/gse-teacher-toolkit.html [S]
- https://www.pearson.com.hk/en_GB/about-us/news/20161129.html [S]
- https://learnenglishteens.britishcouncil.org/grammar/be/term [S]
- https://blog.duolingo.com/how-duolingo-teaches-english [S]
- https://duolingo.fandom.com/wiki/Intermediate_English [S-3rd, unverified count]
- https://learnenglish.life/reviews/busuu/ and https://www.learnenglish.life/compare/duolingo-vs-busuu/ [S-3rd, affiliate]
- https://learnenglish.life/compare/cambly-vs-italki-vs-preply/ [S-3rd, affiliate]
- https://www.whistleout.ca/CellPhones/Guides/kinnu-learning-app and https://www.legalcheek.com/?p=231265 [S-3rd]
- https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours [S]
- Our docs: `docs/academy-lesson-system.md`, `docs/academy-roadmap-v2.md`
