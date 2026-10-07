# Playground placement test (ages 4-9): research and design

**Why it was rebuilt.** The old Playground test was a fixed set of pictures (and, in one entry point, emoji questions). It had
two accuracy problems: (1) it could only answer "A1 or higher" - a child who knows no English at all was still placed at A1 -
and (2) it mixed up two different abilities. A child can understand a lot of spoken English and still not read it, and the
Playground programme depends on both (Pre-A1 has no reading; A1 starts reading words).

**What the research says** (notes in `docs/placement-review/kids-notes-*.md`; every note separates sourced facts from my own
inferences and lists what could not be found):
- Cambridge Pre A1 Starters (about 45 minutes for ages 6-12): listening is almost all no-reading (point, tick one of three
  pictures, colour); reading and writing start at word level. Every task starts with an example, audio is played twice, parts are
  only 5 items, the task type changes each part, and the tone is "nobody fails".
- The Cambridge and Oxford young-learner placement tests are adaptive and short (about 30-40 minutes) but assume the child can
  already use a mouse and read a little; no source targets 4-5 year olds.
- ETS (TOEFL Primary) caps each section at 30 minutes / 30 items because children's attention is short; performance fell on the
  longer form. Three options are generally optimal for multiple choice (more depends on distractor quality).
- Early-literacy screeners (EGRA, DIBELS, Heggerty, Reading Eggs) move from letter names, to letter sounds, to words, to
  sentences, and stop a skill after a few misses in a row. Reading Eggs ends after 3 wrong in a row.
- Picture-only vocabulary tests can understate ability for children with little picture experience, and some pictures are
  culturally biased - so every picture here is a plain, familiar object and the same word is tested more than once.
- Speech recognition is poor on young children's speech (word error rates of 15-35%), so speaking is not auto-scored.

**What was built**
- **Two short ladders, each with its own ability estimate** (same Bayesian method as the Academy and Success tests, with a
  guessing allowance for THREE options):
  1. *Listening* (about 10-20 items, no reading): Pip says it, the child taps one of three pictures - words, colours and numbers,
     phrases, actions, categories, "where is it" scenes (on / under / in / behind / in front / next to), tick or cross,
     sequences.
  2. *Letters and reading* (about 6-14 items): letter names and letter sounds (the school's real recorded phonics clips, never
     text-to-speech), first letter of a picture, then words to read and match to a picture (the word is never read aloud), then
     sentences.
- **Level rule:** Pre-A1 unless the child both understands (A1 band) and reads words; A2 needs A2 listening and sentences. A child
  who understands a lot but cannot read yet is Pre-A1 with a "strong listener" flag, so a teacher can move them up quickly.
- **Child-safe flow:** a screen asking a grown-up to sit with the child; two practice items (a wrong tap is allowed to try again);
  every instruction spoken (about 110 saved clips), replay button, big tap targets; stars show effort, never right or wrong; no
  wrong-answer sound; a "?" button so a child does not have to guess; taps before Pip finishes speaking earn less credit.
- **Nothing live:** all pictures are existing static art or drawn in code (the scenes), and every spoken line is a saved clip; the
  deploy gate checks both. It runs in both entry points (the student gate and the public /placement/playground page).
- **A fix that matters beyond the Playground:** the student-gate placement screen was ignoring the new adaptive result and still
  using the old "60% in a band" rule to set the level. All hubs now use the adaptive result there too.

**Simulated accuracy** (made-up children, imperfect item difficulties, guessing and careless slips; 50 children per profile, about
32-34 questions): a child who knows no English or only isolated words is placed Pre-A1 100% of the time; a child who understands
phrases and knows letters but cannot read words 80%; children at A1 56-60% and at A2 46% exactly right, with only 0-10% placed at
the wrong level AND not flagged "borderline". The level boundaries are where the uncertainty is, which is why borderline children
are flagged for the teacher to confirm in lesson 1. These numbers use the same model as the test, so treat them as an upper
bound; real accuracy needs teacher verdicts.

**Still to do**
- A teacher (or two) should look at every picture and scene; scenes drawn in code are simple and may need polishing.
- A pilot with real children of known level (the bank difficulties are expert estimates), then refine from the answers saved
  per item (each answer's time, tap, and "?" are stored with the result).
- An optional 20-second recorded speaking sample with parent consent, sent to a teacher (not auto-scored).
- Teacher-verdict entry (agree / up one / down one) - the database columns already exist.
