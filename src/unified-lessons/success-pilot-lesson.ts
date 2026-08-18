/**
 * Success pilot lesson — proves the unified PPP + activity engine for an
 * adult/professional learner, reusing the same 3 catalog activity types
 * (match, memory, multiple) as the Academy pilot so the HubTheme re-skin
 * work in playground-games.tsx is validated once, not duplicated per hub.
 * See academy-pilot-lesson.ts for the pedagogy-skill grounding notes.
 */
import type { UnifiedLesson } from './types';

export const successPilotLesson: UnifiedLesson = {
  id: 'success-pilot-lesson',
  title: 'Business Travel Essentials',
  cefr: 'B2',
  hub: 'success',
  defaultHostCharacterId: 'sol',
  moments: [
    {
      id: 'intro-1',
      kind: 'intro_moment',
      mode: 'presentation',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'intro',
          title: 'Business Travel Essentials',
          subtitle: "You'll need this vocabulary the next time you book a flight or file a trip expense report — let's make sure you're ready.",
        },
      ],
    },
    {
      id: 'discovery-1',
      kind: 'discovery_moment',
      mode: 'presentation',
      hostCharacterId: 'sol',
      blocks: [
        { type: 'vocab_solo', word: 'itinerary', definition: 'A planned schedule of the places you will visit on a trip.' },
        { type: 'vocab_solo', word: 'connecting flight', definition: 'A second flight you take to reach your final destination.' },
        { type: 'vocab_solo', word: 'expense report', definition: 'A document listing money you spent on a business trip.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'match',
          label: 'Match the travel items',
          config: {
            instruction: 'Match each word to its picture.',
            pairs: [
              { word: 'bus', image_url: '' },
              { word: 'hat', image_url: '' },
              { word: 'sun', image_url: '' },
            ],
          },
        },
      ],
    },
    {
      id: 'practice-2',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'memory',
          label: 'Find the travel word pairs',
          config: {
            instruction: 'Flip the cards and find the matching pairs.',
            pairs: [
              { id: 'bus', label: 'bus', emoji: '🚌' },
              { id: 'hat', label: 'hat', emoji: '🧢' },
              { id: 'sun', label: 'sun', emoji: '☀️' },
              { id: 'fish', label: 'fish', emoji: '🐟' },
            ],
          },
        },
      ],
    },
    {
      id: 'practice-3',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'fill',
          label: 'Fill the gap',
          config: {
            text: 'Please review the ____ before you book your flights.',
            answer: 'itinerary',
            options: ['itinerary', 'suitcase', 'umbrella'],
          },
        },
      ],
    },
    {
      id: 'practice-4',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'missing_letter',
          label: 'Write the missing letter',
          config: {
            instruction: 'What letter is missing?',
            word: 'sun',
            missing_position: 1,
          },
        },
      ],
    },
    {
      id: 'practice-5',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'hotspot',
          label: 'Spot the travel items',
          config: {
            instruction: 'Find each travel item Sol calls out.',
            parts: [
              { label: 'bus', emoji: '🚌' },
              { label: 'hat', emoji: '🧢' },
              { label: 'sun', emoji: '☀️' },
              { label: 'fish', emoji: '🐟' },
            ],
          },
        },
      ],
    },
    {
      id: 'practice-6',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'role_play',
          label: 'Discuss your itinerary with a colleague',
          config: {
            prompt: 'Discuss your itinerary with a colleague',
            character: 'Colleague',
            lines: [
              'Hey, are you all set for the trip?',
              'What time does your connecting flight leave?',
              "Don't forget to submit your expense report when you're back!",
            ],
            scaffold: "Yes, I'm all set.",
          },
        },
      ],
    },
    {
      id: 'practice-7',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'speaking_mission',
          label: 'Summarize your trip',
          config: {
            prompt: 'Summarize your upcoming business trip in two sentences.',
            scaffold: "I'm traveling to ___ to ___.",
          },
        },
      ],
    },
    {
      id: 'challenge-1',
      kind: 'challenge_moment',
      mode: 'activity',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'multiple',
          label: 'Quick check',
          config: {
            question: 'What do you submit after a trip to get reimbursed?',
            options: ['expense report', 'boarding pass', 'itinerary'],
            answer: 'expense report',
          },
        },
      ],
    },
    {
      id: 'reward-1',
      kind: 'reward_moment',
      mode: 'presentation',
      hostCharacterId: 'sol',
      blocks: [
        {
          type: 'lesson_summary',
          title: 'Well done!',
          bullets: [
            'You reviewed key business travel vocabulary.',
            'You practiced recall and matching.',
            'Next up: drafting a short trip itinerary.',
          ],
        },
      ],
    },
  ],
};
