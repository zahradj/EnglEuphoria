/**
 * Lightweight pub-sub bridge so deep-link buttons (Quest Map zones, etc.)
 * can ask <StudentDashboard /> to swap its `activeTab` without a full
 * router navigation. Keeps the existing internal tab state machine
 * authoritative.
 */
export interface OpenStudentTabDetail {
  tab: string;
  /** Optional query-style hints consumed by the target tab (e.g. zone filter). */
  params?: Record<string, string>;
}

export const STUDENT_TAB_EVENT = 'student-dashboard:open-tab';

export function openStudentTab(detail: OpenStudentTabDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<OpenStudentTabDetail>(STUDENT_TAB_EVENT, { detail }));
}
