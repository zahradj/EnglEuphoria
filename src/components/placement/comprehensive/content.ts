// Static content bank for the 4-skill Comprehensive Placement Test.
// Hardcoded for v1 — deterministic, ships immediately. Can later be swapped
// for a curriculum-fed bank without touching the phase components.

export interface ListeningItem {
  id: string;
  audio_text: string;            // What ElevenLabs will say
  options: { id: string; emoji: string; label: string }[];
  correctId: string;
}

export interface ReadingQuestion {
  qid: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ReadingPassage {
  passage: string;
  questions: ReadingQuestion[];
}

export interface WritingPrompt {
  prompt: string;
  imageUrl: string;
  minChars: number;
}

export interface SpeakingPrompt {
  prompt: string;
  guidance: string;
}

export const LISTENING_ITEMS: ListeningItem[] = [
  {
    id: 'L1',
    audio_text: 'I am drinking a hot cup of coffee in the kitchen.',
    options: [
      { id: 'a', emoji: '☕', label: 'A coffee in the kitchen' },
      { id: 'b', emoji: '🍵', label: 'Tea in the garden' },
      { id: 'c', emoji: '🥤', label: 'A cold drink at the beach' },
      { id: 'd', emoji: '🍷', label: 'Wine at a restaurant' },
    ],
    correctId: 'a',
  },
  {
    id: 'L2',
    audio_text: 'She takes the train to work every morning at eight o\'clock.',
    options: [
      { id: 'a', emoji: '🚗', label: 'She drives a car' },
      { id: 'b', emoji: '🚆', label: 'She takes the train' },
      { id: 'c', emoji: '🚲', label: 'She rides a bike' },
      { id: 'd', emoji: '🚶', label: 'She walks to work' },
    ],
    correctId: 'b',
  },
  {
    id: 'L3',
    audio_text:
      'If I had known about the meeting earlier, I would have prepared a full report for the team.',
    options: [
      { id: 'a', emoji: '📅', label: 'The speaker forgot the meeting' },
      { id: 'b', emoji: '📝', label: 'The speaker prepared a report' },
      { id: 'c', emoji: '😕', label: 'The speaker regrets not preparing' },
      { id: 'd', emoji: '🎉', label: 'The meeting was cancelled' },
    ],
    correctId: 'c',
  },
];

export const READING_PASSAGE: ReadingPassage = {
  passage:
    "Maya works as a junior architect in a small studio downtown. Although she enjoys her job, she often stays late to finish her drawings, which leaves her little time for hobbies. Last weekend she finally took a short trip to the coast — her first proper break in months. She came back feeling refreshed and decided to set firmer limits on her working hours so she could spend more time painting, something she had loved as a teenager but rarely did anymore.",
  questions: [
    {
      qid: 'R1',
      question: 'What is Maya\'s job?',
      options: ['Painter', 'Architect', 'Travel agent', 'Studio manager'],
      correctIndex: 1,
    },
    {
      qid: 'R2',
      question: 'Why does she rarely have time for hobbies?',
      options: [
        'She lives far from the city',
        'She works late to finish her drawings',
        'She is studying for an exam',
        'She is travelling for work',
      ],
      correctIndex: 1,
    },
    {
      qid: 'R3',
      question: 'What did the trip make her decide?',
      options: [
        'To change her career',
        'To travel every month',
        'To work fewer hours and paint more',
        'To move to the coast',
      ],
      correctIndex: 2,
    },
  ],
};

export const WRITING_PROMPT: WritingPrompt = {
  prompt:
    'Look at this picture and describe what is happening in 3 sentences. Try to mention the people, the place, and how they might be feeling.',
  imageUrl: '/placeholder.svg',
  minChars: 120,
};

export const SPEAKING_PROMPT: SpeakingPrompt = {
  prompt: 'Tell us about a typical day in your life. What do you usually do from morning to evening?',
  guidance: 'Speak for at least 20 seconds. Try to use linking words like "first", "then", and "finally".',
};
