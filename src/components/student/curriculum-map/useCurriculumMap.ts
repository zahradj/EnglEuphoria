import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useProgress';

export interface MapLesson {
  id: string;
  title: string;
  lesson_number: number;
  is_assessment: boolean;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number | null;
  mastered: boolean; // completed assessment ≥80
}

export interface BonusQuest {
  id: string;
  label: string;
  targetLessonId: string; // the assessment lesson it branches from
  route: string;
}

export interface MapUnit {
  id: string;
  unit_number: number;
  title: string;
  lessons: MapLesson[];
  locked: boolean;
  cleared: boolean; // assessment passed ≥80
  bonusQuest: BonusQuest | null;
}

export interface MapModel {
  units: MapUnit[];
  isLoading: boolean;
}

const PASS_SCORE = 80;

export function useCurriculumMap(): MapModel {
  const { user } = useAuth();
  const { data: progress = [] } = useUserProgress(user?.id);

  const { data: rawLessons = [], isLoading } = useQuery({
    queryKey: ['curriculum-map-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select(
          'id, title, sequence_order, unit_id, unit:curriculum_units(id, title, unit_number)',
        )
        .eq('is_published', true)
        .order('sequence_order', { ascending: true });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const progressMap = useMemo(() => {
    const m: Record<string, { status: string; score: number | null }> = {};
    (progress as any[]).forEach((p) => {
      m[p.lesson_id] = { status: p.status, score: p.score ?? null };
    });
    return m;
  }, [progress]);

  const units = useMemo<MapUnit[]>(() => {
    if (!rawLessons.length) return [];

    const grouped = new Map<string, { unit: any; lessons: any[] }>();
    for (const l of rawLessons) {
      const unit = Array.isArray(l.unit) ? l.unit[0] : l.unit;
      if (!unit?.id) continue;
      if (!grouped.has(unit.id)) grouped.set(unit.id, { unit, lessons: [] });
      grouped.get(unit.id)!.lessons.push(l);
    }

    const ordered = Array.from(grouped.values()).sort(
      (a, b) => (a.unit.unit_number ?? 0) - (b.unit.unit_number ?? 0),
    );

    let prevCleared = true; // first unit always unlocked
    return ordered.map(({ unit, lessons }) => {
      const sorted = [...lessons].sort(
        (a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0),
      );
      const assessmentIdx = sorted.length - 1;

      const mapped: MapLesson[] = sorted.map((l, idx) => {
        const p = progressMap[l.id];
        const isAssessment = idx === assessmentIdx;
        const score = p?.score ?? null;
        const completed = p?.status === 'completed';
        const mastered = isAssessment && completed && (score ?? 0) >= PASS_SCORE;
        return {
          id: l.id,
          title: l.title,
          lesson_number: idx + 1,
          is_assessment: isAssessment,
          status: !p
            ? 'available'
            : (p.status as MapLesson['status']) ?? 'available',
          score,
          mastered,
        };
      });

      const assessment = mapped[assessmentIdx];
      const assessmentFailed =
        !!assessment &&
        assessment.status === 'completed' &&
        (assessment.score ?? 0) < PASS_SCORE;
      const cleared = !!assessment?.mastered;
      const locked = !prevCleared;

      const bonusQuest: BonusQuest | null = assessmentFailed
        ? {
            id: `bonus-${unit.id}`,
            label: 'Bonus Quest',
            targetLessonId: assessment.id,
            route: `/lesson/${assessment.id}`,
          }
        : null;

      // Next unit unlocked only if this one cleared AND no outstanding bonus quest
      prevCleared = cleared && !bonusQuest;

      return {
        id: unit.id,
        unit_number: unit.unit_number ?? 0,
        title: unit.title,
        lessons: locked
          ? mapped.map((l) => ({ ...l, status: 'locked' as const }))
          : mapped,
        locked,
        cleared,
        bonusQuest,
      };
    });
  }, [rawLessons, progressMap]);

  return { units, isLoading };
}
