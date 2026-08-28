/**
 * Academy pilot lesson — proves the unified PPP + activity engine for a
 * teen (B1) learner. Grounded in the pedagogy skills read for this build:
 *  - playground-curriculum-engine: intro -> discovery -> practice -> reward
 *    beats, no invented topic tied to a real curriculum slot (Academy has
 *    no curriculum_lessons row yet for this pilot).
 *  - expert-teacher-activity-architect: only documented ACTIVITY_CATALOG
 *    types/configs used (multiple, match, memory).
 *
 * Real classroom lesson shape, not just "intro then a pile of activities":
 * intro (Level · Unit · Lesson + brand) -> warm-up (energizer + review of
 * the previous lesson, never new material) -> story (introduces the target
 * vocabulary in context) -> discovery (the same words, now on their own) ->
 * vocabulary game -> further practice -> challenge -> reward. Every
 * activity's words/pictures are the lesson's own three travel words
 * (passport/suitcase/boarding pass), generated via generate-slide-image —
 * no unrelated placeholder vocabulary (bus/hat/sun) left in here.
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
          // Level · Unit · Lesson, explicit and in that order — the cover
          // slide is where a student/teacher orients themselves in the
          // course, not just a title card.
          kicker: 'B1 · UNIT 1 · LESSON 1',
          title: 'Trip Prep',
          subtitle: "Going somewhere soon? These are the exact words you'll need at check-in and the airport.",
          heroImageUrl: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-intro-hero-1787374276856.png',
        },
      ],
    },
    {
      // Warm-up — the real first beat of a classroom lesson, before any new
      // content: an energizer (a tongue twister to listen-and-repeat) plus a
      // quick review of the previous lesson, never brand-new material.
      id: 'warmup-1',
      kind: 'warmup_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'echo',
          label: 'Warm-up: tongue twister',
          config: {
            prompt: "Let's wake up our mouths! Say it fast three times:",
            sentence: 'Pack a bag, grab a map, off we go!',
          },
        },
        {
          type: 'catalog_activity',
          activityType: 'multiple',
          label: 'Quick review: last lesson',
          config: {
            question: "Last lesson we practiced greetings — how do you say hello to someone new?",
            options: ['Nice to meet you!', 'Goodbye!', "I'm hungry."],
            answer: 'Nice to meet you!',
          },
        },
      ],
    },
    {
      id: 'story-1',
      kind: 'story_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      // AI-generated full-bleed scene: Vee and Sam talking face to face in an
      // airport terminal, Academy house style (generate-slide-image, hub:
      // academy) — this is the backdrop every page's speech bubble sits on.
      sceneImageUrl: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-story-airport-scene-1787921017757.png',
      blocks: [
        {
          type: 'storybook',
          title: 'At the Airport',
          pages: [
            {
              speaker: 'Vee',
              text: 'Ugh, this line is so long! Do you have your passport ready?',
              vocab: [{
                word: 'passport',
                definition: 'The official ID you need to travel to another country.',
                image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-passport-1787921028751.png',
              }],
            },
            {
              speaker: 'Sam',
              text: "Yes, it's right here. I already packed my suitcase last night too.",
              vocab: [{
                word: 'suitcase',
                definition: 'A bag you use to pack your clothes for a trip.',
                image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-suitcase-1787921041717.png',
              }],
            },
            {
              speaker: 'Vee',
              text: "Smart! Don't forget — we need to show our boarding pass before we board.",
              vocab: [{
                word: 'boarding pass',
                definition: 'The ticket you show before getting on a plane.',
                image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-boarding-pass-1787921053203.png',
              }],
            },
            {
              speaker: 'Sam',
              text: "Got it right here. I think we're ready for this trip!",
            },
          ],
        },
      ],
    },
    {
      // "Get to know the vocabulary" — a focused look at the three words the
      // story just used in context, now on their own. Comes AFTER the story
      // (not before it): the words already mean something to the student
      // from the conversation, this just sharpens the focus.
      id: 'discovery-1',
      kind: 'discovery_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'vocab_solo',
          word: 'passport',
          definition: 'The official ID you need to travel to another country.',
          image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-passport-1787921028751.png',
        },
        {
          type: 'vocab_solo',
          word: 'suitcase',
          definition: 'A bag you use to pack your clothes for a trip.',
          image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-suitcase-1787921041717.png',
        },
        {
          type: 'vocab_solo',
          word: 'boarding pass',
          definition: 'The ticket you show before getting on a plane.',
          image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-boarding-pass-1787921053203.png',
        },
      ],
    },
    {
      // The vocabulary game — every picture here is one of the three real
      // words the story and discovery deck just taught (was generic
      // bus/hat/sun placeholders unrelated to this lesson's topic at all).
      id: 'practice-1',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'match',
          label: 'Match the travel words',
          config: {
            instruction: 'Match each word to its picture.',
            pairs: [
              { word: 'passport', image_url: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-passport-1787921028751.png' },
              { word: 'suitcase', image_url: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-suitcase-1787921041717.png' },
              { word: 'boarding pass', image_url: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-boarding-pass-1787921053203.png' },
            ],
          },
        },
      ],
    },
    // ── Phonics demo pair (below) ──────────────────────────────────────
    // Phonics isn't a natural fit for a B1 lesson pedagogically (letter-
    // sound decoding is a beginner/literacy skill) — these two moments
    // exist purely to exercise and prove out the redesigned phonics
    // renderer and the new "pop the sound" game in this pilot's live
    // route, the same way story-1 above was added to prove the
    // conversation renderer. A real Pre-A1 lesson is where this belongs.
    {
      id: 'phonics-1',
      kind: 'discovery_moment',
      mode: 'presentation',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'phonics_focus',
          sound: 'p',
          examples: ['passport', 'plane', 'pack', 'pilot', 'park'],
          examplePictures: [
            { word: 'passport', image: 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/lesson-assets/studio/academy-pilot-lesson/ai-image-vocab-passport-1787921028751.png' },
            { word: 'plane' },
            { word: 'pack' },
            { word: 'pilot' },
            { word: 'park' },
          ],
        },
      ],
    },
    {
      id: 'phonics-pop-1',
      kind: 'practice_moment',
      mode: 'activity',
      hostCharacterId: 'vee',
      blocks: [
        {
          type: 'catalog_activity',
          activityType: 'phonics_pop',
          label: 'Pop the /p/ sound',
          config: {
            sound: 'p',
            instruction: "Tap every bubble whose word starts with the /p/ sound.",
            bubbles: [
              { label: 'passport', emoji: '🛂', matches: true },
              { label: 'plane', emoji: '✈️', matches: true },
              { label: 'park', emoji: '🌳', matches: true },
              { label: 'suitcase', emoji: '🧳', matches: false },
              { label: 'ticket', emoji: '🎫', matches: false },
              { label: 'bag', emoji: '👜', matches: false },
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
              { id: 'passport', label: 'passport', emoji: '🛂' },
              { id: 'suitcase', label: 'suitcase', emoji: '🧳' },
              { id: 'boarding-pass', label: 'boarding pass', emoji: '🎫' },
              { id: 'plane', label: 'plane', emoji: '✈️' },
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
            word: 'gate',
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
              { label: 'passport', emoji: '🛂' },
              { label: 'suitcase', emoji: '🧳' },
              { label: 'boarding pass', emoji: '🎫' },
              { label: 'plane', emoji: '✈️' },
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
