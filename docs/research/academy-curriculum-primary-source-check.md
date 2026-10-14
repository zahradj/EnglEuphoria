# Academy curriculum — primary-source check (2026-10-14)

Re-run of the verification after the network was opened. **What could and could not be opened:**

| Source | Result |
|---|---|
| CEFR Companion Volume 2020 (coe.int, rm.coe.int) | **Blocked** — Cloudflare bot check (HTTP 403). Not bypassed. Can-do wording is therefore still **unverified**. |
| English Grammar Profile / English Vocabulary Profile (englishprofile.org) | EGP page is a JavaScript app (curl gets 404 shell); EVP host unreachable. |
| Pearson GSE toolkit (english.com), British Council LearnEnglish, Oxford (oup.com) | Unreachable or blocked. |
| Cambridge English CEFR page, Pearson pages, Wikipedia | Opened, but only marketing/overview text (no descriptor tables). |
| **CEFR-J Grammar Profile 20180315 and Vocabulary Profile 1.5** (Tono Laboratory, Tokyo University of Foreign Studies; `openlanguageprofiles/olp-en-cefrj`, free with citation) | **Opened and used.** Each grammar row lists CEFR-J level plus Core Inventory, EGP and GSE levels, so EGP/GSE values here are second-hand. |

Limits: CEFR-J was built for Japanese learners of English, so its levels are often conservative (e.g. *friendly* B2). Treat it as strong evidence for ordering, weak evidence for exact single words. It is not the Cambridge English Vocabulary Profile.

## Grammar: what the data says (applied in `structureLevels.ts`)

| Structure | Data (CEFR-J / EGP / GSE) | Result |
|---|---|---|
| be, possessives, there is/are, prepositions, present simple, imperatives, can, present continuous | A1.x across all columns | confirmed at A1 |
| past of be | CEFR-J A1.3, EGP A1 | floor A2 kept; may appear as a chunk late in A1 |
| comparatives / superlatives | -er A1.3, more A2.2, -est A1.1, most A2.1 | A2 confirmed |
| going to, should, have to, will (decisions) | A2.1–A2.2 | A2 confirmed |
| too / enough | too + adj GSE A2; enough + adj CEFR-J B2.1, EGP B1–C1 | split: *too* A2, full *enough* B1 |
| much/many vs (a) few/(a) little | much A2.2; few/little EGP B1–B2 | A2 limited to much / many / a lot of |
| used to | B1.1 / B1 / B1 | B1 confirmed (a search snippet had suggested B2 — **contradicted**) |
| present perfect continuous | B2.1 / B1–C2 / B2 | B2 confirmed (a snippet suggested B1 — **contradicted**) |
| second conditional | B1.2 / A2–B2 / B2 | B1 confirmed |
| third conditional | CI B1–C1, EGP C1, GSE B2 | B2 confirmed |
| past perfect | B1.2 | B1 confirmed |
| reported statements | say A2.2, tell B1.2, EGP B2 for backshift | B1 kept; backshift limited until after the past-perfect Season |
| embedded questions | know/wonder + wh- A2.1–B1.1; ask/tell + wh- B1.1 | floor B1; must come **before** B2 Season 4 reported questions |
| causative have/get, non-defining relatives, participle clauses | B2.2 / B2 / C1 | B2 confirmed |
| mixed conditionals, cleft, subjunctive, rhetorical and pragmatic items | not in the dataset | **still unverified** |

## Gaps fixed in the A1 spine (via the `use` field, no new Season)
The data lists these at A1 but no A1 Season taught them: articles *a / an / the* and plural nouns (CEFR-J A1.1), object pronouns (A1.1), and wh-questions (What/How A1.1, Why A1.2, Where A1.3). They are now sub-uses of: A1 S01 `be-present` (wh-chunks), A1 S02 `there-is-are` (articles, plurals), A1 S06 `possessive-s` (object pronouns). Season 10 still teaches full question word order.

## Still open (needs a person with access to the sources)
- Order problems in the roadmap that need Season moves (not just notes): B1 S12 vs S13 (reported statements before past perfect — scoped down for now), B2 S04 vs S09 (reported vs embedded questions), `will` at A2 S09 and B1 S10 (now documented as different sub-uses).
- The 13 can-do corrections in `academy-curriculum-cefr-verification.md` stay **unapplied**: they rest on memory because the Companion Volume could not be opened.
- Vocabulary: see below.

## Vocabulary level flags (CEFR-J vs our item banks)
Single words only, compared with the level we tag each item. Counts of words CEFR-J places at least one level **above** our tag: A1 81 of 569 matched, A2 147 of 560, B1 32 of 346, B2 14 of 821, C1 23 of 467. Many are real (*gym*, *artist*, *passport*, *routine*, *sometimes*, *project*), some reflect the Japanese-learner bias (*friendly*, *north/south*). **Nothing was retagged**: the item validator requires an item level not above its Season, and the right reference is the Cambridge English Vocabulary Profile, which could not be opened. The list for review follows.

```
A1-S01 online: ours A1, CEFR-J A2
A1-S01 member: ours A1, CEFR-J A2
A1-S01 country: ours A1, CEFR-J A2
A1-S02 upstairs: ours A1, CEFR-J A2
A1-S02 downstairs: ours A1, CEFR-J A2
A1-S02 plant: ours A1, CEFR-J A2
A1-S03 interest: ours A1, CEFR-J A2
A1-S03 popular: ours A1, CEFR-J A2
A1-S03 hate: ours A1, CEFR-J A2
A1-S03 gym: ours A1, CEFR-J B1
A1-S03 museum: ours A1, CEFR-J A2
A1-S03 lose: ours A1, CEFR-J A2
A1-S03 artist: ours A1, CEFR-J B1
A1-S03 dancer: ours A1, CEFR-J A2
A1-S03 chart: ours A1, CEFR-J A2
A1-S03 film: ours A1, CEFR-J A2
A1-S03 sound: ours A1, CEFR-J A2
A1-S04 menu: ours A1, CEFR-J A2
A1-S04 customer: ours A1, CEFR-J A2
A1-S04 thirsty: ours A1, CEFR-J A2
A1-S04 bill: ours A1, CEFR-J A2
A1-S04 carrot: ours A1, CEFR-J A2
A1-S04 onion: ours A1, CEFR-J A2
A1-S04 salt: ours A1, CEFR-J A2
A1-S04 euro: ours A1, CEFR-J A2
A1-S04 pound: ours A1, CEFR-J B1
A1-S05 routine: ours A1, CEFR-J B1
A1-S05 relax: ours A1, CEFR-J A2
A1-S05 sometimes: ours A1, CEFR-J B1
A1-S05 geography: ours A1, CEFR-J B1
A1-S05 exam: ours A1, CEFR-J A2
A1-S06 teenager: ours A1, CEFR-J A2
A1-S06 visitor: ours A1, CEFR-J A2
A1-S06 blonde: ours A1, CEFR-J A2
A1-S06 friendly: ours A1, CEFR-J B2
A1-S06 actress: ours A1, CEFR-J B1
A1-S07 road: ours A1, CEFR-J A2
A1-S07 village: ours A1, CEFR-J A2
A1-S07 north: ours A1, CEFR-J A2
A1-S07 south: ours A1, CEFR-J A2
A1-S07 east: ours A1, CEFR-J A2
A1-S07 west: ours A1, CEFR-J A2
A1-S07 follow: ours A1, CEFR-J A2
A1-S07 center: ours A1, CEFR-J A2
A1-S07 market: ours A1, CEFR-J A2
A1-S07 university: ours A1, CEFR-J A2
A1-S07 far: ours A1, CEFR-J A2
A1-S07 opposite: ours A1, CEFR-J A2
A1-S07 traffic: ours A1, CEFR-J A2
A1-S07 journey: ours A1, CEFR-J A2
A1-S07 across: ours A1, CEFR-J A2
A1-S07 passport: ours A1, CEFR-J B1
A1-S07 flight: ours A1, CEFR-J A2
A1-S07 tourist: ours A1, CEFR-J A2
A1-S07 capital: ours A1, CEFR-J A2
A1-S07 kilometer: ours A1, CEFR-J A2
A1-S07 meter: ours A1, CEFR-J A2
A1-S07 mile: ours A1, CEFR-J B1
A1-S07 space: ours A1, CEFR-J A2
A1-S08 project: ours A1, CEFR-J B2
A1-S08 success: ours A1, CEFR-J A2
A1-S08 amazing: ours A1, CEFR-J B1
A1-S08 fantastic: ours A1, CEFR-J A2
A1-S08 perfect: ours A1, CEFR-J A2
A1-S09 cheap: ours A1, CEFR-J A2
A1-S09 enough: ours A1, CEFR-J A2
A1-S09 sweater: ours A1, CEFR-J A2
A1-S09 boot: ours A1, CEFR-J B1
A1-S09 hundred: ours A1, CEFR-J A2
A1-S09 thousand: ours A1, CEFR-J A2
A1-S09 million: ours A1, CEFR-J A2
A1-S09 cent: ours A1, CEFR-J A2
A1-S09 cost: ours A1, CEFR-J A2
A1-S09 style: ours A1, CEFR-J A2
A1-S10 report: ours A1, CEFR-J A2
A1-S10 blog: ours A1, CEFR-J B1
A1-S10 website: ours A1, CEFR-J A2
A1-S10 text: ours A1, CEFR-J A2
A1-S10 send: ours A1, CEFR-J A2
A1-S10 fall: ours A1, CEFR-J A2
A1-S10 return: ours A1, CEFR-J A2
A2-S01 suddenly: ours A2, CEFR-J B1
A2-S01 scared: ours A2, CEFR-J B1
A2-S01 immediately: ours A2, CEFR-J B1
A2-S01 prize: ours A2, CEFR-J B1
A2-S01 score: ours A2, CEFR-J B1
A2-S01 incredible: ours A2, CEFR-J B1
A2-S01 beat: ours A2, CEFR-J B1
A2-S01 celebrity: ours A2, CEFR-J B1
A2-S01 airline: ours A2, CEFR-J B1
A2-S02 sail: ours A2, CEFR-J B2
A2-S02 ocean: ours A2, CEFR-J B1
A2-S02 railway: ours A2, CEFR-J B1
A2-S02 platform: ours A2, CEFR-J B1
A2-S02 engine: ours A2, CEFR-J B1
A2-S02 tourism: ours A2, CEFR-J B1
A2-S02 route: ours A2, CEFR-J B2
A2-S02 scary: ours A2, CEFR-J B1
A2-S02 luggage: ours A2, CEFR-J B1
A2-S02 souvenir: ours A2, CEFR-J B1
A2-S02 series: ours A2, CEFR-J B1
A2-S02 chip: ours A2, CEFR-J B2
A2-S03 laptop: ours A2, CEFR-J B2
A2-S03 tablet: ours A2, CEFR-J B1
A2-S03 device: ours A2, CEFR-J B1
A2-S03 digital: ours A2, CEFR-J B1
A2-S03 electronic: ours A2, CEFR-J B1
A2-S03 network: ours A2, CEFR-J B1
A2-S03 available: ours A2, CEFR-J B1
A2-S03 recommend: ours A2, CEFR-J B1
A2-S03 user: ours A2, CEFR-J B2
A2-S03 data: ours A2, CEFR-J B2
A2-S03 console: ours A2, CEFR-J B2
A2-S03 clothing: ours A2, CEFR-J B2
A2-S04 arrange: ours A2, CEFR-J B1
A2-S04 guide: ours A2, CEFR-J B1
A2-S04 cycle: ours A2, CEFR-J B1
A2-S04 region: ours A2, CEFR-J B1
A2-S04 ordinary: ours A2, CEFR-J B1
A2-S04 backpack: ours A2, CEFR-J B1
A2-S04 postcard: ours A2, CEFR-J B1
A2-S04 recording: ours A2, CEFR-J B1
A2-S04 lyrics: ours A2, CEFR-J B2
A2-S04 goalkeeper: ours A2, CEFR-J B1
A2-S04 designer: ours A2, CEFR-J B1
A2-S04 architect: ours A2, CEFR-J B1
A2-S05 flu: ours A2, CEFR-J B1
A2-S05 finger: ours A2, CEFR-J B1
A2-S05 skin: ours A2, CEFR-J B1
A2-S05 cough: ours A2, CEFR-J B1
A2-S05 injury: ours A2, CEFR-J B1
A2-S05 pain: ours A2, CEFR-J B1
A2-S05 virus: ours A2, CEFR-J B1
A2-S05 disease: ours A2, CEFR-J B1
A2-S05 stress: ours A2, CEFR-J B1
A2-S05 energy: ours A2, CEFR-J B2
A2-S05 protect: ours A2, CEFR-J B1
A2-S05 active: ours A2, CEFR-J B1
A2-S05 lift: ours A2, CEFR-J B1
A2-S05 yoga: ours A2, CEFR-J B1
A2-S05 eyesight: ours A2, CEFR-J B1
A2-S05 nut: ours A2, CEFR-J B2
A2-S05 vegetarian: ours A2, CEFR-J B1
A2-S06 bin: ours A2, CEFR-J B1
A2-S06 trash: ours A2, CEFR-J B1
A2-S06 behave: ours A2, CEFR-J B1
A2-S06 attend: ours A2, CEFR-J B1
A2-S06 equipment: ours A2, CEFR-J B1
A2-S06 instruction: ours A2, CEFR-J B1
A2-S06 instructor: ours A2, CEFR-J B1
A2-S06 serious: ours A2, CEFR-J B1
A2-S06 formal: ours A2, CEFR-J B1
A2-S06 informal: ours A2, CEFR-J B2
A2-S06 compete: ours A2, CEFR-J B1
A2-S06 foul: ours A2, CEFR-J B2
A2-S06 profile: ours A2, CEFR-J B2
A2-S06 connect: ours A2, CEFR-J B1
A2-S06 stopwatch: ours A2, CEFR-J B2
A2-S07 recipe: ours A2, CEFR-J B2
A2-S07 amount: ours A2, CEFR-J B1
A2-S07 taste: ours A2, CEFR-J B1
A2-S07 peel: ours A2, CEFR-J B2
A2-S07 grill: ours A2, CEFR-J B1
A2-S07 typical: ours A2, CEFR-J B1
A2-S07 variety: ours A2, CEFR-J B1
A2-S07 normally: ours A2, CEFR-J B1
A2-S07 farming: ours A2, CEFR-J B1
A2-S07 reception: ours A2, CEFR-J B1
A2-S07 media: ours A2, CEFR-J B2
A2-S08 motorcycle: ours A2, CEFR-J B1
A2-S08 van: ours A2, CEFR-J B1
A2-S08 parking: ours A2, CEFR-J B1
A2-S08 scooter: ours A2, CEFR-J B2
A2-S08 distance: ours A2, CEFR-J B1
A2-S08 onto: ours A2, CEFR-J B1
A2-S08 narrow: ours A2, CEFR-J B1
A2-S08 reduce: ours A2, CEFR-J B1
A2-S08 vehicle: ours A2, CEFR-J B1
A2-S08 link: ours A2, CEFR-J B1
A2-S08 listener: ours A2, CEFR-J B2
A2-S09 experiment: ours A2, CEFR-J B1
A2-S09 lab: ours A2, CEFR-J B1
A2-S09 professor: ours A2, CEFR-J B1
A2-S09 chemistry: ours A2, CEFR-J B1
A2-S09 microscope: ours A2, CEFR-J B2
A2-S09 gadget: ours A2, CEFR-J C1
A2-S09 climate: ours A2, CEFR-J B1
A2-S09 environment: ours A2, CEFR-J B2
A2-S09 electricity: ours A2, CEFR-J B1
A2-S09 possibility: ours A2, CEFR-J B1
A2-S09 progress: ours A2, CEFR-J B1
A2-S09 rise: ours A2, CEFR-J B1
A2-S09 definitely: ours A2, CEFR-J B1
A2-S09 physics: ours A2, CEFR-J B1
A2-S09 biology: ours A2, CEFR-J B1
A2-S10 thunder: ours A2, CEFR-J B1
A2-S10 react: ours A2, CEFR-J B1
A2-S10 season: ours A2, CEFR-J B1
A2-S10 disaster: ours A2, CEFR-J B1
A2-S10 completely: ours A2, CEFR-J B1
A2-S10 detective: ours A2, CEFR-J B1
A2-S10 spider: ours A2, CEFR-J B1
A2-S10 mosquito: ours A2, CEFR-J B1
A2-S10 campsite: ours A2, CEFR-J B1
A2-S11 journalist: ours A2, CEFR-J B1
A2-S11 colleague: ours A2, CEFR-J B2
A2-S11 employee: ours A2, CEFR-J B2
A2-S11 employer: ours A2, CEFR-J B2
A2-S11 able: ours A2, CEFR-J B1
A2-S11 salary: ours A2, CEFR-J B2
A2-S11 department: ours A2, CEFR-J B1
A2-S11 conference: ours A2, CEFR-J B2
A2-S11 charity: ours A2, CEFR-J B1
A2-S11 lecture: ours A2, CEFR-J B1
A2-S11 advertise: ours A2, CEFR-J B1
A2-S11 programmer: ours A2, CEFR-J B2
A2-S11 trainer: ours A2, CEFR-J B2
A2-S11 huge: ours A2, CEFR-J B1
A2-S11 pattern: ours A2, CEFR-J B1
A2-S11 vet: ours A2, CEFR-J B1
A2-S12 invitation: ours A2, CEFR-J B1
A2-S12 comment: ours A2, CEFR-J B1
A2-S12 arrangement: ours A2, CEFR-J B1
A2-S12 refuse: ours A2, CEFR-J B1
A2-S12 including: ours A2, CEFR-J B1
A2-S12 loud: ours A2, CEFR-J B1
A2-S12 microphone: ours A2, CEFR-J B2
A2-S12 laughter: ours A2, CEFR-J B1
B2-S03 hypothesis: ours B2, CEFR-J C2```
