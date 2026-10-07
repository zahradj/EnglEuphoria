import type { BankQuestion } from './questionBanks';

/**
 * Academy placement items added in the placement-test redesign (docs/placement-test-research.md).
 *
 * Rules every item follows: one clearly correct answer, four plausible options, American spelling, teen-universal
 * topics (school, friends, hobbies, plans), no cultural knowledge needed. `difficulty` bands: A1 0.10-0.25,
 * A2 0.28-0.48, B1 0.50-0.66, B2 0.68-0.85, C1 0.88+ (they are expert estimates, to be checked by two teachers and
 * then refined with real answers - see the build plan). The feedback text is neutral on purpose: a placement test
 * must not teach the answer to the next question or tell the student how they are doing.
 */
const NEUTRAL = { correct: 'Thanks!', incorrect: 'Thanks!' };

export const ACADEMY_EXTRA: BankQuestion[] = [
  // ---- A1
  { question: 'My brother ___ twelve years old.', options: ['is', 'are', 'am', 'have'], correctIndex: 0, difficulty: 0.12, targetLevel: 'A1', feedback: NEUTRAL },
  { question: 'We ___ soccer after school.', options: ['plays', 'play', 'playing', 'to play'], correctIndex: 1, difficulty: 0.18, targetLevel: 'A1', feedback: NEUTRAL },
  { question: 'What do you use to write on paper?', options: ['a pen', 'a plate', 'a pillow', 'a pocket'], correctIndex: 0, difficulty: 0.1, targetLevel: 'A1', skill: 'vocabulary', feedback: NEUTRAL },
  { question: '"___ is your name?" "My name is Lina."', options: ['Who', 'What', 'Where', 'When'], correctIndex: 1, difficulty: 0.12, targetLevel: 'A1', feedback: NEUTRAL },
  { question: 'There ___ two books on the table.', options: ['is', 'are', 'am', 'be'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', feedback: NEUTRAL },
  { question: 'Monday, Tuesday, Wednesday, ___', options: ['Thursday', 'Saturday', 'Friday', 'Sunday'], correctIndex: 0, difficulty: 0.12, targetLevel: 'A1', skill: 'vocabulary', feedback: NEUTRAL },
  { question: 'Who does Sara live with?', options: ['Her friends', 'Her family', 'Her teacher', 'Her cousins'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', skill: 'reading', readingPassage: "Hi! I'm Sara. I'm 13. I live in Cairo with my mom, my dad and my little brother. I like pizza and music.", feedback: NEUTRAL },
  { question: "🎧 When is Tom's birthday?", options: ['In March', 'In May', 'In July', 'In June'], correctIndex: 1, difficulty: 0.2, targetLevel: 'A1', type: 'listening_match', audio_script: 'My name is Tom. I am fourteen years old. My birthday is in May.', feedback: NEUTRAL },

  // ---- A2
  { question: 'I ___ my homework yesterday evening.', options: ['did', 'do', 'doing', 'does'], correctIndex: 0, difficulty: 0.3, targetLevel: 'A2', feedback: NEUTRAL },
  { question: 'How ___ does this T-shirt cost?', options: ['many', 'much', 'long', 'old'], correctIndex: 1, difficulty: 0.35, targetLevel: 'A2', feedback: NEUTRAL },
  { question: 'Look at those dark clouds! It ___ rain.', options: ['is going to', 'goes to', 'is go to', 'going'], correctIndex: 0, difficulty: 0.4, targetLevel: 'A2', feedback: NEUTRAL },
  { question: 'You can use a ___ to find a place in a new city.', options: ['map', 'mirror', 'menu', 'medal'], correctIndex: 0, difficulty: 0.3, targetLevel: 'A2', skill: 'vocabulary', feedback: NEUTRAL },
  { question: "We didn't ___ the movie because it was boring.", options: ['liked', 'like', 'likes', 'liking'], correctIndex: 1, difficulty: 0.33, targetLevel: 'A2', feedback: NEUTRAL },
  { question: 'What must students NOT bring on the trip?', options: ['Lunch', 'Water', 'A phone', 'A bottle'], correctIndex: 2, difficulty: 0.38, targetLevel: 'A2', skill: 'reading', readingPassage: "Dear students, our school trip is on Friday. We meet at the school gate at 8:30. Please bring lunch and a bottle of water. Don't bring your phone. See you there! Ms. Lee", feedback: NEUTRAL },
  { question: '🎧 What time will they meet?', options: ['6:30', '7:00', '7:30', '8:00'], correctIndex: 1, difficulty: 0.4, targetLevel: 'A2', type: 'listening_match', audio_script: "Hi Anna, it's Jack. The movie starts at seven thirty, not eight. Let's meet outside the cinema at seven. Bring some money for popcorn!", feedback: NEUTRAL },
  { question: "There isn't ___ milk in the fridge.", options: ['some', 'any', 'many', 'a'], correctIndex: 1, difficulty: 0.42, targetLevel: 'A2', feedback: NEUTRAL },
  { question: 'He usually walks to school, but today he ___ the bus.', options: ['takes', 'is taking', 'take', 'has take'], correctIndex: 1, difficulty: 0.45, targetLevel: 'A2', feedback: NEUTRAL },
  { question: "I'm hungry. Let's have a ___ before the lesson.", options: ['snack', 'ticket', 'uniform', 'schedule'], correctIndex: 0, difficulty: 0.3, targetLevel: 'A2', skill: 'vocabulary', feedback: NEUTRAL },

  // ---- B1
  { question: "If it ___ tomorrow, we'll stay at home.", options: ['rains', 'will rain', 'rained', 'is raining'], correctIndex: 0, difficulty: 0.52, targetLevel: 'B1', feedback: NEUTRAL },
  { question: "We've known each other ___ three years.", options: ['since', 'for', 'from', 'during'], correctIndex: 1, difficulty: 0.55, targetLevel: 'B1', feedback: NEUTRAL },
  { question: 'The movie was so boring ___ I fell asleep.', options: ['that', 'than', 'as', 'but'], correctIndex: 0, difficulty: 0.6, targetLevel: 'B1', feedback: NEUTRAL },
  { question: 'She asked me where ___.', options: ['I lived', 'did I live', 'I live did', 'do I live'], correctIndex: 0, difficulty: 0.62, targetLevel: 'B1', feedback: NEUTRAL },
  { question: "He's the boy ___ won the school prize.", options: ['who', 'which', 'whose', 'whom'], correctIndex: 0, difficulty: 0.55, targetLevel: 'B1', feedback: NEUTRAL },
  { question: 'I used to ___ soccer every weekend when I was ten.', options: ['play', 'playing', 'played', 'plays'], correctIndex: 0, difficulty: 0.5, targetLevel: 'B1', feedback: NEUTRAL },
  { question: 'She was ___ about her exam results, so she called her mom.', options: ['worried', 'worrying', 'worry', 'worries'], correctIndex: 0, difficulty: 0.58, targetLevel: 'B1', skill: 'vocabulary', feedback: NEUTRAL },
  { question: "How did Maya's work change?", options: ['She stopped going', 'She started doing more interesting jobs', 'She moved to another town', 'She became a teacher'], correctIndex: 1, difficulty: 0.55, targetLevel: 'B1', skill: 'reading', readingPassage: "Last summer, Maya joined a volunteer program at an animal shelter near her town. At first she only cleaned the cages, which she found boring. After a month, the staff let her walk the dogs and help new visitors choose a pet. \"I didn't expect to learn so much,\" she says. \"Now I want to become a vet.\"", feedback: NEUTRAL },
  { question: '🎧 What is the announcement about?', options: ['The match is moved to another day', 'The match is at four tomorrow', 'The rain has stopped', 'The team has changed'], correctIndex: 0, difficulty: 0.58, targetLevel: 'B1', type: 'listening_match', audio_script: "Attention, students. Because of the heavy rain, tomorrow's soccer match is canceled. It will take place next Tuesday at four o'clock instead. Please tell your team.", feedback: NEUTRAL },
  { question: 'Please ___ attention to the teacher.', options: ['pay', 'make', 'take', 'do'], correctIndex: 0, difficulty: 0.6, targetLevel: 'B1', skill: 'vocabulary', feedback: NEUTRAL },
  { question: "You ___ bring a pen. We'll give you one.", options: ["mustn't", "don't have to", "can't", "shouldn't"], correctIndex: 1, difficulty: 0.64, targetLevel: 'B1', feedback: NEUTRAL },

  // ---- B2
  { question: 'If I had known about the test, I ___ harder.', options: ['would have studied', 'will study', 'studied', 'would study'], correctIndex: 0, difficulty: 0.75, targetLevel: 'B2', feedback: NEUTRAL },
  { question: 'The new library, ___ opened last month, has a gaming room.', options: ['which', 'what', 'who', 'where'], correctIndex: 0, difficulty: 0.68, targetLevel: 'B2', feedback: NEUTRAL },
  { question: 'By the time we arrived, the movie ___.', options: ['had already started', 'already started', 'has already started', 'was already start'], correctIndex: 0, difficulty: 0.74, targetLevel: 'B2', feedback: NEUTRAL },
  { question: 'She suggested ___ the project until next week.', options: ['to postpone', 'postponing', 'postpone', 'to postponing'], correctIndex: 1, difficulty: 0.78, targetLevel: 'B2', feedback: NEUTRAL },
  { question: "It's important to ___ a healthy balance between school and free time.", options: ['maintain', 'contain', 'obtain', 'retain'], correctIndex: 0, difficulty: 0.75, targetLevel: 'B2', skill: 'vocabulary', feedback: NEUTRAL },
  { question: 'What do the researchers suggest?', options: ['Phone bans have no effect at all', 'Banning phones is the only solution', 'The benefit is real but small and depends on other habits', 'Sleep is not important for students'], correctIndex: 2, difficulty: 0.8, targetLevel: 'B2', skill: 'reading', readingPassage: 'A recent study of 1,200 students found that those who put their phones away for the whole school day scored slightly higher in math tests. However, the researchers said the difference was small, and that students with good sleep habits benefited most. They also warned that banning phones completely can make students less able to manage their own screen time in the future.', feedback: NEUTRAL },
  { question: '🎧 What does the speaker think of the book?', options: ['She loved all of it', 'She liked the characters but not the ending', "She didn't like the characters", 'She thinks it was too long'], correctIndex: 1, difficulty: 0.78, targetLevel: 'B2', type: 'listening_match', audio_script: 'I get why people love the book, but honestly, I found the ending rushed. The first half was brilliant, though. The characters felt real. If it had been longer, I think I would have enjoyed it more.', feedback: NEUTRAL },
  { question: 'Hardly ___ the house when it started to rain.', options: ['had we left', 'we had left', 'did we leave', 'we left'], correctIndex: 0, difficulty: 0.85, targetLevel: 'B2', feedback: NEUTRAL },

  // ---- C1 (ceiling checks)
  { question: "The scientist's findings were met with ___ by her colleagues, who doubted the data.", options: ['enthusiasm', 'skepticism', 'indifference', 'gratitude'], correctIndex: 1, difficulty: 0.9, targetLevel: 'C1', skill: 'vocabulary', feedback: NEUTRAL },
  { question: 'Not until the results were published ___ the scale of the problem.', options: ['did people realize', 'people realized', 'people did realize', 'realized people'], correctIndex: 0, difficulty: 0.92, targetLevel: 'C1', feedback: NEUTRAL },
];
