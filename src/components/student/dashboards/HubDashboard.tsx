import React from 'react';
import DashboardHome from '../dashboard/DashboardHome';
import { useStudentLanguageSync } from '@/hooks/useStudentLanguageSync';

interface HubDashboardProps {
  studentName?: string;
  totalXp?: number;
  onLevelUp?: () => void;
}

/**
 * Success / Professional Hub dashboard — front page.
 *
 * Front page is intentionally minimal: Today's class + progress + jump-back-in.
 * Skills radar, business milestones, velocity chart, weekly briefing, downloads,
 * materials, teachers, billing, certificates live in dedicated sidebar tabs.
 */
export const HubDashboard: React.FC<HubDashboardProps> = ({
  studentName = 'Sarah',
}) => {
  useStudentLanguageSync();
  return <DashboardHome hub="professional" studentName={studentName} />;
};

export default HubDashboard;
