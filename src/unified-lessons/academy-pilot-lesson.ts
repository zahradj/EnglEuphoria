/**
 * Academy pilot lesson — proves the unified PPP + activity engine for a
 * teen (B1) learner. Grounded in the pedagogy skills read for this build:
 *  - playground-curriculum-engine: intro -> discovery -> practice -> reward
 *    beats, no invented topic tied to a real curriculum slot (Academy has
 *    no curriculum_lessons row yet for this pilot).
 *  - expert-teacher-activity-architect: only documented ACTIVITY_CATALOG
 *    types/configs used (multiple, match, memory).
 * Vocabulary is deliberately drawn from playground-games.tsx's built-in
 * TRAIL_IMAGE_MAP (bus, hat, sun, fish) so match/memory activities resolve
 * real images with zero new art needed for this pilot.
 */
import type { UnifiedLesson } from './types';

export const academyPilotLesson: UnifiedLesson = {
  id: 'academy-pilot-lesson',
  title: 'Trip Prep',
  cefr: 'B1',
  hub: 'academy',
  defaultHostCharacterId: 'vee',
  moments: [
    {
      id: 'intro-1',
      kind: 'intro_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'intro',
          title: 'Trip Prep',
          subtitle: "Going somewhere soon? These are the exact words you'll need at check-in and the airport.",
        },
      ],
    },
    {
      id: 'discovery-1',
      kind: 'discovery_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      blocks: [
        { type: 'vocab_solo', word: 'suitcase', definition: 'A bag you use to pack your clothes for a trip.' },
        { type: 'vocab_solo', word: 'passport', definition: 'The official ID you need to travel to another country.' },
        { type: 'vocab_solo', word: 'boarding pass', definition: 'The ticket you show before getting on a plane.' },
      ],
    },
    {
      id: 'practice-1',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
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
      hostCharacterId: 'vee',
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
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'fill',
          label: 'Fill the gap',
          config: {
            text: 'I need to bring my ____ before the flight.',
            answer: 'passport',
            options: ['ticket', 'passport', 'bicycle'],
          },
        },
      ],
    },
    {
      id: 'practice-4',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'missing_letter',
          label: 'Write the missing letter',
          config: {
            instruction: 'What letter is missing?',
            word: 'bus',
            missing_position: 1,
          },
        },
      ],
    },
    {
      id: 'practice-5',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'hotspot',
          label: 'Spot the travel items',
          config: {
            instruction: 'Find each travel item Vee calls out.',
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
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'role_play',
          label: 'Check in for your flight',
          config: {
            prompt: 'Check in for your flight',
            character: 'Airport Agent',
            lines: [
              'Hello! Can I see your passport, please?',
              'Do you have any luggage to check?',
              "Great — here's your boarding pass. Have a safe flight!",
            ],
            scaffold: "Here's my passport.",
          },
        },
      ],
    },
    {
      id: 'practice-7',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'speaking_mission',
          label: 'Talk about your dream trip',
          config: {
            prompt: "Tell Vee about a trip you'd love to take — where and why?",
            scaffold: "I'd love to go to ___ because ___.",
          },
        },
      ],
    },
    {
      id: 'challenge-1',
      kind: 'challenge_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'multiple',
          label: 'Quick check',
          config: {
            question: 'Which one do you need to get on a plane?',
            options: ['passport', 'umbrella', 'bicycle'],
            answer: 'passport',
          },
        },
      ],
    },
    {
      id: 'reward-1',
      kind: 'reward_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'lesson_summary',
          title: 'Nice work!',
          bullets: [
            'You learned key travel vocabulary.',
            'You practiced matching and memory recall.',
            'Next up: role-playing at the airport.',
          ],
        },
      ],
    },
  ],
};
