import type { CefrBucket } from './types';

// A1 Playground CEFR roadmap — the curriculum blueprint for A1.
// 10 buckets = the 10 themed worlds (owner decision 2026-10-12, Plan B), strengthened the same day with the
// Cambridge A1 Movers grammar spine (present continuous, must, weather, clothes, routines, time, past chunks)
// and no repeated "can" (docs/a1-playground-roadmap.md §3). Lesson-by-lesson plans: ./a1LessonPlans.ts.
// The rotator matches `topics` to each world's `topicAffinity` (src/curriculum/worlds/a1Worlds.ts).

export const A1_PLAYGROUND_BUCKETS: CefrBucket[] = [
  {
    index: 0, unitNumber: 1, unitTitle: 'Hello, Welcome Town!',
    topics: ['greetings', 'introductions', 'classroom', 'feelings'],
    grammarFocus: ['be (am/is/are) — I\'m / He\'s / She\'s / They\'re', 'What\'s your name? / How are you?', 'This is my friend…'],
    vocabularyFocus: ['hello', 'goodbye', 'name', 'friend', 'teacher', 'class', 'happy', 'sad', 'tired', 'hungry'],
    communicativeGoal: 'Greet, introduce myself and a friend, and say how we feel',
    successCriteria: ['Greet and say goodbye', 'Introduce self and a friend in full sentences', 'Ask and answer "How are you?" about me and others'],
    reviewTargets: [],
  },
  {
    index: 1, unitNumber: 2, unitTitle: 'What Can Animals Do?',
    topics: ['animals', 'actions', 'movement', 'abilities'],
    grammarFocus: ['it can / can\'t + verb (animals)', 'Can it…? Yes, it can / No, it can\'t', 'it\'s got + body part (a long tail)'],
    vocabularyFocus: ['monkey', 'elephant', 'snake', 'crocodile', 'climb', 'swing', 'long', 'short', 'tail'],
    communicativeGoal: 'Describe a jungle animal in 4 sentences (what it is, looks like, can, can\'t) and ask "Can it…?"',
    successCriteria: ['Say one can and one can\'t sentence about an animal', 'Ask and answer "Can it…?"', 'Describe an animal in 4 sentences'],
    reviewTargets: ['be (am/is/are) — I\'m / He\'s / She\'s / They\'re'],
  },
  {
    index: 2, unitNumber: 3, unitTitle: 'Counting Quest',
    topics: ['numbers', 'counting', 'directions', 'weather'],
    grammarFocus: ['How many…? There are + 21–100 (tens)', 'imperatives: Go left / right / up / down', 'above / below', 'What\'s the weather like? It\'s hot / cold / windy / sunny'],
    vocabularyFocus: ['thirty', 'forty', 'fifty', 'one hundred', 'rocket', 'planet', 'moon', 'astronaut', 'hot', 'cold', 'windy', 'sunny', 'cloudy', 'snow'],
    communicativeGoal: 'Count to 100 in tens, steer with directions and give a planet weather report',
    successCriteria: ['Count in tens to 100 and say how many', 'Follow and give 2-step directions', 'Say what the weather is like'],
    reviewTargets: ['How many? (numbers 1–20)'],
  },
  {
    index: 3, unitNumber: 4, unitTitle: 'I Like, I Don\'t Like',
    topics: ['food', 'likes_dislikes', 'ordering', 'meals'],
    grammarFocus: ['like / don\'t like + noun and + -ing (I like cooking)', 'Do you like…? Yes, I do / No, I don\'t', 'Would you like some…? Yes, please / No, thank you', 'Let\'s…!'],
    vocabularyFocus: ['rice', 'soup', 'salad', 'sandwich', 'chips', 'grapes', 'breakfast', 'lunch', 'dinner', 'cook'],
    communicativeGoal: 'Say what I like and like doing, ask a friend, and offer and accept food',
    successCriteria: ['Form 3 like / don\'t like sentences (one with -ing)', 'Ask "Do you like…?"', 'Offer and accept food politely'],
    reviewTargets: ['it can / can\'t + verb (animals)'],
  },
  {
    index: 4, unitNumber: 5, unitTitle: 'Faces, Feelings & Clothes',
    topics: ['emotions', 'appearance', 'describing_people', 'clothes'],
    grammarFocus: ['be + feeling + because… (chunk)', 'has got — looks and family (She\'s got a little brother)', 'He\'s / She\'s wearing… (present continuous chunk)'],
    vocabularyFocus: ['scared', 'excited', 'bored', 'surprised', 'teeth', 'horn', 'tail', 'brother', 'sister', 'wear', 'scarf', 'glasses'],
    communicativeGoal: 'Describe a monster in 4 sentences: how it feels and why, its looks, family and clothes',
    successCriteria: ['Say how someone feels and why', 'Use has got for looks and family', 'Say what someone is wearing'],
    reviewTargets: ['be (am/is/are) — I\'m / He\'s / She\'s / They\'re', 'like / don\'t like + noun and + -ing (I like cooking)'],
  },
  {
    index: 5, unitNumber: 6, unitTitle: 'What Is It Doing?',
    topics: ['sea_animals', 'questions', 'habitats', 'actions'],
    grammarFocus: ['present continuous: What\'s it doing? It\'s swimming / hiding', 'Is it a…? Yes, it is / No, it isn\'t', 'present simple with it: It lives in… It eats…'],
    vocabularyFocus: ['shark', 'whale', 'octopus', 'crab', 'turtle', 'starfish', 'shell', 'hide', 'dive'],
    communicativeGoal: 'Say what a sea animal is doing and where it lives, and find a hidden animal with yes/no questions',
    successCriteria: ['Say what 3 animals are doing', 'Say where an animal lives and what it eats', 'Ask 3 yes/no questions'],
    reviewTargets: ['He\'s / She\'s wearing… (present continuous chunk)', 'has got — looks and family (She\'s got a little brother)'],
  },
  {
    index: 6, unitNumber: 7, unitTitle: 'Hero Helpers',
    topics: ['abilities', 'helping', 'health', 'rules'],
    grammarFocus: ['I can… well / fast (adverbs)', 'Can I help you? Yes, please', 'What\'s the matter? I\'ve got a cold / a headache', 'must / mustn\'t'],
    vocabularyFocus: ['help', 'carry', 'lift', 'fix', 'save', 'headache', 'cold', 'toothache', 'strong', 'kind'],
    communicativeGoal: 'Help a citizen: ask what\'s wrong, offer help, say what I can do well and give one hero rule',
    successCriteria: ['Say what I can do well / fast', 'Ask "What\'s the matter?" and understand the answer', 'Give one must and one mustn\'t rule'],
    reviewTargets: ['it can / can\'t + verb (animals)', 'Would you like some…? Yes, please / No, thank you'],
  },
  {
    index: 7, unitNumber: 8, unitTitle: 'Bigger, Biggest, Long Ago',
    topics: ['sizes', 'comparisons', 'adjectives', 'past'],
    grammarFocus: ['comparatives + than', 'superlatives: the biggest / the fastest', 'past chunks: was / were, had (It was big. It had sharp teeth.)'],
    vocabularyFocus: ['dinosaur', 'egg', 'neck', 'claw', 'footprint', 'long ago', 'fast', 'slow', 'sharp'],
    communicativeGoal: 'Compare two dinosaurs and say what one was like long ago',
    successCriteria: ['Form 3 comparative sentences', 'Say which is the biggest', 'Say 2 sentences with was / had'],
    reviewTargets: ['I can… well / fast (adverbs)', 'has got — looks and family (She\'s got a little brother)'],
  },
  {
    index: 8, unitNumber: 9, unitTitle: 'Where Is It?',
    topics: ['household', 'rooms', 'prepositions', 'object_descriptions'],
    grammarFocus: ['there is / there are', 'Where is…? It\'s behind / between / in front of / next to…', 'Whose… is it? It\'s Wim\'s.'],
    vocabularyFocus: ['kitchen', 'bedroom', 'bathroom', 'hall', 'stairs', 'table', 'chair', 'bed', 'lamp', 'door', 'window'],
    communicativeGoal: 'Describe a room: say what is where and whose things are',
    successCriteria: ['Use 4 place words', 'Form 2 there is / there are sentences', 'Ask and answer "Whose…?"'],
    reviewTargets: ['How many…? There are + 21–100 (tens)'],
  },
  {
    index: 9, unitNumber: 10, unitTitle: 'How Does It Work?',
    topics: ['technology', 'instructions', 'routines', 'time'],
    grammarFocus: ['imperatives for instructions', 'sequence words (first / then / next)', 'present simple routines: Nano gets up at 7 o\'clock', 'What time is it? days of the week'],
    vocabularyFocus: ['press', 'turn', 'open', 'close', 'button', 'switch', 'first', 'then', 'next', 'o\'clock', 'get up', 'go to bed', 'Monday'],
    communicativeGoal: 'Give a robot 3-step instructions and tell its day with times',
    successCriteria: ['Give 3-step instructions', 'Tell the time (o\'clock)', 'Say 3 routine sentences with times or days'],
    reviewTargets: ['imperatives: Go left / right / up / down', 'must / mustn\'t', 'past chunks: was / were, had (It was big. It had sharp teeth.)'],
  },
];
