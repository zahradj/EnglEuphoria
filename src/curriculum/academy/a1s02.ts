// A1 Season 2 "My Room, My Stuff" (the Lost Charger): the Season spec as data, read by the lesson tests (owner 2026-10-13: "continue with A1").
// Plan and research: docs/academy-a1s02-spec.md. The roadmap outline (levels/a1.ts) gives the budget (80 items, 8 episodes); this module names the real items.
// Imports nothing outside src/curriculum/academy/.
export interface A1S02Episode {
  no: number;
  name: string;
  objective: string;
  /** the new items (words and chunks); the count equals the lesson blueprint's newItems.count */
  newItems: string[];
  /** structures analysed in this episode (E3 first, E6 second) */
  structures: string[];
  /** vocabulary-game picks (ids in VOCAB_GAME_MENU) for the word sets of this episode */
  games: string[][];
  mission: string;
  release: string;
  /** story beat the lesson plays */
  story: string;
  clue: string;
}

export const A1_S02 = {
  id: 'A1-S02',
  level: 'A1',
  seasonNo: 2,
  title: 'My Room, My Stuff',
  theme: 'The Lost Charger',
  cast: ['Vee', 'Theo', 'Ava'] as const,
  lead: 'Theo',
  hook: "Theo's phone is at 3 % and his charger has vanished from his room. Follow the clues around the room to find out where it went.",
  release: 'A voice-note tour of my room (30-45 seconds)',
  canDo: [
    'I can say what there is in a room and where things are.',
    'I can name common objects and gadgets and say what colour they are.',
    'I can ask where something is and understand the answer.',
  ],
  structures: ['there is / there are (+ a / an / any, plural -s)', 'in / on / under / next to / behind (place)'],
  pron: ['plural endings /s/ /z/ /ɪz/ (chairs, lamps, boxes)', 'the /ɪ/ vs /iː/ contrast (it / eat, bin / been)'],
  /** the Season's whole language, by episode (80 items) */
  episodes: [
    {
      no: 1, name: 'Cold Open', objective: 'I can understand the main idea of a short story about a lost charger.',
      newItems: ['charger', 'phone', 'bag', 'cable', 'plug', 'room', 'mess', 'lost', 'find', 'look', 'where', 'here', 'there', 'Oh no!'],
      structures: [], games: [['listen-pick', 'flip-memory'], ['drag-match', 'snap']],
      mission: 'predict where the charger is and say why (1-2 sentences)', release: 'one-sentence reaction: My charger is…',
      story: 'Theo calls the club: his charger is lost. Vee: "Let us look at the room." A cable lies under the bed.', clue: 'A cable under the bed: not Theo\'s. Whose is it?',
    },
    {
      no: 2, name: 'Word Lab', objective: 'I can name furniture and gadgets in a room.',
      newItems: ['bed', 'desk', 'chair', 'lamp', 'window', 'door', 'shelf', 'table', 'sofa', 'wall', 'floor', 'laptop', 'headphones', 'poster'],
      structures: [], games: [['drag-match', 'flip-memory'], ['listen-pick', 'category-sort'], ['kims-game', 'spelling-rebuild']],
      mission: 'describe-and-draw: say an object, your teacher draws it; swap', release: 'voice note: my words (3 things in my room)',
      story: 'The room map: Vee and Theo name each thing so the search can start. Plural sounds: chairs, lamps, boxes.', clue: 'A sticker on the lamp: a club logo.',
    },
    {
      no: 3, name: 'Pattern Lab', objective: 'I can say what there is and what there are.',
      newItems: ['There is a bed.', 'There is an old lamp.', 'There are two chairs.', 'There are three bags.', 'There isn\'t a sofa.', 'There aren\'t any posters.', 'Is there a desk?', 'Are there any shelves?', 'Yes, there is.', 'No, there aren\'t.'],
      structures: ['there is / there are'], games: [['sentence-build', 'gap-fill'], ['sentence-halves', 'odd-one-out']],
      mission: 'sentence-build duel: describe Theo\'s room photo, then the club photo', release: 'write three sentences about my own room: There is… There are…',
      story: 'Two photos of the room: Before and After. Spot what changed: There are two chargers in the first photo, one in the second.', clue: 'Photo evidence: the charger vanished while the club was in the room.',
    },
    {
      no: 4, name: 'On Air', objective: 'I can ask where something is and say where it is.',
      newItems: ['in', 'on', 'under', 'Where is…?', 'Where are…?', 'It\'s…', 'They\'re…', 'Is it…?', 'Yes, it is.', 'No, it isn\'t.', 'Look!', 'Found it!', 'Can you help?', 'Thanks!'],
      structures: ['in / on / under'], games: [['sentence-build', 'say-it-memory'], ['listen-pick', 'gap-fill']],
      mission: 'role-play: Theo calls Ava; ask where the charger is, she answers; the teacher is Ava', release: 'record the call: Where is my charger?',
      story: 'Theo calls Ava: "Where is my charger?" Ava: "Is it on the desk? Is it under the bed?"', clue: 'Ava says: "It is in a bag."',
    },
    {
      no: 5, name: 'Deep Dive', objective: 'I can name colours and gadgets and read a short room description.',
      newItems: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'grey', 'brown', 'camera', 'speaker', 'tablet'],
      structures: [], games: [['drag-match', 'snap'], ['listen-pick', 'category-sort']],
      mission: 'summarise the description in 3 sentences: colour + thing + place', release: 'write a short description of one object in my room, then rewrite it to fix mistakes',
      story: 'Ava\'s message describes her bags: a red bag, a blue bag, a black bag. Which one has the charger?', clue: 'The charger is in the blue bag.',
    },
    {
      no: 6, name: 'Side Quest', objective: 'I can say exactly where things are in a room I choose.',
      newItems: ['next to', 'behind', 'in front of', 'between', 'above', 'near', 'top', 'bottom', 'left', 'right', 'middle', 'corner', 'drawer', 'box'],
      structures: ['next to / behind / in front of / between'], games: [['drag-match', 'flip-memory'], ['spelling-rebuild', 'odd-one-out']],
      mission: 'free choice: build a room (game room, studio, dorm) and describe where it all is', release: 'mini creation: a picture or voice note of my dream room',
      story: 'The student picks a skin (gaming room, music studio, dorm, art room) and places the things; Vee asks "Where is…?".', clue: 'Your room has a blue bag in the corner: a hint.',
    },
    {
      no: 7, name: 'Remix', objective: 'I can mix everything from this Season and the one before.',
      newItems: [], structures: [], games: [],
      mission: 'boss round: find 5 things from clues (place, colour, number)', release: 'recap clip: three things in a room, where they are',
      story: 'The boss room: a messy room; five clues, five things, one minute of thinking time each.', clue: 'The five things spell a word: C-L-U-B.',
    },
    {
      no: 8, name: 'Finale', objective: 'I can give a short voice-note tour of my room.',
      newItems: [], structures: [], games: [],
      mission: 'peer task: Take 1 and Take 2 of "Welcome to my room"', release: 'the Season Release: a voice-note tour of my room (30-45 seconds) and the checkpoint',
      story: 'Ava was borrowing the charger for the club night and forgot to say; she says sorry; Theo gives a tour of his room.', clue: 'The charger is back. Next: a new Season of the club.',
    },
  ] as A1S02Episode[],
} as const;

export const A1_S02_ITEM_COUNT = A1_S02.episodes.reduce((n, e) => n + e.newItems.length, 0);
