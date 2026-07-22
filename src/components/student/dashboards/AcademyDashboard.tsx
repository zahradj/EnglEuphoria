import React from 'react';
import DashboardHome from '../dashboard/DashboardHome';
import { useStudentLanguageSync } from '@/hooks/useStudentLanguageSync';

interface AcademyDashboardProps {
  studentName?: string;
  totalXp?: number;
  onLevelUp?: () => void;
}

/**
 * Academy (Teens) dashboard — front page.
 *
 * Front page is intentionally minimal: Today's class + progress + jump-back-in.
 * Daily challenge, streak, skill XP bars, social lounge, record clip, lessons,
 * materials, teachers, reports, etc. live in dedicated sidebar tabs.
 */
export const AcademyDashboard: React.FC<AcademyDashboardProps> = ({
  studentName = 'Alex',
}) => {
  useStudentLanguageSync();
  return <DashboardHome hub="academy" studentName={studentName} />;
};

export default AcademyDashboard;
