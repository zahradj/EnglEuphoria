---
name: kids-song-writer
description: REQUIRED before writing or generating ANY lesson song or song video (hello/goodbye songs, chants, action songs, song videos) in any hub. How to write words that fit the beat, rhyme, repeat the target vocabulary and sing clearly — then the gate script (scripts/check-lyrics.py) and how to ask the song bot for ONE whole song at a fixed tempo, so the lyrics, rhythm and music match. Owner, 2026-10-09: "some lyrics and the music are not compatible… generate songs where the lyrics and the rhythm and the music are compatible."
---

# Kids Song Writer — words that fit the beat

## Why this exists
The first song videos joined separately generated verse takes, and the words were written without a meter: one line had 4 beats,
the next 6 ("A cow, a cow! It's a cow! Moo, moo!" squeezed into the E-I-E-I-O tune). Each take also had its own tempo and
melody. Result (owner): "some lyrics and the music are not compatible together." Fix: write to a meter, check it, and generate
the WHOLE song in ONE take with one section per verse/chorus at a fixed tempo.

## What the research says
| Source | Finding | Our rule |
|---|---|---|
| Prosody (Wikipedia "Prosody (music)"; Ableton "The Rhythm of Lyrics"; Pat Pattison, *Writing Better Lyrics*) | Good setting = stressed syllables on strong beats; the reverse sounds forced. Say the line aloud: where the voice leans is the stress | Every line has exactly **4 stressed beats** (4/4, 2 bars per line). Content words and the stressed syllable of long words carry the beats; "a, the, my, and…" go between |
| Pattison: stable vs unstable sections | Same line lengths, same number of stresses, even line counts and AABB / ABAB rhyme feel stable and singable | 4-line sections; lines in the same place of every verse have the same syllables (±1) and stresses, because the verses share ONE tune |
| Pattison: rhyme types | Sung vowels are stretched, so family rhymes (same vowel, consonants of the same family: barn/farm, is/kiss, yum/fun) work like perfect rhymes | Rhyme the line ends AABB (or ABAB); perfect, family or additive rhymes; never two lines that only share a vowel unless it is a deliberate refrain |
| Preschool songwriting guides (Reading Rockets; musicindustryhowto; ensembleschools) | Repetition teaches words; simple tunes, major keys, small range, everyday topics, actions | Each target word sung **≥ 3 times**; a refrain that comes back; one action per line the child can do |
| AI-lyrics guides (NousResearch songwriting skill; Suno lyric guides) | 6-10 syllables per line, similar line lengths, plain words, clear vowels on downbeats, short repeated choruses; models rush long or uneven lines | 5-9 syllables per line (max 2 per beat); plain Pre-A1 words; open vowels at line ends; chorus ≤ 4 lines |
| ElevenLabs Music composition plans (docs: composition-plans, create-composition-plan) | Plans have global styles (BPM, 4/4, key) and sections with `duration_ms` (3-120 s) and `lines` (≤ 200 chars); English styles work best | Sections = Intro (instrumental, 2 bars) + one per verse/chorus, each `lines × 2 bars` long at the song's BPM; BPM, 4/4 and key in the global styles. Never one section per line (5-8× too long) |

## Writing the song (in `scripts/songs.json`)
```json
"u7l5-farm-song3": {
  "publicPath": "public/lep1/audio/farm-song3-u7l5.mp3",
  "bpm": 120, "key": "G major", "beatsPerLine": 4, "barsPerLine": 2, "introBars": 2, "maxSeconds": 95,
  "targetWords": ["farm", "cow", "pig", "sheep", "duck"],
  "style": "...one style sentence incl. tempo, instruments, voice...", "positiveStyles": [...], "negativeStyles": [...],
  "sections": [ {"name": "Chorus", "rhyme": "AX", "lines": [...]}, {"name": "Verse 1", "rhyme": "AABB", "lines": [...]}, ... ],
  "lines": [ ...all lines in order (karaoke + the scorer read this)... ]
}
```
1. **One goal, the target words** (from the lesson): each sung ≥ 3 times, ideally doubled ("A cow, a cow").
2. **Tempo**: 100-120 BPM (action songs 116-120, story songs 96-108). One line = 2 bars = 8 beats.
3. **Every line: 4 stressed beats, 5-9 syllables.** Mark the stresses aloud: "a COW, a COW on GRANDpa's FARM".
4. **Verses are copies of one shape**: same syllables per line position, same stress pattern, only the word changes
   (cow → pig → sheep). Name them "Verse 1", "Verse 2"… so the gate compares them.
5. **Rhyme** AABB (or ABAB for a chorus with a hook line). Put the rhyme on the last stressed syllable.
6. **Chorus**: short (2-4 lines), the catchiest line, repeated; it may repeat its own line (refrain).
7. **Length**: Pre-A1 ≤ 75 s (a 4-animal song may go to 95 s).
8. **Pictures follow the words**: one sung line = one shot in the song video (scripts/make-song-video.py).

## The gate
```bash
pip install pronouncing   # once
python3 scripts/check-lyrics.py <key>     # BEATS, SPEED, MATCH, RHYME, WORDS, LENGTH — fix every FAIL before asking the bot
```
Unknown words (oink, E-I-E-I-O…) go into `SPECIAL` in the script. A WARN for a repeated end word is fine only for a refrain.

## Generating
- Request the key from the song bot (`scripts/song-gen-request.txt` → `song-gen.yml`): `generate-songs.mjs` turns `sections`
  into an ElevenLabs composition plan (Intro + one section per verse/chorus, exact durations, BPM/4-4/key in the global styles).
  ONE take = the whole song, so tempo, key and melody are the same in every verse.
- `verify-song.py` scores each take against `lines` (Whisper). Pick ≥ 0.7, then READ the transcript: animal sounds and names
  are often misheard (oink → "oint", baa → "bar"); a mumbled real word is not acceptable.
- Line times: the plan fixes them (intro + n × line length), so karaoke `lineDurationsMs` = line length for every line
  (check against the take's measured line starts; the model may drift a little).
- Never join separately generated verses into one song again (different tempo/key/melody = "not compatible").

## Checklist before the owner hears it
- [ ] `check-lyrics.py` PASS; every target word ≥ 3 times; words exactly as on screen
- [ ] one take for the whole song; transcript read word by word; no extra or missing lines
- [ ] lesson scene: `songUrl`, `lyrics` (= `lines`), `lineDurationsMs`; song video rebuilt from the new line times
- [ ] the owner listened (a test proves the words, not the music)

Sources: en.wikipedia.org/wiki/Prosody_(music); makingmusic.ableton.com/the-rhythm-of-lyrics; patpattison.com/perfect-match;
americansongwriter.com/songwriter-u-surviving-rhyme-meeting-the-family; jmcacademy.edu.au/news/top-lyric-writing-tips-with-pat-pattison;
readingrockets.org/topics/activities/articles/songwriting-kids; musicindustryhowto.com/how-to-make-a-good-song-for-children;
hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/creative/creative-songwriting-and-ai-music;
elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans; elevenlabs.io/docs/api-reference/music/create-composition-plan.
