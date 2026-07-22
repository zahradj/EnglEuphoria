// Fetches per-slot orchestrator + stabilization status for the lessons in the
// current curriculum blueprint, so CurriculumMap can render verdict pills,
// stabilization summaries, and unit-level rollups.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CurriculumData } from '../../CreatorContext';

export type Verdict = 'publish' | 'repair' | 'block';

export interface LessonStatus {
  lessonId: string;
  verdict: Verdict | null;        // null = generated but no unified_output (legacy)
  stabVerdict: 'pass' | 'repair' | 'block' | null;
  repairsApplied: number;
  slideCount: number;
  stateHash?: string;
  generatedAt?: string;
  orchestratorVersion?: string;
  isPublished: boolean;
}

export interface BlueprintStatusesResult {
  /** key = `${unit_number}-${lesson_number}` */
  byKey: Map<string, LessonStatus>;
  loading: boolean;
  /** Highest orchestrator version found across generated lessons. */
  orchestratorVersion?: string;
  /** Count of unconsumed longitudinal signals for the creator (student-scoped table — best-effort). */
  signalCount: number;
  refresh: () => void;
}

const hubToTargetSystem = (hub: string): string => {
  const h = (hub || '').toLowerCase();
  if (h === 'playground' || h === 'kids') return 'kids';
  if (h === 'academy' || h === 'teen' || h === 'teens') return 'teen';
  if (h === 'success' || h === 'adult' || h === 'adults' || h === 'professional') return 'adult';
  return h || 'teen';
};

export function useBlueprintLessonStatuses(
  curriculum: CurriculumData | null,
): BlueprintStatusesResult {
  const [byKey, setByKey] = useState<Map<string, LessonStatus>>(new Map());
  const [loading, setLoading] = useState(false);
  const [orchestratorVersion, setOrchestratorVersion] = useState<string | undefined>();
  const [signalCount, setSignalCount] = useState(0);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  // Hot-reload after a unified-lesson save anywhere in the app.
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('unified-lesson-saved', handler);
    return () => window.removeEventListener('unified-lesson-saved', handler);
  }, [refresh]);

  const targetSystem = curriculum ? hubToTargetSystem(curriculum.hub) : null;
  const cefr = curriculum?.cefr_level?.toUpperCase() ?? null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!curriculum || !targetSystem || !cefr) {
        setByKey(new Map());
        return;
      }
      setLoading(true);
      try {
        const { data: u } = await supabase.auth.getUser();
        const uid = u.user?.id;
        if (!uid) return;

        const { data, error } = await supabase
          .from('curriculum_lessons')
          .select('id, content, ai_metadata, is_published')
          .eq('created_by', uid)
          .eq('target_system', targetSystem);
        if (error) throw error;

        const map = new Map<string, LessonStatus>();
        let highestVer: string | undefined;
        for (const row of (data ?? []) as any[]) {
          const meta = row.ai_metadata ?? {};
          if ((meta.cefr_level ?? '').toUpperCase() !== cefr) continue;
          const u = Number(meta.unit_number);
          const l = Number(meta.lesson_number);
          if (!u || !l) continue;
          const unified = meta.unified_output ?? null;
          const vr = unified?.validation_report ?? null;
          const stab = vr?.stabilization ?? null;
          const slideCount = Array.isArray(row.content?.slides) ? row.content.slides.length : 0;
          const status: LessonStatus = {
            lessonId: row.id,
            verdict: (vr?.verdict as Verdict | undefined) ?? null,
            stabVerdict: (stab?.finalVerdict as any) ?? null,
            repairsApplied: Array.isArray(stab?.repairsApplied) ? stab.repairsApplied.length : 0,
            slideCount,
            stateHash: unified?.state_hash,
            generatedAt: unified?.generated_at,
            orchestratorVersion: unified?.orchestrator_version,
            isPublished: !!row.is_published,
          };
          map.set(`${u}-${l}`, status);
          if (unified?.orchestrator_version && (!highestVer || unified.orchestrator_version > highestVer)) {
            highestVer = unified.orchestrator_version;
          }
        }

        // Best-effort: count unconsumed longitudinal signals tied to the creator.
        // The table is student-scoped; we filter by student_id = creator's uid so
        // self-test runs (when content_creator == student_id) light up the bar.
        const { count } = await supabase
          .from('curriculum_stabilization_signals' as any)
          .select('id', { count: 'exact', head: true })
          .is('consumed_at', null)
          .eq('student_id', uid);

        if (!cancelled) {
          setByKey(map);
          setOrchestratorVersion(highestVer);
          setSignalCount(count ?? 0);
        }
      } catch (e) {
        console.warn('useBlueprintLessonStatuses error', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [curriculum, targetSystem, cefr, tick]);

  return useMemo(
    () => ({ byKey, loading, orchestratorVersion, signalCount, refresh }),
    [byKey, loading, orchestratorVersion, signalCount, refresh],
  );
}

export function rollupUnit(
  lessons: { unit_number?: number; lesson_number?: number }[],
  unitNumber: number,
  byKey: Map<string, LessonStatus>,
): { publish: number; repair: number; block: number; pending: number } {
  let publish = 0, repair = 0, block = 0, pending = 0;
  lessons.forEach((l, idx) => {
    const u = l.unit_number ?? unitNumber;
    const ln = l.lesson_number ?? idx + 1;
    const s = byKey.get(`${u}-${ln}`);
    if (!s || !s.verdict) pending += 1;
    else if (s.verdict === 'publish') publish += 1;
    else if (s.verdict === 'repair') repair += 1;
    else block += 1;
  });
  return { publish, repair, block, pending };
}
