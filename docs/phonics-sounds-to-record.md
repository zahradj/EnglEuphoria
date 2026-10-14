# Phonics sounds still to record

These are the sounds the lessons need but `public/lep1/audio/letters/` does not have yet. We record our own set in
standard American English (voice rule in CLAUDE.md), name each file `phon-<key>.ogg` and add the key to `PHONIC_CLIP` in
`src/content/playground-library/unit1/audio.ts`.

The owner's reference pack (syntheticphonics.com, © Phonics International) is for **listening only**. Its README says it
is not licensed for reuse, so none of its files go into the app.

## Already in the app
- a-z single sounds (26)
- sh, ch, th (one th), wh, ar, au, er, ou, oo, ing
- long a, e, i, o, u, oo

## Missing (checked 2026-10-13 against the 50-sound reference list)

| Key | Sound | Example words | Needed by |
|---|---|---|---|
| `ng` | /ŋ/ on its own | ring, wing, king, bang | A1 U3 L2 (now uses the `ing` clip) |
| `th-voiced` | voiced /ð/ | this, that, the, with | A1 U3 L1 (we teach unvoiced th: three, thin) |
| `nk` | /ŋk/ | pink, sink, think | later |
| `qu` | /kw/ | queen, quick | later |
| `x` | /ks/ (and /gz/) | box, fox, six | later (now the letter x clip) |
| `zh` | /ʒ/ | treasure, television | later |
| `oi` | /ɔɪ/ (oi, oy) | coin, boy | later |
| `ai` | /eɪ/ as a digraph (ai, ay, a-e) | rain, play, cake | we have `a-long` — check it fits |
| `ee` | /iː/ (ee, ea) | tree, sea | we have `e-long` — check it fits |
| `igh` | /aɪ/ (igh, ie, i-e) | night, pie | we have `i-long` — check it fits |
| `oa` | /oʊ/ (oa, ow, o-e) | boat, snow | we have `o-long` — check it fits |
| `yoo` | /juː/ (u-e, ew) | cube, new | we have `u-long` — check it fits |
| `or` | /ɔːr/ | fork, door | later |
| `air` | /ɛər/ | chair, hair | later |
| `ear` | /ɪər/ | ear, hear | later |
| `short-oo` | /ʊ/ | book, look | check our `oo` (it may be the long one) |
| `schwa` | /ə/ | a banana, the | later (rarely taught on its own) |
| `le` | /əl/ | apple, little | later |
