# A1 Activity Library — every gamified activity we can use

Owner (2026-10-09): "The activity should be gamified and interactive. Create a list of every possible activity that can be used …
you can use also the same games from the Pre-A1."

Every entry is a **game** (goal + instant feedback + win state + juice — `.claude/skills/game-animation`), never a worksheet.
Roadmap that uses them: [`docs/a1-playground-roadmap.md`](a1-playground-roadmap.md).

**Status**
- **A1** — built in the Welcome Town renderer (`src/content/playground-library/welcome-town/`), ready for A1 lessons.
- **U** — universal: one shared component used by every world (`SpinWheelScene`, `PictureMatchScene`, `RecallWarmupScene`).
- **⇄ Pre-A1** — built for Pre-A1 (`unit1/scene-components/`); to use it in A1, port it to a universal scene and give it an
  **A1 mode** (the "A1 upgrade" column: sentences, questions, the child asks / builds / reads).
- **★ New** — to build; the researched source is named in brackets in "How it plays".

**Slot** = where it fits in the 22-page blueprint: W warm-up · I input · L listening practice · C controlled practice ·
S speaking · G game break · P phonics/reading · R review/boss · X extra time.

---

## 1. Warm-ups and routines

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Hello / Goodbye song | `song` | A1 | Karaoke sing-along with actions | songs written with `kids-song-writer`, lyric strip | W, R |
| Remember? | `recall-warmup` | U | Pip says a word from last lesson, child finds the picture (click / shadow) | say the whole sentence back ("He is happy!") | W |
| Mystery Bag | `mystery-bag` | ⇄ Pre-A1 | Feel-the-bag reveal, guess what's inside | child asks "Is it a…?" | W, I |
| What's Missing? | `whats-missing` / `whos-missing` | ⇄ Pre-A1 | One picture disappears, say which | "The pencil is missing!" | W, R |
| Tile Reveal | `tile-reveal` | ⇄ Pre-A1 | Tap tiles to uncover a picture bit by bit, guess early | guess with "I think it's a…" | W |
| Feelings check-in | `feelings-wheel` / `feelings-dice` | ⇄ Pre-A1 | Spin/roll a feeling, say it | "I'm tired today because…" | W |
| Brain Break | `tpr-actions` (break) | ⇄ Pre-A1 | Stand up and move: jump, freeze, stretch | instructions in full sentences ("Touch your nose and jump!") | X |

## 2. Input — meet the new language

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Word page (no plate) | `meet` look `word` | A1 | Character on one side, word big on the open side, tap to hear and repeat | add the sentence line + emoji note (boy = he) | I |
| Dialogue page | `meet` (chalk) | A1 | Character says the model line on a plate | question + answer pair | I |
| Vocab Spot | `vocab-spot` | A1 | Tap arrows in a scene, one word card at a time | card shows the sentence | I |
| Echo | `echo` | A1 | Listen and say it with the character | whole question | I, S |
| Listen & Repeat cards | `listen-repeat-cards` | ⇄ Pre-A1 | Flip cards, hear, repeat | sentence cards | I |
| Lift the Flap | `lift-flap` | ⇄ Pre-A1 | Lift flaps to discover | "What's behind the door? A cat!" | I |
| Peek / Part Peek | `part-peek` / `shape-peek` / `peek-pop` | ⇄ Pre-A1 | Part of a picture peeks out, guess | "It's got long ears. It's a rabbit!" | I, L |
| Torch Hunt | `torch-hunt` / `shape-torch` | A1 / ⇄ | Dark room, move the torch, find what you hear | "Where's the cat? It's under the bed." | I, L |
| Watch & Copy demo | `video-check` / `story-video` | ⇄ Pre-A1 | One character shows each action, labelled (`kids-demo-video`) | actions with "I can…" | I |
| Story video | `story-video` / `video-story` | ⇄ Pre-A1 | Real animated story with pause questions | longer lines, retell | I, R |
| Flipbook story | `flipbook` | A1 | Page-turn story | read-along with highlighted words | P |
| Sound model | `sound-model` | A1 | Mouth picture + sound + word | blends/digraphs | P |
| Tongue Twister | `tongue-twister` | A1 | Say it slow, then fast | digraph twisters | P |

## 3. Listening games

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Listen & Tap | `listen-tap` | A1 | Hear it, tap the right thing in the scene | "Name That Feeling" situations (Khan Kids) | L |
| Who Said It? | `who-said-it` | ⇄ Pre-A1 | Hear a voice line, tap the speaker | longer lines | L |
| Tick or Cross | `tick-cross` / `true-false` | ⇄ / A1 | Is it true for the picture? | sentence statements (Cambridge format) | L |
| Listen & Colour | `listen-colour` | ⇄ Pre-A1 | Colour what you hear (Cambridge Starters L5) | "Colour the bird on the tree blue" | L |
| Simon Says | `simon-touch` | ⇄ Pre-A1 | Do it only when Simon says | full instructions, left/right | L, X |
| Feelings / Word Bingo | `feelings-bingo` | ⇄ Pre-A1 | Mark what you hear, get a line | sentences called | L, R |
| Odd One Out | `odd-one-out` | ⇄ Pre-A1 | Which one doesn't belong? | say why ("It can't fly") | L, C |
| Sound Pop | `sound-pop` / `phonics bubbles` | ⇄ Pre-A1 | Pop the bubble with the sound | blends | P |
| Draw the Path | `draw-path` | ⇄ Pre-A1 | Draw the route you hear | directions (go straight, turn left) | L |
| Door Knock | `door-knock` | ⇄ Pre-A1 | Who's behind the door? listen and guess | "Who is it? It's Bella!" | L |
| Animal Riddle | `animal-riddle` | ⇄ Pre-A1 | Clues one by one, guess | "It's got a long neck. It can…" | L |
| Buzzer Show | `buzzer-show` | ⇄ Pre-A1 | Game-show buzzer quiz | question rounds, points | L, R |

## 4. Matching, sorting, ordering

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Drag Match | `drag-match` | A1 | Drag words onto the scene | sentences onto pictures | C |
| Picture ↔ Word Match | `picture-match` | U | Drag word to its picture slot | sentence ↔ picture | C, R |
| Memory Pairs | `memory` | A1 | Flip and find pairs | word ↔ sentence pairs | G |
| Sort Basket / Catch & Sort | `sort-basket` / `catch-sort` | ⇄ Pre-A1 | Catch falling items into the right basket | this/these, he/she/they, like/don't like | C, G |
| Pronoun Sort | `pronoun-sort` | A1 | Drag friends to He / She / They | built for A1 | C |
| Sound Sort | `sound-sort` | ⇄ Pre-A1 | Sort by first sound | digraphs | P |
| Shadow Match | `shadow-match` | ⇄ Pre-A1 | Match shape to shadow | say "It's a…" | C |
| Story Order | `story-order` | ⇄ Pre-A1 | Put story pictures in order, retell | daily routine order | C, R |
| Size Line | `size-line` | ⇄ Pre-A1 | Order by size | comparatives (bigger/smaller) | C |
| Frequency Ladder | `frequency-ladder` | A1 | Place always/sometimes/never | routines | C |
| Move & Match | `move-match` | ⇄ Pre-A1 | Do the action, match the word | "I can jump" | C |
| Family Tree | `family-tree` | ⇄ Pre-A1 | Build the tree | "This is Mia's mum" | C |

## 5. Arcade games (the "video game" layer)

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Whack-a-Word | `peek-pop` | ⇄ Pre-A1 | Hit the one you hear before it hides (Wordwall Whack-a-Mole) | hit the right sentence | G |
| Balloon Pop | `count-balloons` / `friend-pop` / `age-balloons` | ⇄ Pre-A1 | Pop the right balloons | numbers to 100, questions | G |
| Claw Machine | `claw-machine` | ⇄ Pre-A1 | Grab the prize you hear | "Get the blue robot!" | G |
| Fishing | `shape-fishing` | ⇄ Pre-A1 | Fish for the right item (Blooket Fishing Frenzy) | any word set | G |
| Ring Toss | `ring-toss` | ⇄ Pre-A1 | Throw rings on the right target | — | G |
| Brick Crush | `brick-crush` | ⇄ Pre-A1 | Break the bricks with the right word | sentence halves | G |
| Dash Runner | `dash` | ⇄ Pre-A1 | Run and jump into the right answer gate | questions | G |
| Stepping Stones | `stepping-stones` | ⇄ Pre-A1 | Cross the river on the right stones | build a sentence stone by stone | G |
| Feed the Monster / Ducks | `feed-monsters` / `duck-feed` | ⇄ Pre-A1 | Feed what the monster asks for | "I'd like three apples" | G |
| Train Recall / Pattern Train | `train-recall` / `pattern-train` | ⇄ Pre-A1 | Load the train in order | days of the week | G |
| Sand Prints / Photo Snap | `sand-prints` / `photo-snap` | ⇄ Pre-A1 | Follow tracks / take the photo | — | G |
| Rapid Recall | `rapid-recall` | ⇄ Pre-A1 | 3-second flash, say it | beat-the-clock boss | R |
| **Maze Chase** | — | ★ New | Steer through a maze to the right answer (Wordwall Maze Chase) | directions, answers | G |
| **Airplane** | — | ★ New | Fly into the right cloud (Wordwall Airplane) | — | G |
| **Racing** | — | ★ New | Each right answer moves your car/runner (Blooket Racing) | — | R |
| **Tower Defense** | — | ★ New | Right answers build towers that stop the monsters (Blooket Tower Defense) | — | R |
| **Floor Is Lava** | — | ★ New | Jump to the right platform before the lava rises (Gimkit) | — | G |

## 6. Speaking production

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Roleplay | `roleplay` | A1 | Listen to the dialogue, repeat each line | swap roles: child leads | S |
| Join the Stage / Your Turn | `join-stage` | A1 | The child's turn in the conversation | free answer | S |
| Voice Stage | `voice-stage` | ⇄ Pre-A1 | Record and play back yourself | — | S |
| Spin & Say | `spin-wheel` | U | Spin, the number lights a picture, say the sentence (feelings dice) | "She is sad!" | S |
| Guess Who / Secret Card | `secret-card` | ⇄ Pre-A1 | Ask yes/no questions to find the secret one | "Has she got long hair?" ★ upgrade | S |
| Welcome Party / Hello Doors | `welcome-party` / `hello-doors` | A1 | Say the line to open each door | any dialogue | S, R |
| Meet & Greet / Name Gate | `meet-greet` / `name-gate` | ⇄ Pre-A1 | Greet each arriving friend | — | S |
| Monster / Face Builder | `monster-maker` / `face-builder` | ⇄ Pre-A1 | Build it, then describe it | "It's got three eyes" | S |
| Show and Tell | `photo-snap` + `join-stage` | ⇄ | Show a picture of yours, say 3 sentences | — | S |
| **Food Survey / Find Someone Who** | — | ★ New | Ask 4 friends, fill the chart | Do you like…? | S |
| **Spot the Difference** | — | ★ New | Two pictures, say the differences (information gap) | She's wearing… | S |
| **Charades** | — | ★ New | Act it, the teacher guesses — or guess Pip's | What are you doing? | S |
| **Pip's Shop / Café** | — | ★ New | Customers order, you serve and talk (Blooket Café) | Can I have…? Would you like…? | S, G |
| **Doctor Pip** | — | ★ New | Patients say what's wrong, choose the cure | What's the matter? | S |

## 7. Grammar in play

| Activity | Kind | Status | How it plays | A1 upgrade | Slot |
|---|---|---|---|---|---|
| Sentence Build | `sentence-build` | A1 | Drag word tiles into a sentence | questions | C |
| Grammar Gap | `grammar-gap` | ⇄ Pre-A1 | Choose the missing word | is/are, has/have | C |
| Place It | `place-it` | A1 | Put things in/on/under as you hear | behind/next to/between | C |
| Where's the Castle? | `where-castle` | A1 | Find by prepositions | — | C |
| House Hide | `house-hide` | ⇄ Pre-A1 | Find the hidden pet by listening | Where's the cat? | C, L |
| Whose Room? | `whose-room` | ⇄ Pre-A1 | Match rooms to owners | possessive 's | C |
| Robo-Copy | `robo-copy` | ⇄ Pre-A1 | The robot does exactly what you say | imperatives, can | S, C |
| He/She Model-Sort-Say | `he-she-*` / `x-is-feeling` | ⇄ Pre-A1 | Model, sort, say | — | C |
| Age / Number sentences | `age-sentence-match` | ⇄ Pre-A1 | Match sentence to picture | How old…? | C |
| **See-Saw Scales** | — | ★ New | Put two animals on the see-saw, say which is bigger | comparatives | C |
| **Clock Tower** | — | ★ New | Set the clock to the time you hear | What time is it? | C |
| **Dress-Up / Weather Dress-Up** | — | ★ New | Dress the character as you hear; weather changes | She's wearing…, Put on… | C, G |
| **Design My Room** | — | ★ New | Place furniture, then describe | There's a… next to… | C, S |
| **Daily Diary Comic** | — | ★ New | Build a 4-panel comic of your day, read it | present simple | C, P |

## 8. Phonics and reading

| Activity | Kind | Status | How it plays | Slot |
|---|---|---|---|---|
| Letter Game / Sound Hunt | `letter-game` | A1 | Find the letter/sound you hear | P |
| Trace | `trace` | A1 | Trace the letter with the sound | P |
| Word Build | `word-build` | A1 | Blend sounds into a word, read it | P |
| Letter Tiles / First Sound | `letter-match` / `letter-blocks` / `first-sound` | ⇄ Pre-A1 | Pick the first sound / spell with tiles | P |
| Alphabet Blocks / Order | `alphabet-blocks` / `alphabet-order` | ⇄ Pre-A1 | Order the letters | P |
| Name Badge | `name-badge` | A1 | Spell your name | P |
| Word ↔ Picture | `word-picture-match` | ⇄ Pre-A1 | Read and match | P |
| **Read & Do** | — | ★ New | Read a sentence, do it in the picture ("The cat is on the box") | P |
| **Sight-Word Splat** | — | ★ New | Splat the sight word you hear | P |
| **Rhyme Pairs** | — | ★ New | Match rhyming words (cat/hat) | P |

## 9. Review, bosses, rewards (the game frame)

| Activity | Kind | Status | How it plays | Slot |
|---|---|---|---|---|
| Trophy Chest | `trophy-chest` | ⇄ Pre-A1 | Answer to open the chest | R |
| Sticker Reward / Vault | `sticker-reward` | ⇄ Pre-A1 | Earn the lesson sticker | R |
| Home Mission | `home-mission` | ⇄ Pre-A1 | A real-world task for home | R |
| Finale | `finale` | A1 | Celebration + XP | R |
| Jigsaw | `jigsaw-puzzle` | A1 | Put the picture together | G |
| **Boss Battle** | — | ★ New | Each right answer is a hit on the boss (Grumpy Cloud); no lives lost, just more turns | R |
| **Treasure Map Quest** | — | ★ New | Walk the map; each station is a mini-game; the chest at the end | R |
| **Escape Room** | — | ★ New (hello-doors upgrade) | Four doors, one puzzle each | R |
| **Jeopardy Board** | — | ★ New | Pick a category and points | R |
| **Board Game Race** | — | ★ New | Roll, move, answer the square (snakes & ladders) | R |
| **Pet Pal** | — | ★ New | Feed and dress a pet with the words you learned; it grows each lesson | X |

---

### How to choose (quick rules)
- Input pages: word page → sentence page → one discovery game (Torch / Peek / Mystery Bag).
- Each lesson: ≥ 1 listening game, ≥ 1 arcade game, ≥ 3 speaking pages, 1 phonics/reading game, 1 signature game.
- Never the same kind twice in a unit; check `docs/playground-lesson-blueprint.md` §3d and `lessonVariety.ts`.
- Porting a Pre-A1 game: make it universal (like `SpinWheelScene`), keep the Pre-A1 look, add an `a1` content mode, register it in
  both renderers, add it to `reusableActivities.ts` and `.claude/skills/activity-pattern-library`.
