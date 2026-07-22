// Master Curriculum Data Map
// This is the single source of truth for all lessons that need to be generated

export type LessonType = 'Mechanic' | 'Context' | 'Application' | 'Checkpoint';

export interface MasterLesson {
  number: number;
  title: string;
  type: LessonType;
}

export interface MasterUnit {
  number: number;
  name: string;
  lessons: MasterLesson[];
}

export interface MasterLevel {
  name: string;
  cefrLevel: string;
  units: MasterUnit[];
}

export interface MasterSystem {
  label: string;
  visualStyle: string;
  levels: Record<string, MasterLevel>;
}

export type SystemKey = 'kids' | 'teen' | 'adult';

export const MASTER_CURRICULUM: Record<SystemKey, MasterSystem> = {
  // =====================================================
  // SYSTEM 1: PLAYGROUND (Kids/Foundation)
  // Visual Style: Cartoon / Vibrant
  // =====================================================
  kids: {
    label: 'Playground',
    visualStyle: 'Cartoon / Vibrant',
    levels: {
      'Beginner': {
        name: 'Beginner',
        cefrLevel: 'Pre-A1',
        units: [
          {
            number: 1,
            name: 'Hello World',
            lessons: [
              { number: 1, title: 'Grammar: I am / You are (To Be)', type: 'Mechanic' },
              { number: 2, title: 'Reading: Meet the Superheroes', type: 'Context' },
              { number: 3, title: 'Speaking: "What is your name?"', type: 'Application' },
              { number: 4, title: 'Mission: Draw & Introduce Yourself', type: 'Checkpoint' },
            ],
          },
        ],
      },
      'Hard Beginner': {
        name: 'Hard Beginner',
        cefrLevel: 'A1',
        units: [
          {
            number: 2,
            name: 'My Day',
            lessons: [
              { number: 1, title: 'Grammar: Present Simple (He Plays)', type: 'Mechanic' },
              { number: 2, title: 'Reading: The Busy Ant\'s Morning', type: 'Context' },
              { number: 3, title: 'Speaking: Telling the Time', type: 'Application' },
              { number: 4, title: 'Mission: My Daily Schedule', type: 'Checkpoint' },
            ],
          },
        ],
      },
      'Elementary': {
        name: 'Elementary',
        cefrLevel: 'A1+',
        units: [
          {
            number: 3,
            name: 'Yesterday',
            lessons: [
              { number: 1, title: 'Grammar: Past Simple (Was/Were)', type: 'Mechanic' },
              { number: 2, title: 'Reading: The Dinosaur Museum', type: 'Context' },
              { number: 3, title: 'Speaking: "Where were you?"', type: 'Application' },
              { number: 4, title: 'Mission: My Last Birthday', type: 'Checkpoint' },
            ],
          },
        ],
      },
    },
  },

  // =====================================================
  // SYSTEM 2: THE ACADEMY (Teens/Structure)
  // Visual Style: Realistic / Social / Modern
  // =====================================================
  teen: {
    label: 'The Academy',
    visualStyle: 'Realistic / Social / Modern',
    levels: {
      'Academy Beginner': {
        name: 'Academy Beginner',
        cefrLevel: 'A2',
        units: [
          {
            number: 1,
            name: 'The Refresh',
            lessons: [
              { number: 1, title: 'Grammar: Sentence Structure (S-V-O)', type: 'Mechanic' },
              { number: 2, title: 'Blog Post: "New School, New Me"', type: 'Context' },
              { number: 3, title: 'Roleplay: Meeting New Friends', type: 'Application' },
              { number: 4, title: 'Mission: Write a Social Bio', type: 'Checkpoint' },
            ],
          },
        ],
      },
      'High Intermediate': {
        name: 'High Intermediate',
        cefrLevel: 'B1+',
        units: [
          {
            number: 2,
            name: 'Experience',
            lessons: [
              { number: 1, title: 'Grammar: Present Perfect vs Past', type: 'Mechanic' },
              { number: 2, title: 'Article: "Teen Travelers of 2024"', type: 'Context' },
              { number: 3, title: 'Interview: "Have you ever...?"', type: 'Application' },
              { number: 4, title: 'Mission: Two Truths, One Lie', type: 'Checkpoint' },
            ],
          },
        ],
      },
      'Upper Intermediate': {
        name: 'Upper Intermediate',
        cefrLevel: 'B2',
        units: [
          {
            number: 3,
            name: 'The Future',
            lessons: [
              { number: 1, title: 'Grammar: Future Forms & Probability', type: 'Mechanic' },
              { number: 2, title: 'Tech Review: "The World in 2050"', type: 'Context' },
              { number: 3, title: 'Debate: AI vs Humans', type: 'Application' },
              { number: 4, title: 'Mission: The Time Capsule Video', type: 'Checkpoint' },
            ],
          },
        ],
      },
    },
  },

  // =====================================================
  // SYSTEM 3: THE HUB (Adults/Pro)
  // Visual Style: Corporate / Minimalist / Professional
  // =====================================================
  adult: {
    label: 'The Hub',
    visualStyle: 'Corporate / Minimalist / Professional',
    levels: {
      'Advanced': {
        name: 'Advanced',
        cefrLevel: 'C1',
        units: [
          {
            number: 1,
            name: 'Persuasion',
            lessons: [
              { number: 1, title: 'Grammar: Conditionals (2nd & 3rd)', type: 'Mechanic' },
              { number: 2, title: 'Case Study: The Failed Merger', type: 'Context' },
              { number: 3, title: 'Negotiation: Closing the Deal', type: 'Application' },
              { number: 4, title: 'Mission: The Elevator Pitch', type: 'Checkpoint' },
            ],
          },
        ],
      },
      'Proficiency': {
        name: 'Proficiency',
        cefrLevel: 'C2',
        units: [
          {
            number: 2,
            name: 'Nuance',
            lessons: [
              { number: 1, title: 'Grammar: Inversion & Cleft Sentences', type: 'Mechanic' },
              { number: 2, title: 'Speech Analysis: Political Rhetoric', type: 'Context' },
              { number: 3, title: 'Presentation: Crisis Management', type: 'Application' },
              { number: 4, title: 'Mission: The Formal Press Release', type: 'Checkpoint' },
            ],
          },
        ],
      },
    },
  },
};

// Helper function to get all lessons for a system as a flat list
export function getAllLessonsForSystem(systemKey: SystemKey) {
  const system = MASTER_CURRICULUM[systemKey];
  const lessons: Array<{
    system: SystemKey;
    levelName: string;
    cefrLevel: string;
    unitNumber: number;
    unitName: string;
    lessonNumber: number;
    lessonTitle: string;
    lessonType: LessonType;
    uniqueKey: string;
  }> = [];

  Object.entries(system.levels).forEach(([levelName, level]) => {
    level.units.forEach((unit) => {
      unit.lessons.forEach((lesson) => {
        lessons.push({
          system: systemKey,
          levelName,
          cefrLevel: level.cefrLevel,
          unitNumber: unit.number,
          unitName: unit.name,
          lessonNumber: lesson.number,
          lessonTitle: lesson.title,
          lessonType: lesson.type,
          uniqueKey: `${systemKey}-${levelName}-${unit.number}-${lesson.number}`,
        });
      });
    });
  });

  return lessons;
}

// Helper to get a specific lesson by its unique key
export function getLessonByKey(uniqueKey: string) {
  const parts = uniqueKey.split('-');
  if (parts.length < 4) return null;
  
  const systemKey = parts[0] as SystemKey;
  const levelName = parts.slice(1, -2).join('-');
  const unitNumber = parseInt(parts[parts.length - 2]);
  const lessonNumber = parseInt(parts[parts.length - 1]);

  const system = MASTER_CURRICULUM[systemKey];
  if (!system) return null;

  const level = system.levels[levelName];
  if (!level) return null;

  const unit = level.units.find(u => u.number === unitNumber);
  if (!unit) return null;

  const lesson = unit.lessons.find(l => l.number === lessonNumber);
  if (!lesson) return null;

  return {
    system: systemKey,
    levelName,
    cefrLevel: level.cefrLevel,
    unitNumber: unit.number,
    unitName: unit.name,
    lessonNumber: lesson.number,
    lessonTitle: lesson.title,
    lessonType: lesson.type,
    uniqueKey,
  };
}

// Get total lesson count
export function getTotalLessonCount(): number {
  let count = 0;
  Object.keys(MASTER_CURRICULUM).forEach((systemKey) => {
    const system = MASTER_CURRICULUM[systemKey as SystemKey];
    Object.values(system.levels).forEach((level) => {
      level.units.forEach((unit) => {
        count += unit.lessons.length;
      });
    });
  });
  return count;
}

// Get all levels for a system
export function getLevelsForSystem(systemKey: SystemKey): Array<{ name: string; cefrLevel: string }> {
  const system = MASTER_CURRICULUM[systemKey];
  if (!system) return [];
  
  return Object.values(system.levels).map(level => ({
    name: level.name,
    cefrLevel: level.cefrLevel,
  }));
}

// Get all units for a specific level
export function getUnitsForLevel(
  systemKey: SystemKey,
  levelName: string
): Array<{ number: number; name: string; lessonCount: number }> {
  const system = MASTER_CURRICULUM[systemKey];
  if (!system) return [];
  
  const level = system.levels[levelName];
  if (!level) return [];
  
  return level.units.map(unit => ({
    number: unit.number,
    name: unit.name,
    lessonCount: unit.lessons.length,
  }));
}

// Get all lessons for a specific unit
export function getLessonsForUnit(
  systemKey: SystemKey,
  levelName: string,
  unitNumber: number
) {
  const allLessons = getAllLessonsForSystem(systemKey);
  return allLessons.filter(
    l => l.levelName === levelName && l.unitNumber === unitNumber
  );
}
