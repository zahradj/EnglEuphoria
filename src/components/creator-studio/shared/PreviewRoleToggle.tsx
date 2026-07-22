import { GraduationCap, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PreviewRole = 'teacher' | 'student';

interface Props {
  value: PreviewRole;
  onChange: (next: PreviewRole) => void;
  hub: 'playground' | 'academy' | 'success';
}

export function PreviewRoleToggle({ value, onChange, hub }: Props) {
  const accent =
    hub === 'playground'
      ? 'bg-orange-500 text-white shadow-sm'
      : hub === 'academy'
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'bg-emerald-600 text-white shadow-sm';

  const base =
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition';
  const inactive = 'text-slate-500 hover:text-slate-700';

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => onChange('teacher')}
        className={cn(base, value === 'teacher' ? accent : inactive)}
      >
        <User className="w-3.5 h-3.5" /> Teacher View
      </button>
      <button
        type="button"
        onClick={() => onChange('student')}
        className={cn(base, value === 'student' ? accent : inactive)}
      >
        <GraduationCap className="w-3.5 h-3.5" /> Student View
      </button>
    </div>
  );
}
