import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { resolveHub, normalizeHub, getHubRoute, type HubLevel } from '@/lib/hubResolver';

export type StudentLevel = 'playground' | 'academy' | 'professional';

interface StudentLevelData {
  studentLevel: StudentLevel | null;
  onboardingCompleted: boolean;
  loading: boolean;
  /** True once we have a confirmed hub (DB or metadata) AND loading has settled. */
  hubReady: boolean;
  error: string | null;
  /** Where the resolved level came from in this render */
  source: 'metadata' | 'db' | 'fallback' | null;
  refetch: () => Promise<void>;
}

/**
 * Metadata-first, non-blocking student level hook.
 *  - Seeds from auth metadata immediately so UI never hangs.
 *  - Confirms / syncs against student_profiles in the background.
 *  - On RLS or missing-row failures, keeps the metadata value and
 *    silently upserts a healed row.
 */
/**
 * Module-level cache shared across every `useStudentLevel` consumer.
 * Without it, each component that calls the hook fires its own
 * `student_profiles` fetch and shows its own loading state — producing a
 * visible flicker (route-guard spinner → HubBootSkeleton → final dashboard).
 * With it, the second-and-later instances seed synchronously from the first.
 */
const levelCache = new Map<string, { level: StudentLevel; onboarding: boolean; source: StudentLevelData['source'] }>();

export function useStudentLevel(): StudentLevelData {
  const { user } = useAuth();

  // Role guard — non-students must never trigger a `student_profiles` upsert
  // or be assigned a default `'playground'` level. Doing so silently turns
  // teachers/admins into students for any guard that reads `studentLevel`.
  const userRole = (user as any)?.role as string | undefined;
  const isStudent = !user || !userRole || userRole === 'student';

  // Seed synchronously from the shared cache first (so the second consumer
  // never re-flashes a skeleton), then from auth metadata.
  const seed = (() => {
    if (!user || !isStudent) {
      return { level: null as StudentLevel | null, source: null as StudentLevelData['source'], onboarding: false, fromCache: false };
    }
    const cached = levelCache.get(user.id);
    if (cached) {
      return { level: cached.level, source: cached.source, onboarding: cached.onboarding, fromCache: true };
    }
    const { level, source } = resolveHub({ metadata: (user as any).user_metadata });
    return { level: level as StudentLevel, source, onboarding: false, fromCache: false };
  })();

  const [studentLevel, setStudentLevel] = useState<StudentLevel | null>(seed.level);
  const [source, setSource] = useState<StudentLevelData['source']>(seed.source);
  const [onboardingCompleted, setOnboardingCompleted] = useState(seed.onboarding);
  // If we seeded from cache, the hub is already confirmed — skip the loading
  // state entirely so downstream components render instantly.
  const [loading, setLoading] = useState<boolean>(!!user && isStudent && !seed.fromCache);
  const [error, setError] = useState<string | null>(null);
  const healAttemptedRef = useRef(false);

  const fetchStudentLevel = useCallback(async () => {
    if (!user?.id || !isStudent) {
      setLoading(false);
      return;
    }

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('student_profiles')
        .select('student_level, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('🔴 [useStudentLevel] DB fetch failed (keeping metadata fallback):', fetchError);
        setError(fetchError.message);
        // Self-heal: try a background upsert so future reads succeed.
        if (!healAttemptedRef.current) {
          healAttemptedRef.current = true;
          const metaLevel = normalizeHub((user as any).user_metadata?.hub_type)
            || normalizeHub((user as any).user_metadata?.preferred_hub)
            || 'playground';
          supabase.from('student_profiles').upsert(
            { user_id: user.id, student_level: metaLevel, onboarding_completed: false },
            { onConflict: 'user_id' }
          ).then(({ error: healErr }) => {
            if (healErr) console.error('🔴 [useStudentLevel] Self-heal upsert failed:', healErr);
            else console.log('🟢 [useStudentLevel] Self-heal upsert OK →', metaLevel);
          });
        }
        return; // keep metadata-seeded value
      }

      if (data?.student_level) {
        const dbLevel = normalizeHub(data.student_level);
        if (dbLevel) {
          setStudentLevel(dbLevel as StudentLevel);
          setSource('db');
          // Populate the shared cache so sibling/child consumers of this
          // hook seed instantly and don't re-show their loading state.
          levelCache.set(user.id, {
            level: dbLevel as StudentLevel,
            onboarding: data.onboarding_completed ?? false,
            source: 'db',
          });
        }
        setOnboardingCompleted(data.onboarding_completed ?? false);
      } else if (!healAttemptedRef.current) {
        // Row missing — heal it from metadata in the background.
        healAttemptedRef.current = true;
        const metaLevel = normalizeHub((user as any).user_metadata?.hub_type)
          || normalizeHub((user as any).user_metadata?.preferred_hub)
          || 'playground';
        const { error: healErr } = await supabase.from('student_profiles').upsert(
          { user_id: user.id, student_level: metaLevel, onboarding_completed: false },
          { onConflict: 'user_id' }
        );
        if (healErr) console.error('🔴 [useStudentLevel] Heal-missing-row failed:', healErr);
        else console.log('🟢 [useStudentLevel] Healed missing student_profiles row →', metaLevel);
      }
    } catch (err) {
      console.error('🔴 [useStudentLevel] Unexpected error:', err);
      setError('Failed to fetch student level');
    } finally {
      setLoading(false);
    }
  }, [user, isStudent]);

  useEffect(() => {
    if (!user?.id || !isStudent) {
      setLoading(false);
      return;
    }

    // Re-seed when user changes
    const { level, source: src } = resolveHub({ metadata: (user as any).user_metadata });
    setStudentLevel((prev) => prev ?? (level as StudentLevel));
    setSource((prev) => prev ?? src);

    fetchStudentLevel();

    // Hard escape hatch — never stay loading past 3s.
    const safetyTimeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('⏱️ [useStudentLevel] 3s safety timeout — using metadata fallback.');
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => clearTimeout(safetyTimeout);
  }, [user?.id, isStudent, fetchStudentLevel]);

  return {
    studentLevel,
    onboardingCompleted,
    loading,
    hubReady: !loading && studentLevel !== null,
    error,
    source,
    refetch: fetchStudentLevel,
  };
}

/**
 * Determines the student level based on age
 */
export function determineStudentLevel(age: number): StudentLevel {
  // Strict brackets: 4-9 → Playground, 10-17 → Academy, 18+ → Professional.
  if (age < 10) return 'playground';
  if (age < 18) return 'academy';
  return 'professional';
}

/**
 * IRT-inspired evaluation: weighs age + correctCount + avgComplexity
 */
export function evaluateStudentLevel(
  age: number,
  correctCount: number,
  totalQuestions: number,
  avgComplexity: number = 0.5
): { level: StudentLevel; track: string } {
  const defaultLevel = determineStudentLevel(age);
  if (age < 10 && correctCount > 4 && avgComplexity > 0.8) {
    return { level: 'academy', track: 'advanced' };
  }
  if (age > 18 && correctCount < 2) {
    return { level: 'professional', track: 'foundational' };
  }
  return { level: defaultLevel, track: 'standard' };
}

/**
 * Maps student level to the corresponding route. Delegates to the shared resolver
 * so all routing stays in sync.
 */
export function getStudentDashboardRoute(level: StudentLevel | string | null | undefined): string {
  const normalized = normalizeHub(level as string) ?? 'playground';
  return getHubRoute(normalized as HubLevel);
}
