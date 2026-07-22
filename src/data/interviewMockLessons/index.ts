/**
 * Interview Arena — Mock Lessons
 *
 * Short (~10 min) pre-built lessons used during teacher interviews so the
 * applicant has real material to teach on the live classroom canvas.
 *
 * Shapes match the PlaygroundDemo / AcademyDemo / SuccessDemo SlideRenderers
 * already consumed by `src/pages/LiveClassroom.tsx`.
 *
 * Loaded when `classroom_states.is_interview === true` AND no `lesson_id`.
 */
import type { Slide as PlaygroundSlide } from '@/pages/PlaygroundDemo';
import type { Slide as AcademySlide } from '@/pages/AcademyDemo';
import type { Slide as SuccessSlide } from '@/pages/SuccessDemo';

export type MockLessonKey =
  | 'magic_link_default'
  | 'playground_sampler'
  | 'academy_sampler'
  | 'success_sampler';

export interface MockLesson {
  key: MockLessonKey;
  title: string;
  hub: 'playground' | 'academy' | 'success';
  slides: PlaygroundSlide[] | AcademySlide[] | SuccessSlide[];
}

const playgroundSampler: MockLesson = {
  key: 'playground_sampler',
  hub: 'playground',
  title: 'Mock Demo · Animals & Sounds (Playground)',
  slides: [
    {
      type: 'intro',
      title: '👋 Welcome to the Demo Class!',
      text: 'Today we will meet some friendly animals and learn their names in English.',
      voice: { text: 'Hello! Today we will meet some friendly animals.', autoPlay: false },
    },
    {
      type: 'vocab_solo',
      word: 'cat',
      definition: 'A small furry pet that says meow.',
    },
    {
      type: 'match',
      instruction: 'Match each word to the correct picture.',
      pairs: [
        { word: 'cat', image_url: '/placeholder.svg' },
        { word: 'dog', image_url: '/placeholder.svg' },
        { word: 'bird', image_url: '/placeholder.svg' },
      ],
    },
    {
      type: 'multiple',
      question: 'Which animal says "meow"?',
      options: ['Dog', 'Cat', 'Bird'],
      answer: 'Cat',
    },
    {
      type: 'fill',
      text: 'A ___ says woof.',
      answer: 'dog',
    },
    {
      type: 'lesson_summary',
      title: 'Great job!',
      vocab_recap: ['cat', 'dog', 'bird'],
      takeaway: 'You learned three animal words today!',
    },
  ] as PlaygroundSlide[],
};

const academySampler: MockLesson = {
  key: 'academy_sampler',
  hub: 'academy',
  title: 'Mock Demo · Past Simple Storytime (Academy)',
  slides: [
    {
      type: 'intro',
      title: 'Welcome to the Demo Lesson',
      text: 'Today we will review the past simple tense through a short story.',
    } as any,
    {
      type: 'multiple',
      question: 'Yesterday I ___ to the cinema.',
      options: ['go', 'went', 'goes', 'going'],
      answer: 'went',
    } as any,
    {
      type: 'fill',
      text: 'She ___ a beautiful song last night. (sing)',
      answer: 'sang',
    } as any,
    {
      type: 'multiple',
      question: 'Choose the correct past form of "buy":',
      options: ['buyed', 'bought', 'buyt', 'buying'],
      answer: 'bought',
    } as any,
    {
      type: 'lesson_summary',
      title: 'Recap',
      vocab_recap: ['went', 'sang', 'bought'],
      grammar_recap: 'Past simple is used for completed actions in the past.',
    } as any,
  ] as AcademySlide[],
};

const successSampler: MockLesson = {
  key: 'success_sampler',
  hub: 'success',
  title: 'Mock Demo · Polite Requests at Work (Professional)',
  slides: [
    {
      type: 'intro',
      title: 'Welcome',
      text: 'Today we will practice making polite professional requests in English.',
    } as any,
    {
      type: 'multiple',
      question: 'Which is the most polite way to ask a colleague for help?',
      options: [
        'Give me that file.',
        'I need that file.',
        'Could you please send me that file when you have a moment?',
        'Send file now.',
      ],
      answer: 'Could you please send me that file when you have a moment?',
    } as any,
    {
      type: 'fill',
      text: '____ you mind reviewing this report before Friday?',
      answer: 'Would',
    } as any,
    {
      type: 'lesson_summary',
      title: 'Recap',
      vocab_recap: ['could you please', 'would you mind', 'I was wondering if'],
      takeaway: 'Polite requests use modal verbs and softer phrasing.',
    } as any,
  ] as SuccessSlide[],
};

/**
 * Magic-link default — used by `/interview/:token` when the interview row
 * doesn't pin a specific mock_lesson_key. Exactly 1 reading passage + 1
 * vocab game, so the applicant has material to teach within seconds of
 * entering the arena.
 */
const magicLinkDefault: MockLesson = {
  key: 'magic_link_default',
  hub: 'academy',
  title: 'Interview Demo · The Morning Market (Reading + Vocabulary)',
  slides: [
    {
      type: 'intro',
      title: '📖 Reading: The Morning Market',
      text:
        'Every Saturday, Maya walks to the morning market near her house. She buys fresh bread, sweet apples, and a small bunch of yellow flowers. The market is noisy and busy, but Maya loves the smell of warm bread and the colors of the fruit. She always comes home smiling.',
      voice: {
        text:
          'Every Saturday, Maya walks to the morning market near her house. She buys fresh bread, sweet apples, and a small bunch of yellow flowers.',
        autoPlay: false,
      },
    } as any,
    {
      type: 'match',
      instruction: 'Vocabulary game — match each word from the passage to its picture.',
      pairs: [
        { word: 'bread', image_url: '/placeholder.svg' },
        { word: 'apples', image_url: '/placeholder.svg' },
        { word: 'flowers', image_url: '/placeholder.svg' },
        { word: 'market', image_url: '/placeholder.svg' },
      ],
    } as any,
  ] as AcademySlide[],
};

export const INTERVIEW_MOCK_LESSONS: Record<MockLessonKey, MockLesson> = {
  magic_link_default: magicLinkDefault,
  playground_sampler: playgroundSampler,
  academy_sampler: academySampler,
  success_sampler: successSampler,
};

export function getMockLesson(key: string | null | undefined): MockLesson {
  if (key && key in INTERVIEW_MOCK_LESSONS) {
    return INTERVIEW_MOCK_LESSONS[key as MockLessonKey];
  }
  return magicLinkDefault;
}

