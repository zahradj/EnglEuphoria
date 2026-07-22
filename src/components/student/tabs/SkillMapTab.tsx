import React from 'react';
import { SmartSkillMap } from '@/components/student/dashboard/SmartSkillMap';
import { useStudentLevel } from '@/hooks/useStudentLevel';

/**
 * Full-page Skill Map tab. Currently surfaced for the Success (professional) hub.
 * Falls back to the resolved hub so Playground / Academy still get a useful view
 * if linked directly.
 */
export const SkillMapTab: React.FC = () => {
  const { studentLevel } = useStudentLevel();
  const hub = (studentLevel || 'professional') as 'playground' | 'academy' | 'professional';

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Skill Map</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A live, intelligent view of every skill you're building. Updated after every lesson.
        </p>
      </div>
      <SmartSkillMap hub={hub} variant="full" />
    </div>
  );
};

export default SkillMapTab;
