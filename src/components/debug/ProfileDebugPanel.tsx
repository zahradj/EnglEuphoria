import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel } from '@/hooks/useStudentLevel';
import { useTeacherHubRole } from '@/hooks/useTeacherHubRole';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Collapsible debug panel that shows the current user's resolved
 * hub_type, role, onboarding status, and raw auth metadata.
 * Only visible in development or when ?debug=true is in the URL.
 */
export const ProfileDebugPanel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { studentLevel, onboardingCompleted, loading: studentLoading } = useStudentLevel();
  const { hubRole, hubKind, loading: teacherLoading } = useTeacherHubRole(user?.id);

  const isDev = import.meta.env.DEV;
  const debugParam = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('debug') === 'true'
    : false;

  if (!isDev && !debugParam) return null;
  if (!user) return null;

  const role = (user as any).role ?? 'unknown';
  const meta = user.user_metadata ?? {};

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-lg hover:bg-amber-600 transition-colors"
      >
        <Bug className="w-3.5 h-3.5" />
        Profile Debug
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 rounded-xl bg-gray-900/95 text-gray-100 text-xs p-4 shadow-2xl backdrop-blur-sm border border-gray-700 space-y-2 max-h-80 overflow-y-auto">
          <Row label="User ID" value={user.id} />
          <Row label="Email" value={user.email ?? '—'} />
          <Row label="Resolved Role" value={role} />
          <Row label="Meta hub_type" value={meta.hub_type ?? '—'} />
          <Row label="Meta role" value={meta.role ?? '—'} />
          <Row label="Meta full_name" value={meta.full_name ?? '—'} />

          <hr className="border-gray-700" />
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Student Profile</p>
          <Row label="student_level" value={studentLoading ? '⏳' : (studentLevel ?? 'null')} />
          <Row label="onboarding" value={studentLoading ? '⏳' : String(onboardingCompleted)} />

          <hr className="border-gray-700" />
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Teacher Profile</p>
          <Row label="hub_role" value={teacherLoading ? '⏳' : (hubRole ?? 'null')} />
          <Row label="hubKind" value={teacherLoading ? '⏳' : hubKind} />
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between gap-3">
    <span className="text-gray-400 shrink-0">{label}</span>
    <span className="text-right break-all font-mono">{value}</span>
  </div>
);
