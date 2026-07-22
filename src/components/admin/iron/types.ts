export interface PPPLesson {
  lessonNumber: number;
  title: string;
  presentation: {
    concept: string;
    formula?: string;
    keyPoints: string[];
    table?: { headers: string[]; rows: string[][] };
  };
  practice: {
    taskA: { instruction: string; pattern: string; expectedOutput?: string };
    taskB: { instruction: string; buildsOn: string; expectedOutput?: string };
    taskC: { instruction: string; buildsOn: string; expectedOutput?: string };
  };
  production: {
    scenario: string;
    mission: string;
    constraints: string[];
    successCriteria: string;
    timeLimit?: string;
  };
}

export interface IronLevel {
  levelNumber: number;
  levelName: 'Anchor' | 'Forge' | 'Temper' | 'Edge' | 'Alloy';
  levelTitle: string;
  levelDescription: string;
  lessons: PPPLesson[];
}

export interface IronCurriculum {
  id?: string;
  topic: string;
  targetAudience: 'kids' | 'teens' | 'adults';
  cefrLevel: string;
  levels: IronLevel[];
  generatedAt: string;
}

export type TargetAudience = 'kids' | 'teens' | 'adults';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LEVEL_NAMES: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: 'Anchor', icon: '⚓', color: 'from-slate-500 to-slate-600' },
  2: { name: 'Forge', icon: '🔨', color: 'from-orange-500 to-red-600' },
  3: { name: 'Temper', icon: '🔥', color: 'from-amber-500 to-orange-600' },
  4: { name: 'Edge', icon: '⚔️', color: 'from-blue-500 to-indigo-600' },
  5: { name: 'Alloy', icon: '💎', color: 'from-purple-500 to-pink-600' },
};
