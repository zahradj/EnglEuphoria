import type { HomeworkQuest } from './types';

/* A1 Monster Town (Unit 5) homework quests, one per lesson — the same level kinds as the Unit 2-4 quests. */

const S = '/lep1/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const page = (n: number) => `${S}/bg-a1u5-story-${n}-wide.png`;
const street = `${S}/bg-a1u5-street-wide.png`;
const lab = `${S}/bg-a1u5-lab-wide.png`;
const theme = (mapImg: string) => ({ accent: '#8B5CF6', accent2: '#14B8A6', night: false, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/mia-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Great job!', 'Monster-tastic!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = street) => ({ kind: 'treasure' as const, name: 'Monster Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "How Do You Feel? Scared, Bored, Excited!" */
export const QUEST_MONSTER_FEELINGS_A1_U5L1: HomeworkQuest = {
  id: 'monster-feelings-a1-u5l1', title: 'Monster Feelings Quest', subtitle: 'How Do You Feel? · A1 Unit 5 · Lesson 1', level: 'A1', lessonKey: 'monster-rich-5-1',
  theme: theme(page(1)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Bibi’s Faces', icon: '👾', intro: 'Listen. Tap Bibi’s face!', img: street,
      rounds: [
        { line: 'She’s scared.', answer: 'scared', options: [{ label: 'scared', src: it('bibi-scared') }, { label: 'happy', src: it('bibi-happy') }, { label: 'bored', src: it('bibi-bored') }] },
        { line: 'She’s excited!', answer: 'excited', options: [{ label: 'sad', src: it('bibi-sad') }, { label: 'excited', src: it('bibi-excited') }, { label: 'tired', src: it('bibi-tired') }] },
        { line: 'She’s surprised!', answer: 'surprised', options: [{ label: 'angry', src: it('bibi-angry') }, { label: 'scared', src: it('bibi-scared') }, { label: 'surprised', src: it('bibi-surprised') }] },
        { line: 'She’s bored.', answer: 'bored', options: [{ label: 'bored', src: it('bibi-bored') }, { label: 'excited', src: it('bibi-excited') }, { label: 'happy', src: it('bibi-happy') }] },
      ] },
    { kind: 'true-false', name: 'Why?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${S}/bg-a1u5-why-dark-wide.png`, aspect: 16 / 9, line: 'It’s dark. Bibi is scared.', isTrue: true },
        { img: `${S}/bg-a1u5-why-party-wide.png`, aspect: 16 / 9, line: 'It’s a party. Bibi is bored.', isTrue: false },
        { img: `${S}/bg-a1u5-why-present-wide.png`, aspect: 16 / 9, line: 'A big present! Bibi is surprised.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Because…', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('bibi-scared'), line: 'She is scared because it is dark.', extra: ['happy'] },
        { img: it('bibi-tired'), line: 'She is tired because it is early.', extra: ['party'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(3),
      sentences: ['This is Monster Town. Look! A tiny monster.', 'This is Bibi. Bibi is tired because it is early.', 'It is dark. Bibi is scared!'],
      questions: [
        { q: 'Who is the tiny monster?', options: ['Bibi', 'Pip', 'Leo'], answer: 'Bibi' },
        { q: 'Why is Bibi tired?', options: ['It is early.', 'It is a party.', 'It is hot.'], answer: 'It is early.' },
      ] },
    { kind: 'twister', name: 'Bee Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: lab, line: 'Three green bees see sheep.', seconds: 45, focus: 'ee', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: lab,
      rounds: [
        { word: 'bee', sounds: ['b', 'ee'], picture: it('bee') },
        { word: 'sheep', sounds: ['sh', 'ee', 'p'], picture: it('sheep') },
      ] },
    chest('You did it! Feelings expert!'),
  ],
};

/** Lesson 2 "What Do They Look Like? Tall, Short, Big, Small" */
export const QUEST_MONSTER_LOOKS_A1_U5L2: HomeworkQuest = {
  id: 'monster-looks-a1-u5l2', title: 'Monster Looks Quest', subtitle: 'What Do They Look Like? · A1 Unit 5 · Lesson 2', level: 'A1', lessonKey: 'monster-rich-5-2',
  theme: theme(`${S}/bg-a1u5-home-wide.png`), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Who Is It?', icon: '👀', intro: 'Listen. Tap the right monster!', img: `${S}/bg-a1u5-home-wide.png`,
      rounds: [
        { line: 'He’s got three eyes.', answer: 'Big Bob', options: [{ label: 'Big Bob', src: it('big-bob') }, { label: 'Bea', src: it('bea') }, { label: 'Bibi', src: it('bibi-happy') }] },
        { line: 'He’s got one big eye.', answer: 'Professor Glob', options: [{ label: 'Bibi', src: it('bibi-happy') }, { label: 'Professor Glob', src: it('glob') }, { label: 'Big Bob', src: it('big-bob') }] },
        { line: 'She’s got a yellow bow.', answer: 'Bea', options: [{ label: 'Big Bob', src: it('big-bob') }, { label: 'Bibi', src: it('bibi-happy') }, { label: 'Bea', src: it('bea') }] },
      ] },
    { kind: 'true-false', name: 'Tall or Short?', icon: '📏', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(5), aspect: 16 / 9, line: 'Big Bob is very tall.', isTrue: true },
        { img: page(5), aspect: 16 / 9, line: 'Bibi is tall.', isTrue: false },
        { img: `${S}/bg-a1u5-family-photo-wide.png`, aspect: 16 / 9, line: 'Bibi has got a little sister.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'She’s Got…', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('mb-horns-long'), line: 'She has got long horns.', extra: ['short'] },
        { img: it('bea'), line: 'She has got a little sister.', extra: ['brother'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(4),
      sentences: ['It is dark. Bibi is scared!', 'The lesson is long. Bibi is bored.', 'Big Bob has got three eyes. He is very tall.'],
      questions: [
        { q: 'Why is Bibi bored?', options: ['The lesson is long.', 'It is a party.', 'It is dark.'], answer: 'The lesson is long.' },
        { q: 'How many eyes has Big Bob got?', options: ['one', 'two', 'three'], answer: 'three' },
      ] },
    { kind: 'twister', name: 'Sea Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: `${S}/bg-a1u5-home-wide.png`, line: 'Sea monsters eat peas at the beach.', seconds: 50, focus: 'ea', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: `${S}/bg-a1u5-home-wide.png`,
      rounds: [
        { word: 'tea', sounds: ['t', 'ea'], picture: it('tea') },
        { word: 'seal', sounds: ['s', 'ea', 'l'], picture: it('seal') },
      ] },
    chest('You did it! Monster expert!', `${S}/bg-a1u5-home-wide.png`),
  ],
};

/** Lesson 3 "Listen to the Feelings Song" */
export const QUEST_MONSTER_SONG_A1_U5L3: HomeworkQuest = {
  id: 'monster-song-a1-u5l3', title: 'Monster Music Quest', subtitle: 'Listen to the Feelings Song · A1 Unit 5 · Lesson 3', level: 'A1', lessonKey: 'monster-rich-5-3',
  theme: theme(`${S}/bg-a1u5-stage-wide.png`), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Name That Feeling', icon: '🔔', intro: 'Listen to Bibi. How does she feel?', img: `${S}/bg-a1u5-stage-wide.png`,
      rounds: [
        { line: 'It’s dark! Oh no!', answer: 'scared', options: [{ label: 'excited', src: it('bibi-excited') }, { label: 'scared', src: it('bibi-scared') }, { label: 'bored', src: it('bibi-bored') }] },
        { line: 'The lesson is long… so long.', answer: 'bored', options: [{ label: 'bored', src: it('bibi-bored') }, { label: 'surprised', src: it('bibi-surprised') }, { label: 'sad', src: it('bibi-sad') }] },
        { line: 'A party for me! Hooray!', answer: 'excited', options: [{ label: 'sad', src: it('bibi-sad') }, { label: 'scared', src: it('bibi-scared') }, { label: 'excited', src: it('bibi-excited') }] },
      ] },
    { kind: 'true-false', name: 'Why?', icon: '🤔', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(7), aspect: 16 / 9, line: 'Bibi is sad because she is tiny.', isTrue: true },
        { img: page(6), aspect: 16 / 9, line: 'Bibi has got a big brother.', isTrue: false },
        { img: page(3), aspect: 16 / 9, line: 'Bibi is scared because it is dark.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Why Are You…?', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('bibi-sad'), line: 'Why are you sad?', extra: ['how'] },
        { img: it('bibi-scared'), line: 'She is scared because it is dark.', extra: ['bored'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(6),
      sentences: ['Big Bob has got three eyes. He is very tall.', 'Bibi has got a little sister. Her name is Bea.', 'Bibi is sad because she is tiny.'],
      questions: [
        { q: 'Who is Bea?', options: ['Bibi’s sister', 'Bibi’s mom', 'Bibi’s teacher'], answer: 'Bibi’s sister' },
        { q: 'Why is Bibi sad?', options: ['She is tiny.', 'It is a party.', 'It is dark.'], answer: 'She is tiny.' },
      ] },
    { kind: 'twister', name: 'Pea Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: page(6), line: 'Bea eats green peas.', seconds: 45, focus: 'ee', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: `${S}/bg-a1u5-stage-wide.png`,
      rounds: [
        { word: 'leaf', sounds: ['l', 'ea', 'f'], picture: it('leaf') },
        { word: 'cheese', sounds: ['ch', 'ee', 'z'], picture: it('cheese') },
      ] },
    chest('You did it! Super listener!', `${S}/bg-a1u5-stage-wide.png`),
  ],
};

/** Lesson 4 "Describe a Monster Friend!" */
export const QUEST_MONSTER_FRIEND_A1_U5L4: HomeworkQuest = {
  id: 'monster-friend-a1-u5l4', title: 'Monster Friend Quest', subtitle: 'Describe a Monster Friend! · A1 Unit 5 · Lesson 4', level: 'A1', lessonKey: 'monster-rich-5-4',
  theme: theme(`${S}/bg-a1u5-laundry-wide.png`), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'What Is It?', icon: '🧣', intro: 'Listen. Tap the right picture!', img: `${S}/bg-a1u5-laundry-wide.png`,
      rounds: [
        { line: 'He’s wearing a scarf.', answer: 'scarf', options: [{ label: 'hat', src: it('hat') }, { label: 'scarf', src: it('scarf') }, { label: 'boots', src: it('boots') }] },
        { line: 'She’s wearing glasses.', answer: 'glasses', options: [{ label: 'glasses', src: it('glasses') }, { label: 'coat', src: it('coat-blue') }, { label: 'hat', src: it('hat') }] },
        { line: 'He’s wearing boots.', answer: 'boots', options: [{ label: 'scarf', src: it('scarf') }, { label: 'glasses', src: it('glasses') }, { label: 'boots', src: it('boots') }] },
      ] },
    { kind: 'true-false', name: 'True or False?', icon: '👓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(8), aspect: 16 / 9, line: 'Leo is wearing a green scarf.', isTrue: true },
        { img: page(8), aspect: 16 / 9, line: 'Mia is wearing boots.', isTrue: false },
        { img: page(9), aspect: 16 / 9, line: 'Bibi is sad.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'He’s Wearing…', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('hat'), line: 'He is wearing a big hat.', extra: ['got'] },
        { img: it('glasses'), line: 'She is wearing glasses.', extra: ['has'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(8),
      sentences: ['Bibi is sad because she is tiny.', 'Leo is wearing a green scarf. Mia is wearing glasses.', 'Mia: Why are you sad, Bibi?'],
      questions: [
        { q: 'What is Mia wearing?', options: ['glasses', 'a scarf', 'boots'], answer: 'glasses' },
        { q: 'Who asks Bibi a question?', options: ['Mia', 'Leo', 'Big Bob'], answer: 'Mia' },
      ] },
    { kind: 'twister', name: 'Funny Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: `${S}/bg-a1u5-laundry-wide.png`, line: 'Funny Bibi is happy and sleepy.', seconds: 45, focus: 'y', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: `${S}/bg-a1u5-laundry-wide.png`,
      rounds: [
        { word: 'happy', sounds: ['h', 'a', 'pp=p', 'y=ee'], picture: it('bibi-happy') },
        { word: 'teddy', sounds: ['t', 'e', 'dd=d', 'y=ee'], picture: it('teddy') },
      ] },
    chest('You did it! Monster friend expert!', `${S}/bg-a1u5-laundry-wide.png`),
  ],
};

/** Lesson 5 "Storybook: Bibi's Bad Day" */
export const QUEST_BIBI_STORY_A1_U5L5: HomeworkQuest = {
  id: 'bibi-story-a1-u5l5', title: 'Bibi’s Story Quest', subtitle: 'Storybook: Bibi’s Bad Day · A1 Unit 5 · Lesson 5', level: 'A1', lessonKey: 'monster-rich-5-5',
  theme: theme(page(11)), voice: 'teacher', praise,
  levels: [
    { kind: 'reading', name: 'Read the Story', icon: '📖', intro: 'Read Bibi’s story. Then answer from memory!', img: page(10),
      sentences: ['Bibi is tired because it is early.', 'Bibi is sad because she is tiny.', 'Surprise! Bibi is surprised.', 'Bibi is excited because it is a party for her!', 'Bibi is happy. It is a good day after all!'],
      questions: [
        { q: 'Why is Bibi sad?', options: ['She is tiny.', 'It is a party.', 'It is sunny.'], answer: 'She is tiny.' },
        { q: 'Why is Bibi excited?', options: ['It is early.', 'It is a party for her.', 'The lesson is long.'], answer: 'It is a party for her.' },
      ] },
    { kind: 'picture-choice', name: 'How Does She Feel?', icon: '😮', intro: 'Listen. Tap Bibi’s face!', img: page(12),
      rounds: [
        { line: 'Surprise! Bibi is surprised.', answer: 'surprised', options: [{ label: 'tired', src: it('bibi-tired') }, { label: 'surprised', src: it('bibi-surprised') }, { label: 'sad', src: it('bibi-sad') }] },
        { line: 'It is dark. Bibi is scared.', answer: 'scared', options: [{ label: 'scared', src: it('bibi-scared') }, { label: 'happy', src: it('bibi-happy') }, { label: 'bored', src: it('bibi-bored') }] },
        { line: 'It is a good day! Bibi is happy.', answer: 'happy', options: [{ label: 'sad', src: it('bibi-sad') }, { label: 'excited', src: it('bibi-excited') }, { label: 'happy', src: it('bibi-happy') }] },
      ] },
    { kind: 'true-false', name: 'True or False?', icon: '🎉', intro: 'Look and listen. True or false?',
      rounds: [
        { img: page(11), aspect: 16 / 9, line: 'There is a big cake.', isTrue: true },
        { img: page(10), aspect: 16 / 9, line: 'Bibi is bored.', isTrue: false },
        { img: page(12), aspect: 16 / 9, line: 'Bibi is happy.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Because…', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('bibi-scared'), line: 'Bibi is scared because it is dark.', extra: ['happy'] },
        { img: it('bibi-excited'), line: 'She is excited because it is a party.', extra: ['sad'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: page(11),
      rounds: [
        { word: 'eat', sounds: ['ea', 't'], picture: it('cake') },
        { word: 'teeth', sounds: ['t', 'ee', 'th'], picture: it('mb-mouth-teeth') },
      ] },
    chest('You did it! Story star!', page(12)),
  ],
};

/** Lesson 6 "Feelings Charades!" */
export const QUEST_GAME_NIGHT_A1_U5L6: HomeworkQuest = {
  id: 'game-night-a1-u5l6', title: 'Game Night Quest', subtitle: 'Feelings Charades! · A1 Unit 5 · Lesson 6', level: 'A1', lessonKey: 'monster-rich-5-6',
  theme: theme(`${S}/bg-a1u5-gamenight-wide.png`), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Which Feeling?', icon: '🎭', intro: 'Listen. Tap Bibi’s face!', img: `${S}/bg-a1u5-gamenight-wide.png`,
      rounds: [
        { line: 'She’s tired because it’s early.', answer: 'tired', options: [{ label: 'tired', src: it('bibi-tired') }, { label: 'excited', src: it('bibi-excited') }, { label: 'sad', src: it('bibi-sad') }] },
        { line: 'She’s excited because it’s a party.', answer: 'excited', options: [{ label: 'bored', src: it('bibi-bored') }, { label: 'excited', src: it('bibi-excited') }, { label: 'scared', src: it('bibi-scared') }] },
        { line: 'She’s bored because the lesson is long.', answer: 'bored', options: [{ label: 'happy', src: it('bibi-happy') }, { label: 'surprised', src: it('bibi-surprised') }, { label: 'bored', src: it('bibi-bored') }] },
      ] },
    { kind: 'sentence-builder', name: 'Ask Me!', icon: '❓', intro: 'Listen. Build the question!',
      rounds: [
        { img: it('hat'), line: 'Is your monster wearing a hat?', extra: ['got'] },
        { img: it('mb-horns-long'), line: 'Has your monster got long horns?', extra: ['is'] },
      ] },
    { kind: 'true-false', name: 'True or False?', icon: '🎲', intro: 'Look and listen. True or false?',
      rounds: [
        { img: it('big-bob'), line: 'Big Bob is very tall.', isTrue: true },
        { img: it('scarf'), line: 'This is a hat.', isTrue: false },
        { img: it('bibi-scared'), line: 'Bibi is scared.', isTrue: true },
      ] },
    { kind: 'twister', name: 'Twister Race', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: `${S}/bg-a1u5-gamenight-wide.png`, line: 'Three green bees see sheep.', seconds: 45, focus: 'ee', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: `${S}/bg-a1u5-gamenight-wide.png`,
      rounds: [
        { word: 'sheep', sounds: ['sh', 'ee', 'p'], picture: it('sheep') },
        { word: 'funny', sounds: ['f', 'u', 'nn=n', 'y=ee'], picture: it('bibi-happy') },
      ] },
    chest('You did it! Game night champion!', `${S}/bg-a1u5-gamenight-wide.png`),
  ],
};
