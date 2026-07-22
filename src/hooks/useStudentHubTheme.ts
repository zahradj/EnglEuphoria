/**
 * Student-side hub theme hook.
 *
 * Resolves the active student's hub via `useStudentLevel()` and
 * returns the hub-branded class strings from the shared
 * `hubClassroomTheme` registry. Use this on EVERY student dashboard
 * surface so buttons, chips, gradients and accent rings stay on-brand
 * for Playground / Academy / Success without hard-coded colors.
 */
import { useMemo } from 'react';
import { useStudentLevel, type StudentLevel } from './useStudentLevel';
import {
  getClassroomHubTheme,
  type ClassroomHubKey,
  type ClassroomHubTheme,
} from '@/components/teacher/classroom/hubClassroomTheme';

export interface StudentHubTheme extends ClassroomHubTheme {
  hubKey: ClassroomHubKey;
  /** Convenience aliases */
  buttonGhost: string;
}

const KEY_MAP: Record<StudentLevel, ClassroomHubKey> = {
  playground: 'playground',
  academy: 'academy',
  professional: 'success',
};

export function useStudentHubTheme(overrideHub?: ClassroomHubKey | StudentLevel | null): StudentHubTheme {
  const { studentLevel } = useStudentLevel();

  return useMemo(() => {
    const raw = (overrideHub as string | null | undefined) ?? (studentLevel ? KEY_MAP[studentLevel] : 'success');
    const hubKey = (raw as ClassroomHubKey) || 'success';
    const base = getClassroomHubTheme(hubKey);
    return {
      ...base,
      hubKey,
      buttonGhost: `${base.accentText} hover:${base.accentSoftBg}`,
    };
  }, [studentLevel, overrideHub]);
}

export { type ClassroomHubKey };
