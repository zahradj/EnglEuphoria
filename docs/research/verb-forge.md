# Verb Forge: how the irregular-verb game is built (research note, 2026-10-10)

**Goal (owner):** an Academy game for regular and irregular verbs (base, past simple, past participle) that helps students memorise faster.

## What the sources agree on
There is no controlled study of English irregular verbs; the teaching guides agree with general memory research:
1. **Group by pattern and sound family**, not alphabetically (cut-cut-cut; sing-sang-sung; know-knew-known; buy-bought-bought).
2. **Most frequent verbs first.**
3. **Retrieval, not rereading**: test yourself (typing from memory), shuffle, reverse the direction (participle -> base).
4. **Space the reviews** (Leitner boxes).
5. **Practise in sentences**, because the choice between 2nd and 3rd form depends on the time words (yesterday / have already).
Quizlet Learn adds the difficulty ladder (multiple choice -> typed -> context); we grade each FORM separately, as a learner may know "went" and miss "gone".

Sources: Tes "Irregular verbs: memorization techniques and patterns"; italki, Talkpal and Booyya guides; Leitner-system app documentation; Quizlet Learn documentation.

## How the game uses it
| Stop | Technique | Code |
|---|---|---|
| Pattern Forge | Noticing: name the pattern (A-A-A, A-B-B, A-B-C, A-B-A, +ed) | `PatternStage` |
| Family Forge | Group by sound family, recognition (choice with near-miss and regular-ed decoys) | `FamilyStage`, `FAMILIES` |
| Memory Forge | Retrieval: type from memory, reverse questions, hint ladder, Leitner per form | `MemoryStage`, `verbMemory.ts` |
| Sentence Forge | Use: past time vs "have" | `SentenceStage`, `SENTENCES` |
Colour code everywhere: base = blue, past simple = orange, past participle = green.

## Left out on purpose
read / lead / wind (spelled like another word, unsafe for text-to-speech), get (got vs gotten), learn / dream / burn (two accepted spellings), be (two past forms).
