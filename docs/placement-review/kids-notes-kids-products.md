# Kids English product placement and level-check design (ages 4-9, many non-readers)

Method note: about 20 tool calls. Many commercial products (Novakid, VIPKid, Gogokid, Cambly Kids, Lingoda Juniors, ABCmouse, Little Fox, Pinkfong, LingoAce, Hello Pal, Duolingo ABC) have no public placement documentation I could find; they are listed under Gaps rather than guessed.

## 1. Early-literacy screeners for non-readers (Reading Eggs, Lexia, Raz-Kids, Heggerty, DIBELS, EGRA): task sequence, length, items, stop rules

### Takeaway
Non-reader screeners use short, sub-skill-by-sub-skill tasks (rhyme, first sound, blending, segmenting; letter names/sounds) with a very early discontinue rule (3-5 wrong or zero-correct items) so a child who cannot do a skill never sits through frustrating items. Adaptive commercial tools (Reading Eggs, Lexia) stop on a few errors and place the child on a lesson map; they place by phonics/letter knowledge, not by "English level".

### Cited Findings
- Heggerty Kindergarten Phonemic Awareness Baseline: tasks in order = rhyme recognition (5 items, yes/no), rhyme production (5), isolate initial sound (5), blend compound words and syllables (6), isolate final sound (5), segment compound words/syllables (6), plus further blending/segmenting/deletion tasks (5-6 items each). Each task starts with a teacher-modelled example, then "Now it's your turn". Pacing/stop rules: if the child cannot answer within 4 seconds, move to the next word; "You may discontinue the skill if there are no correct responses within the first 3 words." Scored +/- per item, ___/5 or ___/6 per skill. Wrong answers get a gentle model-and-repeat ("Say it back to me"). — [Heggerty KDG Baseline Assessment (PDF)](https://heggerty.org/wp-content/uploads/2020/07/KDG-Baseline-Assessment.June-25-2020.pdf) (read via local PDF text extraction)
- DIBELS 8 kindergarten subtests: Letter Naming Fluency, Phonemic Segmentation Fluency, Nonsense Word Fluency, Word Reading Fluency (Initial Sound Fluency and First Sound Fluency were dropped in the 8th edition). Hesitation rule: after 3 seconds the examiner supplies the letter (LNF) or marks incorrect and says "Keep going" (NWF), so one stuck item never stalls the child. — [DIBELS 8 vs Previous Editions](https://dibels.amplify.com:443/docs/dibels/DIBELS-8-vs-Previous-Editions-Admin-Scoring.pdf)
- DIBELS 8 gating across subtests: beginning of kindergarten, if PSF is discontinued do not give NWF and WRF; mid-kindergarten, if NWF is discontinued do not give WRF. Same source. A search-result summary says PSF is discontinued if no sounds are correct in the first 5 words (not verified in the guide text, PDF unparseable) — [DIBELS 8 admin guide](https://dibels.uoregon.edu/sites/default/files/2026-07/dibels8_admin_scoring_guide.pdf)
- Reading Eggs placement (main program): result is a starting lesson on a 120-lesson map with explicit "what do they know" bands: lesson 1 = no prior knowledge (letters m,s,a,t,b,c,f,i first); lessons 11/21/31 = knows 8/14/19 letters and reads am/at/ap/an words; 41-80 = "Emergent Reader" (all letters, short vowel /a/ and long /ee/ CVC words, then CVCC, then all short vowels); 81-120 = "Early Reader". — [Reading Eggs Placement Test Overview (PDF)](https://marketing-cdn.3plearning.com/uploads/docs/user-guides/reading-eggs/Reggs_REX_PlacementTest.pdf)
- Reading Eggs placement test: up to 60 questions, "will automatically end after three incorrect answers", may take several short sessions; parents may explain what a question asks but not give answers; the first attempt partly teaches how to use the app, so kids may be placed too low and a retake is advised. (Wording came from a search snippet of the Reading Eggs knowledge base page; the page title concerns Reading Eggspress, so applicability to the main Reading Eggs test is slightly uncertain.) — [Reading Eggs KB](https://kb.readingeggs.com/does-reading-eggspress-have-a-placement-test)
- Reading Eggs Fast Phonics placement uses voice recognition: the child reads a series of words aloud, scored automatically, placing into one of 20 "Peaks"; starts on first login after a sound/microphone check; parents can reset it; framing "there are no right or wrong ways for your child to answer". Number of words and stop rules not published. — [Reading Eggs Fast Phonics placement test](https://readingeggs.co.za/news/2021/12/14/fast-phonics-placement-test/)
- Lexia Core5 Auto Placement: "generally takes less than 20 minutes", progress saves so it need not be finished in one sitting, brief audio intro, ends with a neutral "Good Job!" message; kindergarten = Levels 6-9 of 21; place-out at 90% or higher in Level 21. Item types and adaptive branching are not in the FAQ. — [Lexia community FAQ](https://community.lexialearning.com/core5-faq-85/core5-auto-placement-faq-student-experience-804); K levels per [third-party Lexia level guide](https://alumni.caelum.com.br/guide-lexia-core5-levels-mapping-v4vv.html)
- Raz-Kids / Reading A-Z: no auto-placement quiz for emergent readers; the teacher starts a Running Record benchmark at the child's age/grade level; the child records themselves reading, records a retelling, then takes a comprehension quiz; Benchmark Books for K-1 were removed from the platform, Benchmark Passages remain. Teacher-confirmed and reading-based. — [Reading A-Z help: finding a student's level](https://help.learninga-z.com/en/articles/7025909-finding-a-student-s-level-on-raz-kids); [Benchmark books and passages](https://help.learninga-z.com/en/articles/11688742-benchmark-books-and-passages)
- EGRA (RTI/USAID) subtasks relevant to non-readers: listening comprehension (story plus questions), letter identification (grid, as many as possible in a minute), initial sound identification, nonword reading, oral reading, dictation, vocabulary. Exact discontinue rule not retrieved. — [EGRA Toolkit revision](https://tcg.uis.unesco.org/wp-content/uploads/sites/4/2022/11/WG_GAML_17_UISAID-EGRA-Toolkit-Revision_final.pdf) (search snippet only)

### Inferences
- A workable computer-run non-reader sequence mirrors Heggerty/DIBELS order of difficulty (listen-and-tap letter/sound, first sound, blend, read CVC), about 5 items per skill, with a stop rule of 3 wrong in a row (Reading Eggs) or 0 of the first 3 (Heggerty), then skip to the next skill domain rather than ending the whole test.
- Output is best expressed like Reading Eggs: a named band ("knows 14 letters, reads am/at words") that parents and teachers understand, not a bare score.
- A practice/example item per task is the cheap fix for "first attempt is learning the UI"; Cambridge and Heggerty both model an example first.

### Gaps
- Exact DIBELS time limits, Lexia item types and adaptive branching, EGRA discontinue rule: primary PDFs not parseable or not public.
- Reading Eggs Junior (ages 2-4): no documented placement test found.

## 2. EFL kids teacher-led level checks (VIPKid/Novakid style) vs what a computer can do

### Takeaway
Live-teacher platforms generally place in the trial lesson by teacher judgement plus age, with no public formal test; I found no verified item lists for VIPKid/Gogokid/Novakid. The most concrete public spec of what a Pre-A1/A1 child "can do" is Cambridge's can-do statements, which map directly onto computer-checkable item types.

### Cited Findings
- Novakid: at the trial lesson the teacher determines level considering age and knowledge; levels = Pre-K (0), Juniors (1), Starters (2), Movers (3), Flyers (4), Time2Talk (5), Virtual Explorer (6), CEFR Pre-A1 to B1; one Trustpilot review says no placement test is conducted at the start. — [Trustpilot Novakid](https://au.trustpilot.com/review/novakid.com.tr); [learnenglish.life guide](https://learnenglish.life/reviews/novakid/) (reviews/third party, not Novakid primary)
- VIPKid: Pre-A1 = Level 1 and Level 2; ages 3-16; no public placement details found. — [App Store listing](https://apps.apple.com/app/id1602493727)
- A smaller online school (CSV English) shows the typical pattern: optional online questionnaire (reading, writing sample, speaking confidence), a 25-minute trial class where the teacher judges speaking/listening, reading, writing, vocabulary/grammar, then parents receive a placement report with a recommended level. Example of the model, not VIPKid. — [CSV English class placement](https://sites.google.com/csvenglish.com/csv-english/trial-class/class-placement)
- Cambridge Pre A1 Starters can-do: understand letters of the alphabet when heard; simple spoken instructions in short phrases; simple spoken questions about self (name, age, favourite things, routine); simple spoken descriptions of people/objects; very short conversations; name familiar people/things (family, animals, school, household objects); basic descriptions (how many, colour, size, location); respond with single words or yes/no; read very simple sentences incl. questions; follow short picture stories; write own name; copy words; spell some simple words. — [Cambridge Pre A1 Starters Digital / A1 Movers Digital Can Do (PDF)](https://cambridgeenglish.org/es/Images/722674-can-do-statements-for-pre-a1-starters-digital-and-a1-movers-digital.pdf)
- Cambridge A1 Movers can-do: understand simple dialogues/stories with picture help; agree/disagree in short phrases; answer simple questions in phrases and sentences; tell a simple story from pictures; read short simple stories with pictures; write short phrases and sentences. Same source.
- Starters Digital format: Listening 5 tasks / 20 questions (max 40 min); Reading and Writing 5 tasks / 25 questions (max 25 min); Speaking 3-5 min, 4 tasks, face to face with examiner (scene pictures, object cards, personal questions); results in "shields" (max 5 per component); each task starts with an example. Listening task types: minimal differences (choose 1 of 3 pictures), story scene, note-taking, interactive dialogue, picture editing (drag/drop, colour with digital crayons). Audio played twice in most tasks. — [Cambridge Starters Digital test format](https://www.cambridgeenglish.org/exams-and-tests/starters-digital/test-format); [listening-task summary](https://www.cambridgeenglish.org/fr/exams-and-tests/starters-digital/test-format)

### Inferences
- Computer-feasible (audio prompt, tap/drag, no reading): hear a word and tap the picture (colours, numbers, animals, family, objects); hear an instruction and act on screen (drag the cat onto the box tests "Where is"); hear "What colour...?" and pick; hear a letter name and tap the letter; minimal-difference picture pairs (Cambridge Task 1 style).
- Not reliably computer-checkable without ASR: naming things aloud, "What is this?", personal questions, "I can..." production, speaking confidence. These need a teacher or staged ASR; Reading Eggs Fast Phonics shows voice-recognition scoring of single read words is commercially deployed.
- Reading/writing items (read words, spell, copy name) should be gated behind letter-knowledge evidence, since Pre-A1 only expects copying and spelling "some" simple words.

### Gaps
- No verified item lists for VIPKid, Gogokid, Novakid, Cambly Kids, Lingoda Juniors, LingoAce, Hello Pal Kids teacher level checks; teacher-forum material not retrieved.

## 3. Level bands and signposts (Pre-A1 / A1 / A2) and how consumer apps route

### Takeaway
Consumer apps (Lingokids, Khan Academy Kids) mostly route by parent-entered age, then adapt silently; programme providers use Cambridge-aligned names (Starters/Movers/Flyers = Pre-A1/A1/A2). Usable signposts come from Cambridge can-do statements and Reading Eggs "what they know" bands.

### Cited Findings
- Lingokids: parent enters age; content levels Beginner (3 and under), Intermediate (4-6), Advanced (7+); algorithm gradually raises difficulty; "no level to set". — [Lingokids help centre](https://help.lingokids.com/hc/en-us/articles/360019924937-How-do-I-know-what-my-kid-s-level-is) (my direct fetch returned 403; taken from search result text)
- Khan Academy Kids: ages 2-8; set the child's age at setup; the Learning Path picks activities by age, level and previous performance; parents may need to adjust level per subject. — [Khan Kids community post](https://support.khanacademy.org/hc/ka/community/posts/19708598827021-Khan-Kids-how-to-adjust-for-different-reading-math-levels); [Khan Kids ELA](https://www.khanacademy.org/kids/ela)
- Cambridge YLE: Starters (Pre A1), Movers (A1), Flyers (A2); for ages 7-12 as described; whole exam under about an hour. — [Pre A1 Starters overview](https://www.hau.gr/en-us/exams/language-certifications/university-of-cambridge/pre-a1-starters) (third-party exam centre)
- Reading Eggs bands: no letters; some letters plus am/at; all letters plus CVC (emergent); all consonants/short vowels plus CVCC and digraphs (early). — [Reading Eggs placement overview](https://marketing-cdn.3plearning.com/uploads/docs/user-guides/reading-eggs/Reggs_REX_PlacementTest.pdf)
- Starters vs Movers difference per Cambridge can-do: single words and yes/no vs phrases, sentences, dialogues and short picture stories (section 2 source).

### Inferences
- Parent-friendly signposts mapped to sources: Pre-A1 = answers with single words/yes-no, follows one-step instructions, names classroom/family/animal objects, knows letter names, writes own name; A1 = answers in short phrases/sentences, follows a picture dialogue, reads short picture stories, writes short phrases. A "knows 50 words" threshold has no cited source; I found no verified word-count threshold.
- Age alone is a weak router for EFL (bilingual 4-year-old vs beginner 9-year-old), so age should set the entry point of the check, not the result.

### Gaps
- No verified word counts for Starters/Movers lists; no routing rules for ABCmouse, Little Fox, Pinkfong, Duolingo ABC, Hello Pal, LingoAce.

## 4. Failure modes of picture-only placement and fixes

### Takeaway
Evidence specific to EFL apps is thin, but general research shows pictures are not neutral stimuli (familiarity with pictorial representation, culturally specific objects, dialect), and vendor documentation shows first-attempt UI-learning effects and a parent-help concern.

### Cited Findings
- Kenyan low/middle-income children (n=192, ages 2-7) did better on an object vocabulary task than a picture vocabulary task (beta 0.07, p<.001); US middle/high-income children (n=96, ages 2-3) did equally well on both (beta 0.02, p=.60). Conclusion: picture assessments can underestimate ability where picture experience is limited. — [RTI: validity of picture-based assessments across cultures](https://www.rti.org/publication/investigating-the-validity-of-picture-based-assessments-across-cu)
- PPVT adapted for Madagascar: over half of items showed unexpected response variation and bias linked to local dialect. — [PMC4382173](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4382173/) (via search summary)
- PPVT-III with Maori children in New Zealand: documented cultural bias in items. — [Lime Network summary](https://limenetwork.net.au/resources-hub/resource-database/cultural-biases-in-the-peabody-picture-vocabulary-test-iii-testing-tamariki-in-a-new-zealand-sample/) (title only; findings not read)
- Reading Eggs: first attempt partly measures learning the interface so children can be placed too low; retake advised; parents told not to supply answers. — [Reading Eggs KB](https://kb.readingeggs.com/does-reading-eggspress-have-a-placement-test)
- Cambridge Starters design mitigations: every task starts with an example; audio repeated (twice; unlimited in one task); minimal-difference pictures. — [Cambridge format](https://www.cambridgeenglish.org/exams-and-tests/starters-digital/test-format)

### Inferences
- Guessing: 3 picture options give 33% chance, 4 options 25%. Counter with (a) requiring 2 of 3 correct per band before moving up, (b) testing the same target word in two different formats, (c) the 3-miss stop rule, (d) never deriving a level from a single item.
- Picture ambiguity/cultural bias: avoid items needing culture-specific knowledge (holiday objects, regional food, animals not local); log per-item accuracy by country and run differential item functioning checks, as the PPVT literature does.
- Ceiling effects for readers/older kids: not found in sources; inference that a picture-only test caps A1+ children, so a branch offering short read-and-tap sentences once letters are known (Reading Eggs style) is needed.
- Parent help: no EFL-specific evidence found. Mitigations: ask a parent to sit but stay silent (Reading Eggs wording), mascot reads every instruction aloud so the child does not need the parent, label result "starting point, re-checked in the first lessons".

### Gaps
- No documented case studies of Lingokids/Novakid-type picture placement failures, nor measured effects of parent help or guessing in kids EFL apps.

## 5. Gamified yet valid placement

### Takeaway
Documented practice: neutral completion messaging, example-first tasks, saved progress, short sittings, and "no right or wrong" framing. Specific mascot/star mechanics below are design inference, not drawn from a verified product source.

### Cited Findings
- Lexia: audio introduction, a visual cue that placement mode is active, neutral "Good Job!" at the end, saves progress, usually under 20 minutes. — [Lexia FAQ](https://community.lexialearning.com/core5-faq-85/core5-auto-placement-faq-student-experience-804)
- Reading Eggs Fast Phonics: "there are no right or wrong ways for your child to answer" framing. — [Reading Eggs](https://readingeggs.co.za/news/2021/12/14/fast-phonics-placement-test/)
- Cambridge Starters: results as "shields" (max 5 per skill) and child-friendly digital tasks (drag-and-drop, colouring with digital crayons). — [Cambridge format](https://www.cambridgeenglish.org/exams-and-tests/starters-digital/test-format)
- Heggerty: wrong answers get a gentle model-and-repeat and 4-second pacing. — [Heggerty PDF](https://heggerty.org/wp-content/uploads/2020/07/KDG-Baseline-Assessment.June-25-2020.pdf)

### Inferences
- Stars awarded for trying (effort), identical for correct and wrong answers, preserve validity because the child cannot learn which answers earn reward; silence or a neutral tap sound on every answer avoids a "wrong" sound that can cause quitting or answer-switching.
- Mascot voices every instruction (non-readers), plays the example first, and ends each 3-5 item section with a visible progress marker; sections of about 5 minutes with save-and-resume (Lexia).
- Stop each skill after 3 misses (Reading Eggs/Heggerty) but keep the mascot cheerful and move on, so children rarely experience failure.
- Include one oral-production check (record a word, ASR or teacher review later) as a flagged optional item rather than a gate.

### Gaps
- No source found on reward-design effects on placement validity, or on 5-minute section length for ages 4-9.

## Overall gaps
Public placement documentation absent for: Cambly Kids, Lingoda Juniors, LingoAce, Hello Pal Kids, ABCmouse, Little Fox, Pinkfong, Duolingo ABC, Gogokid. Several PDFs (DIBELS 8 admin guide, EGRA toolkit) could not be fully parsed, so time limits and the EGRA discontinue rule are unverified. Teacher-forum evidence for VIPKid/Novakid level tests was not retrieved.
