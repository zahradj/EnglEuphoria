import type { MissionArchetype, Hub } from '../types';

interface ArchetypeTemplate {
  archetype: MissionArchetype;
  hubs: Hub[];
  hookTemplates: string[];
  characterByHub: Partial<Record<Hub, string>>;
  stepLabels: string[];
}

/**
 * Narrative archetypes for missions. Used by missionGenerator to bind
 * a lesson plan to a story. AI fills the specifics; templates ensure
 * tone and hub-appropriateness.
 */
export const MISSION_TEMPLATES: ArchetypeTemplate[] = [
  {
    archetype: 'mystery',
    hubs: ['playground', 'academy'],
    hookTemplates: [
      'A mystery has appeared and only your English skills can solve it.',
      'Something strange is happening — gather clues using your new words.',
    ],
    characterByHub: { playground: 'Detective Pip', academy: 'Investigator Mira' },
    stepLabels: ['Gather clues', 'Question witnesses', 'Solve the puzzle'],
  },
  {
    archetype: 'travel_challenge',
    hubs: ['playground', 'academy'],
    hookTemplates: [
      'You\'re traveling to a new place. Use English to navigate the adventure.',
    ],
    characterByHub: { playground: 'Captain Luma', academy: 'Travel Buddy' },
    stepLabels: ['Check in', 'Ask for directions', 'Make a friend'],
  },
  {
    archetype: 'interview',
    hubs: ['academy', 'success'],
    hookTemplates: [
      'You have an interview today — show your communication skills.',
      'A real-world conversation awaits. Prepare with confidence.',
    ],
    characterByHub: { academy: 'Coach Ren', success: 'Career Mentor' },
    stepLabels: ['Introduce yourself', 'Answer key questions', 'Ask your own'],
  },
  {
    archetype: 'debate',
    hubs: ['academy', 'success'],
    hookTemplates: [
      'A friendly debate is starting — defend your view respectfully.',
    ],
    characterByHub: { academy: 'Debate Captain', success: 'Discussion Lead' },
    stepLabels: ['State your view', 'Counter the other side', 'Conclude with strength'],
  },
  {
    archetype: 'speaking_quest',
    hubs: ['academy', 'success'],
    hookTemplates: [
      'A speaking quest unfolds — every voice attempt moves you forward.',
    ],
    characterByHub: { academy: 'Voice Guide', success: 'Speaking Coach' },
    stepLabels: ['Warm up', 'Try the challenge', 'Reflect on your growth'],
  },
  {
    archetype: 'help_character',
    hubs: ['playground'],
    hookTemplates: [
      'Your friend needs help. Use your English to support them.',
    ],
    characterByHub: { playground: 'Buddy Bell' },
    stepLabels: ['Listen carefully', 'Offer help', 'Celebrate together'],
  },
  {
    archetype: 'detective',
    hubs: ['playground', 'academy'],
    hookTemplates: ['Follow the clues and use English to crack the case.'],
    characterByHub: { playground: 'Sleuth Sam', academy: 'Field Agent' },
    stepLabels: ['Find clue 1', 'Find clue 2', 'Reveal the truth'],
  },
  {
    archetype: 'survival',
    hubs: ['academy', 'success'],
    hookTemplates: [
      'You\'re in a real-life situation that demands English to navigate.',
    ],
    characterByHub: { academy: 'Field Mentor', success: 'Situation Coach' },
    stepLabels: ['Assess the scene', 'Communicate clearly', 'Resolve it'],
  },
];

export function getTemplatesForHub(hub: Hub): ArchetypeTemplate[] {
  return MISSION_TEMPLATES.filter((t) => t.hubs.includes(hub));
}

export function getTemplate(archetype: MissionArchetype): ArchetypeTemplate | undefined {
  return MISSION_TEMPLATES.find((t) => t.archetype === archetype);
}
