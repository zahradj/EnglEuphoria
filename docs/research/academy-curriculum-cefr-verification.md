# Academy curriculum vs CEFR - verification attempt (2026-10-14)

Scope: check the `canDo` lines in `src/curriculum/academy/levels/a1.ts..c1.ts` against CEFR / CEFR Companion Volume (CV 2020), Cambridge, British Council and Pearson GSE. Nothing in `src/` was edited.

## 0. Honest status - READ FIRST

**Page bodies could not be opened.** Every `WebFetch` call failed with `getaddrinfo ENOTFOUND` (coe.int, www.coe.int, rm.coe.int, cambridgeenglish.org, englishprofile.org, pearson.com, kcl.ac.uk). A raw `curl` through the proxy was blocked by the permission classifier, and I did not try to work around that. Only `WebSearch` worked, and it returns summaries, not page text.

So the evidence has three grades. Every claim below carries one marker:

- **[verified-search]** - confirmed by a WebSearch result (search summary quoting or describing the source). Not read on the page itself.
- **[paraphrase]** - written from model memory of CEFR/CV 2020. It is probably close, but it is NOT checked and must not be quoted as "official wording".
- **[could not open]** - the source page was not readable; no claim taken from it.

Nobody should treat section 2 as official text. The owner should have someone with browser access open the CV 2020 PDF (see URLs) and confirm the descriptors before the roadmap is edited. I invented no descriptors and no URLs; all URLs below came from search results.

## 1. Sources

| Source | URL (from search results) | Status |
|---|---|---|
| CoE global scale, Table 1 | https://www.coe.int/en/web/common-european-framework-reference%20languages/table-1-cefr-3.3-common-reference-levels-global-scale | listed by search; page [could not open] |
| CoE level descriptions | https://coe.int/en/web/common-european-framework-reference-languages/level-descriptions | listed by search; [could not open] |
| CEFR Companion Volume 2020 (PDF) | https://rm.coe.int/16809ea0d4 | listed by search; [could not open] |
| Pre-A1 provisional guide (Generalitat de Catalunya, secondary) | https://projectes.xtec.cat/lic-cce/wp-content/uploads/usu2122/2022/12/Nivell-pre-A1_provisional.pdf | listed by search; [could not open] |
| Hueber course mapping with Pre-A1 descriptor (secondary) | https://edit.hueber.de/media/36/LHUB_Beginner_SB_CEFR_Mapping.pdf | listed; snippet only |
| Pearson GSE Learning Objectives, Young Learners (6-14) | https://www.pearsoncanadaschool.com/content/dam/websites/pearson-canada-school/assets/documents/literacy/gse/gse-learning-objectives-young-learners.pdf | listed; [could not open] |
| Pearson GSE learning objectives hub | https://pearson.com/english/about/gse/learning-objectives.html | listed; [could not open] |
| Pearson GSE Texas K-12 brochure | https://www.pearson.com/content/dam/pearson-sites/shared/gse-texas-k12-brochure.pdf | listed; snippet only |
| Cambridge English "can do" | https://cambridgeenglish.org/why-choose-us/english-at-work/can-do | listed; [could not open] |
| KCL can-do grid (secondary) | https://www.kcl.ac.uk/language-centre/assets/can-do-statements-cefr.pdf | listed; [could not open] |
| British Council | no British Council page appeared in any search result; nothing taken from it | [could not open] / not found |

## 2. What each level is (global scale + what is new)

### What the searches did confirm

- **Pre-A1 is new in CV 2020.** The 2020 update added a Pre-A1 level, enriched A1 and the C levels, and replaced the 2001 descriptor set. [verified-search]
- **Six-level global scale, banded Basic (A1, A2), Independent (B1, B2), Proficient (C1, C2).** [verified-search]
- **A1 global wording:** "Can understand and use familiar everyday expressions and very basic phrases aimed at the satisfaction of needs of a concrete type." [verified-search, summary-quoted]
- **B2 global (start):** "Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in his/her field of specialisation." [verified-search]
- **C1 global (start):** "Can understand a wide range of demanding, longer texts, and recognise implicit meaning." [verified-search]
- **B1 listening descriptor:** main points of clear standard speech on familiar matters regularly encountered in work, school, leisure. [verified-search]
- **Cambridge exam mapping:** B1 = Preliminary, B2 = First, C1 = Advanced. [verified-search, from a 2013 CUP guide; exam names may have changed]
- **Pre-A1 production example:** "Can produce short phrases about themselves, giving basic personal information" (name, address, family, nationality). [verified-search, secondary source; check against CV]
- **Pearson GSE bands:** "Below A1" 10-21, A1 22-29 [verified-search, Texas K-12 brochure]. Young Learner objectives target ages 6-14 and run from below A1 up to high B1 [verified-search]. GSE Young Learner objectives therefore stop at about B1 and do not cover B2-C1 teens; for B2/C1 teens use GSE Learning Objectives for Academic English/general adults [paraphrase].

### Level by level (all [paraphrase] unless a marker above says otherwise)

| Level | Global scale (gist, not verbatim) | Teen-relevant key descriptors | NEW vs level below |
|---|---|---|---|
| **Pre-A1** | Very limited: recognises/uses isolated words and a few formulaic phrases, with heavy support (CV 2020 "Pre-A1" is a "tentative" band). | Understand a few familiar words/signs; say name, age, country; point and name objects; copy words; follow one-word instructions. Mostly recognition and copying. | (base level) words and set phrases, no sentence-making |
| **A1** | Familiar everyday expressions and very basic phrases for concrete needs; introduce self and others; ask/answer personal details; interact simply if the other person speaks slowly and helps. [first clause verified-search] | Reception: understand very short, slow, simple texts, signs, names; Production: simple phrases about where you live and people you know; Interaction: ask and answer about familiar topics; Mediation: relay very simple info (signs, prices) with help. | **Novel vs Pre-A1:** short simple sentences and questions; personal details exchanged; **understand** (not give) simple directions; very basic linear connectors ("and", "then"). |
| **A2** | Sentences and frequently used expressions on areas of immediate relevance (personal/family info, shopping, local area, employment); simple, routine exchanges; simply describe background and immediate environment. | Short simple messages and announcements; shopping/travel/food transactions; describe plans, past activities and personal experiences; give simple directions with a map; short invitations and suggestions; short social exchanges though not keeping a conversation going. | past events and experiences; plans; comparing; transactions beyond a single phrase; giving directions; linking with "and/but/because" |
| **B1** | Main points of clear standard input on familiar matters (work, school, leisure); deal with most travel situations; simple connected text on familiar/personal topics; describe experiences, events, dreams, hopes; briefly give reasons for opinions and plans. [listening clause verified-search] | Follow main points of TV/radio on familiar topics; write personal letters about experiences; start/maintain/close simple face-to-face conversation; tell a story or the plot of a book/film; relay simple info and ask for clarification (mediation). | **connected** discourse (not just sentences); coping with unpredictable situations; narrating; opinions with reasons; keep a conversation going; mediate simple texts |
| **B2** | Main ideas of complex text on concrete and abstract topics, including technical discussion in own field [verified-search]; interact with a degree of fluency and spontaneity with native speakers without strain; clear, detailed text on a wide range of subjects; explain a viewpoint giving advantages and disadvantages. | Follow extended speech; read articles on contemporary problems with viewpoints; take an active part in discussion, account for and sustain views; write essays/reports passing on information or arguing; summarise and relay for others (mediation). | **abstract** topics; spontaneity and fluency; sustained argument and detailed written text; mediating concepts and text |
| **C1** | Wide range of demanding, longer texts, recognise implicit meaning [verified-search]; express ideas fluently and spontaneously without obvious searching for expressions; flexible, effective language for social, academic, professional purposes; clear, well-structured, detailed text on complex subjects with organisational patterns, connectors, cohesive devices. | Understand implicit attitude, humour, register shifts; follow long specialised text; formulate ideas precisely and relate contributions to others; mediate sensitive/complex material, adapt register. | **implicit** meaning; fluency without searching; control of register, cohesion and style; mediation of complex content |

A1-A2 spoken interaction in CV 2020 is deliberately cautious (speaker must co-operate) [paraphrase]. For 13-18 contexts (school, phones, friends, hobbies, travel, study) the roadmap's themes are appropriate at every level; I did not need to alter any theme.

## 3. How the roadmap is built (observed in the repo)

- `a1.ts`: 10 Seasons; `a2.ts`: 12; `b1.ts`: 16; `b2.ts`: 16; `c1.ts`: 16. **There is no `pre-a1.ts` in `levels/`**, so Pre-A1 has no canDo lines to check. If Pre-A1 is on the roadmap it lives elsewhere (not searched, to stay inside the assignment scope).
- Most canDo lines are 2 per Season. Many B1-C1 lines are written as **grammar targets** ("use inversion", "choose between the present perfect and the past simple") rather than as functions. CEFR descriptors never say "use structure X"; they say what you do with the language. This is not "wrong" for a grammar syllabus, but the lines are not CEFR can-dos [paraphrase].
- Season ids are not shown in the level files (they carry a `title`); I cite **Level S# (title)** with the 1-based order in the file.

## 4. Season-by-season verdicts (judgement from the descriptors in section 2 [paraphrase]; none of this is from an opened source)

Marker legend: OK = in band; HIGH = above band; LOW = below band; DUP = duplicates a line elsewhere.

### A1
- S7 Treasure Map Town: "I can ask for and give simple directions." **HIGH.** Giving directions is A2 (understanding simple directions is A1). Fix: "I can understand simple directions and ask where a place is."
- S8 Can Do!: "...join two ideas with and or but." **Slightly HIGH.** A1 linking is "and", "then"; "but" is A2. Fix: "...join two ideas with and."
- S10 Right Now: "ask and answer simple questions with who, what, where, when and why." **Slightly HIGH** ("why" answers need because). Fix: "...with who, what, where and when."
- S1-S6, S9: OK for A1. S5 "talk about my school day" is OK only as a list of set phrases and times.
- Age-band note: the repo says Academy A1 revises hello/numbers/countries fast. S1 canDo ("say hello, name, age, country") is fine as a canDo but is exactly the content the CLAUDE.md says a 13-18 student already knows. Fix (optional): "I can introduce myself and a friend and ask three follow-up questions."

### A2
- S2 Travel Trouble: "tell a simple story about a trip" **OK** (A2 describes past activities). Fine.
- S8 Getting Around: "explain how to get from one place to another" **OK** (directions are A2 - this is where A1 S7 should hand over).
- S9 Tomorrow's World: "make simple predictions" **OK**.
- S11 Dream Jobs: "describe a job and the skills it needs" **mildly HIGH** (work description is A2, "skills it needs" is B1). Fix: "I can say what a job is and what the person does every day."
- Others OK.

### B1
- S4 Breaking News: "choose between the present perfect and the past simple" **not a can-do (grammar task).** Fix: "I can report recent news and say when it happened."
- S5 If This, Then That: OK.
- S7 Made in the World: OK (B1 can follow a simple process text).
- S10 Plans and Promises: second line is thin. Fix: "I can make arrangements and promises and say what I think will happen."
- S14 Wish List: "express feelings about things I cannot change" **OK/slightly HIGH** (B1+). Keep.
- S16 Teen Talk Show: "use common phrasal verbs naturally" **overstated for B1**. Fix: "I can use common phrasal verbs in everyday talk and keep a conversation going."
- S3 Still Going: **narrow** (a single structure). Suggest: "I can tell how long I have done something and why it matters now."
- Others OK.

### B2
- S1 Been There, Doing That: **OK** for the function; the grammar (present perfect continuous) is B1, which is a mild mismatch (the line reads B2, the structure reads B1). Keep.
- S2 What Might Have Been: third conditional + "express regret, relief and criticism" **OK** (B2 range).
- S12 The Big Picture: "give emphasis ... structure a talk to guide the listener" **OK** (cleft sentences and discourse markers B2).
- S13 Cut the Words: participle clauses and ellipsis **borderline C1**. Fix: "I can write more concisely using participle clauses and edit my own text for clarity."
- S14 As Much As: **OK**.
- S15 Say It Clearly: mediation relay **OK**; *DUP* with C1 S13.
- S16 Debate League: **OK** (B2 argument).
- Others OK.

### C1
- S2 Had I Known: "inverted and mixed conditionals" - mixed conditionals are B2; inverted is C1. Fix: keep, but mark mixed as review: "I can use inverted conditionals to speculate about past and present possibilities."
- S3 They Say...: "evaluate how reliable a source is" **OK**.
- S6 What Matters Is...: cleft and fronted **DUP** with B2 S12 (emphasis). Fix: make C1 about stylistic effect: "I can choose between cleft, fronted and plain versions for a writer's purpose."
- S7 Having Said That: perfect participle clauses **DUP** with B2 S13. Fix: "I can use reduced relatives and perfect participles only where they improve clarity."
- S9 Formal or Not?: **DUP** with S2 ("adapt register for a formal audience") and S5 formal/plain. Fix S2's second line to a different function.
- S13 Mediating Worlds: **DUP** with B2 S15. CV 2020 distinguishes mediating *texts*, *concepts* and *communication*; C1 should be "sensitive" and "complex". Fix: "I can mediate sensitive or complex discussions, adapt tone and summarise decisions for each side."
- S15 Wit and Irony: **OK, near C2 for "use ... tactfully"**; keep "recognise" at C1 and soften "use".
- S16 Capstone Portfolio: **OK**.

## 5. Short correction table

| # | Level / Season | Current line (shortened) | Problem | Suggested line |
|---|---|---|---|---|
| 1 | A1 S7 Treasure Map Town | "ask for and give simple directions" | Giving directions is A2 | "I can understand simple directions and ask where a place is." |
| 2 | A1 S8 Can Do! | "join two ideas with and or but" | "but" is A2 | "I can join two ideas with and." |
| 3 | A1 S10 Right Now | "...who, what, where, when and why" | "why" above A1 | "...who, what, where and when." |
| 4 | A2 S11 Dream Jobs | "job and the skills it needs" | skills is B1 | "I can say what a job is and what the person does every day." |
| 5 | B1 S4 Breaking News | "choose between present perfect and past simple" | grammar task, not a can-do | "I can report recent news and say when it happened." |
| 6 | B1 S10 Plans and Promises | "promises and simple predictions" | thin | "I can make arrangements and promises and say what I think will happen." |
| 7 | B1 S16 Teen Talk Show | "phrasal verbs naturally" | "naturally" is B2+ | "I can use common phrasal verbs in everyday talk and keep a conversation going." |
| 8 | B2 S13 Cut the Words | participle clauses and ellipsis | borderline C1 | "I can write more concisely using participle clauses." |
| 9 | C1 S2 Had I Known | "inverted and mixed conditionals" | mixed is B2 | "I can use inverted conditionals to speculate about past and present." |
| 10 | C1 S6 What Matters Is... | cleft/fronted | repeats B2 S12 | "I can choose between cleft, fronted and plain forms for effect." |
| 11 | C1 S7 Having Said That | perfect participles / reduced relatives | repeats B2 S13 | "I can use reduced relatives only where they improve clarity." |
| 12 | C1 S13 Mediating Worlds | "mediate between speakers..." | repeats B2 S15 | "I can mediate sensitive or complex discussions and adapt tone for each side." |
| 13 | C1 S15 Wit and Irony | "use them tactfully" | "use" is C2 | "I can recognise irony and understatement and explain how tone changes meaning." |

## 6. Recommended next steps

1. A person with browser access opens the CV 2020 PDF (https://rm.coe.int/16809ea0d4) and confirms the global scale, the Pre-A1 band and the mediation scales, then the verdicts in section 4 can be promoted from [paraphrase] to verified.
2. Decide whether B1-C1 canDo lines should be rewritten as functions (preferred by CV 2020) with the grammar target moved to `structures`.
3. Confirm where Pre-A1 lives in the repo; no canDo lines for it were found in `levels/`.
4. Update `docs/academy-roadmap-v2.md` to say these verdicts are still unverified until step 1.
