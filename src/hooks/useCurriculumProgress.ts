import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  MASTER_CURRICULUM, 
  SystemKey, 
  getAllLessonsForSystem,
  LessonType
} from '@/data/masterCurriculum';

// Type for flat lesson data
export interface FlatLesson {
  systemKey: SystemKey;
  levelName: string;
  cefrLevel: string;
  unitNumber: number;
  unitName: string;
  lessonNumber: number;
  lessonTitle: string;
  lessonType: LessonType;
  uniqueKey: string;
}

export interface LessonProgress {
  lessonNumber: number;
  lessonTitle: string;
  lessonType: string;
  isGenerated: boolean;
  lessonData?: FlatLesson;
}

export interface UnitProgress {
  unitNumber: number;
  unitName: string;
  totalLessons: number;
  generatedLessons: number;
  percentage: number;
  lessons: LessonProgress[];
  systemKey: SystemKey;
  levelName: string;
}

export interface LevelProgress {
  levelName: string;
  cefrLevel: string;
  units: UnitProgress[];
  totalLessons: number;
  generatedLessons: number;
  percentage: number;
}

export interface SystemProgress {
  systemKey: SystemKey;
  systemLabel: string;
  systemIcon: string;
  levels: LevelProgress[];
  totalLessons: number;
  generatedLessons: number;
  percentage: number;
}

export interface CurriculumProgress {
  systems: SystemProgress[];
  overallTotal: number;
  overallGenerated: number;
  overallPercentage: number;
}

const SYSTEM_LABELS: Record<SystemKey, { label: string; icon: string }> = {
  kids: { label: 'Playground (Kids)', icon: '🎨' },
  teen: { label: 'The Academy (Teens)', icon: '📚' },
  adult: { label: 'The Hub (Adults)', icon: '💼' },
};

async function fetchGeneratedLessons(): Promise<Map<string, boolean>> {
  const { data, error } = await supabase
    .from('curriculum_lessons')
    .select('title, target_system')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[useCurriculumProgress] Error fetching lessons:', error);
    throw error;
  }

  const generatedMap = new Map<string, boolean>();
  
  data?.forEach((lesson) => {
    // Create a normalized key for matching
    const normalizedTitle = lesson.title.toLowerCase().trim();
    generatedMap.set(`${lesson.target_system}:${normalizedTitle}`, true);
  });

  return generatedMap;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}

function calculateProgress(generatedMap: Map<string, boolean>): CurriculumProgress {
  const systems: SystemProgress[] = [];
  let overallTotal = 0;
  let overallGenerated = 0;

  (Object.keys(MASTER_CURRICULUM) as SystemKey[]).forEach((systemKey) => {
    const systemData = MASTER_CURRICULUM[systemKey];
    const allLessons = getAllLessonsForSystem(systemKey);
    
    const levels: LevelProgress[] = [];
    let systemTotal = 0;
    let systemGenerated = 0;

    Object.entries(systemData.levels).forEach(([levelName, levelData]) => {
      const units: UnitProgress[] = [];
      let levelTotal = 0;
      let levelGenerated = 0;

      levelData.units.forEach((unit) => {
        const unitLessons: LessonProgress[] = unit.lessons.map((lesson, index) => {
          const lessonNumber = index + 1;
          const normalizedTitle = normalizeTitle(lesson.title);
          const isGenerated = generatedMap.has(`${systemKey}:${normalizedTitle}`);
          
          // Find the flat lesson data for this lesson
          const lessonData = allLessons.find(
            (l) => l.levelName === levelName && 
                   l.unitNumber === unit.number && 
                   l.lessonNumber === lessonNumber
          );

          return {
            lessonNumber,
            lessonTitle: lesson.title,
            lessonType: lesson.type,
            isGenerated,
            lessonData: lessonData ? {
              systemKey: lessonData.system,
              levelName: lessonData.levelName,
              cefrLevel: lessonData.cefrLevel,
              unitNumber: lessonData.unitNumber,
              unitName: lessonData.unitName,
              lessonNumber: lessonData.lessonNumber,
              lessonTitle: lessonData.lessonTitle,
              lessonType: lessonData.lessonType,
              uniqueKey: lessonData.uniqueKey,
            } : undefined,
          };
        });

        const generatedCount = unitLessons.filter((l) => l.isGenerated).length;
        const totalCount = unitLessons.length;

        units.push({
          unitNumber: unit.number,
          unitName: unit.name,
          totalLessons: totalCount,
          generatedLessons: generatedCount,
          percentage: totalCount > 0 ? Math.round((generatedCount / totalCount) * 100) : 0,
          lessons: unitLessons,
          systemKey,
          levelName,
        });

        levelTotal += totalCount;
        levelGenerated += generatedCount;
      });

      levels.push({
        levelName,
        cefrLevel: levelData.cefrLevel,
        units,
        totalLessons: levelTotal,
        generatedLessons: levelGenerated,
        percentage: levelTotal > 0 ? Math.round((levelGenerated / levelTotal) * 100) : 0,
      });

      systemTotal += levelTotal;
      systemGenerated += levelGenerated;
    });

    systems.push({
      systemKey,
      systemLabel: SYSTEM_LABELS[systemKey].label,
      systemIcon: SYSTEM_LABELS[systemKey].icon,
      levels,
      totalLessons: systemTotal,
      generatedLessons: systemGenerated,
      percentage: systemTotal > 0 ? Math.round((systemGenerated / systemTotal) * 100) : 0,
    });

    overallTotal += systemTotal;
    overallGenerated += systemGenerated;
  });

  return {
    systems,
    overallTotal,
    overallGenerated,
    overallPercentage: overallTotal > 0 ? Math.round((overallGenerated / overallTotal) * 100) : 0,
  };
}

export function useCurriculumProgress() {
  return useQuery<CurriculumProgress>({
    queryKey: ['curriculum-progress'],
    queryFn: async () => {
      const generatedMap = await fetchGeneratedLessons();
      return calculateProgress(generatedMap);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function getPendingLessonsForUnits(
  progress: CurriculumProgress,
  selectedUnits: Array<{ systemKey: SystemKey; levelName: string; unitNumber: number }>
): FlatLesson[] {
  const pendingLessons: FlatLesson[] = [];

  selectedUnits.forEach(({ systemKey, levelName, unitNumber }) => {
    const system = progress.systems.find((s) => s.systemKey === systemKey);
    const level = system?.levels.find((l) => l.levelName === levelName);
    const unit = level?.units.find((u) => u.unitNumber === unitNumber);

    unit?.lessons.forEach((lesson) => {
      if (!lesson.isGenerated && lesson.lessonData) {
        pendingLessons.push(lesson.lessonData);
      }
    });
  });

  return pendingLessons;
}
