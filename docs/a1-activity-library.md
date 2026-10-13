# A1 Activity Library — every gamified activity we can use

**Extended 2026-10-13** (owner: "Search the internet and extend the activities games list, even use old ones with modern designs"): §10 built since, §11 classic games redesigned, §12 platform mechanics.

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
| ~~Who Said It?~~ | `who-said-it` | ⇄ Pre-A1 | **Not for A1** (owner 2026-10-12: "doesn't make sense, it's not relevant") — use Question → Answer, Yes / No or Listen & Colour | — | — |
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
| Picture Maze | `picture-maze` | ⇄ Pre-A1 | Walk the hedge maze to the thing you hear (Wordwall Maze Chase) | "Find the animal that can fly!" | G |
| **Airplane** | — | ★ New | Fly into the right cloud (Wordwall Airplane) | — | G |
| Answer Race | `answer-race` (looks `gates` / `race` / `raft`) | A1 | Each right answer moves your car / runner / raft (Blooket Racing) | questions + read cards | G, R |
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
| Charades | `charades` | ⇄ Pre-A1 | Curtain opens bit by bit on a friend acting; or the child acts and the teacher guesses | He can swim! / What are you doing? | S |
| Pip's Shop / Café | `shop-till` / `cafe-order` / `smoothie-bar` | ⇄ Pre-A1 | Customers order, you serve and talk (Blooket Café) | Can I have…? Would you like…? | S, G |
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
| Dress-Up | `dress-studio` / `put-on` / `wearing-show` | ⇄ Pre-A1 | Dress the character as you hear (boys get no dress piece) | She's wearing…, Put on… | C, G |
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
| Read & Do | `read-do` | A1 | Read the card, tap the thing, then the friend ("Give Leo the red cap.") | P |
| Word Splat | `word-splat` | A1 | Splat the sight word you hear | P |
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
| Word Board / House Board | `word-board` / `house-board` | ⇄ Pre-A1 | Roll, hop, read or answer the square; ladders and slides | R |
| **Pet Pal** | — | ★ New | Feed and dress a pet with the words you learned; it grows each lesson | X |

## 10. Built since the first list (2026-10-12 / 13)

The games below were built after this list was written. They are in the renderers already and every A1 unit can use them.

| Activity | Kind | Status | How it plays | Slot |
|---|---|---|---|---|
| Field Guide | `field-guide` | A1 | Build a 4-sentence animal card, one gap at a time, then read it aloud | C, S |
| Chat Chain | `chat-chain` | A1 | A friend talks; the child picks the reply that fits and SAYS it | S |
| Jungle Obstacle Run | `obstacle-run` | ⇄ Pre-A1 | Send the friend who CAN pass each obstacle | C, S |
| Can It? | `can-it` | ⇄ Pre-A1 | Thumbs up / down answers, then watch what happens | L, S |
| Hero Trials | `hero-trials` | ⇄ Pre-A1 | Badge per skill (read it / answer it / find it), medal at the end | R |
| Home Hunt | `home-hunt` | ⇄ Pre-A1 | Mission card: "Find something long!", the child shows it on camera | X |
| Flip & Say | `flip-say` | ⇄ Pre-A1 | Face-down speaking cards (Wordwall Speaking cards) | S |
| Letter Monsters / Sound Moles / Sound Fishing | `letter-monsters` / `sound-mole` / `sound-fish` | ⇄ Pre-A1 | Feed / bonk / catch by first sound (digraphs too) | P |
| Party Belt / Talent Show / Campfire Says | `party-belt` / `talent-show` / `campfire-says` | ⇄ Pre-A1 | Conveyor belt, stage show, campfire Simon-says | G, X |

## 11. Classic games with a modern design (owner, 2026-10-13: "even use old ones with modern designs")

These are playground and party games that teachers still use for English. Sources: esl-kids.com, eslactive.com, languageadvisor.net, British Council LearnEnglish Kids, and Baamboozle's Four in a Row, Tic Tac Toe, Memory and Bingo modes. The rule stays the same: we take the mechanic, never the content. The modern part is the look and feel: painted Canva sets, cut-out stickers, juicy UI motion (`game-animation`), recorded voices, a calm pace and no losing. A classic whose original form is unkind is redesigned (marked ⚠️).

| Classic | Modern design (our version) | A1 language | Build on | Status | Slot |
|---|---|---|---|---|---|
| Hangman ⚠️ | **Save the Balloon**: a hot-air balloon with Pip in it. A wrong letter lets one sandbag drop, never a person in danger. The word fills tile by tile, and the balloon lands when it's solved | spelling unit words, then read the sentence | `save-balloon` (U1 L2, U2 L2) | ✓ built | P |
| Bingo | **Sticker Bingo**: a 3×3 card of pictures; the voice says a SENTENCE, the child stamps it with a sticker that pops; the line glows and confetti falls | "She is sad." / "It can fly." | `sticker-bingo` (U1 L6, U2 L4) | ✓ built | L, R |
| Tic-Tac-Toe / Four in a Row | **Noughts & Crosses Duel**: the child vs Pip. To place your token, answer the question on the square; tokens drop with a bounce (Baamboozle Tic Tac Toe / Four in a Row) | any Q&A | `tic-tac-toe` (U1 L6, U2 L6) | ✓ built | R, X |
| Snakes & Ladders | Word Board / House Board (exists) **+ skins**: jungle vines (ladders) and slides, a castle, space | read the square | `word-board` | ✓ built | R |
| Hot Potato | **Hot Coconut**: a coconut passes between the friends while the music plays; when it stops, whoever holds it gets the question and the child answers for them. Timer ring, no forfeit | questions of the unit | `hot-coconut` (U1 L6, U2 L3) | ✓ built | S, X |
| I Spy | **I Spy with my binoculars**: a painted scene; the voice gives a clue ("I spy something small and green"), and the child moves the binocular circle and taps | descriptions | `i-spy` (U2 L1) | ✓ built | L |
| Simon Says | exists (`simon-touch`, `campfire-says`) **+ Red Light, Green Light**: move on "green", freeze on "red", and the child's runner advances | instructions, can | ★ new mode of `campfire-says` | ★ New | X |
| Musical Chairs ⚠️ | **Musical Islands**: animals hop between lily pads while the music plays; when it stops, the child says where each animal is. Nobody is "out" | prepositions, "The frog is on the…" | ★ new `musical-islands` | ★ New | L, X |
| Telephone / Chinese Whispers | **Whisper Tube**: Pip whispers a sentence down a tube to Mia, a word gets mixed up, and the child hears both and fixes the wrong word | listening for detail | `true-false` + 2-voice audio | ★ New | L |
| Pictionary | **Draw That** (Gimkit): the teacher (or child) draws on a shared canvas and the other guesses in a sentence; drawing syncs live | "It's a…" / "It's got…" | `draw-guess` (U1 L2 `wt2-draw-that` feelings faces, U2 L1 `ja-draw-that` animals; shared play: the drawer's screen alone sees the secret) | ✓ built | S |
| 20 Questions / Guess Who | exists: `secret-card` (Guess the Animal / Guess My Friend) | yes/no questions | `secret-card` | ✓ built | S |
| Go Fish (card game) | **Go Fish! with Pip**: the child holds picture cards and asks "Have you got a frog?"; Pip answers "Yes, here you are! / No — go fish!"; pairs fly to the table | have got, animals, food | `go-fish` (U2 L6; rules in goFishRules.ts + test) | ✓ built | S |
| Dominoes | **Sentence Dominoes**: a tile with a picture and half a sentence; snap the next tile whose half finishes the sentence, so the chain grows across the table | sentence halves | `dominoes` (U1 L4, U2 L5) | ✓ built | C, P |
| Hopscotch | **Number Hop**: a painted hopscotch; Pip throws a pebble on a square and the child says the number or sentence on each square Pip hops | numbers 1-20, routines | `stepping-stones` re-skin | ⇄ re-skin | X |
| Hot and Cold | **Treasure Radar**: the child taps the beach to search; the screen tints from blue ("cold") to red ("hot") and Pip says "Warmer! Hotter!" | listening for direction words | ★ new `hot-cold` | ★ New | L, X |
| Battleship | **Treasure Islands**: a 4×4 sea grid (A-D, 1-4); the child calls "B3!" and a chest or a splash appears. A1 mode: answer a question to get each shot | letters + numbers, questions | `grid-hunt` (U1 L3 `wt3-treasure-islands` numbers/ages, U2 L4 `ja4-waterfall-treasure` long nose/tail) | ✓ built | R |
| Kim's Game | exists: `whats-missing` / `whos-missing` | "The cap is missing!" | ✓ built | ✓ built | W, R |
| Pass the Parcel | **Pass the Present**: a gift with 4 layers of paper; each right answer tears one layer off, and the prize sticker is inside | any review | `pass-parcel` (U1 L7, U2 L7) | ✓ built | R |
| Jenga | **Wobbly Tower**: tap a block to pull it out; the question is on it, and a right answer means the block slides out cleanly. The tower never falls on a child's turn | review questions | ★ new `tower-pull` | ★ New | R |
| Word Search / Crossword | **Picture Crossword**: picture clues; type or tap letters, and the word lights up and is said | spelling | ★ new `crossword` (Wordwall) | ★ New | P |
| Rock-Paper-Scissors | **Who starts?**: a quick hand game decides the first turn in duel games; say "Rock, paper, scissors, go!" | chant | UI helper in duel games | ★ New | — |
| Marco Polo / Blind Man's Buff ⚠️ | **Echo Cave**: eyes closed (a dark screen); a friend calls from left / right / up / down, and the child points where the voice comes from (stereo pan) | names, can (who is calling?) | `echo-cave` (U1 L1 `wt-echo-cave` hello/my name is, U2 L2 `ja2-echo-cave` I can…); left/middle/right stereo pan, hint glow after 2 misses | ✓ built | L |

## 12. Modern platform mechanics to borrow (2026 research)

Sources: Wordwall templates (34+ interactives: Maze Chase, Airplane, Whack-a-mole, Balloon Pop, Flip Tiles, Speaking Cards, Group Sort, Image Quiz, Anagram, Spell the Word, Labyrinth), Blooket modes (Gold Quest, Factory, Café, Tower Defense, Racing, Fishing Frenzy, Crazy Kingdom), Gimkit modes (Draw That, Fishtopia, The Floor is Lava, Capture the Flag), Kahoot game modes, Baamboozle (one shared screen), Duolingo ABC (word puzzles, tracing, illustrated stories) and Lingokids. Modes built on deception or fear (Gimkit Trust No One, Humans vs Zombies) and stealing from others (Blooket Gold Quest "steal") are **not for children**; their safe cores are adapted below.

| Platform mechanic | Our version | A1 language | Build on | Status | Slot |
|---|---|---|---|---|---|
| Wordwall Airplane | **Jungle Glider**: Coco glides; tap or steer into the cloud with the right answer, and wrong clouds puff away gently | sentence ↔ picture | ★ new `glider` | ★ New | G |
| Wordwall Balloon Pop | **Balloon Match**: balloons carry words and float to their pictures; pop when matched | word ↔ sentence | `count-balloons` → universal | ⇄ upgrade | C, G |
| Wordwall Anagram / Duolingo ABC word puzzle | **Letter Bubbles**: scrambled letter bubbles; drag them into order and the word is said and read in a sentence | spelling | `letter-blocks` letters mode | ⇄ upgrade | P |
| Wordwall Labyrinth / Maze Chase | exists (`picture-maze`); **+ chase mode**: a friendly bee follows slowly and the child must reach the answer first | answers | `picture-maze` | ⇄ upgrade | G |
| Blooket Gold Quest (no stealing) | **Treasure Chests**: each right answer opens a chest with coins, a double or a sticker; coins fill the class jar (no taking from others) | any review | `chest-quest` (U1 L7, U2 L6) | ✓ built | R |
| Blooket Factory / Crazy Kingdom | **Build the Town**: every right answer builds one piece of the unit's world (a hut, a tree, a bridge), and it stays built across lessons | unit review | `world-builder` (U1 L6 town, U2 L6 jungle camp; persisting across lessons still to build) | ✓ built | R, X |
| Blooket Tower Defense | **Garden Guard** (listed in §5): right answers plant flowers that keep the friendly goats from the veggies; nothing gets hurt | any | ★ New | ★ New | R |
| Gimkit The Floor is Lava | **Rising River**: the class answers together and each answer lifts the bridge before the water rises; cooperative, so the teacher and child win together | any | `rising-river` (U1 L7, U2 L7) | ✓ built | R |
| Gimkit Fishtopia | exists: `shape-fishing` / `sound-fish`; **+ shop**: catches buy aquarium decorations | any | ⇄ upgrade | ⇄ upgrade | G |
| Gimkit Capture the Flag (safe) | **Team Flags**: teacher vs child; each right answer moves your flag one hill closer; first to the top | Q&A | ★ new `flag-race` | ★ New | R |
| Gimkit Draw That | see Pictionary (§11) | | | | |
| Kahoot Robot Run / Treasure Trove | `answer-race` looks already cover running; **+ treasure look**: collect gems on the path | Q&A | `answer-race` new look | ⇄ re-skin | R |
| Baamboozle board (one screen) | **Jungle Jeopardy** (listed in §9): a grid of picture tiles by category and points; tiles flip to a question, with a mystery "Boom!" tile that doubles | review | `quiz-board` (U1 L6, U2 L7) | ✓ built | R |
| Lingokids / Khan Kids collectible pets | **Pet Pal** (listed in §9): every lesson's words feed and dress the pet, which grows across the unit | unit words | ★ New | ★ New | X |
| Duolingo ABC illustrated stories | Reader + story GIFs (scenarios waiting for the owner's OK) | reading | `reader` | ✓ built (GIFs pending) | P |

### Build order suggestion (most value, least art)
1. **Sticker Bingo**, **Tic-Tac-Toe Duel**, **Pass the Present**, **I Spy binoculars**. These reuse existing art and kinds, are quick to build and fit any unit.
2. **Save the Balloon**, **Sentence Dominoes**, **Go Fish!**, **Hot Coconut**. Each is one new kind with simple art.
3. **Jungle Jeopardy**, **Treasure Chests**, **Rising River**, **Build the Town**. These are the game-frame and review layer for L6 and L7.
4. ✓ **Draw That** (synced canvas), **Echo Cave** (stereo audio), **Treasure Islands** (grid). These are technically new.

---

### How to choose (quick rules)
- Input pages: word page → sentence page → one discovery game (Torch / Peek / Mystery Bag).
- Each lesson: ≥ 1 listening game, ≥ 1 arcade game, ≥ 3 speaking pages, 1 phonics/reading game, 1 signature game.
- Never the same kind twice in a unit; check `docs/playground-lesson-blueprint.md` §3d and `lessonVariety.ts`.
- Porting a Pre-A1 game: make it universal (like `SpinWheelScene`), keep the Pre-A1 look, add an `a1` content mode, register it in
  both renderers, add it to `reusableActivities.ts` and `.claude/skills/activity-pattern-library`.
