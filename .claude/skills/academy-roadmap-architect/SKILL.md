---
name: academy-roadmap-architect
description: >
  Build the Academy CEFR roadmap (A1 -> C1) and each themed Season spec: theme, story arc with one language-unlocked clue per
  episode, can-do statements, word/chunk list within budget, 1-2 structures, pronunciation focus, skills ledger, recycling
  plan, "My World" skins, Release, 8 Episode objectives, checkpoint and Daily-10 seeds. Use when asked for the roadmap,
  the blueprint of all lessons, a new Season/unit, or to check that progression is accurate, spiral and acquirable.
  Run academy-season-system first.
---

# Academy Roadmap Architect — turn the level into 70 acquirable, themed Seasons

Goal: a roadmap in which a student **actually acquires** English: small, recycled, retrievable, used in all four skills, with
honest checkpoints. Not a topic list.

## Inputs to gather BEFORE writing a Season (do not guess)

1. **Full existing blueprint** (query `curriculum_lessons` for ALL hubs/units - no unit filter) so themes never duplicate
   (project lesson learned). If Supabase is unreachable, say so and mark the roadmap "unchecked against DB".
2. **Level targets**: the sizing table in `docs/academy-lesson-system.md` §4.1 (cumulative words, Seasons, new items/Season).
3. **Word source**: Oxford 3000/5000 CSV (CEFR-tagged) from oxfordlearnersdictionaries.com/about/wordlists + the Cambridge English
   Vocabulary Profile for chunks/collocations. Counting unit = lemma/chunk; state it. Do not invent word counts from memory.
4. **Grammar source**: English Grammar Profile (Cambridge) for level assignment; the draft sequence in the doc §4.2 is [K] until verified.
5. **Descriptors**: CEFR Companion Volume 2020 (coe.int) for can-dos incl. mediation. Quote paraphrased, cite section.
6. **Cast and tone**: Academy cast (Vee, Ava, Theo, Mia; `cast_vault_characters`), semi-realistic teens, no mascots.

## Procedure per Season

1. **Theme**: teen-relevant, school-safe, visual, supports a Release the student would genuinely make. Check it is not used elsewhere
   and is not the same *kind* as the previous two Seasons (setting, genre, Release type must vary).
2. **Can-dos (<= 4)**: "I can ..." tied to CEFR descriptors for this level, each observable in the Release or checkpoint.
3. **Language spine**
   - **Items** (60-84 by level; <= 14 new per session, so <= 84 per Season; ~60 % productive, rest receptive): concrete, frequent, theme-fit, chunk-first
     ("Can I have ...?", "I'd like ..."), with 6-10 collocations/chunks from B1 up. Tag each: lemma/chunk, CEFR, POS, productive/receptive, skills it will touch.
   - **Structures (1-2)**: one main focus; check learnability order (don't teach a form the learner can't process yet - Pienemann [K]);
     list prerequisite forms and where each was taught.
   - **Pronunciation focus**: 1-2 intelligibility priorities (Lingua Franca Core [K]: sounds that cause misunderstanding, nuclear stress, rhythm), with minimal pairs for HVPT.
   - **Recycling**: E1 re-uses ~30 % of items from the previous two Seasons; list `recycle_from`.
4. **Story arc** (cheap, strong): hook (a mystery/project with a cast member) -> **8 clues**, one per episode, each unlocked only by using
   that episode's target language ("language is the key") -> Finale payoff using the student's own Release. Keep clues light (a message, a photo, a voice note).
5. **Skins (3-6)**: topics (football, gaming, music, anime, art, tech, animals, food, travel, fashion, science) that re-dress the same language
   spine. For each skin list only what changes (nouns, scenario, picture set) - the structure, items and tasks stay identical.
6. **Release**: what the student makes (voice intro, profile card, menu + order, vlog script, comic, podcast clip, pitch). Define the rubric
   (accuracy, range, fluency, coherence, interaction) with level descriptors; define the before/after sample.
7. **Eight Episode specs** (see schema): objective ("I can ..."), skill focus, input spec (type, length, CEFR, target >= 95 % known words incl. glossed),
   new language, Mission type, Release step, assessment hooks. Respect: core productive words only E2/E6 (receptive items and functional chunks may enter E1/E4/E5), new structure only E3/E6, **E7/E8 zero new language**, <= 14 new items per session so <= 84 per Season.
8. **Checkpoint blueprint** (E8): ~60 % this Season, ~40 % earlier; all four skills + vocab + grammar; production-weighted; delayed items from >= 2 Seasons back.
9. **Daily-10 seeds**: item list with due-date logic ids, 2-3 solo mini-games per episode, one graded text/clip ("Library"), one voice-note prompt.
10. **Validate** (checks below), then write the file.

## Schema (TypeScript, proposed home `src/curriculum/roadmap/academy/<level>.ts`; types in `types.ts`)

```ts
type SeasonSpec = {
  id: string;                       // 'A1-S04'
  level: 'A1'|'A2'|'B1'|'B2'|'C1'; seasonNo: number;
  title: string; theme: string;
  story: { hook: string; cast: string[]; clues: string[8]; finale: string };
  canDo: string[];                  // <= 4, CEFR-referenced
  items: { id: string; text: string; cefr: string; pos?: string; mode: 'productive'|'receptive'; introducedIn: 'E1'|'E2'|'E4'|'E5'|'E6' }[];
  structures: { id: string; label: string; cefr: string; prereqIds: string[]; introducedIn: 'E3'|'E6' }[];
  pronunciation: { focus: string[]; minimalPairs: [string,string][] };
  skillsLedger: Record<'listening'|'reading'|'speaking'|'writing'|'vocab'|'grammar'|'pron', number>; // planned minutes
  recycleFrom: string[];            // season ids
  skins: { id: string; label: string; swaps: Record<string,string> }[];
  release: { type: string; rubricId: string; beforeAfter: boolean };
  episodes: EpisodeSpec[];          // exactly 8
  checkpoint: { itemMix: { thisSeason: number; earlier: number }; skills: string[] };
  dailyTen: { itemIds: string[]; miniGames: string[]; library: string; voicePrompt: string };
};
type EpisodeSpec = {
  no: 1|2|3|4|5|6|7|8; type: 'cold-open'|'word-lab'|'pattern-lab'|'on-air'|'deep-dive'|'side-quest'|'remix'|'finale';
  objective: string;                // "I can ..."
  primarySkill: string; newItemIds: string[]; newStructureIds: string[];
  input?: { kind: string; words: number; cefr: string; knownWordsPct: number };
  mission: { kind: string; planningSeconds?: number; take2Constraint: string };
  clue: string; assessmentHooks: string[];
};
```

## Level pattern (supports fade; see doc §2.2)

A1: model -> choose -> fill -> say; full frames, L1 hints, slow audio. A2: chunks -> sentences; half frames. B1: task-first then focus on form; mediation starts.
B2: student-led tasks, opinion defence, summarising. C1: authentic texts, register and collocation precision, seminar/pitch, mediation each Season.

## Validators (a roadmap fails if any fails)

- Item budget per level and per session (<= 14 new/session; hub cap in `lessonBlueprint.ts` VOCAB_CAP academy = 14).
- Cumulative level word target met within +-10 %; no item introduced twice; every item appears >= 8 times across the level in >= 3 skills.
- Every structure's prerequisites were taught earlier; no structure introduced in E7/E8; <= 2 per Season.
- Every can-do is assessed in a checkpoint or Release. All four skills + vocab + grammar present each Season (Nation strands 15-35 % each, adjust by level).
- Themes unique across the whole blueprint; consecutive Seasons differ in setting, genre and Release type.
- Every Season: story with 8 language-unlocked clues, a Release, >= 3 skins, a checkpoint.
- Exactly 8 episodes; E7/E8 carry no new language; Big Remix every 2nd Season; a level check at each level boundary.
- Sources recorded: which list/version each item and structure came from; unverified items flagged `[U]`.

## The roadmap that exists (2026-10-08)

Code (source of truth): `src/curriculum/academy/` - `types.ts`, `authoring.ts`, `levels/a1.ts` ... `c1.ts` (70 Seasons as outlines), `structureLevels.ts`
(grammar catalogue with earliest productive level + confidence), `validateRoadmap.ts`, `index.ts` (computes ids, recycling, Big Remix, level checks),
`__tests__/roadmap.test.ts` (deploy gate). Readable copy: `docs/academy-roadmap-v2.md`, generated by `scripts/academy-roadmap-report.ts`.
It is **brand new and Academy-only** (owner, 2026-10-08: drop the old Academy blueprint, never touch the Playground).

**Outline level only:** each Season has an item *budget* and lexical fields. Concrete item lists (words + chunks, tagged CEFR/POS/productive-receptive) are still to be built
from the Oxford 3000/5000 CEFR lists and the Cambridge English Vocabulary Profile when they can be downloaded, and added per Season.
**Unverified:** 20 grammar placements are marked `unverified` (see the generated doc); check the English Grammar Profile and the GSE Grammar PDF before locking.
When you add or change a Season, edit the level file, run the test, regenerate the doc.

## Output

Write the roadmap file(s) + a short `ROADMAP_NOTES.md` listing data sources, counts per level, validator results, open questions for the owner.
Do not generate lesson content or art here - that is `academy-session-builder`'s job after the owner approves the roadmap.
