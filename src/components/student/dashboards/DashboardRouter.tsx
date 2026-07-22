import React from 'react';
import { SystemId } from '@/types/multiTenant';
import { PlaygroundDashboard } from './PlaygroundDashboard';
import { AcademyDashboard } from './AcademyDashboard';
import { HubDashboard } from './HubDashboard';

// student_profiles.student_level values (from DB)
type StudentLevel = 'playground' | 'academy' | 'professional';

interface DashboardRouterProps {
  /** Primary routing key — accepts both SystemId ('kids'|'teen'|'adult')
   *  and raw student_level strings ('playground'|'academy'|'professional') */
  systemId: SystemId | StudentLevel | string;
  studentName?: string;
  totalXp?: number;
  onLevelUp?: () => void;
}

/** Normalise any incoming id to a canonical SystemId */
function resolveSystemId(id: string): SystemId | null {
  switch (id) {
    case 'kids':
    case 'playground':
      return 'kids';
    case 'teen':
    case 'academy':
      return 'teen';
    case 'adult':
    case 'professional':
      return 'adult';
    default:
      return null;
  }
}

export const DashboardRouter: React.FC<DashboardRouterProps> = ({
  systemId,
  studentName,
  totalXp,
  onLevelUp,
}) => {
  const canonical = resolveSystemId(systemId as string);

  switch (canonical) {
    case 'kids':
      return <PlaygroundDashboard studentName={studentName} />;
    case 'teen':
      return (
        <AcademyDashboard
          studentName={studentName}
          totalXp={totalXp}
          onLevelUp={onLevelUp}
        />
      );
    case 'adult':
      return <HubDashboard studentName={studentName} totalXp={totalXp} />;
    default:
      // Fail-loud: caller must gate on a resolved hub. Never silently default to Playground.
      if (typeof console !== 'undefined') {
        console.warn('[DashboardRouter] Refusing to render — unresolved systemId:', systemId);
      }
      return null;
  }
};
